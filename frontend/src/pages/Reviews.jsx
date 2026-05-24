import React, { useState, useEffect } from 'react'
import { fetchHistory, fetchReview } from '../services/api'

function StatusBadge({ s }) {
  const map = { Critical:'badge-error', Issues:'badge-warning', Clean:'badge-success', Running:'badge-warning', Pending:'badge-muted' }
  return <span className={`badge ${map[s]||'badge-muted'}`}>{s}</span>
}

function SeverityBadge({ s }) {
  const map = { critical: 'badge-error', high: 'badge-warning', warning: 'badge-warning', info: 'badge-muted' }
  return <span className={`badge ${map[s.toLowerCase()]||'badge-muted'}`} style={{ textTransform: 'uppercase', fontSize: 10 }}>{s}</span>
}

export default function Reviews() {
  const [reviewsList, setReviewsList] = useState([])
  const [selectedReview, setSelectedReview] = useState(null)
  const [selectedReviewDetails, setSelectedReviewDetails] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [loadingList, setLoadingList] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const loadHistory = async () => {
    try {
      const history = await fetchHistory()
      setReviewsList(history)
      if (history.length > 0) {
        // Auto-select first review
        setSelectedReview(history[0])
      }
    } catch (err) {
      console.error("Error loading reviews history:", err)
    } finally {
      setLoadingList(false)
    }
  }

  const loadDetails = async (review) => {
    if (!review) return
    setLoadingDetails(true)
    try {
      const details = await fetchReview(review.id)
      setSelectedReviewDetails(details)
    } catch (err) {
      console.error("Error loading review details:", err)
    } finally {
      setLoadingDetails(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    if (selectedReview) {
      loadDetails(selectedReview)
    }
  }, [selectedReview])

  const filteredReviews = reviewsList.filter(r => {
    const matchesSearch = r.pr_title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.repo_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false

    const issueCount = r.bug_count + r.security_issues + r.perf_issues
    const status = r.score < 60 ? 'Critical' : r.score < 90 ? 'Issues' : 'Clean'

    if (activeFilter === 'All') return true
    return status === activeFilter
  })

  const getStatusText = (r) => {
    return r.score < 60 ? 'Critical' : r.score < 90 ? 'Issues' : 'Clean'
  }

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

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      {/* List Panel */}
      <div style={{ width:380, borderRight:'1px solid rgba(178,199,213,0.08)', overflow:'auto', flexShrink:0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid rgba(178,199,213,0.08)', position:'sticky', top:0, background:'var(--color-bg-deep)', zIndex:10 }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'#cee3f1', marginBottom:4 }}>Reviews</h1>
          <p style={{ fontSize:12, color:'#8d9195', marginBottom:14 }}>Showing {filteredReviews.length} of {reviewsList.length} reviews</p>
          <input 
            className="input" 
            placeholder="Search reviews..." 
            style={{ fontSize:12 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
            {['All','Critical','Issues','Clean'].map(f => (
              <button 
                key={f} 
                onClick={() => setActiveFilter(f)}
                className={`btn ${activeFilter === f ? 'btn-primary' : 'btn-ghost'}`} 
                style={{ padding:'4px 12px', fontSize:11, borderRadius:6 }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {loadingList ? (
            <div style={{ padding: 20, fontSize: 12, color: '#8d9195', fontFamily: 'var(--font-mono)' }}>
              Querying history database...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div style={{ padding: 20, fontSize: 12, color: '#8d9195', fontFamily: 'var(--font-mono)' }}>
              No reviews match current search/filter.
            </div>
          ) : (
            filteredReviews.map(r => {
              const status = getStatusText(r)
              const issueCount = r.bug_count + r.security_issues + r.perf_issues
              return (
                <div 
                  key={r.id} 
                  onClick={() => setSelectedReview(r)} 
                  style={{ 
                    padding:'16px 20px', 
                    borderBottom:'1px solid rgba(178,199,213,0.06)', 
                    cursor:'pointer', 
                    background: selectedReview?.id===r.id ? 'rgba(178,199,213,0.05)' : 'transparent', 
                    borderLeft: selectedReview?.id===r.id ? '2px solid #b2c7d5' : '2px solid transparent', 
                    transition:'all 0.15s ease' 
                  }}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                    <div className="mono" style={{ fontSize:12, color:'#cee3f1', fontWeight:500 }}>#{r.pr_number}: {r.pr_title}</div>
                    <StatusBadge s={status}/>
                  </div>
                  <div style={{ fontSize:12, color:'#c3c7cb', marginBottom:6, lineHeight:1.5 }}>
                    {r.summary.length > 90 ? `${r.summary.slice(0, 90)}...` : r.summary}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span className="mono" style={{ fontSize:10, color:'#8d9195' }}>{r.repo_name}</span>
                    <span className="mono" style={{ fontSize:10, color:'#8d9195' }}>{formatTime(r.created_at)}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div style={{ flex:1, overflow:'auto', padding:'32px 40px' }}>
        {loadingDetails ? (
          <div style={{ textAlign: 'center', marginTop: 80, color: '#8d9195', fontFamily: 'var(--font-mono)' }}>
            Retrieving review trace file from ledger...
          </div>
        ) : selectedReviewDetails ? (
          <>
            <div style={{ marginBottom:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'#cee3f1' }}>
                  PR Review: {selectedReviewDetails.pr_title} #{selectedReviewDetails.pr_number}
                </h2>
                <StatusBadge s={getStatusText(selectedReviewDetails)}/>
              </div>
              <p style={{ fontSize:13, color:'#c3c7cb', lineHeight:1.6 }}>{selectedReviewDetails.summary}</p>
            </div>

            {/* Score & Health Stats Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              <div className="card-accent" style={{ padding: 16 }}>
                <div style={{ fontSize: 10, color: '#8d9195', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 4 }}>Console Score</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: selectedReviewDetails.score >= 90 ? '#4ade80' : selectedReviewDetails.score >= 70 ? '#fbbf24' : '#f87171' }}>
                  {selectedReviewDetails.score}/100
                </div>
              </div>
              <div className="card-accent" style={{ padding: 16 }}>
                <div style={{ fontSize: 10, color: '#8d9195', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 4 }}>Grade</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#cee3f1' }}>
                  {selectedReviewDetails.code_quality}
                </div>
              </div>
              <div className="card-accent" style={{ padding: 16 }}>
                <div style={{ fontSize: 10, color: '#8d9195', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 4 }}>Security Flags</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: selectedReviewDetails.security_issues > 0 ? '#f87171' : '#8d9195' }}>
                  {selectedReviewDetails.security_issues}
                </div>
              </div>
              <div className="card-accent" style={{ padding: 16 }}>
                <div style={{ fontSize: 10, color: '#8d9195', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 4 }}>Performance / Bugs</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: selectedReviewDetails.bug_count + selectedReviewDetails.perf_issues > 0 ? '#fbbf24' : '#8d9195' }}>
                  {selectedReviewDetails.bug_count + selectedReviewDetails.perf_issues}
                </div>
              </div>
            </div>

            {/* Findings List */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:600, color:'#cee3f1', marginBottom:16 }}>Analysis Findings ({selectedReviewDetails.findings.length})</h3>
              
              {selectedReviewDetails.findings.length === 0 ? (
                <div className="card" style={{ padding:24, textAlign:'center' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom:16, display:'block', margin:'0 auto 16px' }}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:600, color:'#4ade80', marginBottom:8 }}>No Issues Detected</h3>
                  <p style={{ fontSize:13, color:'#c3c7cb' }}>All agent parameters verified clean. Quality index score: {selectedReviewDetails.score}/100.</p>
                </div>
              ) : (
                selectedReviewDetails.findings.map((f, idx) => {
                  const borderColors = { critical: '#f87171', high: '#fbbf24', warning: '#f59e0b', info: '#3b82f6' }
                  const leftColor = borderColors[f.severity.toLowerCase()] || '#8d9195'

                  return (
                    <div 
                      key={idx} 
                      className="card" 
                      style={{ 
                        padding:20, 
                        marginBottom:16, 
                        borderLeft:`4px solid ${leftColor}`, 
                        background:'rgba(178,199,213,0.015)' 
                      }}
                    >
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                        <span className="mono" style={{ fontSize:12, color:'#cee3f1', fontWeight: 600 }}>
                          {f.file_path}:{f.line_number}
                        </span>
                        <SeverityBadge s={f.severity}/>
                      </div>
                      
                      <p style={{ fontSize:13, color:'#c3c7cb', lineHeight:1.6, marginBottom:12 }}>
                        {f.message}
                      </p>

                      {f.suggestion && (
                        <div style={{ background:'rgba(59,130,246,0.04)', border:'1px solid rgba(59,130,246,0.12)', borderRadius:8, padding:14 }}>
                          <div style={{ fontSize:11, fontWeight:600, color:'#60a5fa', marginBottom:4, fontFamily:'var(--font-mono)' }}>RECOMMENDED RESOLUTION</div>
                          <p style={{ fontSize:12, color:'#b2c7d5', lineHeight:1.5, fontFamily:'var(--font-mono)', margin:0 }}>{f.suggestion}</p>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </>
        ) : (
          <div style={{ textAlign:'center', marginTop:80, color:'#8d9195', fontFamily: 'var(--font-mono)' }}>Select a review audit on the sidebar to inspect logs</div>
        )}
      </div>
    </div>
  )
}

