import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Phone, HeartPulse, Lock, AlertTriangle, Clock, XCircle, Shield } from 'lucide-react';
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

  // 1. Loading State (Static, zero looping pulse animation)
  if (loading) {
    return (
      <div className="emergency-page theme-light" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <HeartPulse size={44} color="#0F5C4D" aria-hidden="true" />
          <p style={{ marginTop: '16px', fontSize: '1.25rem', color: '#1B1B1B', fontWeight: '700' }}>
            Retrieving emergency information...
          </p>
        </div>
      </div>
    );
  }

  // 2. Link Status Errors (Not Found, Expired, Revoked, Locked)
  if (errorType) {
    return (
      <div className="emergency-page theme-light" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center', padding: '40px 24px', backgroundColor: '#FFFFFF', border: '1px solid rgba(27,27,27,0.12)', borderRadius: 'var(--card-radius)', boxShadow: '0 4px 16px rgba(27,27,27,0.08)' }}>
          {errorType === 'expired' && (
            <Clock size={48} color="#D9A66F" style={{ margin: '0 auto 16px' }} aria-hidden="true" />
          )}
          {errorType === 'revoked' && (
            <XCircle size={48} color="#9B1C1C" style={{ margin: '0 auto 16px' }} aria-hidden="true" />
          )}
          {errorType === 'locked' && (
            <Lock size={48} color="#9B1C1C" style={{ margin: '0 auto 16px' }} aria-hidden="true" />
          )}
          {errorType === 'not-found' && (
            <AlertTriangle size={48} color="#4A4A45" style={{ margin: '0 auto 16px' }} aria-hidden="true" />
          )}

          <h1 style={{ fontSize: '1.75rem', marginBottom: '12px', color: '#1B1B1B' }}>
            {errorType === 'expired' && 'Emergency Link Expired'}
            {errorType === 'revoked' && 'Emergency Link Inactive'}
            {errorType === 'locked' && 'Access Temporarily Locked'}
            {errorType === 'not-found' && 'Link Not Found'}
            {errorType === 'unknown' && 'Access Unavailable'}
          </h1>

          <p style={{ color: '#4A4A45', fontSize: '1.125rem', lineHeight: 1.55, marginBottom: '24px' }}>
            {errorMessage}
          </p>

          <div style={{ borderTop: '1px solid rgba(27,27,27,0.12)', paddingTop: '20px' }}>
            <p style={{ fontSize: '0.9375rem', color: '#4A4A45', margin: 0 }}>
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
      <div className="emergency-page theme-light" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '480px', width: '100%', padding: '36px 28px', backgroundColor: '#FFFFFF', border: '1px solid rgba(27,27,27,0.12)', borderRadius: 'var(--card-radius)', boxShadow: '0 4px 16px rgba(27,27,27,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#0F5C4D' }}>
            <Lock size={28} aria-hidden="true" />
            <h1 style={{ fontSize: '1.75rem', margin: 0, color: '#1B1B1B' }}>Security PIN Required</h1>
          </div>

          <p style={{ color: '#4A4A45', fontSize: '1.0625rem', marginBottom: '24px', lineHeight: 1.55 }}>
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
                placeholder="••••"
                maxLength={8}
                autoFocus
                required
              />
              {remainingAttempts !== null && (
                <span className="form-help" style={{ color: '#9B1C1C', fontWeight: '700' }}>
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
              style={{ marginTop: '16px' }}
            >
              View Emergency Card
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // 4. Authorized Public Emergency Card (High Contrast Light, 20px+ text)
  return (
    <div className="emergency-page theme-light">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="emergency-card-container">
          {/* Header Bar in Dark Red */}
          <header className="emergency-header-bar" role="banner">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '6px' }}>
              <HeartPulse size={30} aria-hidden="true" />
              <h1 style={{ fontSize: '1.875rem', fontWeight: '700', letterSpacing: '0.5px', color: '#FFFFFF' }}>
                EMERGENCY INFORMATION
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '1.25rem', opacity: 0.95, color: '#FFFFFF' }}>
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
                  borderBottom: '2px solid rgba(27,27,27,0.12)',
                  paddingBottom: '8px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#1B1B1B'
                }}
              >
                <span>Emergency Contacts</span>
                <span style={{ fontSize: '1rem', color: '#4A4A45' }}>
                  ({cardData?.contacts?.length || 0})
                </span>
              </h2>

              {!cardData?.contacts || cardData.contacts.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FAF8F4', border: '1px solid rgba(27,27,27,0.12)', borderRadius: 'var(--btn-radius)' }}>
                  <p style={{ margin: 0, color: '#4A4A45', fontSize: '1.25rem' }}>
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

                    <div style={{ marginTop: '10px' }}>
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
                  borderBottom: '2px solid rgba(27,27,27,0.12)',
                  paddingBottom: '8px',
                  marginBottom: '16px',
                  color: '#1B1B1B'
                }}
              >
                Vital Instructions &amp; Directives ({cardData?.instructions?.length || 0})
              </h2>

              {!cardData?.instructions || cardData.instructions.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FAF8F4', border: '1px solid rgba(27,27,27,0.12)', borderRadius: 'var(--btn-radius)' }}>
                  <p style={{ margin: 0, color: '#4A4A45', fontSize: '1.25rem' }}>
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

          <footer style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid rgba(27,27,27,0.12)', backgroundColor: '#FAF8F4', color: '#4A4A45', fontSize: '0.9375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <Shield size={18} color="#0F5C4D" aria-hidden="true" />
              <strong style={{ color: '#1B1B1B' }}>EmergencyInfo Vault</strong>
            </div>
            <span>Minimal Read-Only Emergency View &bull; No sensitive ID or financial data stored</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
