import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function SensitiveDataNotice() {
  return (
    <div className="sensitive-notice-banner" role="note" aria-label="Privacy notice regarding sensitive data">
      <AlertTriangle color="#B45309" size={24} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
      <div>
        <strong>Privacy rule:</strong> Do not enter passwords, ID numbers, or financial details.
        <div style={{ marginTop: '4px', fontSize: '0.875rem' }}>
          This vault is designed solely for critical emergency instructions (such as inhaler location, known drug allergies, or blood group). Any entries resembling 12-digit identification numbers or 13 to 19 digit payment card numbers are automatically blocked.
        </div>
      </div>
    </div>
  );
}
