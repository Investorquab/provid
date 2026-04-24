'use client'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES, CREDENTIAL_NAMES } from '@/lib/web3'
import { CredentialIssuerABI } from '@/lib/abis/CredentialIssuer'
import { IdentityVaultABI } from '@/lib/abis/IdentityVault'
import { ProvidIdentityTokenABI } from '@/lib/abis/ProvidIdentityToken'

export default function Dashboard({ onNavigate }: { onNavigate: (p: any) => void }) {
  const { address } = useAccount()

  const { data: isRegistered } = useReadContract({
    address: CONTRACT_ADDRESSES.IdentityVault as `0x${string}`,
    abi: IdentityVaultABI,
    functionName: 'isRegistered', args: [address!],
    query: { enabled: !!address, refetchInterval: 4000 },
  })

  const { data: credStatus } = useReadContract({
    address: CONTRACT_ADDRESSES.CredentialIssuer as `0x${string}`,
    abi: CredentialIssuerABI,
    functionName: 'getCredentialStatus', args: [address!],
    query: { enabled: !!address && !!isRegistered, refetchInterval: 4000 },
  })

  const { data: hasToken } = useReadContract({
    address: CONTRACT_ADDRESSES.ProvidIdentityToken as `0x${string}`,
    abi: ProvidIdentityTokenABI,
    functionName: 'hasMinted', args: [address!],
    query: { enabled: !!address, refetchInterval: 4000 },
  })

  const issued: boolean[] = credStatus ? (credStatus[0] as boolean[]) : [false, false, false, false]
  const verifiedCount = issued.filter(Boolean).length
  const score = 400 + verifiedCount * 120

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '0.06em' }}>Dashboard</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.08em' }}>ENCRYPTED ON NOX · YOU CONTROL ACCESS</div>
        </div>
        <button onClick={() => onNavigate('profile')} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '4px', border: '0.5px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.08em' }}>
          PROFILE
        </button>
      </div>

      {/* Token status */}
      {hasToken ? (
        <div style={{ padding: '14px 16px', background: 'rgba(74,222,128,0.08)', border: '0.5px solid rgba(74,222,128,0.2)', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '20px' }}>🛡️</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#4ade80' }}>PROVID Identity Token minted</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>ERC-7984 · Balance hidden · One per wallet · Sybil resistant</div>
            </div>
          </div>
          <a href={`https://sepolia.arbiscan.io/token/0xf19E8826E1feEd56c6EbaaF4c81574AfFaDE5c05?a=${address}`} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#7c5cfc', textDecoration: 'none', flexShrink: 0 }}>
            View ↗
          </a>
        </div>
      ) : isRegistered ? (
        <div style={{ padding: '14px 16px', background: 'rgba(251,191,36,0.08)', border: '0.5px solid rgba(251,191,36,0.2)', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#fbbf24' }}>Identity token not yet minted</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Complete verification to mint your ERC-7984 token</div>
          </div>
          <button onClick={() => onNavigate('onboard')} style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#fbbf24', color: '#000', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, flexShrink: 0 }}>
            MINT
          </button>
        </div>
      ) : null}

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { n: isRegistered ? score : '—', l: 'IDENTITY SCORE', accent: true },
          { n: verifiedCount, l: 'VERIFIED' },
          { n: 4 - verifiedCount, l: 'PENDING' },
        ].map(({ n, l, accent }) => (
          <div key={l} style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '14px 16px', border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: '28px', fontWeight: 500, color: accent ? '#7c5cfc' : 'var(--text)', lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px', letterSpacing: '0.1em' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Credential feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderLeft: `2px solid ${issued[i] ? '#7c5cfc' : 'var(--border)'}`, background: 'var(--bg-card)', borderRadius: '0 8px 8px 0' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', flex: 1 }}>{CREDENTIAL_NAMES[i]}</div>
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '4px', letterSpacing: '0.06em', background: issued[i] ? '#0d2a1a' : '#2a1e00', color: issued[i] ? '#4ade80' : '#fbbf24' }}>
              {issued[i] ? 'VERIFIED' : 'PENDING'}
            </span>
          </div>
        ))}
      </div>

      {/* CTA if not registered */}
      {!isRegistered && (
        <div style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '10px', border: '0.5px solid #7c5cfc', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '14px' }}>No identity registered yet. Build yours to get started.</div>
          <button onClick={() => onNavigate('onboard')} style={{ fontSize: '13px', padding: '10px 24px', borderRadius: '6px', border: 'none', background: '#7c5cfc', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.08em' }}>
            BUILD IDENTITY
          </button>
        </div>
      )}
    </div>
  )
}
