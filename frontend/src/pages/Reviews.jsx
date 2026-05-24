import React, { useState } from 'react'

const reviews = [
  { id:'pulse-core #1204', repo:'pulse-core', branch:'fix/sql-injection-auth', status:'Critical', agent:'Security', time:'2h ago', issues:3, desc:'Detected vulnerability: Potential SQL Injection in auth middleware' },
  { id:'web-client #892',  repo:'web-client', branch:'feat/user-dashboard',    status:'Issues',   agent:'Bug Detection', time:'5h ago', issues:2, desc:'Possible null pointer dereference in UserProvider context' },
  { id:'api-gateway #201', repo:'api-gateway', branch:'fix/rate-limiter',      status:'Clean',    agent:'All Agents', time:'8h ago', issues:0, desc:'No issues found. Code quality score: 94/100.' },
]

const SELECTED = reviews[0]

function StatusBadge({ s }) {
  const map = { Critical:'badge-error', Issues:'badge-warning', Clean:'badge-success', Running:'badge-warning', Pending:'badge-muted' }
  return <span className={`badge ${map[s]||'badge-muted'}`}>{s}</span>
}

export default function Reviews() {
  const [selected, setSelected] = useState(SELECTED)

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      {/* List Panel */}
      <div style={{ width:380, borderRight:'1px solid rgba(178,199,213,0.08)', overflow:'auto', flexShrink:0 }}>
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid rgba(178,199,213,0.08)', position:'sticky', top:0, background:'var(--color-bg-deep)', zIndex:10 }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'#cee3f1', marginBottom:4 }}>Reviews</h1>
          <p style={{ fontSize:12, color:'#8d9195', marginBottom:14 }}>Showing {reviews.length} of 128 reviews</p>
          <input className="input" placeholder="Search reviews..." style={{ fontSize:12 }}/>
          <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
            {['All','Critical','Issues','Clean'].map(f => (
              <button key={f} className="btn btn-ghost" style={{ padding:'4px 12px', fontSize:11, borderRadius:6 }}>{f}</button>
            ))}
          </div>
        </div>
        <div>
          {reviews.map(r => (
            <div key={r.id} onClick={() => setSelected(r)} style={{ padding:'16px 20px', borderBottom:'1px solid rgba(178,199,213,0.06)', cursor:'pointer', background: selected.id===r.id ? 'rgba(178,199,213,0.05)' : 'transparent', borderLeft: selected.id===r.id ? '2px solid #b2c7d5' : '2px solid transparent', transition:'all 0.15s ease' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                <div className="mono" style={{ fontSize:12, color:'#cee3f1', fontWeight:500 }}>PR: {r.id}</div>
                <StatusBadge s={r.status}/>
              </div>
              <div style={{ fontSize:12, color:'#c3c7cb', marginBottom:6, lineHeight:1.5 }}>{r.desc}</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span className="mono" style={{ fontSize:10, color:'#8d9195' }}>{r.repo}</span>
                <span className="mono" style={{ fontSize:10, color:'#8d9195' }}>{r.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div style={{ flex:1, overflow:'auto', padding:'32px 40px' }}>
        {selected ? (
          <>
            <div style={{ marginBottom:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'#cee3f1' }}>PR Review: {selected.id}</h2>
                <StatusBadge s={selected.status}/>
              </div>
              <p style={{ fontSize:13, color:'#c3c7cb', lineHeight:1.6 }}>{selected.desc}</p>
            </div>

            {selected.status === 'Critical' && (
              <>
                {/* Impact Analysis */}
                <div className="card" style={{ padding:24, marginBottom:20 }}>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color:'#cee3f1', marginBottom:12 }}>Impact Analysis</h3>
                  <p style={{ fontSize:13, color:'#c3c7cb', lineHeight:1.7 }}>
                    The AI engine has identified a lack of parameterization in the <span className="mono" style={{ color:'#b2c7d5', fontSize:12 }}>src/auth/db.ts</span> file. This vulnerability could allow an attacker to bypass authentication mechanisms by injecting malicious SQL fragments into the login query.
                  </p>
                </div>

                {/* Code Diff */}
                <div className="card" style={{ padding:24, marginBottom:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color:'#cee3f1' }}>Code Diff (Highlighted Snippet)</h3>
                    <span className="mono" style={{ fontSize:11, color:'#8d9195' }}>src/auth/db.ts</span>
                  </div>
                  <div className="code-block">
                    <div className="code-neutral">41 | const query = `</div>
                    <div className="code-removed">42 | - SELECT * FROM users WHERE email = '{'${email}'}' AND pwd = '{'${pwd}'}'</div>
                    <div className="code-neutral">43 | `;</div>
                    <div className="code-added">42 | + const query = "SELECT * FROM users WHERE email = ? AND pwd = ?";</div>
                    <div className="code-added">43 | + db.execute(query, [email, pwd]);</div>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="card" style={{ padding:24 }}>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color:'#cee3f1', marginBottom:12 }}>AI Reasoning</h3>
                  <div style={{ fontSize:13, color:'#c3c7cb', lineHeight:1.7, marginBottom:16 }}>
                    String interpolation in SQL queries creates an injection vector. The agent cross-referenced this pattern against the OWASP Top 10 (A03:2021).
                  </div>
                  <div style={{ background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:8, padding:16 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#4ade80', marginBottom:6 }}>Recommended Fix</div>
                    <p style={{ fontSize:12, color:'#c3c7cb', lineHeight:1.6 }}>Implement prepared statements or use an ORM to sanitize user input before execution.</p>
                  </div>
                </div>
              </>
            )}

            {selected.status === 'Clean' && (
              <div className="card" style={{ padding:24, textAlign:'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom:16, display:'block', margin:'0 auto 16px' }}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:600, color:'#4ade80', marginBottom:8 }}>No Issues Detected</h3>
                <p style={{ fontSize:13, color:'#c3c7cb' }}>All agents completed analysis. Code quality score: 94/100.</p>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign:'center', marginTop:80, color:'#8d9195' }}>Select a review to view details</div>
        )}
      </div>
    </div>
  )
}
