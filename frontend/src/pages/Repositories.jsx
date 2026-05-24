import React from 'react'

const stats = [
  { label:'Total Repositories', value:'24' },
  { label:'Active Monitoring',  value:'18' },
  { label:'Webhook Health',     value:'98.2%' },
  { label:'Reviews (24h)',      value:'142' },
]

const repos = [
  { name:'pulse-engine-core', org:'org/infrastructure', lang:'Python',     stars:142, prs:8,  health:'Healthy',  issues:0, lastReview:'2h ago' },
  { name:'vector-search-ui',  org:'org/frontend',       lang:'TypeScript', stars:89,  prs:12, health:'Warning',  issues:2, lastReview:'4h ago' },
  { name:'legacy-auth-service',org:'org/backend',       lang:'Go',         stars:34,  prs:3,  health:'Critical', issues:5, lastReview:'1d ago' },
]

const langColor = { Python:'#3B82F6', TypeScript:'#fbbf24', Go:'#4ade80' }

function StatusBadge({ s }) {
  const map = { Healthy:'badge-success', Warning:'badge-warning', Critical:'badge-error' }
  return <span className={`badge ${map[s]||'badge-muted'}`}>{s}</span>
}

export default function Repositories() {
  return (
    <div style={{ padding:'32px 40px', maxWidth:1400 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, color:'#cee3f1', marginBottom:4 }}>Repositories</h1>
          <p style={{ fontSize:13, color:'#8d9195' }}>Manage connected codebases and AI oversight parameters.</p>
        </div>
        <button className="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Connect Repo
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 }}>
        {stats.map(s => (
          <div key={s.label} className="card-accent" style={{ padding:20 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#8d9195', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>{s.label}</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, color:'#cee3f1' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Repo Table */}
      <div className="card" style={{ overflow:'hidden', marginBottom:24 }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(178,199,213,0.08)' }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color:'#cee3f1' }}>Connected Repositories</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Repository</th>
              <th>Language</th>
              <th>Open PRs</th>
              <th>Health</th>
              <th>Issues</th>
              <th>Last Review</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {repos.map(r => (
              <tr key={r.name}>
                <td>
                  <div>
                    <div style={{ color:'#cee3f1', fontWeight:500, fontSize:13, marginBottom:2 }}>{r.name}</div>
                    <div className="mono" style={{ fontSize:10, color:'#8d9195' }}>{r.org}</div>
                  </div>
                </td>
                <td>
                  <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background: langColor[r.lang]||'#8d9195' }}/>
                    <span className="mono" style={{ fontSize:12 }}>{r.lang}</span>
                  </span>
                </td>
                <td><span className="mono" style={{ fontSize:13, color:'#cee3f1' }}>{r.prs}</span></td>
                <td><StatusBadge s={r.health}/></td>
                <td style={{ color: r.issues>0 ? '#f87171':'#4ade80', fontFamily:'var(--font-mono)', fontSize:12 }}>{r.issues>0?`${r.issues} found`:'None'}</td>
                <td><span className="mono" style={{ fontSize:11, color:'#8d9195' }}>{r.lastReview}</span></td>
                <td><button className="btn btn-ghost" style={{ padding:'4px 12px', fontSize:11 }}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Health Trends */}
      <div className="card" style={{ padding:24 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color:'#cee3f1', marginBottom:4 }}>Health Trends</h3>
        <p style={{ fontSize:12, color:'#8d9195', marginBottom:20 }}>Critical Issue Frequency & PR Velocity</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
          <div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#8d9195', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.06em' }}>Average Severity by Repo</div>
            {repos.map(r => (
              <div key={r.name} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:12, color:'#c3c7cb' }}>{r.name}</span>
                  <span className="mono" style={{ fontSize:11, color:'#8d9195' }}>{r.issues} issues</span>
                </div>
                <div style={{ height:3, background:'rgba(178,199,213,0.1)', borderRadius:2 }}>
                  <div style={{ height:'100%', width:`${(r.issues/10)*100}%`, background: r.health==='Critical'?'#f87171':r.health==='Warning'?'#fbbf24':'#4ade80', borderRadius:2 }}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding:16, background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:8 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#8d9195', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>AI Insight</div>
            <p style={{ fontSize:13, color:'#c3c7cb', lineHeight:1.65 }}>
              <strong style={{ color:'#b2c7d5' }}>vector-search-ui</strong> has seen a 15% increase in code density. Recommend workflow adjustment.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
