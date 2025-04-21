// Card network patterns
const CARD_PATTERNS = {
  VISA: /^4[0-9]{12}(?:[0-9]{3})?$/,
  MASTERCARD: /^5[1-5][0-9]{14}$/,
  RUPAY: /^6[0-9]{15}$/,
  AMEX: /^3[47][0-9]{13}$/,
  DISCOVER: /^6(?:011|5[0-9]{2})[0-9]{12}$/
};

// BIN (Bank Identification Number) ranges for major Indian banks
const BANK_BINS = {
  'SBI': ['4', '5', '6'],
  'HDFC': ['4', '5'],
  'ICICI': ['4', '5'],
  'AXIS': ['4', '5'],
  'PNB': ['4', '5'],
  'BOB': ['4', '5'],
  'CITI': ['4', '5'],
  'KOTAK': ['4', '5'],
  'YES': ['4', '5'],
  'IDFC': ['4', '5']
};

export const detectCardNetwork = (cardNumber) => {
  const cleanedNumber = cardNumber.replace(/\s/g, '');
  
  for (const [network, pattern] of Object.entries(CARD_PATTERNS)) {
    if (pattern.test(cleanedNumber)) {
      return network;
    }
  }
  
  return 'UNKNOWN';
};

export const detectBank = (cardNumber) => {
  const firstDigit = cardNumber.charAt(0);
  
  for (const [bank, prefixes] of Object.entries(BANK_BINS)) {
    if (prefixes.includes(firstDigit)) {
      return bank;
    }
  }
  
  return 'UNKNOWN';
};

export const validateCardNumber = (cardNumber) => {
  // Remove all spaces
  const cleanedNumber = cardNumber.replace(/\s/g, '');
  
  // Check if it's all digits
  if (!/^\d+$/.test(cleanedNumber)) {
    return false;
  }
  
  // Check length (most cards are 16 digits, AMEX is 15)
  if (cleanedNumber.length < 15 || cleanedNumber.length > 16) {
    return false;
  }
  
  // Luhn algorithm for card number validation
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanedNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanedNumber.charAt(i));
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

export const formatCardNumber = (cardNumber) => {
  // Remove all non-digit characters
  const cleanedNumber = cardNumber.replace(/\D/g, '');
  
  // Add space after every 4 digits
  return cleanedNumber.replace(/(\d{4})/g, '$1 ').trim();
}; 