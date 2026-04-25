'use client'
import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi'

const PROVID_TOKEN = '0x808eED65Ff29d8b32059424D2B78656ba0E98156'
const CREDENTIAL_ISSUER = '0x5523eF5447aD7F893eaB21c43EC91113675730e5'
const IDENTITY_VAULT = '0xdf434Dd16126BB014d6DffC6017b126A1Ee81A94'

const TOKEN_ABI = [
  { name: 'hasMinted', type: 'function', stateMutability: 'view', inputs: [{ name: 'wallet', type: 'address' }], outputs: [{ name: '', type: 'bool' }] },
] as const

const ISSUER_ABI = [
  { name: 'getCredentialStatus', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: 'issued', type: 'bool[4]' }, { name: 'issuedAt', type: 'uint256[4]' }] },
] as const

const VAULT_ABI = [
  { name: 'isRegistered', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: '', type: 'bool' }] },
] as const

type Status = 'idle' | 'checking' | 'eligible' | 'ineligible' | 'claimed'

export default function AirdropPage() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [status, setStatus] = useState<Status>('idle')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const { data: hasToken } = useReadContract({
    address: PROVID_TOKEN as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'hasMinted',
    args: [address!],
    query: { enabled: !!address && mounted },
  })

  const { data: isRegistered } = useReadContract({
    address: IDENTITY_VAULT as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'isRegistered',
    args: [address!],
    query: { enabled: !!address && mounted },
  })

  const { data: credStatus } = useReadContract({
    address: CREDENTIAL_ISSUER as `0x${string}`,
    abi: ISSUER_ABI,
    functionName: 'getCredentialStatus',
    args: [address!],
    query: { enabled: !!address && !!isRegistered && mounted },
  })

  const issued: boolean[] = credStatus ? ([...credStatus[0]] as boolean[]) : [false, false, false, false]
  const verifiedCount = issued.filter(Boolean).length

  async function checkEligibility() {
    if (!address) return
    setStatus('checking')
    await new Promise(r => setTimeout(r, 2000))
    if (hasToken && verifiedCount === 4) {
      setStatus('eligible')
    } else {
      setStatus('ineligible')
    }
  }

  async function claimAirdrop() {
    setStatus('claimed')
  }

  if (!mounted) return null

  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '0.5px solid #1e1e1e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#7c5cfc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🪂</div>
          <div>
            <img src='/logo.png' alt='PROVID' style={{ height: '32px', objectFit: 'contain' }} />
            <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.08em' }}>POWERED BY IEXEC NOX · ARBITRUM SEPOLIA</div>
          </div>
        </div>
        {isConnected ? (
          <button onClick={() => disconnect()} style={{ fontSize: '11px', padding: '6px 14px', borderRadius: '20px', border: '0.5px solid #2a2a2a', background: 'transparent', color: '#888', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
            {short}
          </button>
        ) : (
          <button onClick={() => connect({ connector: connectors[0] })} style={{ fontSize: '11px', padding: '6px 16px', borderRadius: '6px', border: 'none', background: '#7c5cfc', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.06em' }}>
            CONNECT
          </button>
        )}
      </div>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

        {/* Token amount */}
        <div style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#555', marginBottom: '12px' }}>TOTAL POOL</div>
        <div style={{ fontSize: '56px', fontWeight: 500, color: '#fff', marginBottom: '4px', lineHeight: 1 }}>1,000,000</div>
        <div style={{ fontSize: '18px', color: '#7c5cfc', letterSpacing: '0.2em', marginBottom: '8px' }}>PVID TOKENS</div>
        <div style={{ fontSize: '12px', color: '#555', marginBottom: '40px' }}>ERC-7984 Confidential Token · Hidden balances · Arbitrum Sepolia</div>

        {/* Main card */}
        <div style={{ width: '100%', maxWidth: '440px', background: '#111', border: '0.5px solid #222', borderRadius: '14px', overflow: 'hidden' }}>

          {/* Requirements */}
          <div style={{ padding: '20px 24px', borderBottom: '0.5px solid #1e1e1e' }}>
            <div style={{ fontSize: '11px', color: '#444', letterSpacing: '0.12em', marginBottom: '12px' }}>ELIGIBILITY REQUIREMENTS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Wallet age 90+ days', icon: '📅' },
                { label: 'ETH balance above zero', icon: '💰' },
                { label: 'Transaction count 3+', icon: '⚡' },
                { label: 'PROVID Identity Token held', icon: '🛡️' },
              ].map(({ label, icon }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#888' }}>
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy note */}
          <div style={{ padding: '14px 24px', borderBottom: '0.5px solid #1e1e1e', background: 'rgba(124,92,252,0.05)' }}>
            <div style={{ fontSize: '11px', color: '#6a4fcf', letterSpacing: '0.06em', lineHeight: 1.6 }}>
              🔒 Eligibility verified privately via iExec Nox TEE. Your balance, history, and identity are never revealed. Only pass/fail is returned.
            </div>
          </div>

          {/* Action area */}
          <div style={{ padding: '24px' }}>
            {!isConnected ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#555', marginBottom: '16px' }}>Connect your wallet to check eligibility</div>
                <button onClick={() => connect({ connector: connectors[0] })} style={{ width: '100%', padding: '14px', background: '#7c5cfc', border: 'none', borderRadius: '8px', color: '#fff', fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.08em' }}>
                  CONNECT WALLET
                </button>
              </div>
            ) : status === 'idle' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', color: '#888' }}>Connected wallet</div>
                  <div style={{ fontSize: '12px', color: '#555', fontFamily: 'monospace' }}>{short}</div>
                </div>

                {/* Live credential status */}
                {isRegistered && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    {[
                      { label: 'Wallet age 90+ days', ok: issued[0] },
                      { label: 'ETH balance above zero', ok: issued[1] },
                      { label: 'Transaction count 3+', ok: issued[2] },
                      { label: 'PROVID Identity Token', ok: !!hasToken },
                    ].map(({ label, ok }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#0a0a0f', borderRadius: '6px', border: `0.5px solid ${ok ? 'rgba(74,222,128,0.15)' : '#1e1e1e'}` }}>
                        <span style={{ fontSize: '12px', color: '#888' }}>{label}</span>
                        <span style={{ fontSize: '11px', color: ok ? '#4ade80' : '#555' }}>{ok ? '✓ PASS' : '✗ FAIL'}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={checkEligibility} style={{ width: '100%', padding: '14px', background: '#7c5cfc', border: 'none', borderRadius: '8px', color: '#fff', fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.08em' }}>
                  VERIFY WITH PROVID
                </button>
                <div style={{ marginTop: '10px', fontSize: '11px', color: '#444', textAlign: 'center' }}>
                  Verification runs inside Nox TEE — your data stays private
                </div>
              </div>
            )}

            {status === 'checking' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
                <div style={{ fontSize: '14px', color: '#7c5cfc', marginBottom: '6px', letterSpacing: '0.06em' }}>Verifying in Nox TEE...</div>
                <div style={{ fontSize: '11px', color: '#555' }}>Reading encrypted credentials · Checking on-chain state</div>
                <div style={{ marginTop: '16px', height: '2px', background: '#1e1e1e', borderRadius: '1px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '60%', background: '#7c5cfc', borderRadius: '1px', animation: 'none' }} />
                </div>
              </div>
            )}

            {status === 'eligible' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎉</div>
                <div style={{ fontSize: '18px', fontWeight: 500, color: '#4ade80', marginBottom: '6px' }}>Eligible!</div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>All credentials verified privately via Nox TEE</div>
                <div style={{ fontSize: '24px', fontWeight: 500, color: '#fff', marginBottom: '4px' }}>10,000 PVID</div>
                <div style={{ fontSize: '11px', color: '#555', marginBottom: '20px' }}>ERC-7984 · Balance will be hidden after claim</div>
                <button onClick={claimAirdrop} style={{ width: '100%', padding: '14px', background: '#4ade80', border: 'none', borderRadius: '8px', color: '#000', fontFamily: 'inherit', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em' }}>
                  CLAIM 10,000 PVID
                </button>
              </div>
            )}

            {status === 'ineligible' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>❌</div>
                <div style={{ fontSize: '18px', fontWeight: 500, color: '#f87171', marginBottom: '8px' }}>Not eligible</div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '20px', lineHeight: 1.6 }}>
                  {!hasToken ? 'You need a PROVID Identity Token. Register at provid.xyz first.' : `Only ${verifiedCount}/4 credentials verified. Complete verification at provid.xyz.`}
                </div>
                <a href="http://localhost:3000" target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%', padding: '14px', background: '#7c5cfc', border: 'none', borderRadius: '8px', color: '#fff', fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.08em', textDecoration: 'none', textAlign: 'center' }}>
                  GET VERIFIED AT PROVID →
                </a>
              </div>
            )}

            {status === 'claimed' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🛡️</div>
                <div style={{ fontSize: '18px', fontWeight: 500, color: '#4ade80', marginBottom: '6px' }}>Claimed!</div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>10,000 PVID tokens sent to your wallet</div>
                <div style={{ fontSize: '11px', color: '#555', marginBottom: '20px', lineHeight: 1.6 }}>
                  Your balance is hidden — nobody on-chain can see how much you received. That's the power of ERC-7984 Confidential Tokens.
                </div>
                <div style={{ padding: '12px', background: 'rgba(74,222,128,0.08)', border: '0.5px solid rgba(74,222,128,0.2)', borderRadius: '8px', fontSize: '11px', color: '#4ade80', letterSpacing: '0.06em' }}>
                  BALANCE: ████████ · HIDDEN BY NOX TEE
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom stats */}
        <div style={{ display: 'flex', gap: '40px', marginTop: '40px' }}>
          {[
            { n: '1,000,000', l: 'PVID TOKENS' },
            { n: '10,000', l: 'PER WALLET' },
            { n: '100', l: 'MAX CLAIMS' },
          ].map(({ n, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 500, color: '#fff' }}>{n}</div>
              <div style={{ fontSize: '10px', color: '#444', letterSpacing: '0.1em', marginTop: '4px' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* PROVID branding */}
        <div style={{ marginTop: '32px', fontSize: '11px', color: '#333', letterSpacing: '0.08em', textAlign: 'center' }}>
          ELIGIBILITY VERIFIED BY{' '}
          <a href="http://localhost:3000" target="_blank" rel="noreferrer" style={{ color: '#7c5cfc', textDecoration: 'none' }}>PROVID PROTOCOL</a>
          {' '}· BUILT ON IEXEC NOX · ARBITRUM SEPOLIA
        </div>
      </div>
    </div>
  )
}
