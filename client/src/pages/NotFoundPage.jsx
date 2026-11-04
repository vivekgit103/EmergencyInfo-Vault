import React, { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import Button from '../components/Button';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page Not Found - EmergencyInfo Vault';
  }, []);

  return (
    <main id="main-content" style={{ padding: '64px 0', textAlign: 'center' }}>
      <div className="container-narrow">
        <div className="card" style={{ padding: '48px 24px' }}>
          <ShieldAlert size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>Page Not Found (404)</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '24px' }}>
            The page you requested could not be found. Please check the address or return home.
          </p>
          <Button to="/" variant="primary">
            Return to Homepage
          </Button>
        </div>
      </div>
    </main>
  );
}
