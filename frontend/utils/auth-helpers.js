import { loginWithGoogle } from './api';

export async function authenticateWithBackend(email) {
  try {
    const response = await loginWithGoogle(email);
    return response;
  } catch (error) {
    console.error("Failed to authenticate with backend:", error);
    throw error;
  }
}