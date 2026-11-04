import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, ShieldAlert, KeyRound, Trash2 } from 'lucide-react';
import SensitiveDataNotice from '../components/SensitiveDataNotice';
import Button from '../components/Button';

export default function HowItWorksPage() {
  useEffect(() => {
    document.title = 'How It Works - EmergencyInfo Vault';
  }, []);

  return (
    <main id="main-content" style={{ padding: '48px 0 64px' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <h1 style={{ marginBottom: '16px' }}>How EmergencyInfo Vault Works</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
          This service provides a clear, access-controlled way to keep emergency contacts ready for responders without publishing your private life to the web.
        </p>

        <SensitiveDataNotice />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '36px' }}>
          {/* Step 1 */}
          <section className="card" aria-labelledby="step-1-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span className="badge badge-primary" style={{ fontSize: '1rem', padding: '6px 12px' }}>Step 1</span>
              <h2 id="step-1-title" style={{ fontSize: '1.375rem', margin: 0 }}>Register and Organize Your Contacts</h2>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              Create an account with your name, email, and a secure password (minimum 8 characters). Once logged in, add your emergency contacts: specify their name, relationship (for example Spouse, Parent, or Physician), phone number, and priority rank (Primary, Secondary, or Other).
            </p>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              You control whether each contact is visible on your public emergency card via a simple checkbox. Contacts marked private remain visible only to you in your dashboard.
            </p>
          </section>

          {/* Step 2 */}
          <section className="card" aria-labelledby="step-2-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span className="badge badge-primary" style={{ fontSize: '1rem', padding: '6px 12px' }}>Step 2</span>
              <h2 id="step-2-title" style={{ fontSize: '1.375rem', margin: 0 }}>Record Essential Instructions</h2>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              Add short notes intended for a first responder, such as where emergency medicine is located or known drug allergies. Titles are capped at 60 characters and descriptions at 300 characters to keep cards concise and legible under stress.
            </p>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              <strong>Sensitive Data Guard:</strong> The application automatically scans instruction fields and rejects entries resembling 12-digit national identification numbers or 13 to 19 digit payment card numbers.
            </p>
          </section>

          {/* Step 3 */}
          <section className="card" aria-labelledby="step-3-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span className="badge badge-primary" style={{ fontSize: '1rem', padding: '6px 12px' }}>Step 3</span>
              <h2 id="step-3-title" style={{ fontSize: '1.375rem', margin: 0 }}>Generate Time-Limited Share Links</h2>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              When preparing for an outing, commute, or travel, generate a share link from your dashboard. Choose an expiry window of 1 hour, 24 hours, or 7 days.
            </p>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              You may optionally protect the link with a 4 to 8 digit PIN. When someone opens the link, they must enter this PIN before the emergency card is revealed. If an incorrect PIN is entered 5 times consecutively, the link is locked for 15 minutes to block unauthorized guesses.
            </p>
          </section>

          {/* Step 4 */}
          <section className="card" aria-labelledby="step-4-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span className="badge badge-primary" style={{ fontSize: '1rem', padding: '6px 12px' }}>Step 4</span>
              <h2 id="step-4-title" style={{ fontSize: '1.375rem', margin: 0 }}>The Responder Emergency Card View</h2>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              When a responder opens your link (for example via a printed card or lock screen shortcut), they see a stripped-down, high-contrast page. There are no navigation links, no menus, and no marketing elements.
            </p>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Contacts are sorted with primary contacts first, accompanied by large tap-to-call buttons. Your personal email address and account records are never revealed on this page.
            </p>
          </section>

          {/* Deletion & Control */}
          <section className="card" aria-labelledby="step-5-title" style={{ borderColor: 'var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Trash2 color="#9B1C1C" size={24} aria-hidden="true" />
              <h2 id="step-5-title" style={{ fontSize: '1.375rem', margin: 0 }}>Complete Account and Data Deletion</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              You retain total ownership of your records. You can delete individual contacts or instructions at any time. If you choose to delete your account, confirming with your password permanently deletes your profile, contacts, instructions, and all share links in a single coordinated operation.
            </p>
          </section>
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Button to="/register" variant="primary" size="lg">
            Create Account
          </Button>
        </div>
      </div>
    </main>
  );
}
