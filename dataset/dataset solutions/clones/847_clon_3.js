const DATA_INPUT_SOURCE_PATH = '/dev/stdin';
const DATA_READ_ENCODING = 'utf8';

// Regular expression patterns for text manipulation
const INITIAL_CLEANUP_REGEX = /gg|hicken/g;
const REPEAT_EE_CHECK_REGEX = /ee/;
const REPEAT_EE_REPLACE_REGEX = /ee/g;
const REPEAT_CC_CHECK_REGEX = /cc/;
const REPEAT_CC_REPLACE_REGEX = /cc/g;

// Strings used for replacement and splitting
const EE_INSERTION_MARKER = "eAe";
const CC_INSERTION_MARKER = "cAc";
const SEGMENT_SPLITTER_CHAR = "A";

// Final output messages
const RESULT_TYPE_EGG = "egg";
const RESULT_TYPE_CHICKEN = "chicken";
const TARGET_LAST_CHARACTER = "e";

/**
 * Retrieves the raw textual input from a specified file path.
 * Includes basic error handling for file access.
 * @param {string} filePath - The path to the input file.
 * @param {string} encoding - The character encoding to use for reading the file.
 * @returns {string} The content of the file, or an empty string if an error occurs.
 */
function obtainInputData(filePath, encoding) {
    try {
        const fileSystemUtil = require('fs');
        const fileContentBuffer = fileSystemUtil.readFileSync(filePath, encoding);
        return fileContentBuffer;
    } catch (dataAcquisitionError) {
        // Log the error for debugging purposes, but continue execution with default behavior.
        console.error("Failed to read input from source:", dataAcquisitionError.message);
        return ""; // Return an empty string to avoid crashes downstream
    }
}

/**
 * Applies initial trimming and pattern-based replacements to the input string.
 * @param {string} rawStringData - The string to be processed.
 * @returns {string} The string after trimming and initial filtering.
 */
function performInitialStringFiltering(rawStringData) {
    const trimmedInput = rawStringData.trim();
    const cleanedInput = trimmedInput.replace(INITIAL_CLEANUP_REGEX, "");
    return cleanedInput;
}

/**
 * Iteratively replaces all occurrences of 'ee' with 'eAe' until no more 'ee' sequences exist.
 * Uses a do-while loop for guaranteed first execution and subsequent checks.
 * @param {string} currentTextSegment - The string to modify.
 * @returns {string} The string with all 'ee' sequences replaced.
 */
function normalizeDoubleE(currentTextSegment) {
    let workingString = currentTextSegment;
    let hasChangedInternally;
    let transformationCounter = 0; // An additional variable for tracking operations (Type III addition)

    do {
        hasChangedInternally = false;
        // Check if the pattern exists before attempting replacement
        if (REPEAT_EE_CHECK_REGEX.test(workingString)) {
            workingString = workingString.replace(REPEAT_EE_REPLACE_REGEX, EE_INSERTION_MARKER);
            hasChangedInternally = true;
            transformationCounter++;
        }
    } while (hasChangedInternally);

    // console.log(`[Debug] 'ee' transformations: ${transformationCounter}`); // Non-essential, for debug

    return workingString;
}

/**
 * Iteratively replaces all occurrences of 'cc' with 'cAc' until no more 'cc' sequences exist.
 * Uses a standard while loop.
 * @param {string} currentTextSegment - The string to modify.
 * @returns {string} The string with all 'cc' sequences replaced.
 */
function normalizeDoubleC(currentTextSegment) {
    let workingString = currentTextSegment;
    let iterationCount = 0; // Another non-essential tracking variable

    while (REPEAT_CC_CHECK_REGEX.test(workingString)) {
        workingString = workingString.replace(REPEAT_CC_REPLACE_REGEX, CC_INSERTION_MARKER);
        iterationCount++;
    }

    // console.log(`[Debug] 'cc' transformations: ${iterationCount}`); // Non-essential, for debug

    return workingString;
}

/**
 * Main function to orchestrate the entire processing pipeline.
 * Encapsulated within an Immediately-Invoked Function Expression (IIFE).
 */
(function processInputAndDetermineOutcome() {
    // Step 1: Fetch the raw data from the designated input stream.
    const initialRawContent = obtainInputData(DATA_INPUT_SOURCE_PATH, DATA_READ_ENCODING);

    // Step 2: Apply the initial set of string cleaning rules.
    let intermediateProcessedString = performInitialStringFiltering(initialRawContent);

    // Guard clause: If the string is empty after initial processing, output default and exit.
    if (intermediateProcessedString.length === 0) {
        console.log(RESULT_TYPE_CHICKEN);
        return;
    }

    // Step 3: Normalize sequences of 'ee' as per the problem logic.
    intermediateProcessedString = normalizeDoubleE(intermediateProcessedString);

    // Step 4: Normalize sequences of 'cc' as per the problem logic.
    intermediateProcessedString = normalizeDoubleC(intermediateProcessedString);

    // Step 5: Split the fully processed string into an array of segments.
    // Filter out any empty strings that may result from consecutive delimiters or leading/trailing delimiters.
    const textSegmentsCollection = intermediateProcessedString
                                    .split(SEGMENT_SPLITTER_CHAR)
                                    .filter(segment => segment.length > 0); // Ensures no empty strings are considered

    // Variable to hold the longest identified segment.
    let ultimateLongestSegment = "";

    // Step 6: Determine the longest segment from the collection.
    // Using Array.prototype.reduce for a more functional approach compared to forEach.
    if (textSegmentsCollection.length > 0) {
        ultimateLongestSegment = textSegmentsCollection.reduce((currentLongest, elementInQuestion) => {
            // If the current element is longer than the current longest, it becomes the new longest.
            return (elementInQuestion.length > currentLongest.length) ? elementInQuestion : currentLongest;
        }, ""); // Initialize reduction with an empty string, ensuring proper comparison.
    } else {
        // If no valid segments were found after splitting and filtering, default to 'chicken'.
        console.log(RESULT_TYPE_CHICKEN);
        return;
    }

    // Step 7: Evaluate the last character of the longest segment.
    let doesLongestEndWithE = false;
    // Add a check to ensure the segment isn't empty before slicing.
    if (ultimateLongestSegment.length > 0) {
        const finalCharacter = ultimateLongestSegment.slice(-1);
        doesLongestEndWithE = (finalCharacter === TARGET_LAST_CHARACTER);
    }

    // Step 8: Output the final result based on the evaluation.
    if (doesLongestEndWithE) {
        console.log(RESULT_TYPE_EGG);
    } else {
        console.log(RESULT_TYPE_CHICKEN);
    }

})(); // End of IIFE execution.