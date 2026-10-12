const appConfig = { sourceFile: '/dev/stdin', lineSeparator: '\n' }; // Linux/Unix standard input configuration

// Read all input data from the specified source file, decode as ASCII,
// and then split it into an array of individual lines based on the configured separator.
let dataRows = require('fs').readFileSync(appConfig.sourceFile, 'ascii')
  .split(appConfig.lineSeparator);

// The first line contains the main text string to be searched.
const mainString = dataRows[0];
// The second line contains the number of patterns to query, converted to a number.
const queryCount = Number(dataRows[1]);
// Subsequent lines (from index 2 up to 2 + queryCount - 1) are the patterns to find.
const patternsToFind = dataRows.slice(2, 2 + queryCount);

// Release the memory occupied by the raw input lines array, as its contents have been extracted.
dataRows = null;

/**
 * Implements a variant of the Rabin-Karp string matching algorithm.
 * This function searches for occurrences of a given pattern string within a larger text string.
 *
 * @param {string} textStr The primary text string in which to search.
 * @param {string} patternStr The pattern string to locate.
 * @param {number} baseVal The base value used for polynomial hashing (e.g., 256 for extended ASCII).
 * @param {number} modVal The modulus value used to keep hash values within a manageable range and prevent overflow.
 * @returns {number} Returns 1 if the pattern is found within the text, otherwise returns 0.
 */
function rkSearch(textStr, patternStr, baseVal, modVal) {
  // Declare all local variables at the beginning of the function.
  let currentText, textLen, currentPattern, patternLen, hashMultiplier, patternHash, textHashes, charIndex, currentShift;

  // Get the length of the main text string.
  textLen = textStr.length;
  // Prepend a dummy character to the text string to make it 1-indexed for algorithmic convenience.
  currentText = "_" + textStr;

  // Get the length of the pattern string.
  patternLen = patternStr.length;
  // Prepend a dummy character to the pattern string to make it 1-indexed.
  currentPattern = "_" + patternStr;

  // Calculate (baseVal^(patternLen-1)) % modVal. This value is used in the rolling hash
  // to efficiently remove the leading character's contribution from a window's hash.
  hashMultiplier = Math.pow(baseVal, patternLen - 1) % modVal;

  // Initialize the hash for the pattern to zero.
  patternHash = 0;
  // Initialize an object to store hashes of text windows. The key 0 will store the hash of the first window.
  textHashes = {};
  textHashes[0] = 0;

  // Preprocessing phase: Calculate the hash for the pattern and the initial window of the text.
  // Loop from 1 up to the pattern's length (inclusive, due to 1-indexing).
  for (charIndex = 1; charIndex <= patternLen; charIndex++) {
    // Update the pattern hash: (base * previous_hash + current_char_code) % modVal.
    patternHash = (baseVal * patternHash + currentPattern[charIndex].charCodeAt()) % modVal;
    // Update the hash for the first text window similarly.
    textHashes[0] = (baseVal * textHashes[0] + currentText[charIndex].charCodeAt()) % modVal;
  }

  // Matching phase: Slide a window of size 'patternLen' across the text string.
  // The loop runs from shift 0 up to (textLen - patternLen).
  for (currentShift = 0; currentShift <= textLen - patternLen; currentShift++) {
    // If the hash of the current text window matches the pattern's hash,
    // perform a character-by-character comparison to confirm a true match (avoid spurious hits).
    if (patternHash === textHashes[currentShift]) {
      // Compare the actual substrings (from index 1 to patternLen+1 due to 1-indexing).
      if (currentPattern.slice(1, patternLen + 1) === currentText.slice(currentShift + 1, currentShift + patternLen + 1)) {
        // If the substrings are identical, the pattern is found. Return 1.
        return 1;
      }
    }

    // If there are more windows to check (i.e., not the last possible shift),
    // calculate the hash for the next window using the rolling hash technique.
    if (currentShift < textLen - patternLen) {
      // The rolling hash formula:
      // new_hash = (base * (old_hash - char_to_remove * hash_multiplier) + char_to_add) % modVal
      textHashes[currentShift + 1] =
        (baseVal * (textHashes[currentShift] - currentText[currentShift + 1].charCodeAt() * hashMultiplier) + currentText[currentShift + patternLen + 1].charCodeAt()) % modVal;
    }
  }
  // If the loop completes without finding any matches, return 0.
  return 0;
}

// Iterate through each pattern in the 'patternsToFind' array.
// For each pattern, call the Rabin-Karp search function with the main text, the current pattern,
// a base of 256 (for ASCII characters), and a large prime modulus (2^31 - 1).
// The result (1 for found, 0 for not found) is then printed to the console.
for (let patternIdx in patternsToFind) {
  console.log(rkSearch(mainString, patternsToFind[patternIdx], 256, Math.pow(2, 31) - 1));
}
