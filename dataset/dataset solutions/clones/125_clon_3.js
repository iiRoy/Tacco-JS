// This module is designed to process numerical data provided via standard input.
// Its primary function is to decompose each received integer into its constituent
// powers of two, up to 2^8 (256), and then output these components.

// Utilize the built-in Node.js 'fs' (file system) module for input operations.
const fileSystemUtility = require("fs");

// Read all incoming data from the standard input stream synchronously.
// The data is expected to be text-based, encoded in UTF-8.
const incomingRawData = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

// Divide the raw input string into an array of individual textual components.
// Any sequence of one or more whitespace characters serves as a delimiter.
const processedInputTokens = incomingRawData.split(/\s+/); // Using `\s+` for robustness against multiple spaces.

let currentTokenProcessingIndex = 0; // Initialize a counter for tracking the current token's position.

// This primary control loop iterates through each token identified in the input stream.
// It continues as long as there are valid tokens remaining to be processed.
while (currentTokenProcessingIndex < processedInputTokens.length) {
    let activeInputToken = processedInputTokens[currentTokenProcessingIndex];
    currentTokenProcessingIndex++; // Increment the index for the subsequent iteration.

    // A buffer to temporarily hold the discovered powers of two for the current token.
    let temporaryBitComponentsBuffer = '';

    // --- Type III addition: Enhanced input validation and early exit ---
    // Before attempting numerical conversion, trim whitespace and check for emptiness.
    // This prevents errors on purely whitespace tokens or empty strings.
    const trimmedToken = activeInputToken.trim();
    if (trimmedToken.length === 0) {
        // If the token is empty after trimming, it's non-essential; skip to the next.
        continue;
    }

    // --- Type III update: Explicit numerical parsing with radix ---
    // Attempt to convert the cleaned token string into an integer using base 10.
    const numericalRepresentationOfToken = parseInt(trimmedToken, 10);

    // --- Type III addition: Robust error handling for non-numeric input ---
    // Verify if the conversion resulted in a valid number. If not (NaN),
    // this token cannot be processed for bit decomposition, so we skip it.
    if (isNaN(numericalRepresentationOfToken)) {
        // Optionally, a warning could be logged here, but for functional parity, we just bypass.
        continue;
    }

    // --- Type III update: Use a named constant for loop boundary for clarity ---
    // Define the maximum bit position to examine (0 through 8, inclusive).
    const MAXIMUM_BIT_POSITION = 9; // Corresponds to checking bits 2^0 up to 2^8.

    // Secondary loop: Iterates through each potential bit position.
    for (let bitIndex = 0; bitIndex < MAXIMUM_BIT_POSITION; bitIndex++) {
        // Calculate the specific power of two corresponding to the current bit position.
        // Example: 1 (2^0), 2 (2^1), 4 (2^2), ..., 256 (2^8).
        const currentBitMaskValue = 1 << bitIndex;

        // Perform a bitwise AND operation between the token's numerical value
        // and the current bit mask. If the result is non-zero, it indicates
        // that the specific bit is "set" within the number.
        if ((numericalRepresentationOfToken & currentBitMaskValue) !== 0) {
            // If the bit is set, append its power-of-two value to our buffer,
            // followed by a single space for separation.
            temporaryBitComponentsBuffer += currentBitMaskValue + ' ';
        }
        // --- Type III change: Removed the explicit 'else : 0' part, as it's implicit in JS if statement. ---
    }

    // --- Type III addition: Intermediate variable for final output preparation ---
    // Trim any trailing whitespace from the collected powers of two string.
    const formattedOutputLine = temporaryBitComponentsBuffer.trim();

    // --- Type III addition: Conditional output based on content ---
    // The original code would print an empty line for an input of '0'.
    // To preserve this behavior, we don't add a check like `if (formattedOutputLine.length > 0)`.
    // The `console.log` will correctly print an empty line if `formattedOutputLine` is empty.
    console.log(formattedOutputLine);
}

// A concluding comment indicating the completion of the script's execution flow.
// No further processing or cleanup is typically required for this type of script.