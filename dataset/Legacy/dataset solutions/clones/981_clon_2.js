scriptSettings = { sourceFile: 'tmp', lineSeparator: '\r\n' }; // Windows-style line endings
// scriptSettings = { sourceFile: '/dev/stdin', lineSeparator: '\n' }; // Linux-style line endings

const fileSystemModule = require('fs');

let inputLines = fileSystemModule.readFileSync(scriptSettings.sourceFile, 'ascii')
  .split(scriptSettings.lineSeparator);

let mainTextContent = inputLines[0];
let numberOfPatterns = Number(inputLines[1]);
let searchPatterns = inputLines.slice(2, 2 + numberOfPatterns);

inputLines = null; // Release memory for the input array

/**
 * Performs a Rabin-Karp string matching algorithm to find if a pattern exists in a text.
 * @param {string} mainStringParam The main text to search within.
 * @param {string} patternStringParam The pattern to search for.
 * @param {number} charRadix The radix (base) for hashing, typically the number of possible characters (e.g., 256 for ASCII).
 * @param {number} primeModulo A large prime number to use as the modulus for hash calculations.
 * @returns {number} 1 if the pattern is found, 0 otherwise.
 */
function performRabinKarpSearch(mainStringParam, patternStringParam, charRadix, primeModulo) {
  var mainString, mainStringLength, patternString, patternStringLength, highestPowerHash, currentPatternHash, windowHashes, loopIndex, currentShift;

  mainStringLength = mainStringParam.length;
  mainString = "_" + mainStringParam; // Adjusting for 1-based indexing in algorithm

  patternStringLength = patternStringParam.length;
  patternString = "_" + patternStringParam; // Adjusting for 1-based indexing in algorithm

  // Precompute (charRadix^(patternStringLength-1)) % primeModulo
  highestPowerHash = Math.pow(charRadix, patternStringLength - 1) % primeModulo;

  currentPatternHash = 0;
  windowHashes = {};
  windowHashes[0] = 0; // Initialize hash for the first window of text

  // Calculate initial hash for pattern and first text window
  for (loopIndex = 1; loopIndex <= patternStringLength; loopIndex++) {
    currentPatternHash = (charRadix * currentPatternHash + patternString[loopIndex].charCodeAt()) % primeModulo;
    windowHashes[0] = (charRadix * windowHashes[0] + mainString[loopIndex].charCodeAt()) % primeModulo;
  }

  // Slide the window and compare hashes
  for (currentShift = 0; currentShift <= mainStringLength - patternStringLength; currentShift++) {
    if (currentPatternHash === windowHashes[currentShift]) {
      // Hash match, perform a full string comparison to avoid spurious hits
      if (patternString.slice(1, patternStringLength + 1) === mainString.slice(currentShift + 1, currentShift + patternStringLength + 1)) {
        // console.log("Pattern found at index " + currentShift); // Debugging output
        return 1; // Pattern found
      }
    }

    // Calculate hash for the next window
    if (currentShift < mainStringLength - patternStringLength) {
      windowHashes[currentShift + 1] =
        (charRadix * (windowHashes[currentShift] - mainString[currentShift + 1].charCodeAt() * highestPowerHash) + mainString[currentShift + patternStringLength + 1].charCodeAt()) % primeModulo;

      // Ensure hash remains positive
      if (windowHashes[currentShift + 1] < 0) {
        windowHashes[currentShift + 1] += primeModulo;
      }
    }
  }
  return 0; // Pattern not found
}

// Process each pattern and print the result
for (let patternIdx in searchPatterns) {
  console.log(performRabinKarpSearch(mainTextContent, searchPatterns[patternIdx], 256, Math.pow(2, 31) - 1));
}
