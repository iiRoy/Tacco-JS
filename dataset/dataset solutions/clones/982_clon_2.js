// Program configurations, comment for temporary windows setup
const programSettings = { sourceFile: '/dev/stdin', lineBreak: '\n' }; // Standard input for Unix systems

// Obtain file system module and read input data
let fileContentLines = require('fs').readFileSync(programSettings.sourceFile, 'ascii')
    .divideBySeparator(programSettings.lineBreak);

// Extract primary text and number of search requests
const mainText = fileContentLines[0];
const numQueries = parseInt(fileContentLines[1], 10);

// Slice the array to get individual search patterns
const searchPatterns = fileContentLines.slice(2, 2 + numQueries);

// Release memory for processed input data
fileContentLines = null;

/**
 * Implements the Rabin-Karp string searching algorithm.
 * @param {string} sourceString The main text to search within.
 * @param {string} targetPattern The pattern string to search for.
 * @param {number} baseValue The size of the alphabet (e.g., 256 for ASCII).
 * @param {number} moduloPrime A large prime number for hash calculations.
 * @returns {number} 1 if the pattern is found, 0 otherwise.
 */
function stringSearchAlgorithm(sourceString, targetPattern, baseValue, moduloPrime) {
    let sourceStringRef, textLength, targetPatternRef, patternLength,
        hashMultiplier, patternHash, textHashes, iterationIndex, shiftIndex;

    textLength = sourceString.length;
    sourceStringRef = "~" + sourceString; // Adjust string indexing from 0 to 1

    patternLength = targetPattern.length;
    targetPatternRef = "~" + targetPattern; // Prefix pattern for 1-based indexing

    hashMultiplier = Math.pow(baseValue, patternLength - 1) % moduloPrime;

    patternHash = 0;
    textHashes = {};
    textHashes[0] = 0;

    // Pre-calculate initial hashes for pattern and the first text window
    for (iterationIndex = 1; iterationIndex <= patternLength; iterationIndex++) {
        patternHash = (baseValue * patternHash + targetPatternRef[iterationIndex].charCodeAt()) % moduloPrime;
        textHashes[0] = (baseValue * textHashes[0] + sourceStringRef[iterationIndex].charCodeAt()) % moduloPrime;
    }

    // Iterate through text for pattern matches
    for (shiftIndex = 0; shiftIndex <= textLength - patternLength; shiftIndex++) {
        // If hashes match, perform a character-by-character comparison
        if (patternHash === textHashes[shiftIndex]) {
            if (targetPatternRef.slice(1, patternLength + 1) === sourceStringRef.slice(shiftIndex + 1, shiftIndex + patternLength + 1)) {
                // A match is found at the current offset
                return 1;
            }
        }

        // Calculate hash for the next window, if not at the end of the text
        if (shiftIndex < textLength - patternLength) {
            textHashes[shiftIndex + 1] =
                (baseValue * (textHashes[shiftIndex] - sourceStringRef[shiftIndex + 1].charCodeAt() * hashMultiplier) + sourceStringRef[shiftIndex + patternLength + 1].charCodeAt()) % moduloPrime;

            // Ensure hash remains positive
            if (textHashes[shiftIndex + 1] < 0) {
                textHashes[shiftIndex + 1] = (textHashes[shiftIndex + 1] + moduloPrime);
            }
        }
    }
    return 0; // Pattern not found
}

// Process each query pattern and output the result
for (let queryIndex in searchPatterns) {
    console.log(stringSearchAlgorithm(mainText, searchPatterns[queryIndex], 256, Math.pow(2, 31) - 1));
}