/**
 * Sensitive Data Detection Patterns
 * 
 * Protects against users inadvertently storing sensitive personal data:
 * 1. 12-digit national ID numbers (e.g., Aadhaar / National ID, 12 continuous digits or 4-4-4 groups)
 * 2. 13 to 19 digit payment card numbers (Credit/Debit cards, formatted or unformatted)
 */

// Matches 12-digit IDs formatted as 4-4-4 with spaces or hyphens, or continuous 12 digits
const TWELVE_DIGIT_ID_REGEX = /(?:^|\D)(\d{4}[ -]?\d{4}[ -]?\d{4}|\d{12})(?!\d)/;

// Matches 13 to 19 digit card numbers (continuous or grouped with spaces/hyphens)
const CARD_NUMBER_REGEX = /(?:^|\D)(?:\d[ -]?){13,19}(?!\d)/;

/**
 * Checks text for prohibited sensitive data patterns
 * @param {string} text - The text to inspect
 * @returns {{ hasSensitiveData: boolean, reason?: string }}
 */
function detectSensitiveData(text) {
  if (!text || typeof text !== 'string') {
    return { hasSensitiveData: false };
  }

  // Check 12-digit ID pattern
  const idMatch = text.match(TWELVE_DIGIT_ID_REGEX);
  if (idMatch) {
    const rawDigits = idMatch[1].replace(/[\s-]/g, '');
    if (rawDigits.length === 12) {
      return {
        hasSensitiveData: true,
        reason: 'Text contains what appears to be a 12-digit national identification number. For your privacy, do not enter ID numbers.'
      };
    }
  }

  // Check 13-19 digit card numbers
  const cardMatch = text.match(CARD_NUMBER_REGEX);
  if (cardMatch) {
    // Strip non-digits from matched segment
    const rawDigits = cardMatch[0].replace(/\D/g, '');
    if (rawDigits.length >= 13 && rawDigits.length <= 19) {
      return {
        hasSensitiveData: true,
        reason: 'Text contains what appears to be a 13 to 19 digit payment card number. For your security, do not enter financial details.'
      };
    }
  }

  // Check any continuous digit runs of 12 or 13-19 digits that might have been surrounded by punctuation
  const allDigitRuns = text.match(/\b\d{12,19}\b/g);
  if (allDigitRuns) {
    for (const run of allDigitRuns) {
      if (run.length === 12) {
        return {
          hasSensitiveData: true,
          reason: 'Text contains what appears to be a 12-digit national identification number. For your privacy, do not enter ID numbers.'
        };
      }
      if (run.length >= 13 && run.length <= 19) {
        return {
          hasSensitiveData: true,
          reason: 'Text contains what appears to be a 13 to 19 digit payment card number. For your security, do not enter financial details.'
        };
      }
    }
  }

  return { hasSensitiveData: false };
}

module.exports = {
  TWELVE_DIGIT_ID_REGEX,
  CARD_NUMBER_REGEX,
  detectSensitiveData
};
