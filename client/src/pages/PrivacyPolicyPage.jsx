import React, { useEffect } from 'react';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy - EmergencyInfo Vault';
  }, []);

  return (
    <main id="main-content" style={{ padding: '48px 0 64px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ marginBottom: '8px' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '32px' }}>
          Last updated: November 1, 2026. Academic project demonstration.
        </p>

        <section style={{ marginBottom: '32px' }}>
          <h2>1. Introduction</h2>
          <p>
            EmergencyInfo Vault is designed specifically to limit data collection to what is necessary for emergency contact management and first responder notification. This policy explains what information is stored, how it is used, and how you maintain complete control over your records.
          </p>
          <p>
            This application is operated by [TODO: legal entity name]. If you have questions regarding this policy, you can contact the project administrator at [TODO: contact email].
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2>2. Information We Collect</h2>
          <p>We collect and store only the information you explicitly provide when creating an account and configuring your emergency records:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px', lineHeight: 1.6 }}>
            <li><strong>Account credentials:</strong> Your name, email address, and a cryptographically hashed password (hashed using bcrypt; we never store plain text passwords).</li>
            <li><strong>Emergency contacts:</strong> Names, relationships (such as Spouse or Doctor), phone numbers, priority level, and your preference for whether the contact is visible on public emergency cards.</li>
            <li><strong>Emergency instructions:</strong> Short notes you write (limited to 60 characters for titles and 300 characters for descriptions) describing urgent instructions like medication locations or allergies.</li>
            <li><strong>Share links:</strong> Random 32-character hexadecimal tokens generated when you request a shareable link, along with expiration timestamps and optional bcrypt-hashed PINs.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2>3. Information We Deliberately Do Not Collect</h2>
          <p>
            To protect your safety and avoid unnecessary data liability, our system is programmed to actively reject sensitive records. We do not store:
          </p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px', lineHeight: 1.6 }}>
            <li>Government-issued identification numbers (including Indian Aadhaar numbers, Social Security numbers, or national identity card sequences).</li>
            <li>Financial account numbers, debit or credit card details, or bank account credentials.</li>
            <li>Full medical histories, clinical records, or insurance claims.</li>
            <li>Precise home street addresses or real-time GPS locations.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2>4. How Information Is Shared</h2>
          <p>
            Your information is private by default and accessible only when authenticated with your account credentials.
          </p>
          <p>
            When you generate a share link, a unique unguessable web address is created. Anyone in possession of that link (and the optional PIN, if configured) can view only the contacts and instructions you marked as visible for emergency responders. Your email address, account identifier, password hash, and private items are never included in the public emergency payload.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2>5. Data Retention and Deletion</h2>
          <p>
            You retain full ownership of your data at all times:
          </p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px', lineHeight: 1.6 }}>
            <li><strong>Individual record deletion:</strong> You can edit or delete any contact or instruction directly from your dashboard at any time.</li>
            <li><strong>Link revocation:</strong> You can revoke an active share link immediately from your dashboard, which prevents any future views through that URL.</li>
            <li><strong>Automatic link expiration:</strong> Share links automatically expire after their chosen duration (1 hour, 24 hours, or 7 days).</li>
            <li><strong>Complete account deletion:</strong> You can delete your entire account through the dashboard. Upon confirming your password, your user profile, all contacts, all instructions, and all share links are permanently removed from the database in a single cascade. No residual copies are retained.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2>6. Security Measures</h2>
          <p>
            We implement security best practices including secure HTTP headers (Helmet), input sanitization against NoSQL injection, strict cross-origin policies, secure httpOnly session cookies, and rate limiting on authentication and public emergency endpoints to prevent brute force attempts.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2>7. Contact and Inquiries</h2>
          <p>
            For privacy inquiries or technical questions regarding this academic demonstration project, contact: [TODO: contact email].
          </p>
        </section>
      </div>
    </main>
  );
}
