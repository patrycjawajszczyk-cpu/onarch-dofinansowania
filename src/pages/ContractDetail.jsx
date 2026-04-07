import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { FUNDING_SOURCES, DOC_TEMPLATES, STATUS_LABELS, CONTRACT_STATUS } from '../lib/templates'
import { format } from 'date-fns'
import { ArrowLeft, Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import ContractForm from '../components/ContractForm'
import './ContractDetail.css'

export default function ContractDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'nowa'

  const [contract, setContract] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [editing, setEditing] = useState(isNew)
  const [showAddDoc, setShowAddDoc] = useState(false)
  const [newDocName, setNewDocName] = useState('')
  const [newDocDate, setNewDocDate] = useState('')

  useEffect(() => { if (!isNew) load() }, [id])

  async function load() {
    const [{ data: c }, { data: d }] = await Promise.all([
      supabase.from('contracts').select('*').eq('id', id).single(),
      supabase.from('documents').select('*').eq('contract_id', id).order('due_date')
    ])
    setContract(c)
    setDocuments(d || [])
    setLoading(false)
  }

  async function handleSave(formData) {
    if (isNew) {
      const { data: c, error } = await supabase.from('contracts').insert(formData).select().single()
      if (!error && c) {
        // Auto-generate documents from template
        const template = DOC_TEMPLATES[formData.source] || []
        if (template.length > 0) {
          const docs = template.map(t => ({
            contract_id: c.id,
            name: t.name,
            period: t.period,
            due_date: null,
            status: 'pending',
            note: t.note,
          }))
          await supabase.from('documents').insert(docs)
        }
        navigate(`/umowy/${c.id}`)
      }
    } else {
      await supabase.from('contracts').update(formData).eq('id', id)
      setEditing(false)
      load()
    }
  }

  async function handleDelete() {
    if (!confirm('Usunąć tę umowę i wszystkie jej dokumenty?')) return
    await supabase.from('documents').delete().eq('contract_id', id)
    await supabase.from('contracts').delete().eq('id', id)
    navigate('/umowy')
  }

  async function updateDocStatus(docId, status) {
    await supabase.from('documents').update({ status }).eq('id', docId)
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status } : d))
  }

  async function updateDocDate(docId, due_date) {
    await supabase.from('documents').update({ due_date }).eq('id', docId)
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, due_date } : d))
  }

  async function addDoc() {
    if (!newDocName.trim()) return
    const { data } = await supabase.from('documents').insert({
      contract_id: id, name: newDocName, status: 'pending', due_date: newDocDate || null, period: 'once', note: ''
    }).select().single()
    if (data) setDocuments(prev => [...prev, data])
    setNewDocName(''); setNewDocDate(''); setShowAddDoc(false)
  }

  async function deleteDoc(docId) {
    await supabase.from('documents').delete().eq('id', docId)
    setDocuments(prev => prev.filter(d => d.id !== docId))
  }

  const getSourceLabel = (val) => FUNDING_SOURCES.find(s => s.value === val)?.label || val
  const getSourceBadge = (val) => FUNDING_SOURCES.find(s => s.value === val)?.color || 'badge-gray'

  const today = new Date().toISOString().split('T')[0]
  const doneCount = documents.filter(d => d.status === 'done').length
  const progress = documents.length > 0 ? Math.round((doneCount / documents.filter(d => d.status !== 'not_applicable').length) * 100) : 0

  if (isNew) return (
    <div>
      <div className="page-header">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link to="/umowy" className="btn btn-ghost btn-sm"><ArrowLeft size={14}/></Link>
          <h1>Nowa umowa</h1>
        </div>
      </div>
      <div className="card"><ContractForm onSave={handleSave} onCancel={() => navigate('/umowy')}/></div>
    </div>
  )

  if (loading) return <div style={{padding:40,color:'var(--gray-500)'}}>Ładowanie...</div>
  if (!contract) return <div style={{padding:40,color:'var(--red)'}}>Nie znaleziono umowy.</div>

  return (
    <div>
      <div className="page-header">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link to="/umowy" className="btn btn-ghost btn-sm"><ArrowLeft size={14}/></Link>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
              <span className={`badge ${getSourceBadge(contract.source)}`}>{getSourceLabel(contract.source)}</span>
              <span className={`badge ${CONTRACT_STATUS[contract.status]?.badge}`}>{CONTRACT_STATUS[contract.status]?.label}</span>
              <span style={{fontSize:12,color:'var(--gray-500)'}}>nr {contract.contract_number || '—'}</span>
            </div>
            <h1 style={{fontSize:20}}>{contract.participant_name}</h1>
            <p>{contract.course_name}</p>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}><Pencil size={14}/> Edytuj</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}><Trash2 size={14}/> Usuń</button>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Edytuj umowę</h2></div>
            <div className="modal-body">
              <ContractForm initial={contract} onSave={handleSave} onCancel={() => setEditing(false)}/>
            </div>
          </div>
        </div>
      )}

      {/* Info cards */}
      <div className="detail-grid">
        <div className="card">
          <div className="info-label">Termin realizacji</div>
          <div className="info-value">{contract.start_date ? format(new Date(contract.start_date),'dd.MM.yyyy') : '—'} – {contract.end_date ? format(new Date(contract.end_date),'dd.MM.yyyy') : '—'}</div>
        </div>
        <div className="card">
          <div className="info-label">Wartość umowy</div>
          <div className="info-value">{contract.value ? `${Number(contract.value).toLocaleString('pl-PL')} zł` : '—'}</div>
        </div>
        <div className="card">
          <div className="info-label">Postęp dokumentacji</div>
          <div style={{display:'flex',alignItems:'center',gap:10,marginTop:4}}>
            <div style={{flex:1,height:8,background:'var(--gray-200)',borderRadius:4,overflow:'hidden'}}>
              <div style={{width:`${progress}%`,height:'100%',background:'var(--terra)',borderRadius:4,transition:'width 0.3s'}}/>
            </div>
            <span style={{fontWeight:700,fontSize:13}}>{doneCount}/{documents.filter(d=>d.status!=='not_applicable').length}</span>
          </div>
        </div>
      </div>

      {contract.notes && <div className="card" style={{marginBottom:16,borderLeft:'3px solid var(--gold)'}}><span style={{fontSize:12,color:'var(--gray-500)'}}>Notatki: </span>{contract.notes}</div>}

      {/* Documents */}
      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h2 style={{fontSize:16,color:'var(--navy)'}}>Dokumenty i checklista</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowAddDoc(true)}><Plus size={14}/> Dodaj dokument</button>
        </div>

        {showAddDoc && (
          <div style={{background:'var(--gray-50)',border:'1px solid var(--gray-200)',borderRadius:8,padding:16,marginBottom:16,display:'flex',gap:10,alignItems:'flex-end',flexWrap:'wrap'}}>
            <div className="form-group" style={{flex:2,minWidth:200}}>
              <label>Nazwa dokumentu</label>
              <input type="text" value={newDocName} onChange={e=>setNewDocName(e.target.value)} placeholder="np. Lista obecności – maj 2026"/>
            </div>
            <div className="form-group" style={{flex:1,minWidth:140}}>
              <label>Termin</label>
              <input type="date" value={newDocDate} onChange={e=>setNewDocDate(e.target.value)}/>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-terra btn-sm" onClick={addDoc}><Check size={14}/> Dodaj</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddDoc(false)}><X size={14}/></button>
            </div>
          </div>
        )}

        {documents.length === 0 && <p style={{color:'var(--gray-500)',fontSize:13}}>Brak dokumentów. Dodaj ręcznie lub utwórz nową umowę z szablonem.</p>}

        <div className="doc-list">
          {documents.map(doc => {
            const isOverdue = doc.due_date && doc.due_date < today && doc.status !== 'done' && doc.status !== 'not_applicable'
            const sl = STATUS_LABELS[doc.status] || STATUS_LABELS.pending
            return (
              <div key={doc.id} className={`doc-item ${doc.status === 'done' ? 'done' : ''} ${isOverdue ? 'overdue' : ''}`}>
                <div style={{flex:1}}>
                  <div style={{fontWeight: doc.status==='done' ? 400 : 600, textDecoration: doc.status==='done' ? 'line-through' : 'none', color: doc.status==='done' ? 'var(--gray-500)' : 'var(--navy)'}}>
                    {doc.name}
                  </div>
                  {doc.note && <div style={{fontSize:11,color:'var(--gray-500)',marginTop:2}}>{doc.note}</div>}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
                  <input type="date" value={doc.due_date || ''} onChange={e => updateDocDate(doc.id, e.target.value)} style={{width:140,fontSize:12,padding:'4px 8px'}}/>
                  <select value={doc.status} onChange={e => updateDocStatus(doc.id, e.target.value)} style={{width:140,fontSize:12,padding:'4px 8px'}}>
                    {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <button className="btn btn-ghost btn-sm" style={{padding:'4px 8px'}} onClick={() => deleteDoc(doc.id)}><X size={12}/></button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
