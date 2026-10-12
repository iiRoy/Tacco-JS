const appSettings = {
  dataFile: '/dev/stdin', // Specifies the path to the input file
  lineDelimiter: '\n'     // Defines the character sequence for new lines
};

// Read the entire content of the input file, decode as ASCII, and split into individual lines
let inputContent = require('fs').readFileSync(appSettings.dataFile, 'ascii')
  .split(appSettings.lineDelimiter);

// Extract the main text string, the total number of search queries, and the list of patterns
const mainDocument = inputContent[0];
const queryQuantity = Number(inputContent[1]);
const patternCollection = inputContent.slice(2, 2 + queryQuantity);

// Dispose of the raw input lines array to free up memory, as parsed data is now in dedicated variables
inputContent = null;

/**
 * Implements the Rabin-Karp string searching algorithm to find a pattern within a text.
 * This function checks for the presence of 'targetString' inside 'sourceString'.
 *
 * @param {string} sourceString - The larger text body where the search will be conducted.
 * @param {string} targetString - The specific pattern string to locate.
 * @param {number} alphabetSize - The size of the character set (e.g., 256 for extended ASCII).
 * @param {number} primeNumber - A large prime modulus used in hash calculations to minimize collisions.
 * @returns {number} Returns 1 if an occurrence of the pattern is found, otherwise returns 0.
 */
function performRabinKarpSearch(sourceString, targetString, alphabetSize, primeNumber) {
  let augmentedSource, sourceLength, augmentedTarget, targetLength, hashMultiplier, patternHash, textHashes, loopCounter, shiftPosition;

  sourceLength = sourceString.length;
  // Prepend a dummy character to the source string to facilitate 1-based indexing for algorithm logic
  augmentedSource = "_" + sourceString;

  targetLength = targetString.length;
  // Prepend a dummy character to the target string for consistent 1-based indexing
  augmentedTarget = "_" + targetString;

  // If the pattern is longer than the source text, it cannot possibly be found
  if (targetLength > sourceLength) {
    return 0;
  }

  // Compute the value of (alphabetSize^(targetLength-1)) % primeNumber, used for rolling hash calculation
  hashMultiplier = Math.pow(alphabetSize, targetLength - 1) % primeNumber;

  patternHash = 0;
  textHashes = {}; // An object to store the hash values of text windows
  textHashes[0] = 0; // Initialize the hash for the very first text window

  // Preprocessing phase: Calculate the hash for the pattern and the initial text window
  for (loopCounter = 1; loopCounter <= targetLength; loopCounter++) {
    patternHash = (alphabetSize * patternHash + augmentedTarget[loopCounter].charCodeAt()) % primeNumber;
    textHashes[0] = (alphabetSize * textHashes[0] + augmentedSource[loopCounter].charCodeAt()) % primeNumber;
  }

  // Matching phase: Iterate through all possible shift positions in the source string
  for (shiftPosition = 0; shiftPosition <= sourceLength - targetLength; shiftPosition++) {
    // If the hash of the current text window matches the pattern's hash,
    // perform a direct character-by-character comparison to confirm (avoid spurious hits)
    if (patternHash === textHashes[shiftPosition]) {
      if (augmentedTarget.slice(1, targetLength + 1) === augmentedSource.slice(shiftPosition + 1, shiftPosition + targetLength + 1)) {
        // A true match is found
        return 1;
      }
    }

    // If not at the end of the source string, calculate the hash for the next text window
    if (shiftPosition < sourceLength - targetLength) {
      textHashes[shiftPosition + 1] =
        (alphabetSize * (textHashes[shiftPosition] - augmentedSource[shiftPosition + 1].charCodeAt() * hashMultiplier) + augmentedSource[shiftPosition + targetLength + 1].charCodeAt()) % primeNumber;
    }
  }

  // If the loop completes without finding any matches, the pattern is not present
  return 0;
}

// For each pattern in the collection, execute the Rabin-Karp search and print the result
for (let patternIdx in patternCollection) {
  console.log(performRabinKarpSearch(mainDocument, patternCollection[patternIdx], 256, Math.pow(2, 31) - 1));
}
