import jwtDecode from 'jwt-decode';

/**
 * Decode JWT token to get payload
 * @param {string} token 
 * @returns {object|null} decoded payload or null if invalid
 */
export function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

/**
 * Logout user by clearing token from localStorage
 */
export function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login'; // redirect to login page
}
