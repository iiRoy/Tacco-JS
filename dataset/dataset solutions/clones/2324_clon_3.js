'use strict'; // Enforces strict mode for cleaner, safer code execution.

/**
 * Orchestrates the processing of raw input data to interleave two string sequences.
 * This function expects a specific input structure:
 * - The first line must contain a positive integer, indicating the anticipated length of the strings.
 * - The second line must contain two space-separated string segments, both of which
 *   are expected to match the length specified on the first line.
 *
 * @param {string} rawInputContent The complete string content read from the input source (e.g., standard input).
 * @returns {void} The function prints the resulting interleaved string to the standard output.
 * @throws {Error} Throws an error if the input format is incorrect, incomplete, or inconsistent.
 */
const processInputData = (rawInputContent) => {
    try {
        // Step 1: Divide the incoming raw data into an array of distinct lines.
        // This operation splits the entire input string wherever a newline character is found.
        const separatedLines = rawInputContent.split('\n');

        // Input integrity check: Verify that the minimum required number of lines are present.
        if (separatedLines.length < 2) {
            throw new Error("Input data is incomplete. Expected at least two lines for processing.");
        }

        // Step 2: Extract and convert the numeric value from the first line, which dictates iteration count.
        // The first line's content is trimmed to remove any incidental whitespace before parsing.
        const loopCountRawString = separatedLines[0].trim();
        const designatedLoopIterations = parseInt(loopCountRawString, 10);

        // Validation for the parsed iteration count: It must be a valid, positive integer.
        if (isNaN(designatedLoopIterations) || designatedLoopIterations <= 0) {
            throw new Error(`Invalid or non-positive iteration count provided: "${loopCountRawString}". A positive integer is required.`);
        }

        // Step 3: Isolate and prepare the string segments from the second line of input.
        // The second line is expected to contain two strings, delimited by a single space.
        const textualSegments = separatedLines[1].split(' ');

        // Validation for the number of string segments: Exactly two segments are anticipated.
        if (textualSegments.length !== 2) {
            throw new Error(`Unexpected number of string segments on the second line. Found ${textualSegments.length}, but 2 were expected.`);
        }

        const primaryStringComponent = textualSegments[0];
        const secondaryStringComponent = textualSegments[1];

        // Critical consistency check: Ensure both string components' lengths align with the designated iteration count.
        if (primaryStringComponent.length !== designatedLoopIterations || secondaryStringComponent.length !== designatedLoopIterations) {
            throw new Error(`Mismatched string lengths. Primary length (${primaryStringComponent.length}) or secondary length (${secondaryStringComponent.length}) does not match the designated iteration count (${designatedLoopIterations}).`);
        }

        // Step 4: Initialize a buffer (array) to construct the interleaved output string efficiently.
        // Using an array and then joining is often more performant than repeated string concatenation.
        const combinedCharactersBuffer = [];
        // Pre-allocate array size for potential micro-optimization, knowing the final length.
        combinedCharactersBuffer.length = designatedLoopIterations * 2;

        // Step 5: Traverse through the string components and construct the interleaved output.
        // The loop's boundary is strictly defined by the 'designatedLoopIterations' value.
        for (let currentElementPosition = 0; currentElementPosition < designatedLoopIterations; currentElementPosition++) {
            // Access characters from both strings using direct bracket notation, which is concise.
            const characterFromPrimary = primaryStringComponent[currentElementPosition];
            const characterFromSecondary = secondaryStringComponent[currentElementPosition];

            // Place the characters into the buffer in an alternating sequence.
            // Direct index assignment is used here to fill the pre-allocated array.
            combinedCharactersBuffer[currentElementPosition * 2] = characterFromPrimary;
            combinedCharactersBuffer[currentElementPosition * 2 + 1] = characterFromSecondary;
        }

        // Step 6: Consolidate the buffered characters into a single string and output it.
        const finalInterwovenOutput = combinedCharactersBuffer.join('');
        console.log(finalInterwovenOutput);

    } catch (processingIssue) {
        // Robust error handling: Log any issues encountered during the input processing.
        // In a production environment, one might also exit the process with an error code.
        console.error(`An operational error transpired: ${processingIssue.message}`);
        // process.exit(1); // Uncomment to exit with an error code.
    }
};

// Application entry point: Reads input from standard input stream and initiates processing.
// This line assumes a typical Unix-like environment where /dev/stdin represents standard input.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));