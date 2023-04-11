/**
 * Removes backslash strings (code blocks) and backticks from a string.
 * @param {string} str - The string to process.
 * @returns {string} The processed string with backslash strings and backticks removed.
 */
export const removeBackslashStrings = (str) => {
  if (!str) return '';
  const regex = /```[\s\S]*?```/g;
  const backquoteRegex = /`/g;
  return str.replace(regex, '').replace(backquoteRegex, ''); 
}
