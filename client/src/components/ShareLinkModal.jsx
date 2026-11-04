import React, { useState } from 'react';
import { X, Key, Clock, Shield } from 'lucide-react';
import Button from './Button';

export default function ShareLinkModal({ isOpen, onClose, onGenerate }) {
  const [expiry, setExpiry] = useState('24h');
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.trim() && (pin.trim().length < 4 || pin.trim().length > 8)) {
      setError('If set, PIN must be between 4 and 8 characters');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onGenerate({
        expiry,
        pin: pin.trim() || undefined
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to generate share link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <div className="modal-dialog">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 id="share-modal-title">Generate Emergency Share Link</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            aria-label="Close dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '16px' }}>
          Generates an unguessable link that responders can use to view your emergency card. You can revoke it at any time.
        </p>

        {error && (
          <div className="alert alert-danger" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
                <Key size={16} aria-hidden="true" /> Optional Security PIN (4 to 8 characters)
              </span>
            </label>
            <input
              id="link-pin"
              type="text"
              inputMode="numeric"
              className="form-input"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Leave empty for direct access, or enter e.g. 4321"
              maxLength={8}
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
      </div>
    </div>
  );
}
