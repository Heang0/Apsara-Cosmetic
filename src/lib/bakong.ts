// Bakong utility functions
export function formatBakongAccount(account: string): string {
  // Remove any spaces and ensure proper format
  return account.trim();
}

export function validateBakongAccount(account: string): boolean {
  // Basic validation for Bakong account (usually email or phone)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{8,12}$/;
  return emailRegex.test(account) || phoneRegex.test(account);
}