'use client'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES, CREDENTIAL_NAMES } from '@/lib/web3'
import { CredentialIssuerABI } from '@/lib/abis/CredentialIssuer'

export default function Profile({ onNavigate }: { onNavigate: (p: any) => void }) {
  const { address } = useAccount()

  const { data: credStatus } = useReadContract({
    address: CONTRACT_ADDRESSES.CredentialIssuer as `0x${string}`,
    abi: CredentialIssuerABI,
    functionName: 'getCredentialStatus',
    args: [address!],
    query: { enabled: !!address },
  })

  const issued = credStatus ? ([...credStatus[0]] as boolean[]) : [false, false, false, false]
  const verifiedCount = issued.filter(Boolean).length
  const score = 400 + verifiedCount * 120
  const pct = Math.round((score / 880) * 100)

  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ fontSize: '17px', fontWeight: 500, letterSpacing: '0.06em' }}>Profile</div>
        <button onClick={() => onNavigate('dashboard')} style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.08em' }}>← BACK</button>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '10px', border: '0.5px solid var(--border)', overflow: 'hidden', maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(124,92,252,0.15)', border: '1.5px solid #7c5cfc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#7c5cfc', fontWeight: 500 }}>
            {address ? address.slice(2, 4).toUpperCase() : 'AO'}
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 500 }}>Anonymous user</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '0.06em' }}>{short}</div>
          </div>
        </div>

        {/* Score */}
        <div style={{ padding: '14px 16px', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.12em', marginBottom: '6px' }}>IDENTITY SCORE</div>
          <div style={{ fontSize: '36px', fontWeight: 500, color: '#7c5cfc', lineHeight: 1 }}>{score}</div>
          <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: '#7c5cfc', borderRadius: '2px', transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '5px' }}>{verifiedCount} of 4 credentials verified</div>
        </div>

        {/* Credentials */}
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '17px', color: 'var(--text-muted)' }}>{CREDENTIAL_NAMES[i]}</span>
              <span style={{ fontSize: '12px', padding: '2px 7px', borderRadius: '3px', letterSpacing: '0.06em', background: issued[i] ? '#0d2a1a' : '#2a1e00', color: issued[i] ? '#4ade80' : '#fbbf24' }}>
                {issued[i] ? 'VERIFIED' : 'PENDING'}
              </span>
            </div>
          ))}
        </div>

        {/* Network */}
        <div style={{ padding: '10px 16px', borderTop: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>ARBITRUM SEPOLIA · NOX PROTOCOL</span>
        </div>
      </div>
    </div>
  )
}
