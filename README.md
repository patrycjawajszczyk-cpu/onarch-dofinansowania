# ON-ARCH Panel Dofinansowań

Panel do zarządzania umowami dofinansowanymi (PUP, WUP/EFS+, BUR, bony szkoleniowe).

## Wdrożenie krok po kroku

### 1. Supabase – baza danych

1. Wejdź na https://supabase.com → zaloguj się
2. Otwórz swój projekt (lub utwórz nowy)
3. Kliknij **SQL Editor** → **New query**
4. Wklej całą zawartość pliku `supabase_schema.sql` → kliknij **RUN**
5. Skopiuj z **Project Settings → API**:
   - `Project URL` → to jest `VITE_SUPABASE_URL`
   - `anon public` key → to jest `VITE_SUPABASE_ANON_KEY`

### 2. GitHub – wrzuć kod

1. Utwórz nowe repozytorium na https://github.com (np. `onarch-dofinansowania`)
2. Wrzuć wszystkie pliki z tego folderu do repozytorium

### 3. Vercel – wdrożenie

1. Wejdź na https://vercel.com → **Add New Project**
2. Zaimportuj repozytorium z GitHub
3. W sekcji **Environment Variables** dodaj:
   - `VITE_SUPABASE_URL` = URL z Supabase
   - `VITE_SUPABASE_ANON_KEY` = klucz anon z Supabase
4. Kliknij **Deploy**

### 4. Make.com – powiadomienia e-mail

1. Utwórz nowy scenariusz w Make.com
2. Dodaj moduł **Webhooks → Custom Webhook** jako trigger
3. Skopiuj URL webhooka
4. Dodaj moduł **Gmail → Send an Email**
5. W treści maila użyj zmiennych:
   ```
   Dokument: {{document_name}}
   Uczestnik: {{participant}}
   Kurs: {{course}}
   Nr umowy: {{contract_number}}
   Termin: {{due_date}}
   Pozostało dni: {{days_left}}
   ```
6. W apce → **Ustawienia** → wklej URL webhooka → Zapisz

## Szablony dokumentów (auto-generowane)

Po dodaniu nowej umowy system automatycznie tworzy checklistę dokumentów:
- **WUP/EFS+** – 16 dokumentów (harmonogram, listy obecności, dzienniki, nagrania, egzamin, certyfikat, ankiety, faktura...)
- **PUP** – 6 dokumentów
- **BUR** – 6 dokumentów (+ ankieta w systemie BUR)
- **Bon szkoleniowy** – 3 dokumenty
- **Projekt UE (inny)** – 5 dokumentów
