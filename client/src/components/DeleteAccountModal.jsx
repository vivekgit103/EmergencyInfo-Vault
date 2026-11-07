import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function DeleteAccountModal({ isOpen, onClose, onConfirm }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required to confirm account deletion');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onConfirm(password);
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
      <div className="modal-dialog" style={{ borderColor: 'var(--danger)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle color="var(--danger)" size={24} aria-hidden="true" />
            <h3 id="delete-account-title" style={{ color: 'var(--danger)', margin: 0 }}>Permanently Delete Account</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            aria-label="Close dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <p style={{ color: 'var(--text-main)', fontSize: '0.9375rem', marginBottom: '16px' }}>
          This action cannot be undone. All your emergency contacts, instructions, and share links will be permanently deleted from our servers immediately.
        </p>

        {error && (
          <div className="alert alert-danger" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="delete-account-password">
              Confirm your current password
            </label>
            <input
              id="delete-account-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your account password"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" loading={submitting} variant="danger">
              Delete Everything Permanently
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
