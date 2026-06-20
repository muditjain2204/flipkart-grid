'use client';

import { useState } from 'react';
import {
  Activity, AlertTriangle, BarChart3, Bell, CalendarDays, ChevronDown,
  CircleHelp, FileText, LayoutDashboard, Map, MessageSquare, Search,
  Settings, ShieldCheck, Users,
} from 'lucide-react';

const menuItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Live Map', icon: Map },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Incidents', icon: AlertTriangle },
  { label: 'Reports', icon: FileText },
];

const routes = [
  { name: 'Outer Ring Road', status: 'High', color: '#ff7a3d', value: '84%' },
  { name: 'Hosur Road', status: 'Moderate', color: '#e8b375', value: '61%' },
  { name: 'Airport Road', status: 'Clear', color: '#a6b989', value: '29%' },
];

export function DashboardPreview() {
  const [activeItem, setActiveItem] = useState('Overview');
  const [period, setPeriod] = useState<'Today' | 'Week'>('Today');

  return (
    <div className="dashboard-frame" id="dashboard">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">Smartflow AI</div>
        <p className="menu-label">Menu</p>
        <nav aria-label="Dashboard navigation">
          {menuItems.map(({ label, icon: Icon }) => (
            <button className={activeItem === label ? 'side-link selected' : 'side-link'} type="button" key={label} onClick={() => setActiveItem(label)}>
              <Icon size={13} strokeWidth={1.8} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="side-link" type="button"><CircleHelp size={13} /> <span>Help center</span></button>
          <button className="side-link" type="button"><Settings size={13} /> <span>Settings</span></button>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <button className="profile" type="button" aria-label="Open user profile">
            <span className="avatar">DF</span>
            <span className="profile-copy"><strong>David Fincher</strong><small>Traffic manager</small></span>
            <ChevronDown size={12} />
          </button>
          <label className="dashboard-search">
            <Search size={12} />
            <input aria-label="Search dashboard" placeholder="Search for any road, event or report" />
            <kbd>? K</kbd>
          </label>
          <div className="header-tools">
            <button type="button" aria-label="Notifications"><Bell size={14} /></button>
            <button type="button" aria-label="Messages"><MessageSquare size={14} /></button>
          </div>
        </header>

        <div className="dashboard-body">
          <div className="dashboard-title-row">
            <div><p className="dashboard-kicker">CITY CONTROL CENTER</p><h2>{activeItem}</h2></div>
            <div className="period-switcher" aria-label="Chart period">
              {(['Today', 'Week'] as const).map((item) => (
                <button className={period === item ? 'active' : ''} type="button" key={item} onClick={() => setPeriod(item)}>{item}</button>
              ))}
            </div>
          </div>

          <div className="dashboard-grid">
            <article className="panel progress-panel">
              <div className="panel-heading"><span>Network efficiency</span><span className="status-chip">Live</span></div>
              <div className="efficiency-row"><strong>{period === 'Today' ? '78' : '73'}%</strong><span>+8.4% <small>vs last period</small></span></div>
              <div className="bar-chart" aria-label="Hourly network efficiency chart">
                {[37, 58, 44, 78, 64, 51, 70, 83, 60, 74, 49, 67].map((height, index) => (
                  <i key={index} style={{ height: `${height}%` }} className={index === 7 ? 'highlight' : ''} />
                ))}
              </div>
              <div className="chart-labels"><span>6am</span><span>12pm</span><span>6pm</span><span>Now</span></div>
            </article>

            <article className="panel events-panel">
              <div className="panel-heading"><span>Upcoming events</span><CalendarDays size={13} /></div>
              <div className="event-cards">
                <div className="event-card orange"><span className="event-icon"><Activity size={13} /></span><strong>Stadium exit</strong><small>Today ? 6:30 PM</small></div>
                <div className="event-card"><span className="event-icon"><Users size={13} /></span><strong>Tech Park rush</strong><small>Today ? 7:15 PM</small></div>
              </div>
            </article>

            <article className="panel team-panel">
              <div className="panel-heading"><span>Team control</span><span className="online-dot">4 online</span></div>
              <label className="mini-search"><Search size={11} /><input aria-label="Search team" placeholder="Search team member" /></label>
              <div className="team-list">
                <div><span className="mini-avatar coral">AK</span><p><strong>Arjun Kumar</strong><small>Signal operations</small></p><i /></div>
                <div><span className="mini-avatar gold">MS</span><p><strong>Maya Singh</strong><small>Field response</small></p><i /></div>
                <div><span className="mini-avatar green">RN</span><p><strong>Ravi Nair</strong><small>Data systems</small></p><i /></div>
              </div>
            </article>

            <article className="panel routes-panel">
              <div className="panel-heading"><span>Priority corridors</span><ShieldCheck size={13} /></div>
              <div className="route-list">
                {routes.map((route) => (
                  <div key={route.name}>
                    <span className="route-color" style={{ background: route.color }} />
                    <p><strong>{route.name}</strong><small>{route.status} congestion</small></p>
                    <b>{route.value}</b>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
