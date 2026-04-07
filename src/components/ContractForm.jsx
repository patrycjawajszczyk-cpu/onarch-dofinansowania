import { useState } from 'react'
import { FUNDING_SOURCES } from '../lib/templates'

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

  const set = (k, v) => setForm(p => ({...p, [k]: v}))

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div className="form-row form-row-2">
        <div className="form-group">
          <label>Źródło dofinansowania *</label>
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
          <label>Imię i nazwisko uczestnika *</label>
          <input type="text" value={form.participant_name} onChange={e => set('participant_name', e.target.value)} placeholder="np. Anna Kowalska"/>
        </div>
        <div className="form-group">
          <label>Nazwa kursu *</label>
          <input type="text" value={form.course_name} onChange={e => set('course_name', e.target.value)} placeholder="np. Projektowanie Ogrodów"/>
        </div>
      </div>

      <div className="form-row form-row-3">
        <div className="form-group">
          <label>Data rozpoczęcia</label>
          <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)}/>
        </div>
        <div className="form-group">
          <label>Data zakończenia</label>
          <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)}/>
        </div>
        <div className="form-group">
          <label>Wartość (zł brutto)</label>
          <input type="number" value={form.value} onChange={e => set('value', e.target.value)} placeholder="10000"/>
        </div>
      </div>

      <div className="form-row form-row-2">
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Aktywna</option>
            <option value="completed">Zakończona</option>
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
        <button className="btn btn-terra" onClick={() => onSave(form)}>Zapisz umowę</button>
      </div>
    </div>
  )
}
