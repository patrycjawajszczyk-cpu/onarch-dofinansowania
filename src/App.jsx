import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PasswordGate from './components/PasswordGate'
import Dashboard from './pages/Dashboard'
import Contracts from './pages/Contracts'
import ContractDetail from './pages/ContractDetail'
import Reminders from './pages/Reminders'
import Settings from './pages/Settings'

export default function App() {
  return (
    <PasswordGate>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/umowy" element={<Contracts />} />
            <Route path="/umowy/:id" element={<ContractDetail />} />
            <Route path="/przypomnienia" element={<Reminders />} />
            <Route path="/ustawienia" element={<Settings />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </PasswordGate>
  )
}
