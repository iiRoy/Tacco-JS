'use strict';

const fileSystemModule = require('fs');

/**
 * Evaluates a given character sequence against a set of predetermined rules.
 * Specifically, characters at 0-indexed even positions must not be 'L',
 * and characters at 0-indexed odd positions must not be 'R'.
 *
 * @param {string} characterSequence The string input to be examined for compliance.
 * @returns {boolean} Returns `true` if the sequence adheres to all rules, `false` otherwise.
 */
function evaluateSequenceCompliance(characterSequence) {
    // Introduce a guard clause for non-string or empty inputs.
    // An empty string technically doesn't violate any rules, so it's compliant.
    if (typeof characterSequence !== 'string' || characterSequence.length === 0) {
        return true;
    }

    const sequenceLength = characterSequence.length;
    let complianceStatus = true; // Initialize our compliance flag to optimistic true

    // Iterate through the sequence using an index representing the character's position
    for (let currentCharacterIndex = 0; currentCharacterIndex < sequenceLength; currentCharacterIndex++) {
        const charAtCurrentPosition = characterSequence.charAt(currentCharacterIndex); // Access character
        const isCurrentPositionEven = (currentCharacterIndex % 2 === 0); // Determine parity of the index

        // Check rules based on the position's parity
        if (isCurrentPositionEven) {
            // Rule for even positions: Character must not be 'L'
            if (charAtCurrentPosition === 'L') {
                complianceStatus = false; // Violation detected
                break; // Exit loop early as compliance is already broken
            }
        } else { // Current position is odd
            // Rule for odd positions: Character must not be 'R'
            if (charAtCurrentPosition === 'R') {
                complianceStatus = false; // Violation detected
                break; // Exit loop early
            }
        }
    }

    return complianceStatus;
}

// --- Main application execution block ---

const standardInputFile = '/dev/stdin'; // Path to read standard input
let receivedTextLine = ''; // Variable to hold the primary input string

try {
    // Synchronously read the entire content from the specified input file.
    // Explicitly set encoding to 'utf8' to correctly handle text.
    const rawFileContent = fileSystemModule.readFileSync(standardInputFile, 'utf8');

    // Process the raw content: remove leading/trailing whitespace, then split into lines.
    const contentLines = rawFileContent.trim().split('\n');

    // We are interested in the very first significant line of input.
    if (contentLines.length > 0) {
        receivedTextLine = contentLines[0];
    } else {
        // If the input file was empty or contained only newlines/whitespace,
        // receivedTextLine remains an empty string, which will be handled by the function.
        console.warn('Warning: Input file was empty or contained no readable lines.');
        receivedTextLine = '';
    }

} catch (ioError) {
    // Implement robust error handling for file system operations.
    // In competitive programming, this might just mean an empty string or program exit.
    console.error(`Error reading from ${standardInputFile}:`, ioError.message);
    receivedTextLine = ''; // Default to an empty string if input fails
}

// Execute the compliance evaluation function with the obtained input.
const isSequenceGood = evaluateSequenceCompliance(receivedTextLine);

// Convert the boolean result into the required "Yes" or "No" string format.
const finalOutputString = isSequenceGood ? "Yes" : "No";

// Display the final determination to the standard output.
console.log(finalOutputString);