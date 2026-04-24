'use client'
import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import Dashboard from '@/components/Dashboard'
import Onboard from '@/components/Onboard'
import ShareProof from '@/components/ShareProof'
import Profile from '@/components/Profile'

export default function Home() {
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [page, setPage] = useState<'dashboard' | 'onboard' | 'share' | 'profile'>('dashboard')
  const [darkMode, setDarkMode] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''

  if (!mounted) return null

  return (
    <div className={darkMode ? '' : 'light'} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderBottom: '0.5px solid var(--border)', background: 'var(--bg-card)' }}>
        <img src="/logo.png" alt="PROVID" style={{ height: '38px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '4px', border: '0.5px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.06em' }}>
            {darkMode ? 'LIGHT' : 'DARK'}
          </button>
          {isConnected && (
            <button onClick={() => disconnect()} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '20px', border: '0.5px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80' }} />
              {short}
            </button>
          )}
        </div>
      </div>

      {!isConnected ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 61px)', gap: '28px', padding: '40px' }}>
          <div style={{ fontSize: '13px', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>BUILT ON IEXEC NOX · ARBITRUM SEPOLIA</div>
          <div style={{ fontSize: '48px', fontWeight: 500, textAlign: 'center', lineHeight: 1.1 }}>Prove anything.<br />Reveal nothing.</div>
          <div style={{ fontSize: '15px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '460px', lineHeight: 1.7 }}>
            A confidential identity protocol. Verify your financial credentials privately. Let any app check your eligibility without ever seeing your data.
          </div>
          <button onClick={() => connect({ connector: connectors[0] })} style={{ fontSize: '13px', padding: '14px 32px', borderRadius: '6px', border: 'none', background: '#7c5cfc', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.1em', fontWeight: 500 }}>
            CONNECT WALLET TO START
          </button>
          <div style={{ display: 'flex', gap: '40px' }}>
            {['Zero data exposed', 'Any app embeds it', 'Nox TEE powered'].map(f => (
              <div key={f} style={{ fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.08em', textAlign: 'center' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#7c5cfc', margin: '0 auto 8px' }} />
                {f.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 61px)' }}>
          <div style={{ width: '56px', background: 'var(--bg-secondary)', borderRight: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '6px', flexShrink: 0 }}>
            {[
              { id: 'dashboard', icon: <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg> },
              { id: 'onboard', icon: <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
              { id: 'share', icon: <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M11 3l3 3-3 3M14 6H6a3 3 0 000 6h1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { id: 'profile', icon: <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
            ].map(({ id, icon }) => (
              <button key={id} onClick={() => setPage(id as typeof page)} style={{ width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', background: page === id ? 'rgba(124,92,252,0.15)' : 'transparent', color: page === id ? '#7c5cfc' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                {icon}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '36px 24px', overflowY: 'auto' }}>
            <div style={{ width: '100%', maxWidth: '600px' }}>
              {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
              {page === 'onboard' && <Onboard onDone={() => { setPage('dashboard') }} />}
              {page === 'share' && <ShareProof />}
              {page === 'profile' && <Profile onNavigate={setPage} />}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
