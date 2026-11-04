import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

export default function ContactFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [name, setName] = useState(initialData ? initialData.name : '');
  const [relationship, setRelationship] = useState(initialData ? initialData.relationship : '');
  const [phone, setPhone] = useState(initialData ? initialData.phone : '');
  const [priority, setPriority] = useState(initialData ? initialData.priority : 'primary');
  const [showInEmergency, setShowInEmergency] = useState(initialData ? initialData.showInEmergency : true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Contact name is required';
    if (!relationship.trim()) errs.relationship = 'Relationship is required';
    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{5,20}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number format';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        relationship: relationship.trim(),
        phone: phone.trim(),
        priority,
        showInEmergency
      });
      onClose();
    } catch (err) {
      if (err.errors) {
        const fieldErrors = {};
        err.errors.forEach(e => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: err.message || 'Failed to save contact' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
      <div className="modal-dialog">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 id="contact-modal-title">{initialData ? 'Edit Contact' : 'Add Emergency Contact'}</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            aria-label="Close dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {errors.general && (
          <div className="alert alert-danger" role="alert" aria-live="polite">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="contact-name">
              Full Name *
            </label>
            <input
              id="contact-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="For example: Sarah Jenkins"
              maxLength={100}
              required
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contact-rel">
              Relationship *
            </label>
            <input
              id="contact-rel"
              type="text"
              className="form-input"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="For example: Spouse, Mother, Primary Doctor"
              maxLength={50}
              required
            />
            {errors.relationship && <span className="form-error">{errors.relationship}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contact-phone">
              Phone Number *
            </label>
            <input
              id="contact-phone"
              type="tel"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="For example: +1-555-0145"
              maxLength={30}
              required
            />
            <span className="form-help">Responders will tap to call this number directly from the emergency card.</span>
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contact-priority">
              Priority Ranking
            </label>
            <select
              id="contact-priority"
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="primary">Primary (displayed first on emergency card)</option>
              <option value="secondary">Secondary (displayed after primary)</option>
              <option value="other">Other (displayed at bottom of contact list)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label" htmlFor="contact-visible">
              <input
                id="contact-visible"
                type="checkbox"
                checked={showInEmergency}
                onChange={(e) => setShowInEmergency(e.target.checked)}
              />
              <span>Include this contact on the public emergency card</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" loading={submitting} variant="primary">
              {initialData ? 'Update Contact' : 'Save Contact'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
