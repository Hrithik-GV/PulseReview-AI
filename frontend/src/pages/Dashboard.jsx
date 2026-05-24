import React from 'react'

const stats = [
  { value:'1,284', label:'Total Reviews', sub:'All time', trend:'+12%', up:true },
  { value:'14',    label:'Active Workflows', sub:'Running now', trend:'2 pending', up:null },
  { value:'3',     label:'Critical Issues', sub:'Needs attention', trend:'-1 today', up:true },
  { value:'42',    label:'Repos Monitored', sub:'Across 3 orgs', trend:'98.2% healthy', up:null },
]

const workflows = [
  { name:'feat/auth-v2-refactor', repo:'core-engine', pr:'#452', status:'Running', agents:['Security','Bug Detection'], progress:65 },
  { name:'fix/db-leak-prevention', repo:'data-layer', pr:'#108', status:'Pending', agents:['Performance'], progress:0 },
]

const history = [
  { pr:'fix/null-pointer-exception #1201', repo:'pulse-core', status:'Clean',    time:'12m ago',  issues:0 },
  { pr:'feat/user-dashboard #892',         repo:'web-client', status:'Issues',   time:'1h ago',   issues:3 },
  { pr:'chore/update-deps #1198',          repo:'pulse-core', status:'Clean',    time:'3h ago',   issues:0 },
  { pr:'feat/stripe-integration #445',     repo:'billing-svc',status:'Critical', time:'5h ago',   issues:7 },
  { pr:'fix/rate-limiter #201',            repo:'api-gateway', status:'Clean',   time:'8h ago',   issues:0 },
]

const agents = [
  { name:'Security Agent',    status:'Active', latency:'142ms', reviewed:1284 },
  { name:'Bug Detection',     status:'Active', latency:'98ms',  reviewed:1284 },
  { name:'Performance Agent', status:'Active', latency:'210ms', reviewed:1284 },
  { name:'Logic Analyzer',    status:'Idle',   latency:'—',     reviewed:892  },
]

const repos = [
  { name:'core-backend',  health:'Healthy', prs:24 },
  { name:'docs-portal',   health:'Healthy', prs:8  },
  { name:'auth-service',  health:'Healthy', prs:11 },
]

function StatCard({ value, label, sub, trend, up }) {
  return (
    <div className="card-accent" style={{ padding:24 }}>
      <div style={{ fontSize:11, color:'#8d9195', fontFamily:'var(--font-mono)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:12 }}>{label}</div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:700, color:'#cee3f1', lineHeight:1, marginBottom:8 }}>{value}</div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:12, color:'#8d9195' }}>{sub}</span>
        {trend && <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color: up ? '#4ade80' : '#c3c7cb' }}>{trend}</span>}
      </div>
    </div>
  )
}

function StatusBadge({ s }) {
  const map = { Running:'badge-warning', Pending:'badge-muted', Clean:'badge-success', Issues:'badge-error', Critical:'badge-error', Active:'badge-success', Idle:'badge-muted' }
  return <span className={`badge ${map[s]||'badge-muted'}`}>{s}</span>
}

export default function Dashboard() {
  return (
    <div style={{ padding:'32px 40px', maxWidth:1400 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:32 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, color:'#cee3f1', letterSpacing:'-0.02em', marginBottom:4 }}>Dashboard</h1>
          <p style={{ fontSize:13, color:'#8d9195' }}>Real-time overview of your AI code review pipeline.</p>
        </div>
        <button className="btn btn-primary" style={{ fontSize:13 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Connect Repo
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 }}>
        {stats.map(s => <StatCard key={s.label} {...s}/>)}
      </div>

      {/* Main Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {/* Active Workflows */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(178,199,213,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color:'#cee3f1' }}>Active Workflows</span>
              <span className="badge badge-warning">{workflows.length} running</span>
            </div>
            <div style={{ padding:'12px 0' }}>
              {workflows.map(w => (
                <div key={w.name} style={{ padding:'12px 20px', borderBottom:'1px solid rgba(178,199,213,0.04)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'#cee3f1', marginBottom:3 }}>{w.name}</div>
                      <div style={{ fontSize:11, color:'#8d9195' }}>{w.repo} · {w.pr}</div>
                    </div>
                    <StatusBadge s={w.status}/>
                  </div>
                  <div style={{ display:'flex', gap:6, marginBottom:10 }}>
                    {w.agents.map(a => <span key={a} className="badge badge-muted" style={{ fontSize:10 }}>{a}</span>)}
                  </div>
                  {w.progress > 0 && (
                    <div style={{ height:3, background:'rgba(178,199,213,0.1)', borderRadius:2 }}>
                      <div style={{ height:'100%', width:`${w.progress}%`, background:'linear-gradient(90deg,#b2c7d5,#3B82F6)', borderRadius:2, transition:'width 0.3s ease' }}/>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Review History */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(178,199,213,0.08)' }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color:'#cee3f1' }}>Recent Review History</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pull Request</th>
                  <th>Repository</th>
                  <th>Status</th>
                  <th>Issues</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.pr}>
                    <td><span className="mono" style={{ color:'#cee3f1', fontSize:12 }}>{h.pr}</span></td>
                    <td><span className="mono" style={{ fontSize:12 }}>{h.repo}</span></td>
                    <td><StatusBadge s={h.status}/></td>
                    <td style={{ color: h.issues > 0 ? '#f87171' : '#4ade80', fontFamily:'var(--font-mono)', fontSize:12 }}>{h.issues > 0 ? `${h.issues} found` : 'None'}</td>
                    <td style={{ color:'#8d9195', fontFamily:'var(--font-mono)', fontSize:11 }}>{h.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {/* Agent Activity */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(178,199,213,0.08)' }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color:'#cee3f1' }}>Agent Activity</span>
            </div>
            <div style={{ padding:'8px 0' }}>
              {agents.map(a => (
                <div key={a.name} style={{ padding:'10px 20px', borderBottom:'1px solid rgba(178,199,213,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background: a.status==='Active'?'#4ade80':'#8d9195', boxShadow: a.status==='Active'?'0 0 6px #4ade80':'none' }}/>
                    <div>
                      <div style={{ fontSize:12, color:'#c3c7cb', marginBottom:1 }}>{a.name}</div>
                      <div className="mono" style={{ fontSize:10, color:'#8d9195' }}>{a.latency}</div>
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize:11, color:'#8d9195' }}>{a.reviewed.toLocaleString()} reviews</div>
                </div>
              ))}
            </div>
          </div>

          {/* Healthy Repos */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(178,199,213,0.08)' }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color:'#cee3f1' }}>Healthy Repositories</span>
            </div>
            <div style={{ padding:'8px 0' }}>
              {repos.map(r => (
                <div key={r.name} style={{ padding:'10px 20px', borderBottom:'1px solid rgba(178,199,213,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:28, height:28, borderRadius:6, background:'rgba(178,199,213,0.06)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c3c7cb" strokeWidth="1.75"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                    </div>
                    <span style={{ fontSize:13, color:'#cee3f1' }}>{r.name}</span>
                  </div>
                  <span className="badge badge-success" style={{ fontSize:10 }}>{r.health}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
