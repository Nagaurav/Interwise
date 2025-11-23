/**
 * Utility functions for authentication token management
 * These functions work with cookies to match the AuthContext implementation
 */

/**
 * Get authentication token from cookies
 * @returns Promise<string | null> - The token or null if not found
 */
export const getAuthToken = async (): Promise<string | null> => {
  if (typeof document === 'undefined') {
    return null; // Server-side rendering
  }
  
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1] || null;
  
  return token;
};

/**
 * Get authentication token from cookies (synchronous version)
 * @returns string | null - The token or null if not found
 */
export const getAuthTokenSync = (): string | null => {
  if (typeof document === 'undefined') {
    return null; // Server-side rendering
  }
  
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1] || null;
  
  return token;
};

/**
 * Check if user is authenticated by checking for token in cookies
 * @returns boolean - True if authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return getAuthTokenSync() !== null;
};
