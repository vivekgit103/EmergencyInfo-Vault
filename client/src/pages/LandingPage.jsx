import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PhoneCall, Lock, Clock, EyeOff } from 'lucide-react';
import SensitiveDataNotice from '../components/SensitiveDataNotice';
import Button from '../components/Button';
import AnimatedBackground from '../components/AnimatedBackground';

export default function LandingPage() {
  useEffect(() => {
    document.title = 'EmergencyInfo Vault - Private Emergency Contact Storage';
  }, []);

  return (
    <div className="page-animated-wrap">
      <AnimatedBackground />

      <main id="main-content" className="content-layer" style={{ padding: '48px 0 64px' }}>
        <div className="container">
          {/* Hero Section */}
          <div style={{ maxWidth: '800px', marginBottom: '56px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', backgroundColor: 'var(--primary-light)', borderRadius: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: '0.875rem', marginBottom: '16px', border: '1px solid #C4DFD7' }}>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>Academic Demonstration Project (CIA2 Backend)</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.125rem)', lineHeight: 1.2, marginBottom: '20px' }}>
              Store emergency contacts and vital notes. Share a minimal read-only card with first responders.
            </h1>

            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '32px' }}>
              In an emergency, bystanders and medics need immediate contact numbers and critical instructions like where an inhaler is kept or known drug allergies. EmergencyInfo Vault keeps your private records organized and lets you generate temporary, stripped-down emergency cards that reveal only what a responder needs to know.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <Button to="/register" variant="primary" size="lg">
                Create an account
              </Button>
              <Button to="/how-it-works" variant="secondary" size="lg">
                How it works
              </Button>
            </div>
          </div>

          {/* Sensitive Data Notice */}
          <SensitiveDataNotice />

          {/* Core Principles Grid with Subtle 3D Tilt */}
          <div style={{ marginTop: '56px' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '24px' }}>How this product protects your privacy</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div className="card card-tilt">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'var(--primary)' }}>
                  <EyeOff size={24} aria-hidden="true" />
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>No Unnecessary Sensitive Data</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: 0 }}>
                  We deliberately do not store government ID numbers, financial information, home addresses, or full medical charts. The backend automatically blocks entries that resemble card numbers or national IDs.
                </p>
              </div>

              <div className="card card-tilt">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'var(--primary)' }}>
                  <Clock size={24} aria-hidden="true" />
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Time-Limited Share Links</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: 0 }}>
                  Public emergency links are temporary. You select whether a link remains active for 1 hour, 24 hours, or 7 days. You can revoke any active link with one click.
                </p>
              </div>

              <div className="card card-tilt">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'var(--primary)' }}>
                  <Lock size={24} aria-hidden="true" />
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Optional PIN Protection</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: 0 }}>
                  You can attach a 4 to 8 digit PIN to any emergency link. The PIN is stored hashed using bcrypt. Five incorrect attempts temporarily lock the link to prevent brute force discovery.
                </p>
              </div>

              <div className="card card-tilt">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'var(--primary)' }}>
                  <PhoneCall size={24} aria-hidden="true" />
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Tap-to-Call Emergency Card</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: 0 }}>
                  First responders view a high-contrast page without navigation clutter. Contacts are ordered by priority (Primary first) with large tap-to-call buttons for rapid phone dialing.
                </p>
              </div>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="card" style={{ marginTop: '48px', backgroundColor: 'var(--bg-subtle)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Demonstration Credentials</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '12px' }}>
              The local development environment includes a sample account populated with fictional data for testing:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '0.9375rem' }}>
              <div><strong>Email:</strong> demo@example.com</div>
              <div><strong>Password:</strong> Password123!</div>
              <div><strong>Sample public link:</strong> <Link to="/e/demo-emergency-token-1234567890">/e/demo-emergency-token-1234567890</Link></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
