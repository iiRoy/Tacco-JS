const fileSystemHandler = require('fs');

// --- Configuration Constants ---
const DATA_SOURCE_PATH = '/dev/stdin';
const TEXT_ENCODING = 'utf8';

const TARGET_PHRASE_ONE = 'egg';
const TARGET_PHRASE_TWO = 'chicken';

const SYMBOL_ONE = 'E';
const SYMBOL_TWO = 'C';
const MERGE_TOKEN = 'A'; // Used to separate merged symbols

// --- Utility Function for Repetitive Pattern Replacement ---
/**
 * Continuously replaces a given pattern in a string until no more occurrences are found.
 * @param {string} inputString The string to process.
 * @param {RegExp} searchPattern The regular expression to search for.
 * @param {string} replacementValue The string to replace matches with.
 * @returns {string} The string after all replacements have been made.
 */
function applyRepeatedReplacement(inputString, searchPattern, replacementValue) {
    let currentWorkingString = inputString;
    let hasChangesOccurred = true;

    // Loop as long as replacements are being made
    while (hasChangesOccurred) {
        const stringBeforeReplacement = currentWorkingString;
        currentWorkingString = currentWorkingString.replace(searchPattern, replacementValue);
        hasChangesOccurred = (currentWorkingString !== stringBeforeReplacement); // Check if the string actually changed
    }
    return currentWorkingString;
}

// --- Main Program Execution Flow ---

try {
    // Step 1: Acquire Raw Input Data
    let rawInputContent = fileSystemHandler.readFileSync(DATA_SOURCE_PATH, TEXT_ENCODING);

    // Step 2: Pre-process Input - Remove superfluous whitespace
    let normalizedInput = rawInputContent.trim();

    // Guard clause: Handle cases where input might be empty after trimming
    if (normalizedInput.length === 0) {
        console.log(TARGET_PHRASE_TWO); // Default to 'chicken' for empty input as per problem logic
        return; // Exit early
    }

    // Step 3: Perform Initial Symbolic Encoding
    // Replace full words with their single-character symbols
    let encodedSequence = normalizedInput.replace(new RegExp(TARGET_PHRASE_ONE, 'g'), SYMBOL_ONE);
    encodedSequence = encodedSequence.replace(new RegExp(TARGET_PHRASE_TWO, 'g'), SYMBOL_TWO);

    // Step 4: Condense Repeating Symbol Sequences
    // Apply the specific condensation rules for symbols
    const firstCondensedPass = applyRepeatedReplacement(encodedSequence, new RegExp(SYMBOL_ONE + SYMBOL_ONE), SYMBOL_ONE + MERGE_TOKEN + SYMBOL_ONE);
    const finalCondensedSequence = applyRepeatedReplacement(firstCondensedPass, new RegExp(SYMBOL_TWO + SYMBOL_TWO), SYMBOL_TWO + MERGE_TOKEN + SYMBOL_TWO);

    // Step 5: Segment Analysis - Split and Find Longest Segment
    // Divide the condensed sequence into distinct segments using the merge token
    const sequenceSegmentsCollection = finalCondensedSequence.split(MERGE_TOKEN);

    // Initialize the variable to store the longest segment found
    let dominantSegment = '';
    // Use a traditional for-loop for iterating over segments
    for (let segmentIndex = 0; segmentIndex < sequenceSegmentsCollection.length; segmentIndex++) {
        const currentSegmentEntry = sequenceSegmentsCollection[segmentIndex];
        // Compare lengths to identify the longest segment
        if (currentSegmentEntry.length > dominantSegment.length) {
            dominantSegment = currentSegmentEntry;
        }
    }

    // Step 6: Determine Final Output Based on Dominant Segment's Trailing Character
    let ultimateDecision;
    // Check if a dominant segment was actually found (e.g., if input wasn't entirely empty or just delimiters)
    if (dominantSegment.length > 0) {
        const lastCharacterOfDominant = dominantSegment.slice(-1);

        // Use an explicit if-else structure for clarity
        if (lastCharacterOfDominant === SYMBOL_ONE) {
            ultimateDecision = TARGET_PHRASE_ONE;
        } else {
            // Default to TARGET_PHRASE_TWO if it's SYMBOL_TWO or any other unexpected character
            ultimateDecision = TARGET_PHRASE_TWO;
        }
    } else {
        // If no dominant segment was found (e.g., input was just 'A' or empty after all processing)
        ultimateDecision = TARGET_PHRASE_TWO;
    }

    // Step 7: Display the Final Result
    console.log(ultimateDecision);

} catch (errorDetails) {
    // Basic error handling for file reading or other unexpected issues
    console.error("An error occurred during processing:", errorDetails.message);
    // As a fallback, output 'chicken' if an error prevents normal execution
    console.log(TARGET_PHRASE_TWO);
}