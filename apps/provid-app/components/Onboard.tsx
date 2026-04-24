'use client'
import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { encodeFunctionData } from 'viem'
import { CONTRACT_ADDRESSES } from '@/lib/web3'
import { IdentityVaultABI } from '@/lib/abis/IdentityVault'
import { CredentialIssuerABI } from '@/lib/abis/CredentialIssuer'
import { ProvidIdentityTokenABI } from '@/lib/abis/ProvidIdentityToken'
import { fetchWalletData } from '@/lib/walletData'
import { encryptWithNox } from '@/lib/noxEncrypt'
import { sendTx } from '@/lib/sendTx'

const steps = ['Connect wallet', 'Fetch data', 'Encrypt with Nox', 'Register vault', 'Issue credentials', 'Mint PVID token']
const VAULT = CONTRACT_ADDRESSES.IdentityVault as `0x${string}`
const ISSUER = CONTRACT_ADDRESSES.CredentialIssuer as `0x${string}`
const TOKEN = CONTRACT_ADDRESSES.ProvidIdentityToken as `0x${string}`

export default function Onboard({ onDone }: { onDone: () => void }) {
  const { address } = useAccount()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [walletData, setWalletData] = useState<any>(null)
  const [lastTxHash, setLastTxHash] = useState('')

  const { data: isRegistered } = useReadContract({
    address: VAULT, abi: IdentityVaultABI,
    functionName: 'isRegistered', args: [address!],
    query: { enabled: !!address, refetchInterval: 3000 },
  })

  const { data: credStatus } = useReadContract({
    address: ISSUER, abi: CredentialIssuerABI,
    functionName: 'getCredentialStatus', args: [address!],
    query: { enabled: !!address && !!isRegistered, refetchInterval: 3000 },
  })

  const { data: hasToken } = useReadContract({
    address: TOKEN, abi: ProvidIdentityTokenABI,
    functionName: 'hasMinted', args: [address!],
    query: { enabled: !!address, refetchInterval: 3000 },
  })

  const issued: boolean[] = credStatus ? ([...credStatus[0]] as boolean[]) : [false, false, false, false]
  const verifiedCount = issued.filter(Boolean).length
  const allVerified = verifiedCount === 4

  useEffect(() => {
    if (!address) return
    fetchWalletData(address).then(setWalletData).catch(console.error)
  }, [address])

  async function tx(to: `0x${string}`, data: `0x${string}`) {
    const hash = await sendTx(address!, to, data)
    setLastTxHash(hash)
    return hash
  }

  async function handleRegister() {
    if (!address) return
    setLoading(true)
    setError('')
    try {
      if (!isRegistered) {
        setStep(1)
        const data = walletData || await fetchWalletData(address)
        setWalletData(data)

        setStep(2)
        const { walletAgeEnc, balanceEnc, txCountEnc } = await encryptWithNox(address, data, VAULT)

        setStep(3)
        await tx(VAULT, encodeFunctionData({
          abi: IdentityVaultABI,
          functionName: 'registerIdentity',
          args: [
            walletAgeEnc.handle as `0x${string}`,
            walletAgeEnc.handleProof as `0x${string}`,
            balanceEnc.handle as `0x${string}`,
            balanceEnc.handleProof as `0x${string}`,
            txCountEnc.handle as `0x${string}`,
            txCountEnc.handleProof as `0x${string}`,
          ],
        }))
        await new Promise(r => setTimeout(r, 3000))
      }

      setStep(4)
      for (const credType of [0, 1, 2, 3] as const) {
        if (!issued[credType]) {
          await tx(ISSUER, encodeFunctionData({
            abi: CredentialIssuerABI,
            functionName: 'issueCredential',
            args: [credType],
          }))
          await new Promise(r => setTimeout(r, 2000))
        }
      }

      if (!hasToken) {
        setStep(5)
        const { mintProvidToken } = await import('@/lib/mintToken')
        await mintProvidToken(address)
      }

      setDone(true)
      setTimeout(onDone, 2000)
    } catch (e: any) {
      console.error('Full error:', e)
      setError(e?.message?.slice(0, 200) || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const meetsAge = walletData ? walletData.walletAgeDays >= 90 : null
  const meetsTx = walletData ? walletData.txCount >= 3 : null
  const meetsBalance = walletData ? walletData.balanceEth > 0 : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '0.06em' }}>Build identity</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.08em' }}>REAL ON-CHAIN DATA · ENCRYPTED VIA NOX TEE</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '4px' }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: i < step ? '#4ade80' : i === step && loading ? '#7c5cfc' : 'var(--text-dim)' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '0.5px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', flexShrink: 0 }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div style={{ width: '10px', height: '0.5px', background: 'var(--border)', margin: '0 2px' }} />}
            </div>
          ))}
        </div>

        {done ? (
          <div style={{ background: 'var(--bg-card)', borderRadius: '10px', border: '0.5px solid #4ade80', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛡️</div>
            <div style={{ fontSize: '18px', fontWeight: 500, color: '#4ade80', marginBottom: '8px' }}>Identity verified & token minted</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>PROVID Identity Token (ERC-7984) is now in your wallet</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {['Balance hidden — nobody sees your holding', 'One per wallet — Sybil resistant', 'Any DeFi protocol can verify you instantly'].map(f => (
                <div key={f} style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <span style={{ color: '#4ade80' }}>✓</span> {f}
                </div>
              ))}
            </div>
            {lastTxHash && (
              <a href={`https://sepolia.arbiscan.io/tx/${lastTxHash}`} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#7c5cfc' }}>
                View on Arbiscan ↗
              </a>
            )}
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', borderRadius: '10px', border: '0.5px solid var(--border)', padding: '24px' }}>
            {hasToken && (
              <div style={{ padding: '10px 14px', background: 'rgba(74,222,128,0.1)', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🛡️ PROVID Identity Token already minted
              </div>
            )}
            {isRegistered && !hasToken && (
              <div style={{ padding: '10px 14px', background: 'rgba(124,92,252,0.1)', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', color: '#a78bfa' }}>
                Vault registered · {verifiedCount}/4 credentials · Token pending
              </div>
            )}

            <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>Your on-chain snapshot</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
              Real data fetched from chain. Encrypted via Nox TEE. Bots and new wallets are rejected automatically.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {[
                { label: 'Wallet age', value: walletData ? `${walletData.walletAgeDays} days` : 'fetching...', required: '90+ days required', meets: meetsAge },
                { label: 'ETH balance', value: walletData ? `${(walletData.balanceEth / 1000).toFixed(4)} ETH` : 'fetching...', required: 'Above zero required', meets: meetsBalance },
                { label: 'Transaction count', value: walletData ? `${walletData.txCount} txns` : 'fetching...', required: '3+ txns required', meets: meetsTx },
              ].map(({ label, value, required, meets }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg)', borderRadius: '8px', border: `0.5px solid ${meets === true ? 'rgba(74,222,128,0.2)' : meets === false ? 'rgba(248,113,113,0.2)' : 'var(--border)'}` }}>
                  <div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>{required}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: loading && step >= 2 ? '#7c5cfc' : 'var(--text-dim)' }}>
                      {loading && step >= 2 ? '████████' : value}
                    </span>
                    {loading && step >= 2 && <span style={{ fontSize: '10px', color: '#7c5cfc' }}>ENCRYPTED</span>}
                    {!(loading && step >= 2) && meets === true && <span style={{ color: '#4ade80' }}>✓</span>}
                    {!(loading && step >= 2) && meets === false && <span style={{ color: '#f87171' }}>✗</span>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px 14px', background: 'rgba(124,92,252,0.05)', border: '0.5px solid rgba(124,92,252,0.15)', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: '8px' }}>ON COMPLETION YOU RECEIVE</div>
              {['4 verified credentials stored in Nox TEE', 'PROVID Identity Token (ERC-7984) — balance hidden', 'Access to any DeFi protocol that uses PROVID'].map(f => (
                <div key={f} style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: '#7c5cfc', flexShrink: 0 }}>→</span> {f}
                </div>
              ))}
            </div>

            {walletData && (meetsAge === false || meetsTx === false || meetsBalance === false) && !isRegistered && (
              <div style={{ padding: '12px 14px', background: 'rgba(248,113,113,0.08)', border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: '8px', marginBottom: '14px', fontSize: '12px', color: '#f87171', lineHeight: 1.6 }}>
                ⚠ Wallet does not meet all criteria. The Nox TEE will reject ineligible wallets.
              </div>
            )}

            {error && (
              <div style={{ padding: '12px 14px', background: 'rgba(248,113,113,0.08)', border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: '8px', marginBottom: '14px', fontSize: '12px', color: '#f87171', lineHeight: 1.6 }}>
                {error}
              </div>
            )}

            <button onClick={handleRegister} disabled={loading || !!hasToken}
              style={{ width: '100%', padding: '14px', background: hasToken ? '#0d2a1a' : loading ? '#1a1a1a' : '#7c5cfc', border: hasToken ? '0.5px solid #4ade80' : loading ? '0.5px solid var(--border)' : 'none', borderRadius: '8px', color: hasToken ? '#4ade80' : loading ? '#7c5cfc' : '#fff', fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, cursor: hasToken || loading ? 'not-allowed' : 'pointer', letterSpacing: '0.08em' }}>
              {hasToken ? '🛡️ PROVID TOKEN ALREADY MINTED'
                : loading ? (
                  step === 1 ? 'FETCHING ON-CHAIN DATA...'
                  : step === 2 ? 'ENCRYPTING WITH NOX SDK...'
                  : step === 3 ? '⚡ CONFIRM IN METAMASK NOW...'
                  : step === 4 ? 'ISSUING CREDENTIALS...'
                  : 'MINTING PROVID IDENTITY TOKEN...'
                ) : isRegistered && !allVerified ? `ISSUE REMAINING (${4 - verifiedCount} left)`
                : isRegistered && allVerified && !hasToken ? 'MINT PROVID IDENTITY TOKEN'
                : 'VERIFY IDENTITY & MINT TOKEN'}
            </button>

            {loading && step === 3 && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#fbbf24', textAlign: 'center' }}>
                ⚡ Confirm in MetaMask immediately — proof expires in seconds
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
