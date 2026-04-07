import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { FUNDING_SOURCES, CONTRACT_STATUS } from '../lib/templates'
import { format } from 'date-fns'
import { Search, Plus } from 'lucide-react'

export default function Contracts() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterStatus, setFilterStatus] = useState('active')

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('contracts').select('*, documents(count)').order('created_at', {ascending: false})
    setContracts(data || [])
    setLoading(false)
  }

  const getSourceLabel = (val) => FUNDING_SOURCES.find(s => s.value === val)?.label || val
  const getSourceBadge = (val) => FUNDING_SOURCES.find(s => s.value === val)?.color || 'badge-gray'

  const filtered = contracts.filter(c => {
    const s = search.toLowerCase()
    const matchSearch = !s || c.participant_name?.toLowerCase().includes(s) || c.course_name?.toLowerCase().includes(s) || c.contract_number?.toLowerCase().includes(s)
    const matchSource = !filterSource || c.source === filterSource
    const matchStatus = !filterStatus || c.status === filterStatus
    return matchSearch && matchSource && matchStatus
  })

  return (
    <div>
      <div className="page-header">
        <div><h1>Umowy</h1><p>{contracts.length} umów łącznie</p></div>
        <Link to="/umowy/nowa" className="btn btn-terra"><Plus size={16}/> Nowa umowa</Link>
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{position:'relative',flex:1,minWidth:200}}>
          <Search size={15} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--gray-500)'}}/>
          <input type="text" placeholder="Szukaj uczestnika, kursu, nr umowy..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:34}}/>
        </div>
        <select value={filterSource} onChange={e=>setFilterSource(e.target.value)} style={{width:'auto',minWidth:160}}>
          <option value="">Wszystkie źródła</option>
          {FUNDING_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{width:'auto',minWidth:140}}>
          <option value="">Wszystkie statusy</option>
          <option value="active">Aktywne</option>
          <option value="completed">Zakończone</option>
          <option value="cancelled">Anulowane</option>
        </select>
      </div>

      {loading && <p style={{color:'var(--gray-500)'}}>Ładowanie...</p>}

      {!loading && filtered.length === 0 && (
        <div className="card" style={{textAlign:'center',padding:48}}>
          <p style={{color:'var(--gray-500)',marginBottom:16}}>Brak umów spełniających kryteria.</p>
          <Link to="/umowy/nowa" className="btn btn-terra"><Plus size={16}/> Dodaj pierwszą umowę</Link>
        </div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {filtered.map(c => (
          <Link to={`/umowy/${c.id}`} key={c.id} className="card card-hover" style={{textDecoration:'none',color:'inherit',display:'block'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,flexWrap:'wrap'}}>
                  <span className={`badge ${getSourceBadge(c.source)}`}>{getSourceLabel(c.source)}</span>
                  <span className={`badge ${CONTRACT_STATUS[c.status]?.badge || 'badge-gray'}`}>{CONTRACT_STATUS[c.status]?.label || c.status}</span>
                  <span style={{fontSize:12,color:'var(--gray-500)'}}>nr {c.contract_number || '—'}</span>
                </div>
                <div style={{fontWeight:700,fontSize:15,color:'var(--navy)',marginBottom:4}}>{c.participant_name}</div>
                <div style={{fontSize:13,color:'var(--gray-700)'}}>{c.course_name}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0,marginLeft:20}}>
                <div style={{fontSize:12,color:'var(--gray-500)'}}>
                  {c.start_date ? format(new Date(c.start_date),'dd.MM.yyyy') : '—'} – {c.end_date ? format(new Date(c.end_date),'dd.MM.yyyy') : '—'}
                </div>
                {c.value && <div style={{fontWeight:700,color:'var(--navy)',marginTop:4}}>{Number(c.value).toLocaleString('pl-PL')} zł</div>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
