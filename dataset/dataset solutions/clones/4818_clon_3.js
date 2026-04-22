// This JavaScript module is designed to classify a single textual symbol
// as either a vowel or a consonant based on standard English alphabet rules.

/**
 * Processes a given input string to determine if its significant character
 * (after whitespace removal) is an English lowercase vowel.
 *
 * @param {string} sourceDataString - The raw string content provided for analysis.
 */
const analyzeCharacter = (sourceDataString) => {

    // Define the canonical set of lowercase English vowels for efficient membership testing.
    // This uses a Set data structure for optimized lookups, a Type III modification
    // from the original array-based check.
    const VOWEL_SYMBOL_COLLECTION = new Set(['a', 'e', 'i', 'o', 'u']);

    // Pre-process the input string to remove any leading or trailing whitespace.
    // This ensures that only the core character content is evaluated.
    // The original code handled multi-character input by simply checking if the
    // entire string matched a vowel; this implementation maintains that behavior.
    const processedCharString = sourceDataString.trim();

    // A variable to store the ultimate classification result string.
    let characterClassificationOutcome;

    // Type III Addition: Implement a specific check for empty input after trimming.
    // While the original code would implicitly classify an empty string as a 'consonant'
    // (since it's not in the vowel list), this explicit check clarifies intent.
    if (processedCharString.length === 0) {
        // An empty string isn't a vowel. For consistency with original behavior,
        // it's treated as a consonant.
        characterClassificationOutcome = 'consonant';
    } else {
        // Determine if the processed character string is present in the vowel collection.
        // This is an intermediate step variable, a Type III addition.
        const isCurrentSymbolAVowel = VOWEL_SYMBOL_COLLECTION.has(processedCharString);

        // Assign the appropriate classification label based on the check.
        if (isCurrentSymbolAVowel) {
            characterClassificationOutcome = 'vowel';
        } else {
            characterClassificationOutcome = 'consonant';
        }
    }

    // Output the final determined category to the standard output stream.
    // The original separate console.log calls are refactored into a single call
    // using an intermediate variable, a Type III change.
    console.log(characterClassificationOutcome);

}; // End of analyzeCharacter function definition.


// --- Program Entry Point and Input Handling ---

// Type III Change: Break down the file reading operation into multiple,
// more granular steps and introduce helper variables.

// First, obtain a reference to the Node.js 'fs' (file system) module.
const fileSystemHandler = require('fs');

// Specify the conventional path for standard input in Unix-like systems.
const stdinDevicePath = '/dev/stdin';

// Synchronously read the raw byte buffer from the standard input device.
// The 'utf8' encoding is specified at a later stage for Type III variation.
const rawInputBufferData = fileSystemHandler.readFileSync(stdinDevicePath);

// Convert the raw buffer data into a human-readable string using UTF-8 encoding.
const decodedCharacterData = rawInputBufferData.toString('utf8');

// Finally, invoke the primary analysis function with the prepared input string.
analyzeCharacter(decodedCharacterData);