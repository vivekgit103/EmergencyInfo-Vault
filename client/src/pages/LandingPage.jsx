import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, EyeOff, Sliders, Clock, KeyRound, Trash2, FileText,
  Phone, HeartPulse, Check
} from 'lucide-react';
import Button from '../components/Button';
import AnimatedBackground from '../components/AnimatedBackground';
import SensitiveDataNotice from '../components/SensitiveDataNotice';

export default function LandingPage() {
  useEffect(() => {
    document.title = 'EmergencyInfo Vault - Private Emergency Contact Storage';
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <AnimatedBackground />

      <main id="main-content" className="content-layer" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <div className="container">

          {/* 1. HERO SECTION (Staggered entrance on load only, played once) */}
          <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center', padding: '24px 0 36px' }}>
            <div className="hero-animate-1" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', backgroundColor: 'var(--primary-light)', borderRadius: '9999px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <Shield size={16} color="var(--primary)" aria-hidden="true" />
              <span className="label-uppercase" style={{ color: 'var(--primary)' }}>
                Academic Project (CIA2 Backend)
              </span>
            </div>

            <h1 className="hero-animate-2" style={{ fontSize: 'clamp(2.75rem, 6vw, 4.25rem)', lineHeight: 1.08, marginBottom: '24px' }}>
              Emergency contacts and instructions, shared only when you <span className="text-clay">choose.</span>
            </h1>

            <p className="hero-animate-3" style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '720px', margin: '0 auto 36px' }}>
              Store a few contacts and short notes. Share a read-only card by link, with an optional PIN and an expiry time. Delete everything whenever you want.
            </p>

            <div className="hero-animate-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <Button to="/register" variant="primary" size="lg">
                Create account
              </Button>
              <Button to="/how-it-works" variant="secondary" size="lg">
                See how it works
              </Button>
            </div>
          </div>

          {/* 2. INFO STRIP (Replaces metrics ticker, static full-width band) */}
          <section className="info-strip" aria-label="Data Storage Boundaries">
            <div className="container" style={{ maxWidth: '960px' }}>
              <div className="info-strip-grid">
                <div className="info-strip-col">
                  <span className="info-strip-label">Stored</span>
                  <p className="info-strip-text">
                    Names, phone numbers, and short instructions you write.
                  </p>
                </div>
                <div className="info-strip-col">
                  <span className="info-strip-label danger-label">Never stored</span>
                  <p className="info-strip-text">
                    ID numbers, card or bank details, medical records, or home addresses.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sensitive Data Notice */}
          <div style={{ maxWidth: '960px', margin: '0 auto 48px' }}>
            <SensitiveDataNotice />
          </div>

          {/* 3. FEATURE CARD GRID (3 columns on desktop, 1 on mobile) */}
          <section style={{ maxWidth: '1060px', margin: '0 auto 64px' }} aria-labelledby="features-heading">
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <span className="label-uppercase" style={{ color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>
                System Capabilities
              </span>
              <h2 id="features-heading" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)' }}>
                Built strictly for privacy and control
              </h2>
            </div>

            <div className="feature-grid">
              {/* Card 1 */}
              <div className="feature-card">
                <div className="feature-icon-square">
                  <EyeOff size={24} aria-hidden="true" />
                </div>
                <h3 className="feature-card-title">Private by default</h3>
                <p className="feature-card-text">
                  Only contacts and notes explicitly flagged for emergency display are exposed on public links. All other entries stay protected in your personal vault.
                </p>
              </div>

              {/* Card 2 */}
              <div className="feature-card">
                <div className="feature-icon-square">
                  <Sliders size={24} aria-hidden="true" />
                </div>
                <h3 className="feature-card-title">You choose what shows</h3>
                <p className="feature-card-text">
                  Toggle visibility per contact or instruction at any time. Tailor exactly what first responders see without removing records from your account.
                </p>
              </div>

              {/* Card 3 */}
              <div className="feature-card">
                <div className="feature-icon-square">
                  <Clock size={24} aria-hidden="true" />
                </div>
                <h3 className="feature-card-title">Links that expire</h3>
                <p className="feature-card-text">
                  Generate temporary share links valid for 1 hour, 24 hours, or 7 days. You can instantly revoke any active link with a single click.
                </p>
              </div>

              {/* Card 4 */}
              <div className="feature-card">
                <div className="feature-icon-square">
                  <KeyRound size={24} aria-hidden="true" />
                </div>
                <h3 className="feature-card-title">PIN protected</h3>
                <p className="feature-card-text">
                  Attach an optional 4 to 8 digit PIN hashed with bcrypt. Five incorrect attempts trigger an automatic 15-minute lockout to block guessing.
                </p>
              </div>

              {/* Card 5 */}
              <div className="feature-card">
                <div className="feature-icon-square">
                  <Trash2 size={24} aria-hidden="true" />
                </div>
                <h3 className="feature-card-title">Delete anytime</h3>
                <p className="feature-card-text">
                  Erase individual items or cascade-delete your entire account, all emergency contacts, instructions, and share links permanently.
                </p>
              </div>

              {/* Card 6 */}
              <div className="feature-card">
                <div className="feature-icon-square">
                  <FileText size={24} aria-hidden="true" />
                </div>
                <h3 className="feature-card-title">Short notes only</h3>
                <p className="feature-card-text">
                  Directives are limited to short, essential notes like allergy alerts or inhaler locations. The backend automatically blocks payment cards and national IDs.
                </p>
              </div>
            </div>
          </section>

          {/* 4. SAMPLE CARD SECTION (Window-style panel with mock light card) */}
          <section className="sample-window-panel" aria-labelledby="sample-card-heading">
            <div className="sample-window-header">
              <div className="sample-window-dots">
                <span className="sample-window-dot" />
                <span className="sample-window-dot" />
                <span className="sample-window-dot" />
              </div>
              <span className="sample-window-caption" id="sample-card-heading">
                Sample data
              </span>
              <div style={{ width: '48px' }} />
            </div>

            <div className="sample-window-body">
              {/* Exactly like the real responder page in the light theme */}
              <div className="mock-responder-card">
                <header className="mock-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                    <HeartPulse size={24} aria-hidden="true" />
                    <strong style={{ fontSize: '1.25rem', letterSpacing: '0.5px' }}>EMERGENCY INFORMATION</strong>
                  </div>
                  <div style={{ fontSize: '1.0625rem', opacity: 0.95 }}>
                    Subject: <strong>Alex Mercer</strong>
                  </div>
                </header>

                <div className="mock-card-body">
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(27,27,27,0.12)', paddingBottom: '6px', marginBottom: '14px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>Emergency Contacts</span>
                      <span style={{ fontSize: '0.875rem', color: '#4A4A45' }}>2 listed</span>
                    </div>

                    {/* Contact 1 */}
                    <div className="mock-contact-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1B1B1B' }}>Jordan Mercer</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', backgroundColor: '#E4EFEA', color: '#0F5C4D', padding: '2px 8px', borderRadius: '4px' }}>
                          Primary
                        </span>
                      </div>
                      <div style={{ fontSize: '1rem', color: '#4A4A45', marginBottom: '10px' }}>Spouse</div>
                      <div style={{ background: '#0F5C4D', color: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9375rem', boxShadow: '0 3px 0 #0A3F35' }}>
                        <Phone size={16} aria-hidden="true" />
                        <span>Tap to Call +1 (555) 014-9821</span>
                      </div>
                    </div>

                    {/* Contact 2 */}
                    <div className="mock-contact-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1B1B1B' }}>Dr. Evelyn Reed</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', backgroundColor: '#F8EFE3', color: '#8C541D', padding: '2px 8px', borderRadius: '4px' }}>
                          Secondary
                        </span>
                      </div>
                      <div style={{ fontSize: '1rem', color: '#4A4A45', marginBottom: '10px' }}>Physician</div>
                      <div style={{ background: '#0F5C4D', color: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9375rem', boxShadow: '0 3px 0 #0A3F35' }}>
                        <Phone size={16} aria-hidden="true" />
                        <span>Tap to Call +1 (555) 018-4309</span>
                      </div>
                    </div>
                  </div>

                  {/* Instruction */}
                  <div>
                    <div style={{ borderBottom: '2px solid rgba(27,27,27,0.12)', paddingBottom: '6px', marginBottom: '14px', fontWeight: 700, fontSize: '1.125rem' }}>
                      Vital Directives (1)
                    </div>
                    <div className="mock-instruction-item">
                      <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#0F5C4D', marginBottom: '4px' }}>
                        Severe Penicillin Allergy
                      </div>
                      <div style={{ fontSize: '1.0625rem', color: '#1B1B1B', lineHeight: 1.5 }}>
                        Patient has an acute allergy to penicillin. Carries an inhaler in the side backpack pocket.
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '12px', textAlign: 'center', backgroundColor: '#F8F5EE', borderTop: '1px solid rgba(27,27,27,0.1)', color: '#4A4A45', fontSize: '0.8125rem' }}>
                  Minimal Read-Only Emergency View &bull; No passwords or account data exposed
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', backgroundColor: 'var(--bg-raised)', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Sample data: exactly how responders see your emergency card in high-contrast light mode.
            </div>
          </section>

          {/* 5. DEMONSTRATION NOTICE CARD */}
          <div className="form-card" style={{ maxWidth: '820px', margin: '0 auto', backgroundColor: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-main)' }}>
              Demonstration Account
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '16px' }}>
              The local development environment includes a sample account populated with fictional data for testing:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '0.9375rem' }}>
              <div><strong style={{ color: 'var(--text-main)' }}>Email:</strong> demo@example.com</div>
              <div><strong style={{ color: 'var(--text-main)' }}>Password:</strong> Password123!</div>
              <div><strong style={{ color: 'var(--text-main)' }}>Sample card:</strong> <Link to="/e/demo-emergency-token-1234567890">/e/demo-emergency-token-1234567890</Link></div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
