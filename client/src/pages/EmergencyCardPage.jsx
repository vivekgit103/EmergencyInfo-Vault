import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Phone, HeartPulse, Lock, AlertTriangle, Clock, XCircle, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';

export default function EmergencyCardPage() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [needsPin, setNeedsPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinSubmitting, setPinSubmitting] = useState(false);
  const [pinError, setPinError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(null);

  // Link status error states
  const [errorType, setErrorType] = useState(null); // 'not-found' | 'expired' | 'revoked' | 'locked' | 'unknown'
  const [errorMessage, setErrorMessage] = useState('');
  const [lockedUntil, setLockedUntil] = useState(null);

  // Authorized Emergency Card Data
  const [cardData, setCardData] = useState(null);

  useEffect(() => {
    document.title = 'Emergency Card - EmergencyInfo Vault';
    checkStatus();
  }, [token]);

  const checkStatus = async () => {
    setLoading(true);
    setErrorType(null);
    try {
      const res = await api.emergency.getStatus(token);
      if (res.requiresPin) {
        setNeedsPin(true);
      } else {
        // Direct card payload returned (no PIN needed)
        setCardData(res);
        setNeedsPin(false);
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (err) => {
    const status = err.status;
    if (status === 404) {
      setErrorType('not-found');
      setErrorMessage(err.message || 'This emergency card link does not exist or has been removed.');
    } else if (status === 410) {
      setErrorType('expired');
      setErrorMessage(err.message || 'This emergency card link has expired.');
    } else if (status === 403) {
      setErrorType('revoked');
      setErrorMessage(err.message || 'This emergency card link has been revoked by the owner.');
    } else if (status === 429) {
      setErrorType('locked');
      setErrorMessage(err.message || 'This emergency card is temporarily locked due to repeated incorrect PIN attempts.');
      setLockedUntil(err.lockedUntil);
    } else {
      setErrorType('unknown');
      setErrorMessage(err.message || 'Unable to access emergency card at this time.');
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (!pin.trim()) {
      setPinError('Please enter the 4 to 8 digit PIN');
      return;
    }

    setPinSubmitting(true);
    setPinError('');
    try {
      const payload = await api.emergency.getPayload(token, pin.trim());
      setCardData(payload);
      setNeedsPin(false);
    } catch (err) {
      if (err.status === 429) {
        setErrorType('locked');
        setErrorMessage(err.message);
        setLockedUntil(err.lockedUntil);
      } else {
        setPinError(err.message || 'Incorrect PIN. Please try again.');
        if (err.remainingAttempts !== undefined) {
          setRemainingAttempts(err.remainingAttempts);
        }
      }
    } finally {
      setPinSubmitting(false);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="emergency-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <HeartPulse size={40} color="var(--primary)" style={{ animation: 'pulse 1.5s infinite' }} />
          <p style={{ marginTop: '16px', fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: '700' }}>
            Retrieving emergency information...
          </p>
        </div>
      </div>
    );
  }

  // 2. Link Status Errors (Not Found, Expired, Revoked, Locked)
  if (errorType) {
    return (
      <div className="emergency-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="card" style={{ maxWidth: '520px', width: '100%', textAlign: 'center', padding: '40px 24px' }}>
          {errorType === 'expired' && (
            <Clock size={48} color="#D97706" style={{ margin: '0 auto 16px' }} aria-hidden="true" />
          )}
          {errorType === 'revoked' && (
            <XCircle size={48} color="#9B1C1C" style={{ margin: '0 auto 16px' }} aria-hidden="true" />
          )}
          {errorType === 'locked' && (
            <Lock size={48} color="#9B1C1C" style={{ margin: '0 auto 16px' }} aria-hidden="true" />
          )}
          {errorType === 'not-found' && (
            <AlertTriangle size={48} color="#4B5563" style={{ margin: '0 auto 16px' }} aria-hidden="true" />
          )}

          <h1 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>
            {errorType === 'expired' && 'Emergency Link Expired'}
            {errorType === 'revoked' && 'Emergency Link Inactive'}
            {errorType === 'locked' && 'Access Temporarily Locked'}
            {errorType === 'not-found' && 'Link Not Found'}
            {errorType === 'unknown' && 'Access Unavailable'}
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', lineHeight: 1.5, marginBottom: '24px' }}>
            {errorMessage}
          </p>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
              If you are a first responder in need of urgent assistance, please contact local emergency authorities (such as 112 or local dispatch).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. PIN Challenge Screen
  if (needsPin) {
    return (
      <div className="emergency-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '36px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'var(--primary)' }}>
            <Lock size={28} aria-hidden="true" />
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Security PIN Required</h1>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '24px' }}>
            The cardholder has protected this emergency card with a security PIN. Enter the PIN to view their contacts and directives.
          </p>

          {pinError && (
            <div className="alert alert-danger" role="alert" aria-live="polite">
              {pinError}
            </div>
          )}

          <form onSubmit={handlePinSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="responder-pin" style={{ fontSize: '1.125rem' }}>
                Enter PIN
              </label>
              <input
                id="responder-pin"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="form-input"
                style={{ fontSize: '1.5rem', letterSpacing: '4px', textAlign: 'center', height: '54px' }}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;"
                maxLength={8}
                autoFocus
                required
              />
              {remainingAttempts !== null && (
                <span className="form-help" style={{ color: 'var(--danger)', fontWeight: '700' }}>
                  {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining before 15-minute lockout.
                </span>
              )}
            </div>

            <Button
              type="submit"
              loading={pinSubmitting}
              variant="primary"
              size="lg"
              block
              style={{ marginTop: '12px' }}
            >
              View Emergency Card
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // 4. Authorized Public Emergency Card
  return (
    <div className="emergency-page">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="emergency-card-container">
          {/* Header Bar in Dark Red */}
          <header className="emergency-header-bar" role="banner">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '4px' }}>
              <HeartPulse size={32} aria-hidden="true" />
              <h1 style={{ fontSize: '1.875rem', fontWeight: '700', letterSpacing: '0.5px' }}>
                EMERGENCY INFORMATION
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '1.25rem', opacity: 0.95 }}>
              Subject: <strong>{cardData?.ownerName || 'Cardholder'}</strong>
            </p>
          </header>

          <main className="emergency-content" id="main-content">
            {/* Contacts Section */}
            <section aria-labelledby="contacts-heading" style={{ marginBottom: '32px' }}>
              <h2
                id="contacts-heading"
                style={{
                  fontSize: '1.375rem',
                  borderBottom: '2px solid var(--border-color)',
                  paddingBottom: '8px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Emergency Contacts</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                  ({cardData?.contacts?.length || 0})
                </span>
              </h2>

              {!cardData?.contacts || cardData.contacts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', backgroundColor: 'var(--bg-subtle)' }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.125rem' }}>
                    No public emergency contacts listed on this card.
                  </p>
                </div>
              ) : (
                cardData.contacts.map((contact) => (
                  <article key={contact._id} className="emergency-contact-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span className="contact-name" style={{ fontSize: '1.5rem' }}>{contact.name}</span>
                      <span className={`badge badge-${contact.priority}`}>
                        {contact.priority} contact
                      </span>
                    </div>
                    <div className="contact-rel" style={{ fontSize: '1.25rem' }}>{contact.relationship}</div>

                    <div style={{ marginTop: '8px' }}>
                      <Button
                        href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                        variant="primary"
                        size="lg"
                        block
                        aria-label={`Call ${contact.name} at ${contact.phone}`}
                      >
                        <Phone size={24} aria-hidden="true" />
                        <span>Tap to Call {contact.phone}</span>
                      </Button>
                    </div>
                  </article>
                ))
              )}
            </section>

            {/* Instructions Section */}
            <section aria-labelledby="instructions-heading">
              <h2
                id="instructions-heading"
                style={{
                  fontSize: '1.375rem',
                  borderBottom: '2px solid var(--border-color)',
                  paddingBottom: '8px',
                  marginBottom: '16px'
                }}
              >
                Vital Instructions &amp; Directives ({cardData?.instructions?.length || 0})
              </h2>

              {!cardData?.instructions || cardData.instructions.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', backgroundColor: 'var(--bg-subtle)' }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.125rem' }}>
                    No instructions listed on this card.
                  </p>
                </div>
              ) : (
                cardData.instructions.map((inst) => (
                  <article key={inst._id} className="emergency-instruction-card">
                    <h3 className="emergency-instruction-title" style={{ fontSize: '1.375rem' }}>
                      {inst.title}
                    </h3>
                    <p className="emergency-instruction-text" style={{ fontSize: '1.25rem', lineHeight: 1.6 }}>
                      {inst.text}
                    </p>
                  </article>
                ))
              )}
            </section>
          </main>

          <footer style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <ShieldCheck size={18} color="var(--primary)" aria-hidden="true" />
              <strong>EmergencyInfo Vault</strong>
            </div>
            <span>Minimal Read-Only Emergency View &bull; No sensitive ID or financial data stored</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
