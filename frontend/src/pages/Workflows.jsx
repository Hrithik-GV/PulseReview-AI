import React, { useState } from 'react'

const workflows = [
  {
    id:'wf-142', name:'feat: implement autonomous diff clustering', pr:'#142', repo:'pulse-engine-core',
    status:'Running', branch:'feat/auto-diff-clustering',
    timeline:[
      { agent:'Security Agent', status:'Done', msg:'Scanned 14 files. No critical vulnerabilities found. 2 minor dependency warnings identified in package-lock.json.', time:'2m ago' },
      { agent:'Performance Agent', status:'Running', msg:'Evaluating Big-O complexity for cluster_diffs()', time:'Running...' },
      { agent:'Bug Detection Agent', status:'Issue', msg:'Possible race condition in async thread pool — utils/concurrency.ts: L142-L158 — "The cluster map is mutated without an atomic lock inside the parallel map operation. This will cause intermittent data loss under heavy load."', time:'1m ago' },
    ],
    files:14, github:{ status:'waiting', trigger:'completion_hook' },
    pulse:'All agents are operating within nominal latency parameters. Consensus reached on logic integrity for 12/14 files.',
  },
  {
    id:'wf-141', name:'fix/db-leak-prevention', pr:'#108', repo:'data-layer',
    status:'Pending', branch:'fix/db-leak-prevention',
    timeline:[], files:3, github:null, pulse:null,
  },
]

function StatusBadge({ s }) {
  const map = { Done:'badge-success', Running:'badge-warning', Issue:'badge-error', Pending:'badge-muted', Waiting:'badge-info' }
  return <span className={`badge ${map[s]||'badge-muted'}`}>{s}</span>
}

function AgentIcon({ status }) {
  const color = status==='Done'?'#4ade80':status==='Running'?'#fbbf24':status==='Issue'?'#f87171':'#8d9195'
  return (
    <div style={{ width:32, height:32, borderRadius:'50%', border:`2px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:`${color}18` }}>
      {status==='Done' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
      {status==='Running' && <div style={{ width:8, height:8, borderRadius:'50%', background:color, animation:'pulse 1.5s infinite' }}/>}
      {status==='Issue' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
      {status==='Pending' && <div style={{ width:8, height:8, borderRadius:'50%', background:color }}/>}
    </div>
  )
}

export default function Workflows() {
  const [selected, setSelected] = useState(workflows[0])

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      {/* List */}
      <div style={{ width:320, borderRight:'1px solid rgba(178,199,213,0.08)', overflow:'auto', flexShrink:0 }}>
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid rgba(178,199,213,0.08)' }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'#cee3f1', marginBottom:4 }}>Workflows</h1>
          <p style={{ fontSize:12, color:'#8d9195' }}>Active AI review pipelines</p>
        </div>
        {workflows.map(w => (
          <div key={w.id} onClick={() => setSelected(w)} style={{ padding:'14px 20px', borderBottom:'1px solid rgba(178,199,213,0.06)', cursor:'pointer', background: selected.id===w.id ? 'rgba(178,199,213,0.05)' : 'transparent', borderLeft: selected.id===w.id ? '2px solid #b2c7d5' : '2px solid transparent' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span className="mono" style={{ fontSize:11, color:'#b2c7d5' }}>{w.repo} {w.pr}</span>
              <StatusBadge s={w.status}/>
            </div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'#cee3f1', fontWeight:500 }}>{w.name}</div>
          </div>
        ))}
      </div>

      {/* Detail */}
      <div style={{ flex:1, overflow:'auto', padding:'32px 40px' }}>
        {selected && (
          <>
            <div style={{ marginBottom:28 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'#cee3f1' }}>{selected.name}</h2>
                <StatusBadge s={selected.status}/>
              </div>
              <div style={{ display:'flex', gap:16 }}>
                <span className="mono" style={{ fontSize:11, color:'#8d9195' }}>{selected.repo}</span>
                <span className="mono" style={{ fontSize:11, color:'#8d9195' }}>{selected.pr}</span>
                <span className="mono" style={{ fontSize:11, color:'#8d9195' }}>{selected.files} files changed</span>
              </div>
            </div>

            {/* Timeline */}
            {selected.timeline.length > 0 && (
              <div className="card" style={{ padding:24, marginBottom:20 }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color:'#cee3f1', marginBottom:20 }}>Pipeline Timeline</h3>
                <div style={{ position:'relative', paddingLeft:20 }}>
                  <div style={{ position:'absolute', left:15, top:16, bottom:16, width:1, background:'rgba(178,199,213,0.1)' }}/>
                  {selected.timeline.map((step, i) => (
                    <div key={i} style={{ display:'flex', gap:16, marginBottom:i < selected.timeline.length-1 ? 24 : 0 }}>
                      <AgentIcon status={step.status}/>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                          <span style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, color:'#cee3f1' }}>{step.agent}</span>
                          <span className="mono" style={{ fontSize:10, color:'#8d9195' }}>{step.time}</span>
                        </div>
                        <p style={{ fontSize:12, color:'#c3c7cb', lineHeight:1.6 }}>{step.msg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GitHub */}
            {selected.github && (
              <div className="card" style={{ padding:24, marginBottom:20 }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color:'#cee3f1', marginBottom:12 }}>GitHub Integration</h3>
                <div style={{ fontSize:12, color:'#8d9195', marginBottom:8 }}>Payload Response:</div>
                <div className="code-block" style={{ fontSize:12 }}>
                  <span className="code-neutral">{'{ '}</span>
                  <span style={{ color:'#a78bfa' }}>"status"</span>: <span style={{ color:'#fbbf24' }}>"waiting"</span>,{' '}
                  <span style={{ color:'#a78bfa' }}>"trigger"</span>: <span style={{ color:'#fbbf24' }}>"completion_hook"</span>
                  <span className="code-neutral">{' }'}</span>
                </div>
              </div>
            )}

            {/* AI Pulse */}
            {selected.pulse && (
              <div className="card" style={{ padding:24, background:'rgba(178,199,213,0.03)' }}>
                <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', marginTop:5, flexShrink:0, boxShadow:'0 0 6px #4ade80' }}/>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#4ade80', marginBottom:4 }}>AI Pulse</div>
                    <p style={{ fontSize:12, color:'#c3c7cb', lineHeight:1.6 }}>{selected.pulse}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
