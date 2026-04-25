'use client'
import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES, CREDENTIAL_NAMES } from '@/lib/web3'
import { CredentialIssuerABI } from '@/lib/abis/CredentialIssuer'
import { IdentityVaultABI } from '@/lib/abis/IdentityVault'
import { ProvidIdentityTokenABI } from '@/lib/abis/ProvidIdentityToken'

export default function ShareProof() {
  const { address } = useAccount()
  const [copied, setCopied] = useState(false)

  const { data: isRegistered } = useReadContract({
    address: CONTRACT_ADDRESSES.IdentityVault as `0x${string}`,
    abi: IdentityVaultABI,
    functionName: 'isRegistered', args: [address!],
    query: { enabled: !!address },
  })

  const { data: credStatus } = useReadContract({
    address: CONTRACT_ADDRESSES.CredentialIssuer as `0x${string}`,
    abi: CredentialIssuerABI,
    functionName: 'getCredentialStatus', args: [address!],
    query: { enabled: !!address && !!isRegistered },
  })

  const { data: hasToken } = useReadContract({
    address: CONTRACT_ADDRESSES.ProvidIdentityToken as `0x${string}`,
    abi: ProvidIdentityTokenABI,
    functionName: 'hasMinted', args: [address!],
    query: { enabled: !!address },
  })

  const issued: boolean[] = credStatus ? ([...credStatus[0]] as boolean[]) : [false, false, false, false]
  const verifiedCreds = [0, 1, 2, 3].filter(i => issued[i])

  const proofLink = `https://provid-airdropdemo.vercel.app/verify?user=${address}&creds=${verifiedCreds.join(',')}&token=${hasToken ? '1' : '0'}&network=arbitrum-sepolia`

  function copyLink() {
    navigator.clipboard.writeText(proofLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isRegistered) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '500px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '0.06em' }}>Share proof</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.08em' }}>VERIFIER GETS YES/NO · NOTHING ELSE</div>
          </div>
          <div style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: '10px', border: '0.5px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '14px' }}>Register your identity first to generate proofs.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '0.06em' }}>Share proof</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.08em' }}>VERIFIER GETS YES/NO · NOTHING ELSE</div>
        </div>

        {/* Token status */}
        {hasToken && (
          <div style={{ padding: '12px 16px', background: 'rgba(74,222,128,0.08)', border: '0.5px solid rgba(74,222,128,0.2)', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '16px' }}>🛡️</div>
            <div>
              <div style={{ fontSize: '13px', color: '#4ade80', fontWeight: 500 }}>PROVID Identity Token held</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>ERC-7984 · Balance hidden · Verified human</div>
            </div>
          </div>
        )}

        {/* Proof bundle */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '10px', border: '0.5px solid rgba(124,92,252,0.3)', padding: '20px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 500 }}>Proof bundle</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.06em', fontFamily: 'monospace' }}>
              NOX-{address?.slice(2, 8).toUpperCase()}
            </div>
          </div>

          {/* Real credentials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--bg)', borderRadius: '6px', opacity: issued[i] ? 1 : 0.4 }}>
                <span style={{ color: issued[i] ? '#4ade80' : 'var(--text-dim)', fontSize: '12px', flexShrink: 0 }}>
                  {issued[i] ? '✓' : '○'}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', flex: 1 }}>{CREDENTIAL_NAMES[i]}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                  {issued[i] ? 'BOOL ONLY' : 'NOT ISSUED'}
                </span>
              </div>
            ))}
          </div>

          {/* What verifier sees */}
          <div style={{ padding: '10px 12px', background: 'rgba(124,92,252,0.05)', borderRadius: '6px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: '6px' }}>VERIFIER SEES ONLY</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              ✓ or ✗ for each credential — nothing else. No wallet address, no balance, no history.
            </div>
          </div>

          {/* ACL */}
          <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: '8px' }}>PROOF GENERATED FOR</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {address?.slice(0, 6)}...{address?.slice(-4)} · Arbitrum Sepolia · Nox TEE
            </div>
          </div>
        </div>

        {/* Proof link */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '8px', border: '0.5px solid var(--border)', padding: '14px 16px', marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: '8px' }}>SHAREABLE PROOF LINK</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', wordBreak: 'break-all', lineHeight: 1.6, fontFamily: 'monospace' }}>
            {proofLink.slice(0, 70)}...
          </div>
        </div>

        <button onClick={copyLink} style={{ width: '100%', padding: '12px', background: 'transparent', border: '0.5px solid #7c5cfc', borderRadius: '8px', color: '#7c5cfc', fontFamily: 'inherit', fontSize: '13px', cursor: 'pointer', letterSpacing: '0.08em' }}>
          {copied ? 'COPIED ✓' : 'COPY PROOF LINK'}
        </button>

        <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.6 }}>
          Any app that integrates PROVID can verify this proof on-chain. They see only pass/fail — never your actual data.
        </div>
      </div>
    </div>
  )
}
