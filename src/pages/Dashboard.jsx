import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { FUNDING_SOURCES, STATUS_LABELS } from '../lib/templates'
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns'
import { pl } from 'date-fns/locale'
import { AlertTriangle, CheckCircle2, Clock, FileText, TrendingUp } from 'lucide-react'
import './Dashboard.css'

export default function Dashboard() {
  const [contracts, setContracts] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('contracts').select('*').eq('status','active').order('end_date'),
      supabase.from('documents').select('*, contracts(contract_number, participant_name, course_name, source)').neq('status','done').neq('status','not_applicable').order('due_date')
    ]).then(([c, d]) => {
      setContracts(c.data || [])
      setDocuments(d.data || [])
      setLoading(false)
    })
  }, [])

  const today = new Date()
  const overdue = documents.filter(d => d.due_date && isBefore(new Date(d.due_date), today))
  const urgent = documents.filter(d => d.due_date && !isBefore(new Date(d.due_date), today) && differenceInDays(new Date(d.due_date), today) <= 7)
  const upcoming = documents.filter(d => d.due_date && differenceInDays(new Date(d.due_date), today) > 7 && differenceInDays(new Date(d.due_date), today) <= 30)

  const getSourceLabel = (val) => FUNDING_SOURCES.find(s => s.value === val)?.label || val
  const getSourceBadge = (val) => FUNDING_SOURCES.find(s => s.value === val)?.color || 'badge-gray'

  const daysLabel = (date) => {
    const d = differenceInDays(new Date(date), today)
    if (d < 0) return `${Math.abs(d)} dni temu`
    if (d === 0) return 'dziś'
    if (d === 1) return 'jutro'
    return `za ${d} dni`
  }

  if (loading) return <div style={{padding:40,color:'var(--gray-500)'}}>Ładowanie...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>{format(today, 'EEEE, d MMMM yyyy', {locale: pl})}</p>
        </div>
        <Link to="/umowy/nowa" className="btn btn-terra">+ Nowa umowa</Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{background:'#e8f0fe'}}><FileText size={20} color="#1C2B3A"/></div>
          <div>
            <div className="stat-value">{contracts.length}</div>
            <div className="stat-label">Aktywne umowy</div>
          </div>
        </div>
        <div className="stat-card" style={{borderColor: overdue.length ? 'var(--red)' : 'var(--gray-200)'}}>
          <div className="stat-icon" style={{background:'var(--red-bg)'}}><AlertTriangle size={20} color="var(--red)"/></div>
          <div>
            <div className="stat-value" style={{color: overdue.length ? 'var(--red)' : 'inherit'}}>{overdue.length}</div>
            <div className="stat-label">Zaległe dokumenty</div>
          </div>
        </div>
        <div className="stat-card" style={{borderColor: urgent.length ? 'var(--orange)' : 'var(--gray-200)'}}>
          <div className="stat-icon" style={{background:'var(--orange-bg)'}}><Clock size={20} color="var(--orange)"/></div>
          <div>
            <div className="stat-value" style={{color: urgent.length ? 'var(--orange)' : 'inherit'}}>{urgent.length}</div>
            <div className="stat-label">Pilne (7 dni)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'var(--green-bg)'}}><TrendingUp size={20} color="var(--green)"/></div>
          <div>
            <div className="stat-value">{upcoming.length}</div>
            <div className="stat-label">Nadchodzące (30 dni)</div>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Zaległe */}
        {overdue.length > 0 && (
          <div className="card" style={{borderLeft:'4px solid var(--red)'}}>
            <div className="section-title"><AlertTriangle size={16} color="var(--red)"/> Zaległe dokumenty</div>
            {overdue.map(d => <DocRow key={d.id} doc={d} daysLabel={daysLabel} getSourceLabel={getSourceLabel} getSourceBadge={getSourceBadge} color="var(--red)"/>)}
          </div>
        )}

        {/* Pilne */}
        {urgent.length > 0 && (
          <div className="card" style={{borderLeft:'4px solid var(--orange)'}}>
            <div className="section-title"><Clock size={16} color="var(--orange)"/> Pilne – następne 7 dni</div>
            {urgent.map(d => <DocRow key={d.id} doc={d} daysLabel={daysLabel} getSourceLabel={getSourceLabel} getSourceBadge={getSourceBadge} color="var(--orange)"/>)}
          </div>
        )}

        {/* Nadchodzące */}
        {upcoming.length > 0 && (
          <div className="card">
            <div className="section-title"><CheckCircle2 size={16} color="var(--navy)"/> Nadchodzące – następne 30 dni</div>
            {upcoming.map(d => <DocRow key={d.id} doc={d} daysLabel={daysLabel} getSourceLabel={getSourceLabel} getSourceBadge={getSourceBadge} color="var(--navy)"/>)}
          </div>
        )}

        {/* Aktywne umowy */}
        <div className="card">
          <div className="section-title"><FileText size={16} color="var(--navy)"/> Aktywne umowy</div>
          {contracts.length === 0 && <p style={{color:'var(--gray-500)',fontSize:13}}>Brak aktywnych umów. <Link to="/umowy/nowa">Dodaj pierwszą →</Link></p>}
          {contracts.map(c => (
            <Link to={`/umowy/${c.id}`} key={c.id} className="contract-row">
              <div>
                <span className={`badge ${getSourceBadge(c.source)}`}>{getSourceLabel(c.source)}</span>
                <strong style={{marginLeft:8}}>{c.participant_name}</strong>
                <span style={{color:'var(--gray-500)',marginLeft:6,fontSize:12}}>{c.course_name}</span>
              </div>
              <div style={{fontSize:12,color:'var(--gray-500)'}}>
                do {c.end_date ? format(new Date(c.end_date),'dd.MM.yyyy') : '—'}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function DocRow({ doc, daysLabel, getSourceLabel, getSourceBadge, color }) {
  const c = doc.contracts
  return (
    <Link to={`/umowy/${doc.contract_id}`} className="doc-row">
      <div>
        <div style={{fontWeight:700,fontSize:13}}>{doc.name}</div>
        <div style={{fontSize:12,color:'var(--gray-500)',marginTop:2}}>
          {c && <><span className={`badge ${getSourceBadge(c.source)}`}>{getSourceLabel(c.source)}</span> {c.participant_name} · {c.course_name}</>}
        </div>
      </div>
      <div style={{color, fontWeight:700, fontSize:12, whiteSpace:'nowrap'}}>
        {doc.due_date ? daysLabel(doc.due_date) : '—'}
      </div>
    </Link>
  )
}
