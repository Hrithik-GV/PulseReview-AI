import{useEffect,useRef}from'react';
import*as THREE from'three';
import'./Hyperspeed.css';

const DEFAULT_EFFECT_OPTIONS={onSpeedUp:()=>{},onSlowDown:()=>{},distortion:'turbulentDistortion',length:400,roadWidth:10,islandWidth:2,lanesPerRoad:4,fov:90,fovSpeedUp:150,speedUp:2,carLightsFade:0.4,totalSideLightSticks:20,lightPairsPerRoadWay:40,shoulderLinesWidthPercentage:0.05,brokenLinesWidthPercentage:0.1,brokenLinesLengthPercentage:0.5,lightStickWidth:[0.12,0.5],lightStickHeight:[1.3,1.7],movingAwaySpeed:[60,80],movingCloserSpeed:[-120,-160],carLightsLength:[12,80],carLightsRadius:[0.05,0.14],carWidthPercentage:[0.3,0.5],carShiftX:[-0.8,0.8],carFloorSeparation:[0,5],colors:{roadColor:0x080808,islandColor:0x0a0a0a,background:0x000000,shoulderLines:0xFFFFFF,brokenLines:0xFFFFFF,leftCars:[0xD856BF,0x6750A2,0xC247AC],rightCars:[0x03B3C3,0x0E5EA5,0x324555],sticks:0x03B3C3}};

const random=base=>Array.isArray(base)?Math.random()*(base[1]-base[0])+base[0]:Math.random()*base;
const pickRandom=arr=>Array.isArray(arr)?arr[Math.floor(Math.random()*arr.length)]:arr;
function lerp(current,target,speed=0.1,limit=0.001){let change=(target-current)*speed;if(Math.abs(change)<limit)change=target-current;return change;}
let nsin=val=>Math.sin(val)*0.5+0.5;

const turbulentUniforms={uFreq:{value:new THREE.Vector4(4,8,8,1)},uAmp:{value:new THREE.Vector4(25,5,10,10)}};
const mountainUniforms={uFreq:{value:new THREE.Vector3(3,6,10)},uAmp:{value:new THREE.Vector3(30,30,20)}};
const xyUniforms={uFreq:{value:new THREE.Vector2(5,2)},uAmp:{value:new THREE.Vector2(25,15)}};
const deepUniforms={uFreq:{value:new THREE.Vector2(4,8)},uAmp:{value:new THREE.Vector2(10,20)},uPowY:{value:new THREE.Vector2(20,2)}};

const distortions={
  turbulentDistortion:{uniforms:turbulentUniforms,
    getDistortion:`uniform vec4 uFreq;uniform vec4 uAmp;float nsin2(float v){return sin(v)*0.5+0.5;}
#define PI 3.14159265358979
float getDistortionX(float p){return cos(PI*p*uFreq.r+uTime)*uAmp.r+pow(cos(PI*p*uFreq.g+uTime*(uFreq.g/uFreq.r)),2.)*uAmp.g;}
float getDistortionY(float p){return -nsin2(PI*p*uFreq.b+uTime)*uAmp.b-pow(nsin2(PI*p*uFreq.a+uTime/(uFreq.b/uFreq.a)),5.)*uAmp.a;}
vec3 getDistortion(float progress){return vec3(getDistortionX(progress)-getDistortionX(0.0125),getDistortionY(progress)-getDistortionY(0.0125),0.);}`,
    getJS:(progress,time)=>{const uFreq=turbulentUniforms.uFreq.value;const uAmp=turbulentUniforms.uAmp.value;const getX=p=>Math.cos(Math.PI*p*uFreq.x+time)*uAmp.x+Math.pow(Math.cos(Math.PI*p*uFreq.y+time*(uFreq.y/uFreq.x)),2)*uAmp.y;const getY=p=>-nsin(Math.PI*p*uFreq.z+time)*uAmp.z-Math.pow(nsin(Math.PI*p*uFreq.w+time/(uFreq.z/uFreq.w)),5)*uAmp.w;let d=new THREE.Vector3(getX(progress)-getX(progress+0.007),getY(progress)-getY(progress+0.007),0);return d.multiply(new THREE.Vector3(-2,-5,0)).add(new THREE.Vector3(0,0,-10));}
  },
  mountainDistortion:{uniforms:mountainUniforms,
    getDistortion:`uniform vec3 uAmp;uniform vec3 uFreq;float nsin2(float v){return sin(v)*0.5+0.5;}
#define PI 3.14159265358979
vec3 getDistortion(float progress){float fix=0.02;return vec3(cos(progress*PI*uFreq.x+uTime)*uAmp.x-cos(fix*PI*uFreq.x+uTime)*uAmp.x,nsin2(progress*PI*uFreq.y+uTime)*uAmp.y-nsin2(fix*PI*uFreq.y+uTime)*uAmp.y,nsin2(progress*PI*uFreq.z+uTime)*uAmp.z-nsin2(fix*PI*uFreq.z+uTime)*uAmp.z);}`,
    getJS:(progress,time)=>{let fix=0.02;const uFreq=mountainUniforms.uFreq.value;const uAmp=mountainUniforms.uAmp.value;let d=new THREE.Vector3(Math.cos(progress*Math.PI*uFreq.x+time)*uAmp.x-Math.cos(fix*Math.PI*uFreq.x+time)*uAmp.x,nsin(progress*Math.PI*uFreq.y+time)*uAmp.y-nsin(fix*Math.PI*uFreq.y+time)*uAmp.y,nsin(progress*Math.PI*uFreq.z+time)*uAmp.z-nsin(fix*Math.PI*uFreq.z+time)*uAmp.z);return d.multiply(new THREE.Vector3(2,2,2)).add(new THREE.Vector3(0,0,-5));}
  },
  xyDistortion:{uniforms:xyUniforms,
    getDistortion:`uniform vec2 uFreq;uniform vec2 uAmp;
#define PI 3.14159265358979
vec3 getDistortion(float progress){float fix=0.02;return vec3(cos(progress*PI*uFreq.x+uTime)*uAmp.x-cos(fix*PI*uFreq.x+uTime)*uAmp.x,sin(progress*PI*uFreq.y+PI/2.+uTime)*uAmp.y-sin(fix*PI*uFreq.y+PI/2.+uTime)*uAmp.y,0.);}`,
    getJS:(progress,time)=>{let fix=0.02;const uFreq=xyUniforms.uFreq.value;const uAmp=xyUniforms.uAmp.value;let d=new THREE.Vector3(Math.cos(progress*Math.PI*uFreq.x+time)*uAmp.x-Math.cos(fix*Math.PI*uFreq.x+time)*uAmp.x,Math.sin(progress*Math.PI*uFreq.y+time+Math.PI/2)*uAmp.y-Math.sin(fix*Math.PI*uFreq.y+time+Math.PI/2)*uAmp.y,0);return d.multiply(new THREE.Vector3(2,0.4,1)).add(new THREE.Vector3(0,0,-3));}
  },
  deepDistortion:{uniforms:deepUniforms,
    getDistortion:`uniform vec2 uFreq;uniform vec2 uAmp;uniform vec2 uPowY;float nsin2(float v){return sin(v)*0.5+0.5;}
#define PI 3.14159265358979
float dX(float p){return sin(p*PI*uFreq.x+uTime)*uAmp.x;}float dY(float p){return pow(abs(p*uPowY.x),uPowY.y)+sin(p*PI*uFreq.y+uTime)*uAmp.y;}
vec3 getDistortion(float progress){return vec3(dX(progress)-dX(0.02),dY(progress)-dY(0.02),0.);}`,
    getJS:(progress,time)=>{const uFreq=deepUniforms.uFreq.value;const uAmp=deepUniforms.uAmp.value;const uPowY=deepUniforms.uPowY.value;const gX=p=>Math.sin(p*Math.PI*uFreq.x+time)*uAmp.x;const gY=p=>Math.pow(p*uPowY.x,uPowY.y)+Math.sin(p*Math.PI*uFreq.y+time)*uAmp.y;let d=new THREE.Vector3(gX(progress)-gX(progress+0.01),gY(progress)-gY(progress+0.01),0);return d.multiply(new THREE.Vector3(-2,-4,0)).add(new THREE.Vector3(0,0,-10));}
  }
};

const carLightsFrag=`
varying vec3 vColor;varying vec2 vUv;uniform vec2 uFade;
void main(){float alpha=smoothstep(uFade.x,uFade.y,vUv.x);gl_FragColor=vec4(vColor,alpha);if(gl_FragColor.a<0.0001)discard;}
`;
const carLightsVert=`
attribute vec3 aOffset;attribute vec3 aMetrics;attribute vec3 aColor;
uniform float uTravelLength;uniform float uTime;
varying vec2 vUv;varying vec3 vColor;
DISTORTION_CHUNK
void main(){
  vec3 transformed=position.xyz;float radius=aMetrics.r;float myLength=aMetrics.g;float speed=aMetrics.b;
  transformed.xy*=radius;transformed.z*=myLength;
  transformed.z+=myLength-mod(uTime*speed+aOffset.z,uTravelLength);transformed.xy+=aOffset.xy;
  float progress=abs(transformed.z/uTravelLength);transformed.xyz+=getDistortion(progress);
  vec4 mvPosition=modelViewMatrix*vec4(transformed,1.);gl_Position=projectionMatrix*mvPosition;
  vUv=uv;vColor=aColor;
}
`;
const sideSticksVert=`
attribute float aOffset;attribute vec3 aColor;attribute vec2 aMetrics;
uniform float uTravelLength;uniform float uTime;varying vec3 vColor;
mat4 rotY(in float a){return mat4(cos(a),0,sin(a),0,0,1,0,0,-sin(a),0,cos(a),0,0,0,0,1);}
DISTORTION_CHUNK
void main(){
  vec3 transformed=position.xyz;float width=aMetrics.x;float height=aMetrics.y;
  transformed.xy*=vec2(width,height);float t=mod(uTime*60.*2.+aOffset,uTravelLength);
  transformed=(rotY(3.14/2.)*vec4(transformed,1.)).xyz;transformed.z+=-uTravelLength+t;
  float progress=abs(transformed.z/uTravelLength);transformed.xyz+=getDistortion(progress);
  transformed.y+=height/2.;transformed.x+=-width/2.;
  vec4 mvPosition=modelViewMatrix*vec4(transformed,1.);gl_Position=projectionMatrix*mvPosition;vColor=aColor;
}
`;
const sideSticksFrag=`varying vec3 vColor;void main(){gl_FragColor=vec4(vColor,1.);}`;
const roadVert=`
uniform float uTime;uniform float uTravelLength;varying vec2 vUv;
DISTORTION_CHUNK
void main(){
  vec3 transformed=position.xyz;vec3 dist=getDistortion((transformed.y+uTravelLength/2.)/uTravelLength);
  transformed.x+=dist.x;transformed.z+=dist.y;transformed.y+=-1.*dist.z;
  vec4 mvPosition=modelViewMatrix*vec4(transformed,1.);gl_Position=projectionMatrix*mvPosition;vUv=uv;
}
`;
const roadFrag=`
varying vec2 vUv;uniform vec3 uColor;uniform float uTime;
uniform float uLanes;uniform float uBrokenLinesWidthPercentage;uniform float uBrokenLinesLengthPercentage;
void main(){
  vec2 uv=vUv;uv.y=mod(uv.y+uTime*0.05,1.);
  float lw=1.0/uLanes;float blw=lw*uBrokenLinesWidthPercentage;float les=1.-uBrokenLinesLengthPercentage;
  float bl=step(1.0-blw,fract(uv.x*2.0))*step(les,fract(uv.y*10.0));
  float sl=step(1.0-blw,fract((uv.x-lw*(uLanes-1.0))*2.0))+step(blw,uv.x);
  bl=mix(bl,sl,uv.x);
  vec3 color=uColor+bl*0.08;
  gl_FragColor=vec4(color,1.);
}
`;
const islandFrag=`varying vec2 vUv;uniform vec3 uColor;void main(){gl_FragColor=vec4(uColor,1.);}`;

function makeMat(frag,vert,distortion,extraUniforms){
  const vs=vert.replace('DISTORTION_CHUNK',distortion.getDistortion);
  return new THREE.ShaderMaterial({fragmentShader:frag,vertexShader:vs,transparent:true,uniforms:Object.assign({uTime:{value:0}},extraUniforms)});
}

class CarLights{
  constructor(webgl,options,colors,speed,fade){this.webgl=webgl;this.options=options;this.colors=colors;this.speed=speed;this.fade=fade;}
  init(){
    const o=this.options;
    let curve=new THREE.LineCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-1));
    let geo=new THREE.TubeGeometry(curve,40,1,8,false);
    let inst=new THREE.InstancedBufferGeometry().copy(geo);
    inst.instanceCount=o.lightPairsPerRoadWay*2;
    let lw=o.roadWidth/o.lanesPerRoad;
    let aOff=[],aMet=[],aCol=[];
    let cols=Array.isArray(this.colors)?this.colors.map(c=>new THREE.Color(c)):new THREE.Color(this.colors);
    for(let i=0;i<o.lightPairsPerRoadWay;i++){
      let r=random(o.carLightsRadius),len=random(o.carLightsLength),spd=random(this.speed);
      let lane=i%o.lanesPerRoad,lx=lane*lw-o.roadWidth/2+lw/2;
      let cw=random(o.carWidthPercentage)*lw,cs=random(o.carShiftX)*lw;lx+=cs;
      let oy=random(o.carFloorSeparation)+r*1.3,oz=-random(o.length);
      aOff.push(lx-cw/2,oy,oz,lx+cw/2,oy,oz);
      aMet.push(r,len,spd,r,len,spd);
      let c=pickRandom(cols);aCol.push(c.r,c.g,c.b,c.r,c.g,c.b);
    }
    inst.setAttribute('aOffset',new THREE.InstancedBufferAttribute(new Float32Array(aOff),3,false));
    inst.setAttribute('aMetrics',new THREE.InstancedBufferAttribute(new Float32Array(aMet),3,false));
    inst.setAttribute('aColor',new THREE.InstancedBufferAttribute(new Float32Array(aCol),3,false));
    let mat=makeMat(carLightsFrag,carLightsVert,o.distortion,{uTravelLength:{value:o.length},uFade:{value:this.fade},...o.distortion.uniforms});
    let mesh=new THREE.Mesh(inst,mat);mesh.frustumCulled=false;this.webgl.scene.add(mesh);this.mesh=mesh;
  }
  update(t){this.mesh.material.uniforms.uTime.value=t;}
}

class LightsSticks{
  constructor(webgl,options){this.webgl=webgl;this.options=options;}
  init(){
    const o=this.options;let geo=new THREE.PlaneGeometry(1,1);
    let inst=new THREE.InstancedBufferGeometry().copy(geo);inst.instanceCount=o.totalSideLightSticks;
    let so=o.length/(o.totalSideLightSticks-1);
    let aOff=[],aCol=[],aMet=[];
    let cols=Array.isArray(o.colors.sticks)?o.colors.sticks.map(c=>new THREE.Color(c)):new THREE.Color(o.colors.sticks);
    for(let i=0;i<o.totalSideLightSticks;i++){
      let w=random(o.lightStickWidth),h=random(o.lightStickHeight);
      aOff.push((i-1)*so*2+so*Math.random());
      let c=pickRandom(cols);aCol.push(c.r,c.g,c.b);aMet.push(w,h);
    }
    inst.setAttribute('aOffset',new THREE.InstancedBufferAttribute(new Float32Array(aOff),1,false));
    inst.setAttribute('aColor',new THREE.InstancedBufferAttribute(new Float32Array(aCol),3,false));
    inst.setAttribute('aMetrics',new THREE.InstancedBufferAttribute(new Float32Array(aMet),2,false));
    let mat=makeMat(sideSticksFrag,sideSticksVert,o.distortion,{uTravelLength:{value:o.length},...o.distortion.uniforms});
    mat.side=THREE.DoubleSide;
    let mesh=new THREE.Mesh(inst,mat);mesh.frustumCulled=false;this.webgl.scene.add(mesh);this.mesh=mesh;
  }
  update(t){this.mesh.material.uniforms.uTime.value=t;}
}

class Road{
  constructor(webgl,options){this.webgl=webgl;this.options=options;this.uTime={value:0};}
  createPlane(side,isRoad){
    const o=this.options;
    let geo=new THREE.PlaneGeometry(isRoad?o.roadWidth:o.islandWidth,o.length,20,100);
    let mat;
    if(isRoad){
      let vs=roadVert.replace('DISTORTION_CHUNK',o.distortion.getDistortion);
      mat=new THREE.ShaderMaterial({fragmentShader:roadFrag,vertexShader:vs,side:THREE.DoubleSide,uniforms:{uTime:this.uTime,uTravelLength:{value:o.length},uColor:{value:new THREE.Color(o.colors.roadColor)},uLanes:{value:o.lanesPerRoad},uBrokenLinesWidthPercentage:{value:o.brokenLinesWidthPercentage},uBrokenLinesLengthPercentage:{value:o.brokenLinesLengthPercentage},...o.distortion.uniforms}});
    } else {
      let vs=roadVert.replace('DISTORTION_CHUNK',o.distortion.getDistortion);
      mat=new THREE.ShaderMaterial({fragmentShader:islandFrag,vertexShader:vs,side:THREE.DoubleSide,uniforms:{uTime:this.uTime,uTravelLength:{value:o.length},uColor:{value:new THREE.Color(o.colors.islandColor)},...o.distortion.uniforms}});
    }
    let mesh=new THREE.Mesh(geo,mat);mesh.rotation.x=-Math.PI/2;mesh.position.z=-o.length/2;mesh.position.x+=(o.islandWidth/2+o.roadWidth/2)*side;this.webgl.scene.add(mesh);return mesh;
  }
  init(){this.left=this.createPlane(-1,true);this.right=this.createPlane(1,true);this.island=this.createPlane(0,false);}
  update(t){this.uTime.value=t;}
}

class App{
  constructor(container,options){
    this.options=options;this.container=container;this.disposed=false;
    const w=Math.max(1,container.offsetWidth),h=Math.max(1,container.offsetHeight);
    this.renderer=new THREE.WebGLRenderer({antialias:false,alpha:true});
    this.renderer.setSize(w,h,false);this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    container.appendChild(this.renderer.domElement);
    this.camera=new THREE.PerspectiveCamera(options.fov,w/h,0.1,10000);
    this.camera.position.set(0,8,-5);
    this.scene=new THREE.Scene();
    this.clock=new THREE.Clock();
    this.fovTarget=options.fov;this.speedUpTarget=0;this.speedUp=0;this.timeOffset=0;
    this.road=new Road(this,options);
    this.leftCars=new CarLights(this,options,options.colors.leftCars,options.movingAwaySpeed,new THREE.Vector2(0,1-options.carLightsFade));
    this.rightCars=new CarLights(this,options,options.colors.rightCars,options.movingCloserSpeed,new THREE.Vector2(1,0+options.carLightsFade));
    this.sticks=new LightsSticks(this,options);
    this._tick=this._tick.bind(this);
    this._onDown=this._onDown.bind(this);this._onUp=this._onUp.bind(this);
    this._onResize=this._onResize.bind(this);
    window.addEventListener('resize',this._onResize);
  }
  _onResize(){
    const w=this.container.offsetWidth,h=this.container.offsetHeight;if(!w||!h)return;
    this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
  }
  _onDown(){if(this.options.onSpeedUp)this.options.onSpeedUp();this.fovTarget=this.options.fovSpeedUp;this.speedUpTarget=this.options.speedUp;}
  _onUp(){if(this.options.onSlowDown)this.options.onSlowDown();this.fovTarget=this.options.fov;this.speedUpTarget=0;}
  init(){
    const o=this.options;
    this.road.init();
    this.leftCars.init();this.leftCars.mesh.position.x=-o.roadWidth/2-o.islandWidth/2;
    this.rightCars.init();this.rightCars.mesh.position.x=o.roadWidth/2+o.islandWidth/2;
    this.sticks.init();this.sticks.mesh.position.x=-(o.roadWidth+o.islandWidth/2);
    this.container.addEventListener('mousedown',this._onDown);
    this.container.addEventListener('mouseup',this._onUp);
    this.container.addEventListener('touchstart',this._onDown,{passive:true});
    this.container.addEventListener('touchend',this._onUp,{passive:true});
    this._tick();
  }
  _tick(){
    if(this.disposed)return;
    const delta=this.clock.getDelta();
    const lp=Math.exp(-(-60*Math.log2(1-0.1))*delta);
    this.speedUp+=lerp(this.speedUp,this.speedUpTarget,lp,0.00001);
    this.timeOffset+=this.speedUp*delta;
    const time=this.clock.elapsedTime+this.timeOffset;
    this.rightCars.update(time);this.leftCars.update(time);this.sticks.update(time);this.road.update(time);
    const fovChange=lerp(this.camera.fov,this.fovTarget,lp);
    if(fovChange!==0){this.camera.fov+=fovChange*delta*6;this.camera.updateProjectionMatrix();}
    if(this.options.distortion.getJS){
      const d=this.options.distortion.getJS(0.025,time);
      this.camera.lookAt(this.camera.position.x+d.x,this.camera.position.y+d.y,this.camera.position.z+d.z);
    }
    this.renderer.render(this.scene,this.camera);
    this._raf=requestAnimationFrame(this._tick);
  }
  dispose(){
    this.disposed=true;
    if(this._raf)cancelAnimationFrame(this._raf);
    window.removeEventListener('resize',this._onResize);
    this.container.removeEventListener('mousedown',this._onDown);
    this.container.removeEventListener('mouseup',this._onUp);
    this.container.removeEventListener('touchstart',this._onDown);
    this.container.removeEventListener('touchend',this._onUp);
    this.scene.traverse(o=>{if(!o.isMesh)return;o.geometry&&o.geometry.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});
    this.renderer.dispose();this.renderer.forceContextLoss();
    if(this.renderer.domElement.parentNode)this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
  }
}

const Hyperspeed=({effectOptions=DEFAULT_EFFECT_OPTIONS})=>{
  const ref=useRef(null);const appRef=useRef(null);
  useEffect(()=>{
    const container=ref.current;if(!container)return;
    const opts={...DEFAULT_EFFECT_OPTIONS,...effectOptions,colors:{...DEFAULT_EFFECT_OPTIONS.colors,...effectOptions.colors}};
    opts.distortion=distortions[opts.distortion]||distortions.turbulentDistortion;
    const app=new App(container,opts);appRef.current=app;app.init();
    return()=>{if(appRef.current){appRef.current.dispose();appRef.current=null;}};
  },[effectOptions]);
  return <div ref={ref} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',overflow:'hidden'}}></div>;
};

export default Hyperspeed;
