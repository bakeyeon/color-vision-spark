
// Simple encryption utility for password storage
const ENCRYPTION_KEY = 'lovable-admin-key-2024';

export const encryptPassword = (password: string): string => {
  // Simple XOR encryption with base64 encoding
  let encrypted = '';
  for (let i = 0; i < password.length; i++) {
    const charCode = password.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    encrypted += String.fromCharCode(charCode);
  }
  return btoa(encrypted);
};

export const decryptPassword = (encryptedPassword: string): string => {
  try {
    const decoded = atob(encryptedPassword);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch {
    return '';
  }
};

export const getStoredPassword = (): string => {
  const stored = localStorage.getItem('adminPassword');
  if (stored) {
    return decryptPassword(stored);
  }
  return 'admin123'; // Default password
};

export const setStoredPassword = (password: string): void => {
  const encrypted = encryptPassword(password);
  localStorage.setItem('adminPassword', encrypted);
};
