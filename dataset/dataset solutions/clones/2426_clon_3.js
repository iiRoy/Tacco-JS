'use strict';

// Initiate standard input stream processing routines
process.stdin.resume();
process.stdin.setEncoding('utf-8');

// Internal buffer to accumulate all incoming data from stdin
let bufferedInputData = '';
// Pointer to keep track of the current line being processed from the buffer
let currentInputLinePointer = 0;

// Event handler for chunks of data received from the standard input
process.stdin.on('data', (incomingDataChunk) => {
    bufferedInputData += incomingDataChunk;
});

// Event handler triggered when the entire standard input stream has ended
process.stdin.on('end', () => {
    // Once all input is received, split the buffered data into individual lines
    bufferedInputData = bufferedInputData.split('\n');
    // Then, kick off the primary application logic
    executeMainProcessingLogic();
});

/**
 * Retrieves the next line from the buffered input.
 * Advances the internal line pointer after retrieval.
 * @returns {string|null} The next line of input, or null if no more lines are available.
 */
function retrieveNextInputLine() {
    // A simple guard to prevent reading beyond the available input lines
    if (currentInputLinePointer >= bufferedInputData.length) {
        console.error("Error: Attempted to read past the end of available input lines.");
        return null; // Or throw an error for more rigorous error handling
    }
    // Return the current line and then increment the pointer for the next call
    return bufferedInputData[currentInputLinePointer++];
}

/**
 * A standardized function for outputting results to the console.
 * This abstracts away direct `console.log` calls and allows for potential
 * future modifications (e.g., logging to a file, formatting).
 * @param {string} finalVerdict - The string message to be outputted.
 */
function deliverResult(finalVerdict) {
    console.log(finalVerdict);
}

// *************************************************************************
// ******************** Core Application Logic Begins Here *****************
// *************************************************************************

/**
 * This function encapsulates the primary task of the application:
 * reading an input string, splitting it into two conceptual halves,
 * and determining if these halves are identical.
 */
function executeMainProcessingLogic() {
    // Read the first line of input. It's typically an integer representing
    // an expected length or count, but we'll primarily use the actual string's length.
    const theoreticalStringLength = parseInt(retrieveNextInputLine(), 10);

    // Read the second line, which is the actual string data to be analyzed.
    const stringDataForAnalysis = retrieveNextInputLine();

    // Determine the real, current length of the string provided.
    const actualStringLength = stringDataForAnalysis.length;

    // --- Type III Addition: Enhanced guard clause for edge cases ---
    // If the string is too short (empty or single character), it cannot be
    // meaningfully split into two identical, non-empty halves.
    if (actualStringLength <= 1) {
        deliverResult('No'); // Output 'No' for trivial cases
        return; // Exit the function early as no further processing is needed
    }

    // --- Type III Update: More explicit calculation of the division point ---
    // Calculate the index at which the string should be divided.
    // Math.floor ensures an integer index. For odd-length strings, this
    // effectively ignores the middle character when forming the two halves.
    // Example: "abcde" (length 5) -> splitIndex = floor(5/2) = 2.
    // First half "ab", second half "de". The 'c' is skipped.
    const divisionIndex = Math.floor(actualStringLength / 2);

    // --- Type III Update: Use `substring` for clarity in segment extraction ---
    // Extract the initial segment of the string from the beginning up to the division point.
    const initialSegment = stringDataForAnalysis.substring(0, divisionIndex);

    // Extract the latter segment of the string. The starting point for this
    // segment is calculated to ensure it mirrors the length of the initial segment,
    // effectively skipping any middle character in odd-length strings.
    // Example: "abcde" (length 5), divisionIndex 2.
    // Latter segment starts at (5 - 2) = 3. `substring(3)` yields "de".
    const finalSegment = stringDataForAnalysis.substring(actualStringLength - divisionIndex);

    // --- Type III Update: Expanded conditional logic for result determination ---
    // Compare the two extracted segments. If they are identical, output 'Yes', otherwise 'No'.
    if (initialSegment === finalSegment) {
        deliverResult('Yes');
    } else {
        deliverResult('No');
    }

    // --- Type III Deletion (Implicit): The 'theoreticalStringLength' variable,
    // although read, is not directly used in the string splitting or comparison logic.
    // Its presence is retained to mimic the input reading pattern, but its
    // functional impact on the core algorithm has been removed by relying
    // on `actualStringLength` and `substring` operations.
}