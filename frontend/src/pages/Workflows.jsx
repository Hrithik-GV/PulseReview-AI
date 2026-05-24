import React, { useState, useEffect } from 'react'
import { fetchWorkflows, fetchWorkflow } from '../services/api'

function StatusBadge({ s }) {
  const map = { Done:'badge-success', Running:'badge-warning', Issue:'badge-error', Pending:'badge-muted', Waiting:'badge-info', Completed:'badge-success', Clean:'badge-success', Issues:'badge-warning', Critical:'badge-error', Failed:'badge-error' }
  return <span className={`badge ${map[s]||'badge-muted'}`}>{s}</span>
}

function AgentIcon({ status }) {
  const color = (status==='Done'||status==='completed')?'#4ade80':(status==='Running'||status==='running')?'#fbbf24':(status==='Issue'||status==='failed')?'#f87171':'#8d9195'
  return (
    <div style={{ width:32, height:32, borderRadius:'50%', border:`2px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:`${color}18` }}>
      {(status==='Done'||status==='completed') && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
      {(status==='Running'||status==='running') && <div style={{ width:8, height:8, borderRadius:'50%', background:color, animation:'pulse 1.5s infinite' }}/>}
      {(status==='Issue'||status==='failed') && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
      {(status==='Pending'||status==='pending') && <div style={{ width:8, height:8, borderRadius:'50%', background:color }}/>}
    </div>
  )
}

export default function Workflows() {
  const [workflowsList, setWorkflowsList] = useState([])
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [selectedDetails, setSelectedDetails] = useState(null)
  const [loadingList, setLoadingList] = useState(true)

  const loadWorkflows = async () => {
    try {
      const w = await fetchWorkflows()
      setWorkflowsList(w)
      if (w.length > 0 && !selectedWorkflow) {
        setSelectedWorkflow(w[0])
      }
    } catch (err) {
      console.error("Error loading workflows:", err)
    } finally {
      setLoadingList(false)
    }
  }

  const loadWorkflowDetails = async () => {
    if (!selectedWorkflow) return
    try {
      const details = await fetchWorkflow(selectedWorkflow.id)
      setSelectedDetails(details)
      // Update selected workflow in list if its status/progress changed
      setWorkflowsList(prev => prev.map(item => item.id === details.id ? details : item))
    } catch (err) {
      console.error("Error loading workflow details:", err)
    }
  }

  useEffect(() => {
    loadWorkflows()
  }, [])

  useEffect(() => {
    if (selectedWorkflow) {
      loadWorkflowDetails()
    }
  }, [selectedWorkflow])

  // Poll selected workflow details if it is currently running or pending
  useEffect(() => {
    if (!selectedWorkflow) return
    
    const isRunning = selectedWorkflow.status === 'Running' || selectedWorkflow.status === 'Pending' || 
                      selectedDetails?.status === 'Running' || selectedDetails?.status === 'Pending'
    
    if (isRunning) {
      const interval = setInterval(() => {
        loadWorkflowDetails()
        // Also refresh list to capture status changes
        fetchWorkflows().then(setWorkflowsList).catch(console.error)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [selectedWorkflow, selectedDetails?.status])

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      {/* List */}
      <div style={{ width:320, borderRight:'1px solid rgba(178,199,213,0.08)', overflow:'auto', flexShrink:0 }}>
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid rgba(178,199,213,0.08)' }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'#cee3f1', marginBottom:4 }}>Workflows</h1>
          <p style={{ fontSize:12, color:'#8d9195' }}>Active AI review pipelines</p>
        </div>
        {loadingList ? (
          <div style={{ padding: 20, fontSize: 12, color: '#8d9195', fontFamily: 'var(--font-mono)' }}>
            Retrieving pipelines...
          </div>
        ) : workflowsList.length === 0 ? (
          <div style={{ padding: 20, fontSize: 12, color: '#8d9195', fontFamily: 'var(--font-mono)' }}>
            No pipelines executed.
          </div>
        ) : (
          workflowsList.map(w => (
            <div 
              key={w.id} 
              onClick={() => {
                setSelectedWorkflow(w)
                setSelectedDetails(null)
              }} 
              style={{ 
                padding:'14px 20px', 
                borderBottom:'1px solid rgba(178,199,213,0.06)', 
                cursor:'pointer', 
                background: selectedWorkflow?.id===w.id ? 'rgba(178,199,213,0.05)' : 'transparent', 
                borderLeft: selectedWorkflow?.id===w.id ? '2px solid #b2c7d5' : '2px solid transparent' 
              }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span className="mono" style={{ fontSize:11, color:'#b2c7d5' }}>{w.repo_name} #{w.pr_number}</span>
                <StatusBadge s={w.status}/>
              </div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'#cee3f1', fontWeight:500 }}>{w.pr_title}</div>
            </div>
          ))
        )}
      </div>

      {/* Detail */}
      <div style={{ flex:1, overflow:'auto', padding:'32px 40px' }}>
        {selectedDetails ? (
          <>
            <div style={{ marginBottom:28 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'#cee3f1' }}>{selectedDetails.pr_title}</h2>
                <StatusBadge s={selectedDetails.status}/>
              </div>
              <div style={{ display:'flex', gap:16 }}>
                <span className="mono" style={{ fontSize:11, color:'#8d9195' }}>{selectedDetails.repo_name}</span>
                <span className="mono" style={{ fontSize:11, color:'#8d9195' }}>PR #{selectedDetails.pr_number}</span>
                <span className="mono" style={{ fontSize:11, color:'#8d9195' }}>Pipeline progress: {selectedDetails.progress}%</span>
              </div>
            </div>

            {/* Timeline */}
            {selectedDetails.traces && selectedDetails.traces.length > 0 && (
              <div className="card" style={{ padding:24, marginBottom:20 }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color:'#cee3f1', marginBottom:20 }}>Pipeline Timeline</h3>
                <div style={{ position:'relative', paddingLeft:20 }}>
                  <div style={{ position:'absolute', left:15, top:16, bottom:16, width:1, background:'rgba(178,199,213,0.1)' }}/>
                  {selectedDetails.traces.map((step, i) => (
                    <div key={i} style={{ display:'flex', gap:16, marginBottom:i < selectedDetails.traces.length-1 ? 24 : 0 }}>
                      <AgentIcon status={step.status}/>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                          <span style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, color:'#cee3f1' }}>{step.agent}</span>
                          <span className="mono" style={{ fontSize:10, color:'#8d9195' }}>
                            {step.timestamp ? new Date(step.timestamp).toLocaleTimeString() : '—'}
                          </span>
                        </div>
                        <p style={{ fontSize:12, color:'#c3c7cb', lineHeight:1.6, margin:0 }}>{step.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GitHub integration status */}
            <div className="card" style={{ padding:24, marginBottom:20 }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color:'#cee3f1', marginBottom:12 }}>GitHub Webhook State</h3>
              <div style={{ fontSize:12, color:'#8d9195', marginBottom:8 }}>Payload Response Log:</div>
              <div className="code-block" style={{ fontSize:12 }}>
                <span className="code-neutral">{'{ '}</span>
                <span style={{ color:'#a78bfa' }}>"repository"</span>: <span style={{ color:'#fbbf24' }}>"{selectedDetails.repo_name}"</span>,{' '}
                <span style={{ color:'#a78bfa' }}>"status"</span>: <span style={{ color:'#fbbf24' }}>"{selectedDetails.status.toLowerCase()}"</span>,{' '}
                <span style={{ color:'#a78bfa' }}>"progress"</span>: <span style={{ color:'#cee3f1' }}>{selectedDetails.progress}</span>,{' '}
                <span style={{ color:'#a78bfa' }}>"review_id"</span>: <span style={{ color:'#fbbf24' }}>"{selectedDetails.review_id || 'null'}"</span>
                <span className="code-neutral">{' }'}</span>
              </div>
            </div>

            {/* AI Pulse */}
            <div className="card" style={{ padding:24, background:'rgba(178,199,213,0.03)' }}>
              <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background: selectedDetails.status === 'Failed' ? '#f87171' : '#4ade80', marginTop:5, flexShrink:0, boxShadow: selectedDetails.status === 'Failed' ? '0 0 6px #f87171' : '0 0 6px #4ade80' }}/>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color: selectedDetails.status === 'Failed' ? '#f87171' : '#4ade80', marginBottom:4 }}>AI Pulse Status</div>
                  <p style={{ fontSize:12, color:'#c3c7cb', lineHeight:1.6, margin:0 }}>
                    {selectedDetails.status === 'Pending' && "Initializing secure sandboxed VM environment for code auditing..."}
                    {selectedDetails.status === 'Running' && "Executing Gemini Multi-Agent analysis. Sub-agents are streaming diff inspections..."}
                    {selectedDetails.status === 'Clean' && "Code review complete. Quality gates passed with zero critical flags."}
                    {selectedDetails.status === 'Issues' && "Code review complete. Minor alerts posted to repository PR timeline."}
                    {selectedDetails.status === 'Critical' && "Vulnerabilities detected. Review findings panel for remediation steps."}
                    {selectedDetails.status === 'Failed' && "Analysis terminated unexpectedly. Check system service configurations."}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : selectedWorkflow ? (
          <div style={{ textAlign:'center', marginTop:80, color:'#8d9195', fontFamily: 'var(--font-mono)' }}>Loading telemetry logs...</div>
        ) : (
          <div style={{ textAlign:'center', marginTop:80, color:'#8d9195', fontFamily: 'var(--font-mono)' }}>Select a workflow pipeline from the left list</div>
        )}
      </div>
    </div>
  )
}

