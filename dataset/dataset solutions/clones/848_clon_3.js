// This script processes raw text input, tokenizes specific words,
// segments the resulting string based on patterns, and then identifies
// the longest sequence to determine a final classification.

// Import the 'fs' (file system) module, which is part of Node.js core.
const fileSystemUtility = require('fs');

// Define the standard input stream path for POSIX systems.
const standardInputSource = '/dev/stdin';

/**
 * Retrieves the entire content from a specified file path.
 * This function handles potential errors during file access.
 * @param {string} sourcePath The path to the file from which to read data.
 * @returns {string} The complete content of the file as a UTF-8 encoded string.
 * @throws {Error} An error is thrown if the file cannot be read, and the process exits.
 */
function fetchSourceMaterial(sourcePath) {
    try {
        // Attempt to read the file synchronously. This is suitable for scripting
        // where the input is expected to be immediately available.
        const fileContentBuffer = fileSystemUtility.readFileSync(sourcePath, 'utf8');
        return fileContentBuffer;
    } catch (readError) {
        // If an error occurs (e.g., file not found, permission denied),
        // log the issue and terminate the application.
        console.error(`CRITICAL: Could not access input from ${sourcePath}. Error: ${readError.message}`);
        process.exit(1); // Exit with a non-zero status code to indicate failure.
    }
}

// --- Main Processing Logic ---

// Phase 1: Obtain the raw input from the designated source.
const initialInputPayload = fetchSourceMaterial(standardInputSource);

// Phase 2: Standardize the input string.
// This involves removing leading/trailing whitespace and replacing
// specific semantic tokens ('egg', 'chicken') with simplified single-character representations ('E', 'C').
const cleanedInputText = initialInputPayload.trim();

// Apply the first set of replacements.
// We perform these as separate steps for explicit clarity, though chaining is also viable.
let tokenizedString = cleanedInputText.replace(/egg/g, "E");
tokenizedString = tokenizedString.replace(/chicken/g, "C");

// Introduce a unique internal delimiter character. This character is crucial
// for later segmenting the string when identical tokens appear consecutively.
const internalSequenceDivider = "A";

// Phase 3: Prepare the tokenized string for segmentation.
// Insert the `internalSequenceDivider` between any two consecutive identical tokens.
// For example, "EE" becomes "EAE", and "CC" becomes "CAC".
// Using regex quantifiers {2} for "EE" and "CC" provides a slight variation.
let segmentedPreparation = tokenizedString
    .replace(/E{2}/g, `E${internalSequenceDivider}E`) // Transform "EE" -> "EAE"
    .replace(/C{2}/g, `C${internalSequenceDivider}C`); // Transform "CC" -> "CAC"

// Phase 4: Break down the prepared string into an array of distinct segments.
// The string is split wherever the `internalSequenceDivider` is encountered.
const sequenceSegmentsArray = segmentedPreparation.split(internalSequenceDivider);

// Phase 5: Identify the longest sequence within the array of segments.
// Initialize the variable that will hold the longest sequence found.
// An empty string is used as the default and initial comparison value.
let longestIdentifiedSequence = "";

// Only attempt to find the longest sequence if there are actual segments to process.
if (sequenceSegmentsArray.length > 0) {
    // Employ the 'reduce' array method to efficiently iterate through segments
    // and determine the one with the greatest length.
    longestIdentifiedSequence = sequenceSegmentsArray.reduce((currentLongest, elementBeingEvaluated) => {
        // If the current element is longer than the `currentLongest` found so far,
        // it becomes the new `currentLongest`. Otherwise, the `currentLongest` remains.
        return elementBeingEvaluated.length > currentLongest.length ? elementBeingEvaluated : currentLongest;
    }, ""); // The initial value for `currentLongest` is an empty string.
}
// If `sequenceSegmentsArray` was empty, `longestIdentifiedSequence` will remain "".

// Phase 6: Determine the final output category based on the last character
// of the `longestIdentifiedSequence`.
const finalDiscriminatorChar = longestIdentifiedSequence.slice(-1);

let designatedOutputCategory;

// Use an explicit if-else if-else structure for clarity in decision-making.
if (finalDiscriminatorChar === "E") {
    designatedOutputCategory = "egg";
} else if (finalDiscriminatorChar === "C") {
    designatedOutputCategory = "chicken";
} else {
    // This 'else' block handles cases where:
    // 1. `longestIdentifiedSequence` was empty (making `finalDiscriminatorChar` an empty string).
    // 2. Unexpectedly, the last character is neither 'E' nor 'C'.
    // Based on the problem's implicit rules and the original code's behavior,
    // an empty sequence or non-matching last char defaults to "chicken".
    designatedOutputCategory = "chicken";
}

// Phase 7: Output the final determined category to the standard output.
console.log(designatedOutputCategory);