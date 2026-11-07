import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Wordmark & Academic Notice */}
          <div>
            <div className="footer-wordmark">EmergencyInfo Vault</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, maxWidth: '340px' }}>
              An academic demonstration project (CIA2 Backend) for private emergency contact storage. This service is not a medical device, hospital service, or guaranteed emergency dispatch provider.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Support contact: [TODO: contact email]
            </p>
          </div>

          {/* Col 2: Product */}
          <div>
            <div className="footer-heading">Product</div>
            <ul className="footer-links">
              <li><Link to="/how-it-works">How it works</Link></li>
              <li><Link to="/">Overview</Link></li>
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div>
            <div className="footer-heading">Legal</div>
            <ul className="footer-links">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms and Conditions</Link></li>
            </ul>
          </div>

          {/* Col 4: Account */}
          <div>
            <div className="footer-heading">Account</div>
            <ul className="footer-links">
              <li><Link to="/login">Log in</Link></li>
              <li><Link to="/register">Create account</Link></li>
              <li><Link to="/dashboard">Owner dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} EmergencyInfo Vault. [TODO: legal entity name]. All rights reserved.
          </div>
          <div>
            Academic Project: Not an emergency dispatch service.
          </div>
        </div>
      </div>
    </footer>
  );
}
