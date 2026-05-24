import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchRepos, connectRepo, triggerWorkflow } from '../services/api'

function StatusBadge({ s }) {
  const map = { Healthy:'badge-success', Warning:'badge-warning', Critical:'badge-error' }
  return <span className={`badge ${map[s]||'badge-muted'}`}>{s}</span>
}

export default function Repositories() {
  const navigate = useNavigate()
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showConnectForm, setShowConnectForm] = useState(false)
  const [newRepoName, setNewRepoName] = useState('')
  const [newRepoOwner, setNewRepoOwner] = useState('Hrithik-GV')
  const [connecting, setConnecting] = useState(false)

  // Trigger form state
  const [triggerRepo, setTriggerRepo] = useState(null)
  const [prTitle, setPrTitle] = useState('feat: optimize vector db querying')
  const [prNumber, setPrNumber] = useState(Math.floor(Math.random() * 900) + 100)
  const [triggering, setTriggering] = useState(false)

  const loadRepos = async () => {
    try {
      const data = await fetchRepos()
      setRepos(data)
    } catch (err) {
      console.error("Error loading repositories:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRepos()
  }, [])

  const handleConnect = async (e) => {
    e.preventDefault()
    if (!newRepoName.trim()) return
    setConnecting(true)
    try {
      await connectRepo(newRepoName.trim(), newRepoOwner.trim())
      setNewRepoName('')
      setShowConnectForm(false)
      await loadRepos()
    } catch (err) {
      console.error(err)
      alert("Failed to connect repository. Make sure the API is active.")
    } finally {
      setConnecting(false)
    }
  }

  const handleTriggerReview = async (e) => {
    e.preventDefault()
    if (!triggerRepo) return
    setTriggering(true)
    try {
      await triggerWorkflow(triggerRepo.name, prNumber, prTitle)
      setTriggerRepo(null)
      // Redirect to workflows to watch it run live
      navigate('/workflows')
    } catch (err) {
      console.error(err)
      alert("Failed to initiate code review workflow.")
    } finally {
      setTriggering(false)
    }
  }

  // Calculate dynamic stats
  const activeCount = repos.filter(r => r.active).length
  const totalCount = repos.length
  const criticalCount = repos.filter(r => r.health_score < 60).length

  const stats = [
    { label:'Total Repositories', value: totalCount.toString() },
    { label:'Active Monitoring',  value: activeCount.toString() },
    { label:'Webhook Health',     value: totalCount > 0 ? '100%' : '0%' },
    { label:'Critical Repos',      value: criticalCount.toString() },
  ]

  const getHealthLabel = (score) => {
    if (score > 90) return 'Healthy'
    if (score > 70) return 'Warning'
    return 'Critical'
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#8d9195', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        Querying git integration ledger...
      </div>
    )
  }

  return (
    <div style={{ padding:'32px 40px', maxWidth:1400 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, color:'#cee3f1', marginBottom:4 }}>Repositories</h1>
          <p style={{ fontSize:13, color:'#8d9195' }}>Manage connected codebases and AI oversight parameters.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowConnectForm(!showConnectForm)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Connect Repo
        </button>
      </div>

      {/* Connect Repo Form */}
      {showConnectForm && (
        <div className="card" style={{ padding: 24, marginBottom: 32 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:600, color:'#cee3f1', marginBottom:16 }}>Connect New Codebase</h3>
          <form onSubmit={handleConnect} style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, color: '#8d9195', fontFamily: 'var(--font-mono)' }}>REPOSITORY OWNER / ORG</label>
              <input 
                className="input" 
                value={newRepoOwner} 
                onChange={e => setNewRepoOwner(e.target.value)} 
                placeholder="e.g. Hrithik-GV" 
                style={{ width: 220 }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, color: '#8d9195', fontFamily: 'var(--font-mono)' }}>REPOSITORY NAME</label>
              <input 
                className="input" 
                value={newRepoName} 
                onChange={e => setNewRepoName(e.target.value)} 
                placeholder="e.g. my-awesome-app" 
                style={{ width: 260 }}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={connecting}>
                {connecting ? 'Linking...' : 'Link Repository'}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowConnectForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trigger Review Modal/Form overlay */}
      {triggerRepo && (
        <div className="card" style={{ padding: 24, marginBottom: 32, borderLeft: '4px solid var(--color-primary)' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:600, color:'#cee3f1', marginBottom:8 }}>
            Trigger Manual Review: {triggerRepo.name}
          </h3>
          <p style={{ fontSize:12, color:'#8d9195', marginBottom:16 }}>
            This initiates the multi-agent AI pipeline for a simulated pull request diff.
          </p>
          <form onSubmit={handleTriggerReview} style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, color: '#8d9195', fontFamily: 'var(--font-mono)' }}>PULL REQUEST NUMBER</label>
              <input 
                className="input" 
                type="number"
                value={prNumber} 
                onChange={e => setPrNumber(parseInt(e.target.value) || 0)} 
                style={{ width: 140 }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              <label style={{ fontSize: 11, color: '#8d9195', fontFamily: 'var(--font-mono)' }}>PULL REQUEST TITLE</label>
              <input 
                className="input" 
                value={prTitle} 
                onChange={e => setPrTitle(e.target.value)} 
                placeholder="e.g. feat: integrate payment system" 
                style={{ minWidth: 260 }}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={triggering}>
                {triggering ? 'Initializing Agents...' : 'Execute Agents'}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setTriggerRepo(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
              <th>Status</th>
              <th>Health Index</th>
              <th>Connected Date</th>
              <th>Oversight Actions</th>
            </tr>
          </thead>
          <tbody>
            {repos.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px 20px', fontSize: 12, color: '#8d9195', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                  No repositories configured. Click 'Connect Repo' above to begin.
                </td>
              </tr>
            ) : (
              repos.map(r => (
                <tr key={r.id}>
                  <td>
                    <div>
                      <div style={{ color:'#cee3f1', fontWeight:500, fontSize:13, marginBottom:2 }}>{r.name}</div>
                      <div className="mono" style={{ fontSize:10, color:'#8d9195' }}>{r.owner}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background: r.active ? '#4ade80' : '#8d9195' }}/>
                      <span className="mono" style={{ fontSize:12 }}>{r.active ? 'Active Sync' : 'Paused'}</span>
                    </span>
                  </td>
                  <td><StatusBadge s={getHealthLabel(r.health_score)}/></td>
                  <td><span className="mono" style={{ fontSize:11, color:'#8d9195' }}>{new Date(r.connected_at).toLocaleDateString()}</span></td>
                  <td>
                    <button 
                      className="btn btn-ghost" 
                      style={{ padding:'4px 12px', fontSize:11, color: 'var(--color-primary)' }}
                      onClick={() => {
                        setTriggerRepo(r)
                        setPrNumber(Math.floor(Math.random() * 900) + 100)
                      }}
                    >
                      Trigger Review
                    </button>
                  </td>
                </tr>
              ))
            )}
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
              <div key={r.id} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:12, color:'#c3c7cb' }}>{r.name}</span>
                  <span className="mono" style={{ fontSize:11, color:'#8d9195' }}>{100 - r.health_score} penalty</span>
                </div>
                <div style={{ height:3, background:'rgba(178,199,213,0.1)', borderRadius:2 }}>
                  <div style={{ height:'100%', width:`${100 - r.health_score}%`, background: r.health_score > 90 ? '#4ade80' : r.health_score > 70 ? '#fbbf24' : '#f87171', borderRadius:2 }}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding:16, background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:8 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#8d9195', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>AI Agent Insight</div>
            <p style={{ fontSize:13, color:'#c3c7cb', lineHeight:1.65, margin: 0 }}>
              {repos.length > 0 ? (
                <>
                  <strong style={{ color:'#b2c7d5' }}>{repos[0].name}</strong> has active audit monitoring configured. Manual triggers bypass local git hooks for speedier pipelines.
                </>
              ) : (
                "No repositories linked. Connect a repository above to enable AI automated reviews."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

