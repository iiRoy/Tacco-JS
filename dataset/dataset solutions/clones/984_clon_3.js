const systemConfig = {
  sourceFile: '/dev/stdin',
  lineEnd: '\n'
};

const fileSystem = require('fs');

const rawInputLines = fileSystem.readFileSync(systemConfig.sourceFile, 'utf8')
  .split(systemConfig.lineEnd);

const mainDocument = rawInputLines[0];
const numberOfQueries = parseInt(rawInputLines[1], 10);
const queryPatterns = rawInputLines.slice(2, 2 + numberOfQueries);

/**
 * Implements the Rabin-Karp string searching algorithm to find if a pattern
 * exists within a target string.
 *
 * @param {string} targetText The main string to search within (haystack).
 * @param {string} searchString The pattern string to search for (needle).
 * @param {number} baseAlphabetSize The size of the alphabet (e.g., 256 for extended ASCII).
 * @param {number} primeModulo A large prime number used for hashing to minimize collisions.
 * @returns {number} Returns 1 if the pattern is found, 0 otherwise.
 */
function locateStringPattern(targetText, searchString, baseAlphabetSize, primeModulo) {
  const textLength = targetText.length;
  const patternLength = searchString.length;

  if (patternLength === 0) {
    return 0; // An empty pattern is often considered to match at any position, but for this context, 0.
  }
  if (textLength === 0) {
    return 0; // Cannot find a pattern in an empty text.
  }
  if (patternLength > textLength) {
    return 0; // Pattern cannot be found if it's longer than the text.
  }

  let patternHashValue = 0;
  let currentWindowHashValue = 0;

  // Precompute (baseAlphabetSize ^ (patternLength - 1)) % primeModulo
  // This value is used to efficiently remove the contribution of the leftmost character
  // during the rolling hash calculation.
  let highestPowerMultiplier = 1;
  for (let k = 0; k < patternLength - 1; k++) {
    highestPowerMultiplier = (highestPowerMultiplier * baseAlphabetSize) % primeModulo;
  }

  // Calculate the initial hash for the pattern and the first window of the target text.
  // All string operations are 0-indexed.
  for (let charIndex = 0; charIndex < patternLength; charIndex++) {
    const patternCharCode = searchString.charCodeAt(charIndex);
    const textCharCode = targetText.charCodeAt(charIndex);

    patternHashValue = (baseAlphabetSize * patternHashValue + patternCharCode) % primeModulo;
    currentWindowHashValue = (baseAlphabetSize * currentWindowHashValue + textCharCode) % primeModulo;
  }

  // Iterate through the target text, shifting the window one character at a time.
  // 'shiftPosition' indicates the starting index of the current window.
  for (let shiftPosition = 0; shiftPosition <= textLength - patternLength; shiftPosition++) {
    // If the hashes match, a potential match is found.
    // A full character-by-character comparison is then performed to confirm
    // the match and rule out any hash collisions (spurious hits).
    if (patternHashValue === currentWindowHashValue) {
      const currentTextWindow = targetText.substring(shiftPosition, shiftPosition + patternLength);
      if (searchString === currentTextWindow) {
        return 1; // True match found.
      }
    }

    // If this is not the last possible window, update the hash for the next window.
    if (shiftPosition < textLength - patternLength) {
      const outgoingCharCode = targetText.charCodeAt(shiftPosition); // Character leaving the window
      const incomingCharCode = targetText.charCodeAt(shiftPosition + patternLength); // Character entering the window

      // Calculate the new hash for the next window:
      // 1. Subtract the hash contribution of the outgoing character.
      //    We add 'primeModulo' to ensure the result is non-negative before the modulo.
      let hashWithoutLeftmost = (currentWindowHashValue - (outgoingCharCode * highestPowerMultiplier) % primeModulo + primeModulo) % primeModulo;

      // 2. Multiply by 'baseAlphabetSize' (shifting the hash) and add the contribution
      //    of the incoming character.
      currentWindowHashValue = (hashWithoutLeftmost * baseAlphabetSize + incomingCharCode) % primeModulo;
    }
  }

  return 0; // No match found after checking all possible windows.
}

// Process each query pattern from the input and output the result.
for (const currentPattern of queryPatterns) {
  // Use 256 as the alphabet size (for extended ASCII characters)
  // and (2^31 - 1) as a common large prime modulus to minimize collisions.
  const matchResult = locateStringPattern(mainDocument, currentPattern, 256, 2147483647); // 2^31 - 1
  console.log(matchResult);
}