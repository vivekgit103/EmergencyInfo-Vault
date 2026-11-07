import React, { useEffect } from 'react';

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Terms and Conditions - EmergencyInfo Vault';
  }, []);

  return (
    <main id="main-content" className="content-layer" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="label-uppercase" style={{ color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>
            Terms of Use
          </span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', marginBottom: '8px' }}>
            Terms and Conditions
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            Last updated: November 6, 2026. Academic demonstration project (CIA2 Backend course).
          </p>
        </div>

        <div className="form-card" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <section style={{ marginBottom: '32px' }}>
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using EmergencyInfo Vault, you agree to these terms. If you do not agree with any part of these terms, please do not use this application. This service is operated by [TODO: legal entity name].
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2>2. Non-Medical and Emergency Service Disclaimer</h2>
            <div style={{ backgroundColor: 'var(--danger-light)', borderLeft: '4px solid var(--danger)', padding: '16px 20px', borderRadius: 'var(--btn-radius)', color: 'var(--text-main)', marginBottom: '16px' }}>
              <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--danger)' }}>
                CRITICAL NOTICE
              </strong>
              <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.55 }}>
                EmergencyInfo Vault is an informational organizer and read-only card generator. It is NOT an emergency dispatch service, 911 / 112 alternative, hospital service, or professional medical alert system. We do not dispatch first responders, monitor your physical condition, or guarantee that any bystander or medic will access your card.
              </p>
            </div>
            <p>
              In any actual life-threatening emergency, always contact local emergency services immediately (such as 112 or local emergency numbers).
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2>3. Permitted Use and Prohibited Data</h2>
            <p>
              You agree to use this application only to store legitimate emergency contact numbers and brief instructions intended for emergency personnel.
            </p>
            <p>
              You expressly agree NOT to enter:
            </p>
            <ul style={{ paddingLeft: '24px', marginBottom: '16px', lineHeight: 1.6, color: 'var(--text-muted)' }}>
              <li>National identity card numbers (such as Aadhaar or Social Security numbers).</li>
              <li>Debit or credit card numbers, CVVs, or financial credentials.</li>
              <li>Account passwords, encryption keys, or digital wallet seed phrases.</li>
              <li>Defamatory, unlawful, or infringing content.</li>
            </ul>
            <p>
              The system employs automated filters that reject submissions matching card numbers and 12-digit national ID patterns.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2>4. User Responsibilities</h2>
            <p>
              You are solely responsible for ensuring the accuracy of contact telephone numbers and instructions you record. You are responsible for maintaining the confidentiality of your account credentials and any PIN codes you assign to share links.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2>5. Availability and Service Limits</h2>
            <p>
              This application is hosted as a student software engineering project. While we implement standard production practices, high availability and uptime are not guaranteed. We reserve the right to modify or retire features as needed for evaluation and maintenance.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2>6. Governing Law</h2>
            <p>
              These terms are governed by and construed in accordance with the laws applicable in [TODO: jurisdiction, e.g. India], without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2>7. Contact Information</h2>
            <p style={{ margin: 0 }}>
              For questions or concerns regarding these terms, contact: [TODO: contact email].
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
