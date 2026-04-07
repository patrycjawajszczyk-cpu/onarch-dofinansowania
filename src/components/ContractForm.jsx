import { useState, useRef } from 'react'
import { FUNDING_SOURCES } from '../lib/templates'
import { Upload, Sparkles, FileText, X, AlertCircle } from 'lucide-react'

const SOURCE_KEYWORDS = {
  WUP_EFS: ['wup','wojewodzki urzad pracy','efs','europejski fundusz spoleczny','fundusze europejskie','efs+','regionalny program'],
  PUP: ['pup','powiatowy urzad pracy','starosta'],
  BUR: ['bur','baza uslug rozwojowych'],
  BON: ['bon szkoleniowy','bon na szkolenie'],
  UE_INNE: ['interreg','horyzont','erasmus','popc','poir','power'],
}

function detectSource(text) {
  const lower = text.toLowerCase()
  for (const [key, kws] of Object.entries(SOURCE_KEYWORDS)) {
    if (kws.some(kw => lower.includes(kw))) return key
  }
  return 'INNE'
}

async function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function extractWithClaude(file) {
  const base64 = await readFileAsBase64(file)
  const isPdf = file.type === 'application/pdf'
  const mediaType = isPdf
    ? 'application/pdf'
    : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

  const systemPrompt = `Jestes asystentem analizujacym polskie umowy szkoleniowe i dofinansowania. Wyodrebnij dane i zwroc TYLKO JSON bez zadnego tekstu przed ani po: {"contract_number":"...lub null","participant_name":"...lub null","course_name":"...lub null","start_date":"YYYY-MM-DD lub null","end_date":"YYYY-MM-DD lub null","value":liczba_lub_null,"ordering_party":"...lub null","source_hint":"...lub null","notes":"...lub null"}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: 'Wyodrebnij dane z tej umowy szkoleniowej.' }
        ]
      }]
    })
  })

  const data = await response.json()
  if (data.error) throw new Error(data.error.message)
  const text = data.content?.[0]?.text || ''
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}

export default function ContractForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    source: initial.source || 'WUP_EFS',
    contract_number: initial.contract_number || '',
    participant_name: initial.participant_name || '',
    course_name: initial.course_name || '',
    start_date: initial.start_date || '',
    end_date: initial.end_date || '',
    value: initial.value || '',
    status: initial.status || 'active',
    notes: initial.notes || '',
  })
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [aiOk, setAiOk] = useState(false)
  const fileRef = useRef()

  const set = (k, v) => setForm(p => ({...p, [k]: v}))

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    setParsing(true)
    setParseError(null)
    setAiOk(false)
    try {
      const result = await extractWithClaude(file)
      const detectedSource = result.source_hint ? detectSource(result.source_hint) : form.source
      const noteParts = [
        result.ordering_party && 'Zamawiajacy: ' + result.ordering_party,
        result.notes
      ].filter(Boolean)
      setForm(prev => ({
        ...prev,
        source: detectedSource,
        contract_number: result.contract_number || prev.contract_number,
        participant_name: result.participant_name || prev.participant_name,
        course_name: result.course_name || prev.course_name,
        start_date: result.start_date || prev.start_date,
        end_date: result.end_date || prev.end_date,
        value: result.value || prev.value,
        notes: noteParts.join(' | ') || prev.notes,
      }))
      setAiOk(true)
    } catch(err) {
      setParseError('Nie udalo sie odczytac umowy. Sprawdz czy plik nie jest zaszyfrowany lub wypelnij dane recznie.')
    }
    setParsing(false)
    e.target.value = ''
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>

      <div
        style={{border:`2px dashed ${parsing?'var(--terra)':'var(--gray-300)'}`,borderRadius:10,padding:'20px 24px',textAlign:'center',background:parsing?'#fef8f8':'var(--gray-50)',cursor:'pointer',transition:'all 0.2s'}}
        onClick={() => !parsing && fileRef.current.click()}
      >
        <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" style={{display:'none'}} onChange={handleFile}/>
        {parsing ? (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,color:'var(--terra)'}}>
            <Sparkles size={20}/><span style={{fontWeight:700}}>Claude analizuje umowe...</span>
          </div>
        ) : aiOk ? (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,color:'var(--green)'}}>
            <FileText size={18}/><span style={{fontWeight:700}}>Dane wczytane z: {fileName}</span>
            <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--gray-500)'}} onClick={e=>{e.stopPropagation();setFileName(null);setAiOk(false)}}><X size={14}/></button>
          </div>
        ) : (
          <div>
            <Upload size={24} color="var(--terra)" style={{marginBottom:8}}/>
            <div style={{fontWeight:700,color:'var(--navy)',marginBottom:4}}>Wgraj umowe — Claude wypelni formularz automatycznie</div>
            <div style={{fontSize:12,color:'var(--gray-500)'}}>PDF lub DOCX</div>
          </div>
        )}
      </div>

      {parseError && (
        <div style={{display:'flex',gap:8,alignItems:'flex-start',background:'var(--red-bg)',border:'1px solid #f5b7b1',borderRadius:8,padding:'10px 14px',fontSize:13,color:'var(--red)'}}>
          <AlertCircle size={16} style={{flexShrink:0,marginTop:1}}/> {parseError}
        </div>
      )}

      {aiOk && (
        <div style={{background:'var(--green-bg)',border:'1px solid #a8d5b5',borderRadius:8,padding:'10px 14px',fontSize:12,color:'var(--green)'}}>
          <strong>Claude rozpoznal umowe</strong> — sprawdz pola ponizej i w razie potrzeby popraw.
        </div>
      )}

      <div className="form-row form-row-2">
        <div className="form-group">
          <label>Zrodlo dofinansowania *</label>
          <select value={form.source} onChange={e => set('source', e.target.value)}>
            {FUNDING_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Numer umowy</label>
          <input type="text" value={form.contract_number} onChange={e => set('contract_number', e.target.value)} placeholder="np. 19/SZ/ARR/10.10"/>
        </div>
      </div>

      <div className="form-row form-row-2">
        <div className="form-group">
          <label>Imie i nazwisko uczestnika *</label>
          <input type="text" value={form.participant_name} onChange={e => set('participant_name', e.target.value)} placeholder="np. Anna Kowalska"/>
        </div>
        <div className="form-group">
          <label>Nazwa kursu *</label>
          <input type="text" value={form.course_name} onChange={e => set('course_name', e.target.value)} placeholder="np. Projektowanie Ogrodow"/>
        </div>
      </div>

      <div className="form-row form-row-3">
        <div className="form-group">
          <label>Data rozpoczecia</label>
          <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)}/>
        </div>
        <div className="form-group">
          <label>Data zakonczenia</label>
          <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)}/>
        </div>
        <div className="form-group">
          <label>Wartosc (zl brutto)</label>
          <input type="number" value={form.value} onChange={e => set('value', e.target.value)} placeholder="10000"/>
        </div>
      </div>

      <div className="form-row form-row-2">
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Aktywna</option>
            <option value="completed">Zakonczona</option>
            <option value="cancelled">Anulowana</option>
          </select>
        </div>
        <div className="form-group">
          <label>Notatki</label>
          <input type="text" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Dodatkowe informacje..."/>
        </div>
      </div>

      <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingTop:8,borderTop:'1px solid var(--gray-200)'}}>
        <button className="btn btn-ghost" onClick={onCancel}>Anuluj</button>
        <button className="btn btn-terra" onClick={() => onSave(form)} disabled={parsing}>
          {parsing ? 'Analizuje...' : 'Zapisz umowe'}
        </button>
      </div>
    </div>
  )
}
