'use client';

import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { DashboardPreview } from '@/components/DashboardPreview';

const navItems = ['Overview', 'Features', 'Pricing', 'Developers', 'Contact'];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToDashboard = () => {
    document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <main className="site-shell">
      <header className="top-nav">
        <a className="brand" href="#top" aria-label="Smartflow AI home">Smartflow AI</a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item, index) => (
            <a className={index === 0 ? 'active' : ''} href={`#${item.toLowerCase()}`} key={item}>{item}</a>
          ))}
        </nav>
        <div className="nav-actions">
          <button className="login-button" type="button">Login</button>
          <button className="signup-button" type="button">Sign up</button>
        </div>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <a href={`#${item.toLowerCase()}`} key={item} onClick={() => setMenuOpen(false)}>{item}</a>
            ))}
          </nav>
        )}
      </header>

      <section className="hero" id="top">
        <div className="light-beams" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">Predict. Prevent. Protect.</p>
          <h1>AI-Powered Traffic for<br />Smarter Cities</h1>
          <p className="hero-subtitle">
            Transform live road data into safer, faster decisions<br className="desktop-break" /> with real-time predictive analytics.
          </p>
          <div className="hero-actions">
            <button className="primary-cta" type="button" onClick={scrollToDashboard}>Try it Free <ArrowUpRight size={13} strokeWidth={2.2} /></button>
            <button className="secondary-cta" type="button" onClick={scrollToDashboard}>See it in Action</button>
          </div>
        </div>
        <DashboardPreview />
      </section>

      <section className="feature-strip" id="features" aria-label="Product highlights">
        <p>Built for decisions that cannot wait.</p>
        <div>
          <span>Live city telemetry</span>
          <span>AI congestion forecasts</span>
          <span>Coordinated response planning</span>
        </div>
      </section>
    </main>
  );
}
