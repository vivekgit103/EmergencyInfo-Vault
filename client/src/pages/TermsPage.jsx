import React, { useEffect } from 'react';

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Terms and Conditions - EmergencyInfo Vault';
  }, []);

  return (
    <main id="main-content" style={{ padding: '48px 0 64px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ marginBottom: '8px' }}>Terms and Conditions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '32px' }}>
          Last updated: November 1, 2026. Academic demonstration project (CIA2 Backend course).
        </p>

        <section style={{ marginBottom: '32px' }}>
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using EmergencyInfo Vault, you agree to these terms. If you do not agree with any part of these terms, please do not use this application. This service is operated by [TODO: legal entity name].
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2>2. Non-Medical and Emergency Service Disclaimer</h2>
          <p style={{ backgroundColor: '#FDE8E8', borderLeft: '4px solid #9B1C1C', padding: '16px', borderRadius: '4px', color: '#7E1414', fontWeight: '700' }}>
            CRITICAL NOTICE: EmergencyInfo Vault is an informational organizer and read-only card generator. It is NOT an emergency dispatch service, 911 / 112 alternative, hospital service, or professional medical alert system. We do not dispatch first responders, monitor your physical condition, or guarantee that any bystander or medic will access your card.
          </p>
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
          <ul style={{ paddingLeft: '24px', marginBottom: '16px', lineHeight: 1.6 }}>
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

        <section style={{ marginBottom: '32px' }}>
          <h2>7. Contact Information</h2>
          <p>
            For questions or concerns regarding these terms, contact: [TODO: contact email].
          </p>
        </section>
      </div>
    </main>
  );
}
