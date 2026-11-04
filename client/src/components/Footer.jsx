import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShieldCheck color="#0F5C4D" size={24} aria-hidden="true" />
              <strong style={{ fontSize: '1.125rem' }}>EmergencyInfo Vault</strong>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: '360px' }}>
              A private web application for individuals to record emergency contacts and vital instructions, with time-limited read-only cards for first responders.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Support contact: [TODO: contact email]
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/how-it-works">How it works</Link></li>
              <li><Link to="/login">Log in</Link></li>
              <li><Link to="/register">Create an account</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>Legal &amp; Privacy</h4>
            <ul className="footer-links">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms and Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} EmergencyInfo Vault. [TODO: legal entity name]. Built for CIA2 Backend Course.</p>
          <p>This service does not provide medical treatment or guaranteed emergency response.</p>
        </div>
      </div>
    </footer>
  );
}
