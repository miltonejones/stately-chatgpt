/**
 * Generates a unique string identifier using the current timestamp and a random number.
 * @returns {string} A unique identifier string.
 */
export const uniqueId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);
