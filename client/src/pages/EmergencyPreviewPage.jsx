import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Phone, ArrowLeft, HeartPulse, AlertCircle, Shield } from 'lucide-react';
import Button from '../components/Button';

const priorityOrder = { primary: 1, secondary: 2, other: 3 };

export default function EmergencyPreviewPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Emergency Card Preview - EmergencyInfo Vault';
    const loadPreviewData = async () => {
      try {
        const [contactsRes, instructionsRes] = await Promise.all([
          api.contacts.getAll(),
          api.instructions.getAll()
        ]);

        const visibleContacts = (contactsRes.contacts || [])
          .filter(c => c.showInEmergency)
          .sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4));

        const visibleInstructions = (instructionsRes.instructions || [])
          .filter(i => i.showInEmergency);

        setContacts(visibleContacts);
        setInstructions(visibleInstructions);
      } catch (err) {
        // Handled silently
      } finally {
        setLoading(false);
      }
    };

    loadPreviewData();
  }, []);

  return (
    <div className="emergency-page theme-light">
      {/* Owner Preview Mode Notice Bar (Deep Teal, solid light theme compliant) */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-text)', padding: '12px 16px', textAlign: 'center', fontWeight: '700', fontSize: '0.9375rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
        <span>RESPONDER PREVIEW MODE: This is exactly what a responder will see when opening an active share link.</span>
        <Button to="/dashboard" variant="secondary" size="sm">
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      <div className="container" style={{ maxWidth: '640px', marginTop: '24px' }}>
        <div className="emergency-card-container">
          {/* Header Bar in Dark Red */}
          <header className="emergency-header-bar" role="banner">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <HeartPulse size={28} aria-hidden="true" />
              <h1 style={{ fontSize: '1.875rem', fontWeight: '700', letterSpacing: '0.5px' }}>
                EMERGENCY INFORMATION
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '1.25rem', opacity: 0.95, color: '#FFFFFF' }}>
              Subject: <strong>{user?.name || 'Cardholder'}</strong>
            </p>
          </header>

          <main className="emergency-content" id="main-content">
            {loading ? (
              <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '1.25rem' }}>
                Loading preview card...
              </p>
            ) : (
              <>
                {/* Emergency Contacts Section */}
                <section aria-labelledby="contacts-heading" style={{ marginBottom: '32px' }}>
                  <h2 id="contacts-heading" style={{ fontSize: '1.375rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Emergency Contacts</span>
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>({contacts.length})</span>
                  </h2>

                  {contacts.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FAF8F4', border: '1px solid var(--border-color)', borderRadius: 'var(--btn-radius)' }}>
                      <AlertCircle size={24} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.125rem' }}>
                        No emergency contacts are currently marked as visible for emergency view.
                      </p>
                    </div>
                  ) : (
                    contacts.map((contact) => (
                      <article key={contact._id} className="emergency-contact-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span className="contact-name">{contact.name}</span>
                          <span className={`badge badge-${contact.priority}`}>
                            {contact.priority} contact
                          </span>
                        </div>
                        <div className="contact-rel">{contact.relationship}</div>

                        <div style={{ marginTop: '8px' }}>
                          <Button
                            href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                            variant="primary"
                            size="lg"
                            block
                            aria-label={`Call ${contact.name} at ${contact.phone}`}
                          >
                            <Phone size={22} aria-hidden="true" />
                            <span>Tap to Call {contact.phone}</span>
                          </Button>
                        </div>
                      </article>
                    ))
                  )}
                </section>

                {/* Emergency Instructions Section */}
                <section aria-labelledby="instructions-heading">
                  <h2 id="instructions-heading" style={{ fontSize: '1.375rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
                    Vital Instructions &amp; Directives ({instructions.length})
                  </h2>

                  {instructions.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FAF8F4', border: '1px solid var(--border-color)', borderRadius: 'var(--btn-radius)' }}>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.125rem' }}>
                        No instructions are marked as visible for emergency view.
                      </p>
                    </div>
                  ) : (
                    instructions.map((inst) => (
                      <article key={inst._id} className="emergency-instruction-card">
                        <h3 className="emergency-instruction-title">{inst.title}</h3>
                        <p className="emergency-instruction-text" style={{ margin: 0 }}>
                          {inst.text}
                        </p>
                      </article>
                    ))
                  )}
                </section>
              </>
            )}
          </main>

          <footer style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid var(--border-color)', backgroundColor: '#FAF8F4', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <Shield size={16} color="var(--primary)" aria-hidden="true" />
              <strong>EmergencyInfo Vault</strong>
            </div>
            <span>Minimal Read-Only Emergency View &bull; No sensitive ID or financial data stored</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
