import React, { useState } from 'react'

function Toggle({ on }) {
  return (
    <div style={{ width:36, height:20, borderRadius:10, background: on ? '#b2c7d5' : 'rgba(178,199,213,0.15)', position:'relative', cursor:'pointer', transition:'background 0.2s ease', flexShrink:0 }}>
      <div style={{ width:14, height:14, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left: on ? 19 : 3, transition:'left 0.2s ease', boxShadow:'0 1px 3px rgba(0,0,0,0.3)' }}/>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card" style={{ overflow:'hidden', marginBottom:20 }}>
      <div style={{ padding:'16px 24px', borderBottom:'1px solid rgba(178,199,213,0.08)', background:'rgba(178,199,213,0.02)' }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color:'#cee3f1' }}>{title}</span>
      </div>
      <div style={{ padding:'20px 24px' }}>{children}</div>
    </div>
  )
}

function Field({ label, desc, value, type='text' }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:13, fontWeight:500, color:'#c3c7cb', marginBottom:4 }}>{label}</div>
      {desc && <div style={{ fontSize:12, color:'#8d9195', marginBottom:8 }}>{desc}</div>}
      <input className="input" type={type} defaultValue={value} style={{ maxWidth:420, fontSize:13 }}/>
    </div>
  )
}

export default function Settings() {
  const [agentStates, setAgentStates] = useState({ strict:true, autoApprove:false, notify:true, detailedLogs:true })

  return (
    <div style={{ padding:'32px 40px', maxWidth:900 }}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, color:'#cee3f1', marginBottom:4 }}>Settings</h1>
        <p style={{ fontSize:13, color:'#8d9195' }}>Configure your AI agents and manage platform integrations.</p>
      </div>

      {/* GitHub Integration */}
      <Section title="GitHub Integration">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid rgba(178,199,213,0.06)' }}>
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:'#c3c7cb', marginBottom:2 }}>GitHub App Installation</div>
            <div style={{ fontSize:12, color:'#8d9195' }}>Connect PulseReview AI to your GitHub organizations</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span className="badge badge-success">Connected</span>
            <button className="btn btn-ghost" style={{ fontSize:12, padding:'6px 14px' }}>Manage</button>
          </div>
        </div>
        <div style={{ paddingTop:16 }}>
          <Field label="Webhook Secret" desc="Used to validate incoming GitHub webhook payloads" value="••••••••••••••••••••••" type="password"/>
        </div>
      </Section>

      {/* AI Agent Configuration */}
      <Section title="AI Agent Configuration">
        {[
          { key:'strict', label:'Strict Linting Mode', desc:'Enable stricter code quality analysis. Increases review depth but may increase review time.' },
          { key:'autoApprove', label:'Auto-approve minor PRs', desc:'Automatically approve PRs with no issues and fewer than 50 line changes.' },
          { key:'notify', label:'Slack Notifications', desc:'Receive Slack alerts when a critical vulnerability is detected.' },
          { key:'detailedLogs', label:'Detailed Agent Logs', desc:'Store verbose reasoning logs from each agent run for debugging.' },
        ].map(item => (
          <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid rgba(178,199,213,0.06)' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:'#c3c7cb', marginBottom:2 }}>{item.label}</div>
              <div style={{ fontSize:12, color:'#8d9195' }}>{item.desc}</div>
            </div>
            <div onClick={() => setAgentStates(p => ({...p, [item.key]:!p[item.key]}))}>
              <Toggle on={agentStates[item.key]}/>
            </div>
          </div>
        ))}
      </Section>

      {/* API Keys */}
      <Section title="API Keys">
        <Field label="Gemini API Key" desc="Required for Planner Agent and Bug Detection Agent reasoning" value="AIza••••••••••••••••••••••••••••" type="password"/>
        <Field label="GitHub Personal Access Token" desc="Required for reading PR diffs and posting review comments" value="ghp_••••••••••••••••••••••••••••••" type="password"/>
        <div style={{ display:'flex', gap:12, marginTop:8 }}>
          <button className="btn btn-primary" style={{ fontSize:13 }}>Save Changes</button>
          <button className="btn btn-ghost" style={{ fontSize:13 }}>Rotate Keys</button>
        </div>
      </Section>

      {/* Danger Zone */}
      <div style={{ border:'1px solid rgba(248,113,113,0.2)', borderRadius:12, padding:24, background:'rgba(248,113,113,0.03)' }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color:'#f87171', marginBottom:12 }}>Danger Zone</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:13, color:'#c3c7cb', marginBottom:2 }}>Delete Organization Workspace</div>
            <div style={{ fontSize:12, color:'#8d9195' }}>Permanently delete all workflows, reviews, and repository connections.</div>
          </div>
          <button className="btn" style={{ background:'rgba(248,113,113,0.1)', color:'#f87171', border:'1px solid rgba(248,113,113,0.3)', fontSize:13, padding:'8px 16px' }}>Delete Workspace</button>
        </div>
      </div>
    </div>
  )
}
