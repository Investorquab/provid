'use client'
import { useState } from 'react'

export default function ChainGPT({ credentials, score }: { credentials: any, score: number }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const apiKey = '027bf8a1-f998-48c1-93b6-72be99452a01'

  async function askChainGPT(question: string) {
    if (!apiKey) { setResponse('Please enter your ChainGPT API key above.'); return }
    setLoading(true)
    setResponse('')
    try {
      const res = await fetch('https://api.chaingpt.org/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({
          model: 'cgpt-4',
          messages: [
            { role: 'system', content: 'You are an AI assistant for PROVID, a confidential identity protocol on iExec Nox. User credentials: walletAge=' + credentials.walletAge + ', balance=' + credentials.balance + ', txCount=' + credentials.txCount + ', token=' + credentials.hasToken + '. Keep answers to 2-3 sentences.' },
            { role: 'user', content: question }
          ],
          stream: false,
        }),
      })
      const data = await res.json()
      setResponse(data?.choices?.[0]?.message?.content || 'No response.')
    } catch (e) {
      setResponse('ChainGPT API error. Check your API key.')
    } finally {
      setLoading(false)
    }
  }

  const questions = ['What do my credentials mean?', 'Which DeFi protocols can I access?', 'How is my data kept private?', 'What is the PROVID Identity Token?']

  return (
    <div style={{ marginTop: '24px' }}>
      <button onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', width: '100%', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🤖</span><span>Ask ChainGPT about your identity</span>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '16px' }}>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {questions.map(q => (
              <button key={q} onClick={() => askChainGPT(q)} disabled={loading} style={{ padding: '5px 10px', background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: '20px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px' }}>{q}</button>
            ))}
          </div>
          {loading && <div style={{ fontSize: '12px', color: '#7c5cfc', padding: '10px', background: 'rgba(124,92,252,0.05)', borderRadius: '6px' }}>ChainGPT is thinking...</div>}
          {response && !loading && (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '12px', background: 'rgba(124,92,252,0.05)', border: '0.5px solid rgba(124,92,252,0.15)', borderRadius: '6px', lineHeight: 1.6 }}>
              <div style={{ fontSize: '10px', color: '#7c5cfc', letterSpacing: '0.08em', marginBottom: '6px' }}>CHAINGPT</div>
              {response}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
