/**
 * Core utility module designed to analyze sequences of characters for adjacent differences.
 * This function processes a given input array, specifically focusing on its first element
 * (expected to be a string), to count how many times a character varies from its
 * immediate successor. It incorporates robust input validation and clear output.
 */
function analyzeCharacterAdjacency(rawInputData) {
    // --- Input Validation and Pre-processing ---

    // A crucial guard clause to ensure the primary input is in the expected format.
    // It verifies that `rawInputData` is an array, is not empty, and its first element
    // is indeed a string. Without a valid string, no analysis can proceed.
    if (!Array.isArray(rawInputData) || rawInputData.length === 0 || typeof rawInputData[0] !== 'string') {
        console.error("Validation Error: The provided input data is invalid. Expected an array containing at least one string.");
        // In case of invalid input, we gracefully exit by returning zero,
        // as no character differences can be identified.
        return 0;
    }

    // Convert the primary input string into an array of individual characters.
    // Using `Array.from()` provides a clear and modern way to achieve this,
    // ensuring each character (including Unicode) is treated as a distinct element.
    const charSequence = Array.from(rawInputData[0]);

    // Store the total number of characters in the sequence.
    // This optimizes the loop by preventing repeated `.length` property access.
    const sequenceLength = charSequence.length;

    // --- Core Logic: Counting Discrepancies ---

    // Initialize a counter to track the total number of adjacent character differences.
    // This variable will be incremented each time `currentChar` is not identical to `nextChar`.
    let discrepancyTally = 0;

    // Another guard clause: if the character sequence contains fewer than two characters,
    // it's impossible to have any adjacent pairs for comparison.
    // This prevents unnecessary iteration and ensures correctness for edge cases.
    if (sequenceLength < 2) {
        // console.warn("Notice: The input sequence is too short (less than 2 characters) for adjacency analysis.");
        return 0; // No differences can exist.
    }

    // Iterate through the character sequence. The loop runs from the first character
    // up to the second-to-last character (`sequenceLength - 1`). This is because
    // in each iteration, we compare `currentChar` with `nextChar` (which is `idx + 1`).
    // This structure ensures we always have a `nextChar` to compare against.
    for (let idx = 0; idx < sequenceLength - 1; idx++) {
        // Extract the character at the current index.
        const currentChar = charSequence[idx];
        // Extract the character immediately following the current one.
        const nextChar = charSequence[idx + 1];

        // Perform a strict inequality check (`!==`).
        // If the two adjacent characters are not strictly equal,
        // it indicates a difference, and the tally is updated.
        if (currentChar !== nextChar) {
            // Increment the discrepancy counter.
            discrepancyTally += 1;
        }
    }

    // --- Output and Return Value ---

    // Log the final computed count of adjacent character variations to the console.
    // The output message is descriptive, providing context for the result.
    console.log(`Character Adjacency Report: Detected ${discrepancyTally} variations in the sequence.`);

    // Return the calculated tally, allowing this function's result to be
    // utilized by other parts of a larger application.
    return discrepancyTally;
}

// --- Application Entry Point and Input Handling ---

// This block serves as the main entry point for executing the script.
// It focuses on reading input from standard input (/dev/stdin) and
// orchestrating the call to our character analysis function.
try {
    // Utilize Node.js's file system module to synchronously read the content
    // from standard input. It's assumed the input is UTF-8 encoded.
    const rawInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Remove any leading or trailing whitespace from the entire input buffer.
    const sanitizedInput = rawInputBuffer.trim();

    // Split the cleaned input string into an array of lines.
    // This prepares the data for our `analyzeCharacterAdjacency` function,
    // which expects an array where the first element is the target string.
    const inputLines = sanitizedInput.split("\n");

    // Invoke our primary analysis function with the prepared input data.
    // The function handles its own output logging, but its return value
    // could be captured here for further processing if required.
    analyzeCharacterAdjacency(inputLines);

} catch (processingError) {
    // A robust error handling mechanism for file I/O or initial data processing.
    // Any exceptions during input reading or preparation are caught here.
    console.error(`Fatal Error: An issue occurred while reading or parsing input: ${processingError.message}`);
    // Terminate the process with a non-zero exit code, signaling that the script
    // did not complete successfully due to an error.
    process.exit(1);
}