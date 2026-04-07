import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Settings, Bell } from 'lucide-react'
import './Layout.css'

export default function Layout({ children }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo.png" alt="ON-ARCH" style={{width:'130px',filter:'brightness(0) invert(1)',marginBottom:4}}/>
          <span className="logo-sub">Panel Dofinansowań</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <LayoutDashboard size={18}/> Dashboard
          </NavLink>
          <NavLink to="/umowy" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <FileText size={18}/> Umowy
          </NavLink>
          <NavLink to="/przypomnienia" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <Bell size={18}/> Przypomnienia
          </NavLink>
          <NavLink to="/ustawienia" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <Settings size={18}/> Ustawienia
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <span>ON-ARCH © 2026</span>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
