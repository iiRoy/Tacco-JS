const applicationSettings = {
  sourcePath: '/dev/stdin',
  lineDelimiter: '\n'
};

// Access the file system module to read data.
// The entire content of the specified input file is read, decoded as ASCII,
// and then broken down into an array of strings based on the configured line separator.
const dataInputLines = require('fs').readFileSync(applicationSettings.sourcePath, 'ascii')
  .split(applicationSettings.lineDelimiter);

// The main string, often referred to as the 'text' or 'haystack', is found on the very first line.
const mainSearchString = dataInputLines[0];

// The second line contains an integer indicating the quantity of patterns that follow.
const totalPatternsToProcess = Number(dataInputLines[1]);

// The actual patterns, or 'needles', are extracted from the input lines
// starting from the third line and continuing for the 'totalPatternsToProcess' count.
const collectionOfPatterns = dataInputLines.slice(2, 2 + totalPatternsToProcess);

// Define constants for the Rabin-Karp algorithm's numerical parameters.
// This is the base for our hash function, typically the size of the character set (e.g., ASCII).
const CHARACTER_SET_RADIX = 256;
// A large prime number used as a modulus to prevent hash values from becoming too large
// and to reduce the likelihood of hash collisions. 2^31 - 1 is a Mersenne prime.
const MODULUS_PRIME_NUMBER = 2147483647;

/**
 * Executes the Rabin-Karp string searching algorithm to determine if a target pattern
 * exists within a larger main string. It leverages a rolling hash technique for efficiency.
 *
 * @param {string} mainTextString The complete text body where the search will occur.
 * @param {string} patternToFind The substring whose presence is to be checked.
 * @param {number} baseValue The numerical base (radix) for hash computations.
 * @param {number} primeMod The prime modulus to keep hash values within bounds.
 * @returns {number} Returns 1 if 'patternToFind' is found within 'mainTextString', otherwise 0.
 */
function findSubstringWithRabinKarp(mainTextString, patternToFind, baseValue, primeMod) {
  // --- Preliminary Checks and Edge Cases ---
  if (!mainTextString || !patternToFind) {
    // If either input string is invalid (null, undefined, etc.), no match is possible.
    return 0;
  }

  const textLength = mainTextString.length;
  const patternLength = patternToFind.length;

  if (patternLength === 0) {
    // An empty pattern is generally considered to match.
    return 1;
  }
  if (textLength < patternLength) {
    // If the pattern is longer than the text, it cannot possibly be a substring.
    return 0;
  }

  // --- Precompute Hash Multiplier ---
  let highOrderHashTerm = 1; // Represents (baseValue^(patternLength-1)) % primeMod
  // This loop calculates the highest power of the base (d^(m-1) mod q),
  // which is essential for quickly removing the contribution of the leading character
  // during the rolling hash process.
  for (let k = 0; k < patternLength - 1; k++) {
    highOrderHashTerm = (highOrderHashTerm * baseValue) % primeMod;
  }

  let currentPatternHash = 0;     // Stores the hash value for the 'patternToFind'.
  let currentSlidingWindowHash = 0; // Stores the hash value for the current text window.

  // --- Calculate Initial Hashes ---
  // Iterate through the first 'patternLength' characters to establish the initial hash
  // for both the pattern and the very first window of the main text.
  for (let k = 0; k < patternLength; k++) {
    currentPatternHash = (baseValue * currentPatternHash + patternToFind.charCodeAt(k)) % primeMod;
    currentSlidingWindowHash = (baseValue * currentSlidingWindowHash + mainTextString.charCodeAt(k)) % primeMod;
  }

  // --- Main Sliding Window Comparison Loop ---
  // This loop iterates through all possible starting positions (shifts) for the pattern
  // within the main text string.
  for (let currentShift = 0; currentShift <= textLength - patternLength; currentShift++) {
    // If the hash values of the current text window and the pattern match,
    // it's a potential match. A character-by-character comparison is still needed
    // to confirm and rule out hash collisions.
    if (currentPatternHash === currentSlidingWindowHash) {
      let preciseMatchConfirmed = true;
      // Character-by-character verification loop.
      for (let charOffset = 0; charOffset < patternLength; charOffset++) {
        if (mainTextString.charCodeAt(currentShift + charOffset) !== patternToFind.charCodeAt(charOffset)) {
          preciseMatchConfirmed = false; // Mismatch found, indicating a hash collision.
          break;
        }
      }
      if (preciseMatchConfirmed) {
        // If the pattern is fully confirmed by character comparison, we've found it.
        return 1; // Indicate a successful discovery.
      }
    }

    // --- Update Rolling Hash for the Next Window ---
    // If there are more windows to check (i.e., not the very last shift),
    // compute the hash for the next sliding window using the rolling hash formula.
    if (currentShift < textLength - patternLength) {
      const exitingCharCode = mainTextString.charCodeAt(currentShift);           // Character leaving the window.
      const enteringCharCode = mainTextString.charCodeAt(currentShift + patternLength); // Character entering the window.

      // 1. Remove the hash contribution of the character that is sliding out of the window.
      // We add 'primeMod' before the modulo to ensure the result remains non-negative in JavaScript.
      let tempHash = (currentSlidingWindowHash - (exitingCharCode * highOrderHashTerm) % primeMod + primeMod) % primeMod;

      // 2. Shift the remaining hash left by multiplying by the base, and add the new character's contribution.
      currentSlidingWindowHash = (tempHash * baseValue + enteringCharCode) % primeMod;
    }
  }

  // If the loop completes without finding any pattern matches, return 0.
  return 0;
}

// --- Application Entry Point ---
// Iterate through each pattern stored in the 'collectionOfPatterns' array.
// For every individual pattern, invoke the Rabin-Karp matching function
// against the 'mainSearchString' and display the returned result (1 for match, 0 for no match).
collectionOfPatterns.forEach(singleSearchNeedle => {
  const matchResult = findSubstringWithRabinKarp(
    mainSearchString,
    singleSearchNeedle,
    CHARACTER_SET_RADIX,
    MODULUS_PRIME_NUMBER
  );
  console.log(matchResult);
});