/**
 * Sensitive Data Detection Patterns
 * 
 * Protects against users inadvertently storing sensitive personal data:
 * 1. 12-digit national ID numbers (e.g. Aadhaar / National ID, 12 continuous digits or 4-4-4 groups)
 * 2. 13 to 19 digit payment card numbers (Credit/Debit cards requiring card-like grouping & Luhn checksum)
 */

/**
 * Standard Luhn checksum algorithm (Mod 10).
 * Validates whether a sequence of digits corresponds to a valid credit/debit card number.
 * 
 * Viva explanation:
 * Real payment cards are mathematically checksummed using the Luhn algorithm.
 * By combining card-like grouping (e.g. 4-4-4-4 or 4-6-5) with a Luhn check,
 * we accurately identify and block real card numbers while avoiding false positives
 * on harmless numeric inputs such as two consecutive 10-digit phone numbers ("9876543210 9123456789").
 */
function passesLuhnCheck(digits) {
  if (!digits || typeof digits !== 'string') return false;
  const cleaned = digits.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    if (isNaN(digit)) return false;

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

// Matches 12-digit IDs formatted as 4-4-4 with space or hyphen, or continuous 12 digits
const TWELVE_DIGIT_ID_REGEX = /(?:^|\D)(\d{4}[ -]\d{4}[ -]\d{4}|\d{12})(?!\d)/;

/**
 * Checks text for prohibited sensitive data patterns
 * @param {string} text - The text to inspect
 * @returns {{ hasSensitiveData: boolean, reason?: string }}
 */
function detectSensitiveData(text) {
  if (!text || typeof text !== 'string') {
    return { hasSensitiveData: false };
  }

  // 1. Check 12-digit ID pattern (formatted 4-4-4 with space/hyphen or continuous 12 digits)
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

  // 2. Check card-like grouping patterns with Luhn verification
  // Standard card groupings: 4-4-4-4 (16 digits), 4-6-5 (15 digits Amex), 4-6-4 (14 digits Diners), 4-4-4-4-X (17-19 digits)
  const cardGroupPatterns = [
    /\b\d{4}[ -]\d{4}[ -]\d{4}[ -]\d{4}\b/g,
    /\b\d{4}[ -]\d{6}[ -]\d{5}\b/g,
    /\b\d{4}[ -]\d{6}[ -]\d{4}\b/g,
    /\b\d{4}[ -]\d{4}[ -]\d{4}[ -]\d{4}[ -]\d{1,3}\b/g
  ];

  for (const regex of cardGroupPatterns) {
    const matches = text.match(regex);
    if (matches) {
      for (const m of matches) {
        const rawDigits = m.replace(/\D/g, '');
        if (passesLuhnCheck(rawDigits)) {
          return {
            hasSensitiveData: true,
            reason: 'Text contains what appears to be a 13 to 19 digit payment card number. For your security, do not enter financial details.'
          };
        }
      }
    }
  }

  // 3. Check continuous digit runs of 13-19 digits with Luhn verification
  const continuousRuns = text.match(/\b\d{13,19}\b/g);
  if (continuousRuns) {
    for (const run of continuousRuns) {
      if (passesLuhnCheck(run)) {
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
  passesLuhnCheck,
  detectSensitiveData
};
