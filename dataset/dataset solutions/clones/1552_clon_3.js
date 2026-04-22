const fileSystemBridge = require("fs"); // Import the file system module for I/O operations

// Define constants for input source and encoding to enhance clarity and maintainability.
const SYSTEM_INPUT_PATH = "/dev/stdin";
const TEXT_ENCODING_STANDARD = "utf8";

/**
 * Computes the count of differing characters between two strings of equal length.
 * This function is designed to be a pure helper, focusing solely on character comparison.
 * @param {string} sourceSegment - The first string fragment.
 * @param {string} targetPatternSegment - The second string fragment for comparison.
 * @returns {number} The total number of positions where characters do not match.
 */
function determineCharacterMismatches(sourceSegment, targetPatternSegment) {
    let mismatchesEncountered = 0; // Initialize counter for differences.
    const segmentSpan = targetPatternSegment.length; // Determine the length for iteration.

    // Iterate through each character position to compare.
    for (let charPosition = 0; charPosition < segmentSpan; charPosition++) {
        // If characters at the current position are not identical, increment the mismatch count.
        if (sourceSegment[charPosition] !== targetPatternSegment[charPosition]) {
            mismatchesEncountered++;
        }
    }
    return mismatchesEncountered; // Return the accumulated count of differences.
}

/**
 * Orchestrates the main logic to find the minimum character differences
 * between a primary text and all possible overlapping patterns within it.
 * It reads input, processes strings, and outputs the lowest mismatch count.
 */
function executePatternComparisonWorkflow() {
    // Acquire raw input data from the specified system input path.
    const rawInputContent = fileSystemBridge.readFileSync(SYSTEM_INPUT_PATH, TEXT_ENCODING_STANDARD);

    // Split the raw content into individual lines.
    const contentLines = rawInputContent.split("\n");

    // Implement a basic validation for input data integrity.
    if (contentLines.length < 2) {
        console.error("Critical Error: Input data is incomplete. Expected at least two lines of text.");
        // Terminate execution or throw an exception as appropriate for robust error handling.
        process.exit(1);
    }

    // Assign the first line as the main textual content.
    const principalText = contentLines[0];
    // Assign the second line as the pattern to search for.
    const comparisonSeekingPattern = contentLines[1];

    const principalTextLength = principalText.length; // Get length of the main text.
    const patternLength = comparisonSeekingPattern.length; // Get length of the pattern.

    // A preliminary check: if the pattern is longer than the principal text,
    // no matching substrings can exist. Output a specific error or sentinel value.
    if (patternLength > principalTextLength) {
        console.log("Error: The comparison pattern is longer than the principal text. No valid matches possible.");
        return; // Exit the function gracefully.
    }

    // Calculate the maximum possible starting index for a substring of the principal text.
    const maximumPermissibleShift = principalTextLength - patternLength;

    let leastMismatchesFound = Infinity; // Initialize with a very high value to ensure any valid count will be lower.
    let anExactMatchWasLocated = false; // Flag to indicate if a perfect match is found, allowing for early termination.

    // Iterate through all potential starting positions (offsets) within the principal text.
    // Each offset defines a unique substring of length equal to the pattern's length.
    for (let currentShift = 0; currentShift <= maximumPermissibleShift; currentShift++) {
        // Extract the current substring from the principal text.
        const currentTextualFragment = principalText.substring(currentShift, currentShift + patternLength);

        // Prioritize checking for an exact match as an optimization.
        if (currentTextualFragment === comparisonSeekingPattern) {
            leastMismatchesFound = 0; // If exact, differences are zero.
            anExactMatchWasLocated = true; // Set flag to true.
            break; // Exit the loop immediately as the optimal solution is found.
        } else {
            // If not an exact match, compute the number of differences.
            const fragmentMismatches = determineCharacterMismatches(currentTextualFragment, comparisonSeekingPattern);

            // Update the global minimum if the current fragment has fewer mismatches.
            if (fragmentMismatches < leastMismatchesFound) {
                leastMismatchesFound = fragmentMismatches;
            }
        }
    }

    // Output the final minimum number of character differences identified.
    // This output occurs only once, after all potential substrings have been evaluated.
    console.log(leastMismatchesFound);
}

// Invoke the main workflow to start the program.
executePatternComparisonWorkflow();