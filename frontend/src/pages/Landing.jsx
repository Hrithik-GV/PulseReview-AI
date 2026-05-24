import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Hyperspeed from '../components/Hyperspeed'

const HYPERSPEED_OPTIONS = {
  distortion: 'turbulentDistortion',
  length: 400, roadWidth: 10, islandWidth: 2, lanesPerRoad: 4,
  fov: 90, fovSpeedUp: 150, speedUp: 2, carLightsFade: 0.4,
  totalSideLightSticks: 20, lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05, brokenLinesWidthPercentage: 0.1, brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5], lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80], movingCloserSpeed: [-120, -160],
  carLightsLength: [12, 80], carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5], carShiftX: [-0.8, 0.8], carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808, islandColor: 0x0a0a0a, background: 0x000000,
    shoulderLines: 0xFFFFFF, brokenLines: 0xFFFFFF,
    leftCars: [0xFF7AF1, 0x8A72D6, 0xED6CDB], // Brighter pinks/purples
    rightCars: [0x0AEBFF, 0x1A85E6, 0x4B6B86], // Brighter cyan/blues
    sticks: 0x0AEBFF, // Brighter cyan
  }
}

const features = [
  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Security Scan', desc: 'Deep entropy analysis to detect leaked secrets, SQL injection vectors, and broken access controls before they hit production.' },
  { icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18', title: 'Logic Analysis', desc: 'AI agents map the execution flow to identify race conditions, edge-case failures, and business logic inconsistencies.' },
  { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Performance Profiling', desc: 'Predictive scaling analysis. Detect N+1 queries and inefficient memory allocation patterns during the review phase.' },
]

export default function Landing() {
  const effectOptions = useMemo(() => HYPERSPEED_OPTIONS, [])

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#e3dffe', fontFamily: 'var(--font-body)', position: 'relative' }}>

      {/* Hero Section with Hyperspeed Background */}
      <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', background: '#000000' }}>
        {/* Hyperspeed Canvas - fills entire hero */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <Hyperspeed effectOptions={effectOptions} />
        </div>

        {/* Overlay gradient - Reduced opacity for brighter background */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.4) 80%, #000000 100%)', zIndex: 1, pointerEvents: 'none' }} />

        {/* Navbar */}
        <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,#b2c7d5,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0c0b21" strokeWidth="2.5"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: '#cee3f1', letterSpacing: '-0.01em' }}>PulseReview AI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {['Docs', 'Pricing', 'Integrations'].map(l => <a key={l} href="#" style={{ fontSize: 13, color: 'rgba(195,199,203,0.85)', textDecoration: 'none' }}>{l}</a>)}
          </div>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#b2c7d5', color: '#0c0b21', padding: '8px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            Launch Dashboard →
          </Link>
        </nav>

        {/* Hero Content */}
        <div style={{ position: 'absolute', bottom: '80px', left: 0, right: 0, zIndex: 5, textAlign: 'center', padding: '0 48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 999, padding: '4px 16px', marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
            <span style={{ fontSize: 12, color: '#93c5fd', fontFamily: 'var(--font-mono)' }}>Now in Beta · 500+ teams</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 60, fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.04em', color: '#ffffff', marginBottom: 20, textShadow: '0 0 80px rgba(206,227,241,0.3)' }}>
            AI-Powered Autonomous<br />Code Reviews
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(195,199,203,0.9)', lineHeight: 1.7, marginBottom: 40, maxWidth: 520, margin: '0 auto 40px' }}>
            Deploy multiple AI agents to analyze GitHub PRs, detect bugs, and automate security audits in real-time.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', background: '#b2c7d5', color: '#0c0b21', padding: '13px 32px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
              Start Free Trial
            </Link>
            <a href="#features" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.08)', color: '#cee3f1', padding: '13px 32px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500, border: '1px solid rgba(178,199,213,0.2)', backdropFilter: 'blur(8px)' }}>
              View Demo
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: '#cee3f1', marginBottom: 12 }}>Intelligent Analysis at Every Layer</h2>
          <p style={{ fontSize: 14, color: '#8d9195', maxWidth: 480, margin: '0 auto' }}>Three specialized agents working in parallel to give you a complete picture.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {features.map(f => (
            <div key={f.title} style={{ background: 'rgba(13,12,34,0.7)', border: '1px solid rgba(178,199,213,0.12)', borderRadius: 12, padding: 28, backdropFilter: 'blur(16px)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(178,199,213,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cee3f1" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon} /></svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: '#cee3f1', marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#c3c7cb', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Integration section */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, color: '#cee3f1', lineHeight: 1.2, marginBottom: 16 }}>Seamless GitHub Integration</h2>
          <p style={{ color: '#c3c7cb', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>PulseReview AI lives in your existing workflow, commenting on PRs just like a human reviewer.</p>
          {['Inline code suggestions with 1-click apply.', 'Detailed vulnerability reports with CVE cross-referencing.', 'Performance regression alerts based on simulated execution.'].map(t => (
            <div key={t} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <span style={{ fontSize: 13, color: '#c3c7cb' }}>{t}</span>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(13,12,34,0.8)', border: '1px solid rgba(178,199,213,0.12)', borderRadius: 12, padding: 24, backdropFilter: 'blur(16px)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#8d9195', marginBottom: 12 }}>AI Review Comment · db_manager.py</div>
          <p style={{ fontSize: 13, color: '#c3c7cb', marginBottom: 16, lineHeight: 1.6 }}>Line 42 uses string formatting for a query. This is a high-risk SQL injection vulnerability.</p>
          <div style={{ background: '#0c0b21', border: '1px solid rgba(178,199,213,0.08)', borderRadius: 8, padding: 16, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ color: '#f87171' }}>- query = f"SELECT * FROM users WHERE id = {'{user_id}'}"</div>
            <div style={{ color: '#4ade80' }}>+ query = "SELECT * FROM users WHERE id = %s"</div>
            <div style={{ color: '#4ade80' }}>+ cursor.execute(query, (user_id,))</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '60px 48px', borderTop: '1px solid rgba(178,199,213,0.08)', background: 'rgba(26,25,48,0.4)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: '#cee3f1', marginBottom: 12 }}>Ready to automate your quality control?</h2>
        <p style={{ color: '#c3c7cb', fontSize: 14, marginBottom: 32 }}>Join 500+ high-performance engineering teams using PulseReview AI.</p>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', background: '#b2c7d5', color: '#0c0b21', padding: '13px 32px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>Get Started Free</Link>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderTop: '1px solid rgba(178,199,213,0.08)' }}>
        <span style={{ fontSize: 12, color: '#8d9195' }}>© 2024 PulseReview AI Inc. Autonomous Code Intelligence.</span>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Twitter', 'GitHub'].map(l => <a key={l} href="#" style={{ fontSize: 12, color: '#8d9195', textDecoration: 'none' }}>{l}</a>)}
        </div>
      </div>
    </div>
  )
}
