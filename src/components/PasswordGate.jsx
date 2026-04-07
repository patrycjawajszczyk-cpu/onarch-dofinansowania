import { useState, useEffect } from 'react'

const PASS_KEY = 'onarch_auth'

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(PASS_KEY) === 'ok') setUnlocked(true)
  }, [])

  function check() {
    const correct = import.meta.env.VITE_APP_PASSWORD
    if (input === correct) {
      sessionStorage.setItem(PASS_KEY, 'ok')
      setUnlocked(true)
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  if (unlocked) return children

  return (
    <div style={{minHeight:'100vh',background:'var(--navy)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'white',borderRadius:16,padding:40,width:340,textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:28,color:'var(--navy)',marginBottom:4}}>ON-ARCH</div>
        <div style={{fontSize:12,color:'var(--gold)',letterSpacing:1,marginBottom:32}}>PANEL DOFINANSOWAŃ</div>
        <div style={{marginBottom:16}}>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && check()}
            placeholder="Hasło dostępu"
            style={{width:'100%',padding:'12px 16px',border:`2px solid ${error ? 'var(--red)' : 'var(--gray-300)'}`,borderRadius:8,fontSize:15,textAlign:'center',transition:'border-color 0.2s'}}
            autoFocus
          />
          {error && <div style={{color:'var(--red)',fontSize:12,marginTop:6}}>Nieprawidłowe hasło</div>}
        </div>
        <button
          onClick={check}
          style={{width:'100%',padding:'12px',background:'var(--terra)',color:'white',border:'none',borderRadius:8,fontSize:15,fontWeight:700,cursor:'pointer'}}
        >
          Wejdź
        </button>
      </div>
    </div>
  )
}
