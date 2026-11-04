import React, { useState } from 'react';
import { X } from 'lucide-react';
import SensitiveDataNotice from './SensitiveDataNotice';
import Button from './Button';

// Client-side regex matching the backend sensitive data patterns
const TWELVE_DIGIT_ID_REGEX = /(?:^|\D)(\d{4}[ -]?\d{4}[ -]?\d{4}|\d{12})(?!\d)/;
const CARD_NUMBER_REGEX = /(?:^|\D)(?:\d[ -]?){13,19}(?!\d)/;

export default function InstructionFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [title, setTitle] = useState(initialData ? initialData.title : '');
  const [text, setText] = useState(initialData ? initialData.text : '');
  const [showInEmergency, setShowInEmergency] = useState(initialData ? initialData.showInEmergency : true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const checkSensitiveData = (value) => {
    if (!value) return null;
    const idMatch = value.match(TWELVE_DIGIT_ID_REGEX);
    if (idMatch && idMatch[1].replace(/[\s-]/g, '').length === 12) {
      return 'Text appears to contain a 12-digit identification number. For privacy, do not enter ID numbers.';
    }
    const cardMatch = value.match(CARD_NUMBER_REGEX);
    if (cardMatch) {
      const rawDigits = cardMatch[0].replace(/\D/g, '');
      if (rawDigits.length >= 13 && rawDigits.length <= 19) {
        return 'Text appears to contain a payment card number. For security, do not enter financial details.';
      }
    }
    return null;
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Title is required';
    } else if (title.trim().length > 60) {
      errs.title = 'Title cannot exceed 60 characters';
    }

    if (!text.trim()) {
      errs.text = 'Instruction text is required';
    } else if (text.trim().length > 300) {
      errs.text = 'Text cannot exceed 300 characters';
    }

    const sensitiveTitleError = checkSensitiveData(title);
    if (sensitiveTitleError) errs.title = sensitiveTitleError;

    const sensitiveTextError = checkSensitiveData(text);
    if (sensitiveTextError) errs.text = sensitiveTextError;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        text: text.trim(),
        showInEmergency
      });
      onClose();
    } catch (err) {
      if (err.errors) {
        const fieldErrors = {};
        err.errors.forEach(e => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: err.message || 'Failed to save instruction' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="inst-modal-title">
      <div className="modal-dialog">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 id="inst-modal-title">{initialData ? 'Edit Instruction' : 'Add Emergency Instruction'}</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            aria-label="Close dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <SensitiveDataNotice />

        {errors.general && (
          <div className="alert alert-danger" role="alert" aria-live="polite">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <div className="form-label">
              <label htmlFor="inst-title">Instruction Title *</label>
              <span style={{ fontSize: '0.8125rem', color: title.length > 50 ? 'var(--danger)' : 'var(--text-muted)' }}>
                {title.length}/60
              </span>
            </div>
            <input
              id="inst-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="For example: Inhaler Location or Penicillin Allergy"
              maxLength={60}
              required
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <div className="form-label">
              <label htmlFor="inst-text">Instruction Details *</label>
              <span style={{ fontSize: '0.8125rem', color: text.length > 270 ? 'var(--danger)' : 'var(--text-muted)' }}>
                {text.length}/300
              </span>
            </div>
            <textarea
              id="inst-text"
              className="form-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write concise, clear instructions for a responder (for example: 'Albuterol inhaler is in the outer side pocket of my backpack')."
              maxLength={300}
              rows={4}
              required
            />
            {errors.text && <span className="form-error">{errors.text}</span>}
          </div>

          <div className="form-group">
            <label className="checkbox-label" htmlFor="inst-visible">
              <input
                id="inst-visible"
                type="checkbox"
                checked={showInEmergency}
                onChange={(e) => setShowInEmergency(e.target.checked)}
              />
              <span>Display on the public emergency card</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" loading={submitting} variant="primary">
              {initialData ? 'Update Instruction' : 'Save Instruction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
