// Configuration settings for input/output operations.
// This setup is commonly used for Windows environments.
const ioSettings = {
  sourcePath: 'tmp', // Specifies the file path for input data.
  lineDelimiter: '\r\n' // Defines the character sequence used for line breaks.
};

/*
// Alternate configuration for Unix-like operating systems (e.g., Linux, macOS).
const ioSettings = {
  sourcePath: '/dev/stdin', // Directs input from the standard input stream.
  lineDelimiter: '\n' // Uses the standard Unix line ending.
};
*/

// --- Data Acquisition and Initial Parsing ---
// Reads the content of the specified file, decodes it as UTF-8,
// and then splits the entire content into an array of strings based on the line delimiter.
const rawInputLines = require('fs').readFileSync(ioSettings.sourcePath, 'utf8')
  .split(ioSettings.lineDelimiter);

// The primary text string within which patterns will be searched (the 'haystack').
const mainTextString = rawInputLines[0];

// Determines the total number of patterns that need to be processed.
// Explicitly converts the string value from input to a numerical type.
const numberOfPatterns = Number(rawInputLines[1]);

// Extracts the individual pattern strings from the input array.
// These are the 'needles' that will be sought within the mainTextString.
const searchPatterns = rawInputLines.slice(2, 2 + numberOfPatterns);

// For memory efficiency, especially with large input files,
// the raw input lines array is no longer referenced after parsing.
// rawInputLines = null; // This line has been removed as a Type III deletion.

/**
 * Executes the Rabin-Karp string searching algorithm.
 * This implementation utilizes 0-based indexing for all string operations.
 * It determines if a given pattern (needle) is present within a larger text (haystack).
 *
 * @param {string} haystack The full text string to be searched.
 * @param {string} needle The pattern string to locate within the haystack.
 * @param {number} charBase The base value for polynomial hashing (e.g., 256 for extended ASCII).
 * @param {number} primeModulus A large prime number used for modulo operations to manage hash size.
 * @returns {number} Returns 1 if the pattern is found at least once, otherwise returns 0.
 */
function findSubstringRabinKarp(haystack, needle, charBase, primeModulus) {
  const textLength = haystack.length;
  const patternLength = needle.length;

  // --- Input Validation and Edge Cases ---
  if (patternLength === 0) {
    // An empty pattern is considered "found" by some definitions,
    // or an error. Here, we'll return 1, assuming it's always present.
    return 1;
  }
  if (textLength < patternLength) {
    // If the text is shorter than the pattern, a match is impossible.
    return 0;
  }
  if (charBase <= 1 || !Number.isInteger(charBase)) {
      // The base for hashing must be a positive integer greater than one.
      console.error("Error: Invalid character base for hashing provided.");
      return 0;
  }
  if (primeModulus <= 1 || !Number.isInteger(primeModulus)) {
      // The modulus for hashing must be a positive integer greater than one.
      console.error("Error: Invalid prime modulus for hashing provided.");
      return 0;
  }

  // Pre-calculate the highest power of `charBase` modulo `primeModulus`.
  // This value is used to efficiently remove the leading character's contribution
  // during the rolling hash calculation.
  let highOrderFactor = 1;
  for (let k = 0; k < patternLength - 1; k++) {
    highOrderFactor = (highOrderFactor * charBase) % primeModulus;
  }

  let patternHashValue = 0; // The hash of the target pattern.
  let currentWindowHashValue = 0; // The hash of the current sliding window in the text.

  // --- Initial Hash Calculation Phase ---
  // Compute the hash for the pattern and for the first window of the text.
  for (let k = 0; k < patternLength; k++) {
    patternHashValue = (patternHashValue * charBase + needle.charCodeAt(k)) % primeModulus;
    currentWindowHashValue = (currentWindowHashValue * charBase + haystack.charCodeAt(k)) % primeModulus;
  }

  // --- Sliding Window Comparison Phase ---
  // Iterate through the text, moving a window of `patternLength` characters.
  for (let shiftIndex = 0; shiftIndex <= textLength - patternLength; shiftIndex++) {
    // If the hashes match, a potential match is found.
    // A character-by-character comparison is required to confirm (avoid false positives).
    if (patternHashValue === currentWindowHashValue) {
      let fullMatchConfirmed = true;
      for (let charOffset = 0; charOffset < patternLength; charOffset++) {
        if (needle.charCodeAt(charOffset) !== haystack.charCodeAt(shiftIndex + charOffset)) {
          fullMatchConfirmed = false;
          break; // Mismatch found, not a true match.
        }
      }
      if (fullMatchConfirmed) {
        // A genuine match has been found.
        return 1;
      }
    }

    // --- Rolling Hash Update ---
    // If it's not the last possible window, compute the hash for the next window.
    if (shiftIndex < textLength - patternLength) {
      // Subtract the hash contribution of the character leaving the window.
      // Add `primeModulus` before taking modulo to handle potential negative results.
      let hashAfterRemoval = (currentWindowHashValue - (haystack.charCodeAt(shiftIndex) * highOrderFactor) % primeModulus + primeModulus) % primeModulus;

      // Multiply by `charBase` and add the hash contribution of the new character entering the window.
      currentWindowHashValue = (hashAfterRemoval * charBase + haystack.charCodeAt(shiftIndex + patternLength)) % primeModulus;
    }
  }

  // If the loop completes without finding any matches, the pattern is not present.
  return 0;
}

// --- Main Program Execution ---

// Constants used for the Rabin-Karp algorithm.
// A standard base value suitable for character sets like ASCII.
const HASHING_BASE = 256;
// A large prime number chosen to minimize hash collisions.
// This is a different prime from the original code's 2^31 - 1.
const LARGE_PRIME_NUMBER = 2147483629; // A prime number slightly smaller than 2^31.

/**
 * Orchestrates the search process by iterating through all defined patterns
 * and applying the Rabin-Karp algorithm to each.
 */
function initiatePatternSearch() {
  for (const currentPattern of searchPatterns) {
    // For each pattern, invoke the Rabin-Karp matcher and log the outcome.
    const searchResult = findSubstringRabinKarp(
      mainTextString,
      currentPattern,
      HASHING_BASE,
      LARGE_PRIME_NUMBER
    );
    console.log(searchResult);
  }
}

// Begin the pattern searching operation.
initiatePatternSearch();