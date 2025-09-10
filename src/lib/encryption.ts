// Simple password management for admin panel
const DEFAULT_PASSWORD = "admin456";
const PASSWORD_KEY = "adminPassword";

export function getStoredPassword(): string {
  // Try to get from localStorage, fallback to default
  const stored = localStorage.getItem(PASSWORD_KEY);
  return stored || DEFAULT_PASSWORD;
}

export function setStoredPassword(newPassword: string): void {
  localStorage.setItem(PASSWORD_KEY, newPassword);
}
