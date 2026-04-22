let systemSettings = {
  sourcePath: '/dev/stdin', // Specifies the input file path for a Unix-like system
  lineDelimiter: '\n'       // Defines the character used to separate lines in the input
};

// Reads the entire content of the specified file synchronously.
// It interprets the content as ASCII and then splits it into an array of strings
// based on the defined line delimiter.
let processedInputLines = require('fs')
  .readFileSync(systemSettings.sourcePath, 'ascii')
  .split(systemSettings.lineDelimiter);

// The first line of the input is treated as the main string where patterns will be searched.
let mainInputString = processedInputLines[0];

// The second line is parsed as an integer to determine the total number of patterns to query.
const numberOfQueries = parseInt(processedInputLines[1], 10);

// Extracts the pattern strings from the input, starting from the third line
// up to the number of queries specified.
let patternCollection = processedInputLines.slice(2, 2 + numberOfQueries);

// Frees up memory by setting the `processedInputLines` variable to null,
// as its contents have been transferred to more specific variables.
processedInputLines = null;


/**
 * Implements the Rabin-Karp algorithm for efficient string searching.
 * This function determines if a given pattern string exists within a larger master string.
 *
 * @param {string} textToScan The primary string in which to search.
 * @param {string} queryPattern The specific pattern string to find.
 * @param {number} baseValue The base for the polynomial rolling hash function (e.g., character set size).
 * @param {number} largePrime The prime modulus used to keep hash values within a manageable range.
 * @returns {number} Returns 1 if the queryPattern is found in textToScan, otherwise returns 0.
 */
function findPatternUsingRabinKarp(textToScan, queryPattern, baseValue, largePrime) {
  let scanLength, queryLength, highestPowerTerm, patternHashValue, windowHashes, loopCounter, windowShift;

  // Obtain the lengths of the main text and the pattern.
  scanLength = textToScan.length;
  queryLength = queryPattern.length;

  // Prepend a non-meaningful character to both strings.
  // This allows for 1-based indexing in the algorithm, simplifying array access logic.
  textToScan = "~" + textToScan;
  queryPattern = "~" + queryPattern;

  // If the pattern is longer than the text, it cannot possibly be a substring.
  if (queryLength > scanLength) {
    return 0;
  }

  // Calculate (baseValue^(queryLength-1)) % largePrime.
  // This value is crucial for efficiently removing the leading character's contribution
  // when computing the rolling hash for the next window.
  highestPowerTerm = Math.pow(baseValue, queryLength - 1) % largePrime;

  // Initialize hash storage variables.
  patternHashValue = 0;
  windowHashes = {}; // Stores the hash values of text windows.
  windowHashes[0] = 0; // Initialize the hash for the first window.

  // --- Preprocessing Phase ---
  // Compute the hash for the pattern and the hash for the first window of the main text.
  for (loopCounter = 1; loopCounter <= queryLength; loopCounter++) {
    patternHashValue = (baseValue * patternHashValue + queryPattern.charCodeAt(loopCounter)) % largePrime;
    windowHashes[0] = (baseValue * windowHashes[0] + textToScan.charCodeAt(loopCounter)) % largePrime;
  }

  // --- Matching Phase ---
  // Iterate through all possible starting positions (shifts) for the pattern in the text.
  for (windowShift = 0; windowShift <= scanLength - queryLength; windowShift++) {
    // If the hash of the current text window matches the pattern's hash,
    // a potential match is found. A direct string comparison is then performed
    // to rule out spurious (false positive) matches due to hash collisions.
    if (patternHashValue === windowHashes[windowShift]) {
      // Compare the actual substrings. `substring` is used for clarity and compatibility.
      if (queryPattern.substring(1, queryLength + 1) === textToScan.substring(windowShift + 1, windowShift + queryLength + 1)) {
        // An exact match is confirmed.
        return 1;
      }
    }

    // If not at the end of the main string, calculate the hash for the next window.
    // This is the "rolling" part of the rolling hash.
    if (windowShift < scanLength - queryLength) {
      windowHashes[windowShift + 1] =
        (baseValue * (windowHashes[windowShift] - textToScan.charCodeAt(windowShift + 1) * highestPowerTerm) + textToScan.charCodeAt(windowShift + queryLength + 1)) % largePrime;

      // In JavaScript, the % operator can return negative results for negative dividends.
      // This step ensures the hash value always remains positive, as required by the algorithm.
      if (windowHashes[windowShift + 1] < 0) {
        windowHashes[windowShift + 1] += largePrime;
      }
    }
  }

  // If the loop completes without finding any matches, return 0.
  return 0;
}


// Loop through each pattern stored in the `patternCollection` array.
// For each pattern, execute the Rabin-Karp search function against the `mainInputString`.
// The results (1 for found, 0 for not found) are printed to the console.
for (const patternIndex in patternCollection) {
  console.log(findPatternUsingRabinKarp(
    mainInputString,
    patternCollection[patternIndex],
    256, // A common base value representing the number of possible ASCII characters.
    Math.pow(2, 31) - 1 // A large Mersenne prime number often used as a modulus in hashing.
  ));
}