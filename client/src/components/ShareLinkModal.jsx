import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Key, Clock, Shield, Copy, Check, Printer, ExternalLink, QrCode } from 'lucide-react';
import Button from './Button';

export default function ShareLinkModal({ isOpen, onClose, onGenerate, initialLink = null }) {
  const [expiry, setExpiry] = useState('24h');
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeLink, setActiveLink] = useState(initialLink);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveLink(initialLink);
    setError('');
    setPin('');
    setCopied(false);
  }, [initialLink, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedPin = pin.trim();
    if (trimmedPin && !/^\d{6,}$/.test(trimmedPin)) {
      setError('If set, PIN must be at least 6 numeric digits');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const newLink = await onGenerate({
        expiry,
        pin: trimmedPin || undefined
      });
      if (newLink) {
        setActiveLink(newLink);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to generate share link');
    } finally {
      setSubmitting(false);
    }
  };

  const getFullShareUrl = (token) => {
    if (typeof window !== 'undefined' && window.location) {
      return `${window.location.origin}/e/${token}`;
    }
    return `/e/${token}`;
  };

  const handleCopy = (token) => {
    const url = getFullShareUrl(token);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-emergency-card, #printable-emergency-card * {
            visibility: visible !important;
          }
          #printable-emergency-card {
            position: fixed !important;
            left: 50% !important;
            top: 40px !important;
            transform: translateX(-50%) !important;
            width: 380px !important;
            max-width: 90vw !important;
            border: 2px solid #0F5C4D !important;
            border-radius: 12px !important;
            padding: 24px !important;
            background: #FAF8F4 !important;
            color: #1B1B1B !important;
            box-shadow: none !important;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="modal-dialog" style={{ maxWidth: activeLink ? '540px' : '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 id="share-modal-title" style={{ margin: 0 }}>
            {activeLink ? 'Emergency Card & QR Code' : 'Generate Emergency Share Link'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            aria-label="Close dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        {/* View Mode: Active / Created Link with QR Code and Printable Card */}
        {activeLink ? (
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '16px' }}>
              First responders can scan this QR code or visit the link to view your emergency card.
            </p>

            {/* Printable Emergency Card container */}
            <div
              id="printable-emergency-card"
              style={{
                border: '2px solid var(--primary)',
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: 'var(--bg-subtle)',
                marginBottom: '20px',
                textAlign: 'center'
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--primary)',
                    textTransform: 'uppercase'
                  }}
                >
                  Emergency Info Vault Card
                </span>
                <h4 style={{ margin: '4px 0 0', fontSize: '1.125rem' }}>
                  Medical & Emergency Contact Notice
                </h4>
              </div>

              {/* QR Code */}
              <div
                style={{
                  display: 'inline-block',
                  padding: '12px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  margin: '8px auto'
                }}
              >
                <QRCodeSVG
                  value={getFullShareUrl(activeLink.token)}
                  size={160}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div style={{ marginTop: '12px' }}>
                <code
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    wordBreak: 'break-all',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    marginBottom: '8px'
                  }}
                >
                  {getFullShareUrl(activeLink.token)}
                </code>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {activeLink.hasPin ? (
                    <p style={{ margin: '4px 0', fontWeight: 600 }}>
                      PIN Protected: Responder must enter security PIN to view.
                    </p>
                  ) : (
                    <p style={{ margin: '4px 0' }}>
                      Scan with any smartphone camera for immediate medical info.
                    </p>
                  )}
                  <p style={{ margin: '4px 0' }}>
                    Expires: {new Date(activeLink.expiresAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px', marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(activeLink.token)}
                  aria-label="Copy public link to clipboard"
                >
                  {copied ? <Check size={16} color="var(--primary)" /> : <Copy size={16} />}
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </Button>

                <Button
                  to={`/e/${activeLink.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  size="sm"
                  aria-label="Open emergency card in new tab"
                >
                  <ExternalLink size={16} />
                  <span>Open</span>
                </Button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePrint}
                  aria-label="Print emergency card"
                >
                  <Printer size={16} />
                  <span>Print Card</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setActiveLink(null);
                    setPin('');
                  }}
                >
                  <span>New Link</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Create Form Mode */
          <form onSubmit={handleSubmit}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '16px' }}>
              Generates an unguessable link with a QR code that responders can use to view your emergency card. You can revoke it at any time.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="link-expiry">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} aria-hidden="true" /> Link Duration / Expiry
                </span>
              </label>
              <select
                id="link-expiry"
                className="form-select"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              >
                <option value="1h">1 Hour (single outing or temporary travel)</option>
                <option value="24h">24 Hours (recommended default)</option>
                <option value="7d">7 Days (extended travel or trip)</option>
              </select>
              <span className="form-help">After this time, the link will permanently expire.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="link-pin">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={16} aria-hidden="true" /> Optional Security PIN (minimum 6 digits)
                </span>
              </label>
              <input
                id="link-pin"
                type="text"
                inputMode="numeric"
                className="form-input"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Leave empty for direct access, or enter e.g. 123456"
                maxLength={12}
              />
              <span className="form-help">
                If provided, any responder opening the link must enter this PIN. The PIN is stored hashed and cannot be viewed by our system.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <Button type="button" onClick={onClose} variant="secondary">
                Cancel
              </Button>
              <Button type="submit" loading={submitting} variant="primary">
                Create Share Link
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
