import { useState } from 'react'
import { Save, ExternalLink } from 'lucide-react'

export default function Settings() {
  const [webhook, setWebhook] = useState(localStorage.getItem('make_webhook_url') || '')
  const [email, setEmail] = useState(localStorage.getItem('reminder_email') || '')
  const [saved, setSaved] = useState(false)

  function save() {
    localStorage.setItem('make_webhook_url', webhook)
    localStorage.setItem('reminder_email', email)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Ustawienia</h1><p>Konfiguracja powiadomień e-mail i integracji</p></div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:20,maxWidth:640}}>
        <div className="card">
          <h2 style={{fontSize:16,color:'var(--navy)',marginBottom:4}}>Make.com – Webhook URL</h2>
          <p style={{fontSize:13,color:'var(--gray-500)',marginBottom:16}}>
            Utwórz scenariusz w Make.com z triggerem <strong>Custom Webhook</strong>, a następnie dodaj moduł <strong>Gmail / Email</strong> który wyśle powiadomienie na Twój adres. Wklej URL webhooka poniżej.
          </p>
          <div className="form-group" style={{marginBottom:12}}>
            <label>URL webhooka Make.com</label>
            <input type="text" value={webhook} onChange={e => setWebhook(e.target.value)} placeholder="https://hook.eu1.make.com/xxxxxxxxxxxxxxxx"/>
          </div>
          <div className="form-group">
            <label>Twój adres e-mail (dla referencji)</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="biuro@on-arch.pl"/>
          </div>
        </div>

        <div className="card" style={{borderLeft:'3px solid var(--gold)'}}>
          <h2 style={{fontSize:14,color:'var(--navy)',marginBottom:8}}>Jak skonfigurować Make.com</h2>
          <ol style={{paddingLeft:20,fontSize:13,color:'var(--gray-700)',display:'flex',flexDirection:'column',gap:6}}>
            <li>Wejdź na <a href="https://make.com" target="_blank" rel="noreferrer" style={{color:'var(--terra)'}}>make.com <ExternalLink size={11}/></a> i utwórz nowy scenariusz</li>
            <li>Dodaj moduł <strong>Webhooks → Custom Webhook</strong> jako trigger</li>
            <li>Skopiuj URL webhooka i wklej go powyżej</li>
            <li>Dodaj moduł <strong>Gmail → Send an Email</strong> (lub inny e-mail)</li>
            <li>W treści maila użyj zmiennych: <code>{"{{document_name}}"}</code>, <code>{"{{participant}}"}</code>, <code>{"{{due_date}}"}</code>, <code>{"{{days_left}}"}</code></li>
            <li>Aktywuj scenariusz</li>
          </ol>
        </div>

        <button className={`btn ${saved ? 'btn-gold' : 'btn-terra'}`} onClick={save} style={{alignSelf:'flex-start'}}>
          <Save size={16}/> {saved ? 'Zapisano!' : 'Zapisz ustawienia'}
        </button>
      </div>
    </div>
  )
}
