import React, { useState, useEffect } from 'react'
import { fetchStats, fetchWorkflows, fetchHistory, fetchRepos } from '../services/api'

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
  const map = { Running:'badge-warning', Pending:'badge-muted', Clean:'badge-success', Issues:'badge-warning', Critical:'badge-error', Active:'badge-success', Idle:'badge-muted', Failed:'badge-error' }
  return <span className={`badge ${map[s]||'badge-muted'}`}>{s}</span>
}

export default function Dashboard() {
  const [statsData, setStatsData] = useState({ total_reviews: 0, active_workflows: 0, critical_issues: 0, repos_monitored: 0 })
  const [workflows, setWorkflows] = useState([])
  const [history, setHistory] = useState([])
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [s, w, h, r] = await Promise.all([
        fetchStats(),
        fetchWorkflows(),
        fetchHistory(),
        fetchRepos()
      ])
      setStatsData(s)
      setWorkflows(w.filter(item => item.status === "Running" || item.status === "Pending"))
      setHistory(h.slice(0, 5))
      setRepos(r.slice(0, 3))
    } catch (err) {
      console.error("Error loading dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // Poll active workflows & stats every 3 seconds for live progress tracking
    const interval = setInterval(loadData, 3000)
    return () => clearInterval(interval)
  }, [])

  // Map backend stats to display structure
  const statsList = [
    { value: statsData.total_reviews.toLocaleString(), label: 'Total Reviews', sub: 'All time', trend: '+12%', up: true },
    { value: statsData.active_workflows.toString(), label: 'Active Workflows', sub: 'Running now', trend: `${statsData.active_workflows} pending`, up: null },
    { value: statsData.critical_issues.toString(), label: 'Critical Issues', sub: 'Needs attention', trend: '-1 today', up: true },
    { value: statsData.repos_monitored.toString(), label: 'Repos Monitored', sub: 'Active syncs', trend: '100% online', up: null },
  ]

  // Dynamic agent states based on active workflow progress
  const activeProgress = workflows.length > 0 ? workflows[0].progress : 0
  const agentsList = [
    { name: 'Planner Agent', status: workflows.length > 0 && activeProgress < 20 ? 'Active' : 'Idle', latency: '142ms', reviewed: statsData.total_reviews },
    { name: 'Bug Detection', status: workflows.length > 0 && activeProgress >= 20 && activeProgress < 40 ? 'Active' : 'Idle', latency: '98ms', reviewed: statsData.total_reviews },
    { name: 'Security Agent', status: workflows.length > 0 && activeProgress >= 40 && activeProgress < 60 ? 'Active' : 'Idle', latency: '142ms', reviewed: statsData.total_reviews },
    { name: 'Performance Agent', status: workflows.length > 0 && activeProgress >= 60 && activeProgress < 80 ? 'Active' : 'Idle', latency: '210ms', reviewed: statsData.total_reviews },
  ]

  const formatTime = (isoString) => {
    if (!isoString) return '—'
    try {
      const date = new Date(isoString)
      const diffMs = new Date() - date
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins < 1) return 'just now'
      if (diffMins < 60) return `${diffMins}m ago`
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours}h ago`
      return date.toLocaleDateString()
    } catch {
      return '—'
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#8d9195', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        Loading console metrics...
      </div>
    )
  }

  return (
    <div style={{ padding:'32px 40px', maxWidth:1400 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:32 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, color:'#cee3f1', letterSpacing:'-0.02em', marginBottom:4 }}>Dashboard</h1>
          <p style={{ fontSize:13, color:'#8d9195' }}>Real-time overview of your AI code review pipeline.</p>
        </div>
        <a href="#/repositories" className="btn btn-primary" style={{ fontSize:13, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Manage Repos
        </a>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 }}>
        {statsList.map(s => <StatCard key={s.label} {...s}/>)}
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
              {workflows.length === 0 ? (
                <div style={{ padding: '24px 20px', fontSize: 12, color: '#8d9195', fontFamily: 'var(--font-mono)' }}>
                  No active workflows executing. Open a Pull Request to trigger review.
                </div>
              ) : (
                workflows.map(w => (
                  <div key={w.id} style={{ padding:'12px 20px', borderBottom:'1px solid rgba(178,199,213,0.04)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                      <div>
                        <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'#cee3f1', marginBottom:3 }}>{w.pr_title}</div>
                        <div style={{ fontSize:11, color:'#8d9195' }}>{w.repo_name} · #{w.pr_number}</div>
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
                ))
              )}
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
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px 20px', fontSize: 12, color: '#8d9195', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                      No reviews logged yet.
                    </td>
                  </tr>
                ) : (
                  history.map(h => {
                    const issueCount = h.bug_count + h.security_issues + h.perf_issues
                    return (
                      <tr key={h.id}>
                        <td><span className="mono" style={{ color:'#cee3f1', fontSize:12 }}>{h.pr_title} #{h.pr_number}</span></td>
                        <td><span className="mono" style={{ fontSize:12 }}>{h.repo_name}</span></td>
                        <td><StatusBadge s={h.score < 60 ? 'Critical' : h.score < 90 ? 'Issues' : 'Clean'}/></td>
                        <td style={{ color: issueCount > 0 ? '#f87171' : '#4ade80', fontFamily:'var(--font-mono)', fontSize:12 }}>
                          {issueCount > 0 ? `${issueCount} found` : 'None'}
                        </td>
                        <td style={{ color:'#8d9195', fontFamily:'var(--font-mono)', fontSize:11 }}>{formatTime(h.created_at)}</td>
                      </tr>
                    )
                  })
                )}
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
              {agentsList.map(a => (
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
              {repos.length === 0 ? (
                <div style={{ padding: '16px 20px', fontSize: 12, color: '#8d9195', fontFamily: 'var(--font-mono)' }}>
                  No repositories connected.
                </div>
              ) : (
                repos.map(r => (
                  <div key={r.id} style={{ padding:'10px 20px', borderBottom:'1px solid rgba(178,199,213,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:28, height:28, borderRadius:6, background:'rgba(178,199,213,0.06)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c3c7cb" strokeWidth="1.75"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                      </div>
                      <span style={{ fontSize:13, color:'#cee3f1' }}>{r.name}</span>
                    </div>
                    <span className={`badge ${r.health_score > 90 ? 'badge-success' : r.health_score > 70 ? 'badge-warning' : 'badge-error'}`} style={{ fontSize:10 }}>
                      {r.health_score > 90 ? 'Healthy' : r.health_score > 70 ? 'Warning' : 'Critical'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

