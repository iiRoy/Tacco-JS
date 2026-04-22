'use strict'; // Enforce strict parsing and execution rules for this script.

// Import the Node.js file system module, aliasing it for clarity.
const fileSystemOperations = require('fs');

/**
 * An internal helper function designed to iteratively search for a specific pattern
 * within a given string, replace all its occurrences, and concurrently count
 * how many such transformations were performed in a single pass.
 * This function avoids regular expressions for the core search/replace logic.
 *
 * @param {string} sourceText - The original string that needs to be processed.
 * @param {string} searchSequence - The specific substring pattern to locate.
 * @param {string} replaceWithSequence - The substring pattern to substitute in place of found search patterns.
 * @returns {{processedString: string, countOfReplacements: number}} An object containing the newly formed string
 *          after all replacements in this pass, and the total number of replacements made.
 */
function performPatternSubstitutionAndTally(sourceText, searchSequence, replaceWithSequence) {
    let tallyOfSubstitutions = 0;
    const segments = []; // An array to build the new string efficiently from parts.
    let currentPointer = 0;
    let nextMatchIndex;

    // Loop through the source text to find all instances of the search sequence.
    while ((nextMatchIndex = sourceText.indexOf(searchSequence, currentPointer)) !== -1) {
        tallyOfSubstitutions++; // Increment the counter for each found instance.
        // Add the portion of the string before the current match.
        segments.push(sourceText.substring(currentPointer, nextMatchIndex));
        // Add the replacement sequence.
        segments.push(replaceWithSequence);
        // Advance the pointer past the just-processed search sequence.
        currentPointer = nextMatchIndex + searchSequence.length;
    }

    // Append any remaining characters from the original string after the last match.
    segments.push(sourceText.substring(currentPointer));

    // Combine all collected segments into the final transformed string.
    return {
        processedString: segments.join(''),
        countOfReplacements: tallyOfSubstitutions
    };
}

/**
 * This primary function orchestrates a sequence of string transformations.
 * It repeatedly searches for and replaces 'BW' with 'WB' in the initial input string
 * until no more 'BW' patterns can be found. It accumulates a total count of all
 * such transformations across all passes.
 *
 * @param {string} completeInputBuffer - The raw string content read from the input source, which may contain multiple lines.
 * @returns {void} This function does not return a value but prints the final cumulative count to the standard output.
 */
const manageIterativeStringTransformations = (completeInputBuffer) => {
    // --- Initial Input Validation and Preparation ---
    if (typeof completeInputBuffer !== 'string' || completeInputBuffer.length === 0) {
        console.error("Execution Aborted: Input data is either not a string or is entirely empty.");
        return; // Terminate execution if input is invalid.
    }

    // Extract the first non-empty, trimmed line from the input buffer.
    const relevantLines = completeInputBuffer
        .split('\n')
        .map(lineContent => lineContent.trim())
        .filter(trimmedLine => trimmedLine.length > 0);

    if (relevantLines.length === 0) {
        console.warn("Warning: No significant string data found after processing input lines.");
        return; // Terminate if no valid string sequence is present.
    }

    let currentWorkingString = relevantLines[0]; // The mutable string being processed.

    // Define the specific patterns involved in the transformation.
    const PATTERN_TO_FIND = 'BW'; // The 'Black-White' sequence.
    const PATTERN_TO_INSERT = 'WB'; // The 'White-Black' replacement.

    let totalCumulativeSwaps = 0; // Counter for the grand total of transformations.
    let didAnySwapsOccurInLastPass; // A boolean flag to control the main transformation loop.

    // --- Main Transformation Loop ---
    // The process continues as long as at least one transformation occurs in a pass.
    do {
        didAnySwapsOccurInLastPass = false; // Reset the flag for the current pass.

        // Execute the combined search, replace, and count operation.
        const currentPassResult = performPatternSubstitutionAndTally(
            currentWorkingString,
            PATTERN_TO_FIND,
            PATTERN_TO_INSERT
        );

        // If any transformations were detected in this pass:
        if (currentPassResult.countOfReplacements > 0) {
            totalCumulativeSwaps += currentPassResult.countOfReplacements; // Add to the global total.
            currentWorkingString = currentPassResult.processedString;       // Update the string for the next pass.
            didAnySwapsOccurInLastPass = true;                              // Signal to continue looping.
        }

    } while (didAnySwapsOccurInLastPass); // Loop terminates when a pass yields no replacements.

    // --- Final Result Output ---
    console.info(`Operation completed. The final aggregated count of 'BW' to 'WB' transformations is: ${totalCumulativeSwaps}`);
};

// --- Script Entry Point for Execution ---
// Define the standard input file path.
const STD_INPUT_SOURCE_PATH = '/dev/stdin';

try {
    // Read the entire contents of the standard input file synchronously.
    const rawDataBuffer = fileSystemOperations.readFileSync(STD_INPUT_SOURCE_PATH, 'utf8');
    // Initiate the string transformation process with the acquired data.
    manageIterativeStringTransformations(rawDataBuffer);
} catch (fileReadError) {
    // Handle any potential errors during file reading (e.g., file not found, permissions).
    console.error(`Critical Error: Failed to read from standard input file (${STD_INPUT_SOURCE_PATH}). Details:`, fileReadError.message);
    process.exit(1); // Exit the process with an error code to indicate failure.
}