import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { FUNDING_SOURCES } from '../lib/templates'
import { format, differenceInDays } from 'date-fns'
import { Send, Bell } from 'lucide-react'

async function sendEmailJS(templateParams) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams
    })
  })
  if (!response.ok) throw new Error('EmailJS error: ' + response.status)
}

export default function Reminders() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState({})
  const [sent, setSent] = useState({})
  const [days, setDays] = useState(7)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('documents')
      .select('*, contracts(contract_number, participant_name, course_name, source)')
      .neq('status', 'done').neq('status', 'not_applicable')
      .not('due_date', 'is', null)
      .order('due_date')
    setDocuments(data || [])
    setLoading(false)
  }

  const today = new Date()
  const upcoming = documents.filter(d => {
    const diff = differenceInDays(new Date(d.due_date), today)
    return diff >= -3 && diff <= days
  })

  async function sendReminder(doc) {
    setSending(p => ({...p, [doc.id]: true}))
    try {
      await sendEmailJS({
        document_name: doc.name,
        participant: doc.contracts?.participant_name || '',
        course: doc.contracts?.course_name || '',
        contract_number: doc.contracts?.contract_number || '',
        due_date: doc.due_date,
        days_left: differenceInDays(new Date(doc.due_date), today),
        source: doc.contracts?.source || '',
      })
      setSent(p => ({...p, [doc.id]: true}))
    } catch(e) {
      alert('Blad wysylki: ' + e.message)
    }
    setSending(p => ({...p, [doc.id]: false}))
  }

  async function sendAll() {
    for (const doc of upcoming) await sendReminder(doc)
  }

  const getSourceLabel = (val) => FUNDING_SOURCES.find(s => s.value === val)?.label || val

  const daysLabel = (d) => {
    const diff = differenceInDays(new Date(d), today)
    if (diff < 0) return <span style={{color:'var(--red)',fontWeight:700}}>Zaległe ({Math.abs(diff)}d)</span>
    if (diff === 0) return <span style={{color:'var(--orange)',fontWeight:700}}>Dziś!</span>
    if (diff === 1) return <span style={{color:'var(--orange)',fontWeight:700}}>Jutro</span>
    return <span style={{color: diff<=7 ? 'var(--orange)' : 'var(--navy)',fontWeight:700}}>za {diff} dni</span>
  }

  const emailjsOk = import.meta.env.VITE_EMAILJS_SERVICE_ID

  return (
    <div>
      <div className="page-header">
        <div><h1>Przypomnienia</h1><p>Dokumenty z nadchodzącymi terminami</p></div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <select value={days} onChange={e=>setDays(Number(e.target.value))} style={{width:'auto'}}>
            <option value={7}>Następne 7 dni</option>
            <option value={14}>Następne 14 dni</option>
            <option value={30}>Następne 30 dni</option>
          </select>
          {emailjsOk && upcoming.length > 0 && (
            <button className="btn btn-terra" onClick={sendAll}><Send size={15}/> Wyślij wszystkie ({upcoming.length})</button>
          )}
        </div>
      </div>

      {!emailjsOk && (
        <div className="card" style={{borderLeft:'4px solid var(--gold)',marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Bell size={18} color="var(--gold)"/>
            <div>
              <strong>Skonfiguruj e-maile</strong>
              <p style={{fontSize:13,color:'var(--gray-500)',marginTop:2}}>
                Dodaj zmienne EmailJS w Vercel: VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && <p style={{color:'var(--gray-500)'}}>Ładowanie...</p>}

      {!loading && upcoming.length === 0 && (
        <div className="card" style={{textAlign:'center',padding:48}}>
          <p style={{color:'var(--gray-500)'}}>Brak dokumentów z terminami w wybranym zakresie.</p>
        </div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {upcoming.map(doc => (
          <div key={doc.id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,color:'var(--navy)',marginBottom:4}}>{doc.name}</div>
              <div style={{fontSize:12,color:'var(--gray-500)'}}>
                {getSourceLabel(doc.contracts?.source)} · {doc.contracts?.participant_name} · {doc.contracts?.course_name}
              </div>
              {doc.note && <div style={{fontSize:11,color:'var(--gray-400)',marginTop:2}}>{doc.note}</div>}
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:13,marginBottom:6}}>{daysLabel(doc.due_date)}</div>
              <div style={{fontSize:12,color:'var(--gray-500)',marginBottom:8}}>{format(new Date(doc.due_date),'dd.MM.yyyy')}</div>
              {emailjsOk && (
                <button
                  className={`btn btn-sm ${sent[doc.id] ? 'btn-gold' : 'btn-ghost'}`}
                  onClick={() => sendReminder(doc)}
                  disabled={sending[doc.id]}
                >
                  <Send size={12}/>
                  {sent[doc.id] ? 'Wysłano!' : sending[doc.id] ? '...' : 'Wyślij e-mail'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
