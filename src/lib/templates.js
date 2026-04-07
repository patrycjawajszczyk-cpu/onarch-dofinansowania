// Szablony dokumentów dla każdego typu dofinansowania
// due_offset_days = ile dni przed końcem miesiąca / kursu generować przypomnienie
// period = 'monthly' | 'once' | 'post_course'

export const FUNDING_SOURCES = [
  { value: 'WUP_EFS', label: 'WUP / EFS+', color: 'badge-navy' },
  { value: 'PUP', label: 'PUP (Urząd Pracy)', color: 'badge-terra' },
  { value: 'BUR', label: 'BUR', color: 'badge-gold' },
  { value: 'BON', label: 'Bon szkoleniowy', color: 'badge-green' },
  { value: 'UE_INNE', label: 'Projekt UE (inny)', color: 'badge-orange' },
  { value: 'INNE', label: 'Inne', color: 'badge-gray' },
]

export const DOC_TEMPLATES = {
  WUP_EFS: [
    { name: 'Harmonogram kursu', period: 'once', offset_days: -5, note: '5 dni od podpisania umowy' },
    { name: 'Pre-test (test wstępny)', period: 'once', offset_days: 0, note: 'Na pierwszych zajęciach' },
    { name: 'Lista obecności – zajęcia grupowe', period: 'monthly', offset_days: 3, note: 'Do 3. dnia kolejnego miesiąca' },
    { name: 'Lista obecności – zajęcia indywidualne', period: 'monthly', offset_days: 3, note: 'Do 3. dnia kolejnego miesiąca' },
    { name: 'Dziennik zajęć grupowych', period: 'post_course', offset_days: 7, note: '7 dni po zakończeniu kursu' },
    { name: 'Dziennik zajęć indywidualnych', period: 'post_course', offset_days: 7, note: '7 dni po zakończeniu kursu' },
    { name: 'Nagrania zajęć online (nośnik elektroniczny)', period: 'post_course', offset_days: 7, note: '7 dni po zakończeniu kursu' },
    { name: 'Post-test / egzamin końcowy', period: 'once', offset_days: 0, note: 'Po zakończeniu zajęć' },
    { name: 'Lista potwierdzająca przystąpienie do egzaminu', period: 'once', offset_days: 0, note: 'W dniu egzaminu' },
    { name: 'Certyfikat / zaświadczenie (oryg. dla uczestnika)', period: 'once', offset_days: -7, note: 'Max 7 dni od egzaminu' },
    { name: 'Kopia certyfikatu dla Zamawiającego', period: 'once', offset_days: -7, note: 'Max 7 dni od egzaminu' },
    { name: 'Ankiety ewaluacyjne uczestników', period: 'post_course', offset_days: 7, note: '7 dni po zakończeniu kursu' },
    { name: 'Rejestr wydanych zaświadczeń', period: 'post_course', offset_days: 7, note: '7 dni po zakończeniu kursu' },
    { name: 'Lista potwierdzająca odbiór materiałów', period: 'post_course', offset_days: 7, note: '7 dni po zakończeniu kursu' },
    { name: 'Raporty oceny efektów uczenia się', period: 'post_course', offset_days: 7, note: '7 dni po zakończeniu kursu' },
    { name: 'Faktura (2 pozycje: szkolenie + egzamin/materiały)', period: 'post_course', offset_days: 7, note: 'Po zakończeniu kursu' },
  ],
  PUP: [
    { name: 'Harmonogram kursu', period: 'once', offset_days: -5, note: 'Przed rozpoczęciem' },
    { name: 'Lista obecności', period: 'monthly', offset_days: 3, note: 'Do 3. dnia kolejnego miesiąca' },
    { name: 'Dziennik zajęć', period: 'post_course', offset_days: 7, note: 'Po zakończeniu kursu' },
    { name: 'Egzamin końcowy', period: 'once', offset_days: 0, note: 'Po zakończeniu zajęć' },
    { name: 'Certyfikat / zaświadczenie', period: 'once', offset_days: -7, note: 'Max 7 dni od egzaminu' },
    { name: 'Faktura VAT', period: 'post_course', offset_days: 7, note: 'Po zakończeniu kursu' },
  ],
  BUR: [
    { name: 'Harmonogram kursu', period: 'once', offset_days: -5, note: 'Przed rozpoczęciem' },
    { name: 'Lista obecności', period: 'monthly', offset_days: 3, note: 'Do 3. dnia kolejnego miesiąca' },
    { name: 'Dziennik zajęć', period: 'post_course', offset_days: 7, note: 'Po zakończeniu kursu' },
    { name: 'Certyfikat / zaświadczenie', period: 'once', offset_days: -7, note: 'Max 7 dni od egzaminu' },
    { name: 'Ankieta oceny usługi (BUR)', period: 'post_course', offset_days: 3, note: 'W systemie BUR' },
    { name: 'Faktura VAT', period: 'post_course', offset_days: 7, note: 'Po zakończeniu kursu' },
  ],
  BON: [
    { name: 'Lista obecności', period: 'monthly', offset_days: 3, note: 'Do 3. dnia kolejnego miesiąca' },
    { name: 'Certyfikat / zaświadczenie', period: 'once', offset_days: -14, note: 'Max 14 dni od zakończenia' },
    { name: 'Faktura VAT', period: 'post_course', offset_days: 7, note: 'Po zakończeniu kursu' },
  ],
  UE_INNE: [
    { name: 'Harmonogram kursu', period: 'once', offset_days: -5, note: 'Przed rozpoczęciem' },
    { name: 'Lista obecności', period: 'monthly', offset_days: 3, note: 'Do 3. dnia kolejnego miesiąca' },
    { name: 'Dziennik zajęć', period: 'post_course', offset_days: 7, note: 'Po zakończeniu kursu' },
    { name: 'Certyfikat / zaświadczenie', period: 'once', offset_days: -7, note: 'Max 7 dni od egzaminu' },
    { name: 'Faktura VAT', period: 'post_course', offset_days: 7, note: 'Po zakończeniu kursu' },
  ],
  INNE: [
    { name: 'Lista obecności', period: 'monthly', offset_days: 3, note: 'Do 3. dnia kolejnego miesiąca' },
    { name: 'Certyfikat / zaświadczenie', period: 'once', offset_days: -7, note: '' },
    { name: 'Faktura VAT', period: 'post_course', offset_days: 7, note: '' },
  ],
}

export const STATUS_LABELS = {
  pending: { label: 'Do zrobienia', badge: 'badge-orange' },
  done: { label: 'Gotowe', badge: 'badge-green' },
  overdue: { label: 'Zaległe', badge: 'badge-red' },
  not_applicable: { label: 'N/D', badge: 'badge-gray' },
}

export const CONTRACT_STATUS = {
  active: { label: 'Aktywna', badge: 'badge-green' },
  completed: { label: 'Zakończona', badge: 'badge-gray' },
  cancelled: { label: 'Anulowana', badge: 'badge-red' },
}
