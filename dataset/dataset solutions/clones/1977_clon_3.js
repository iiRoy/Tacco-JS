"use strict"; // Enforce strict parsing and execution rules for improved code quality and error handling

// --- Input Stream Management Module ---
// This section is responsible for reading data from standard input and tokenizing it.

// Obtain the raw content from the standard input stream as a UTF-8 encoded string.
const rawInputContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw content: split it into individual tokens using any sequence of whitespace characters
// as delimiters. The 'filter(Boolean)' step ensures that any empty strings resulting from the split
// (e.g., from multiple consecutive spaces or leading/trailing whitespace) are removed.
let availableTokens = rawInputContent.split(/\s+/).filter(Boolean);

// Initialize a cursor to keep track of the current position within the token array.
// This allows sequential access to input tokens.
let currentTokenPointer = 0;

/**
 * Retrieves a specified number of tokens from the global input stream.
 *
 * @param {number} countOfTokens - The exact number of tokens to extract.
 * @param {boolean} convertToNumbers - If true, each token is explicitly converted to a number.
 *                                     Otherwise, tokens are returned as strings.
 * @returns {(string|number)[]} An array containing the requested tokens, either as strings or numbers.
 */
function fetchInputTokenArray(countOfTokens, convertToNumbers) {
    const extractedValues = []; // Initialize an array to store the fetched tokens.

    // Loop to retrieve the desired number of tokens.
    for (let i = 0; i < countOfTokens; i++) {
        // Guard against attempting to read beyond the available tokens.
        if (currentTokenPointer >= availableTokens.length) {
            // In competitive programming, input format is usually guaranteed.
            // For robust applications, one might throw an error or pad with default values here.
            break; // Exit the loop if no more tokens are available.
        }

        const tokenString = availableTokens[currentTokenPointer++]; // Get the current token and advance the pointer.

        // Conditionally convert the token to a number or keep it as a string.
        extractedValues.push(convertToNumbers ? Number(tokenString) : tokenString);
    }
    return extractedValues;
}

// --- Application Core Logic Execution ---
// This is the entry point for running the main business logic of the program.

// Execute the primary function that contains the application's core algorithm.
const executionOutcome = runMainApplicationLogic();

// After the core logic completes, check if there's a result to display.
// If the outcome is neither null nor undefined, print it to standard output,
// ensuring it's treated as a string and followed by a newline.
if (executionOutcome !== null && typeof executionOutcome !== 'undefined') {
    process.stdout.write(String(executionOutcome) + '\n');
}

/**
 * Contains the primary logic for this application.
 * It reads a specific set of input values, performs a conditional check,
 * and produces a string response.
 *
 * @returns {string} "Yes" if any of the first three numeric inputs is exactly 7; otherwise, "No".
 *                   Returns an error message if insufficient input is provided.
 */
function runMainApplicationLogic() {
    // The problem requires checking three specific numbers.
    // Fetch an array of three numeric values from the input stream.
    const numericalDataSet = fetchInputTokenArray(3, true); // true ensures conversion to numbers.

    // --- Robustness Check: Validate Input Quantity ---
    // It's crucial to ensure that the expected number of inputs was actually received.
    if (numericalDataSet.length < 3) {
        // If fewer than three numbers were provided, this indicates an input error.
        // In a real-world scenario, this might log an error or throw an exception.
        return "ERROR: Insufficient numeric inputs provided. Expected 3, received " + numericalDataSet.length + ".";
    }

    // --- Core Decision Logic: Check for '7' Presence ---
    let hasSevenBeenDetected = false; // Flag to indicate if the value 7 is found among the inputs.

    // Iterate through each number in our collected data set.
    // The 'for...of' loop is a modern and clean way to iterate over array elements.
    for (const currentNumber of numericalDataSet) {
        // For absolute robustness, verify the type before comparison, although `fetchInputTokenArray`
        // with `convertToNumbers=true` should already ensure numeric types.
        if (typeof currentNumber === 'number' && currentNumber === 7) {
            hasSevenBeenDetected = true; // Set the flag if 7 is found.
            break; // Optimization: Once 7 is found, no need to check the remaining numbers.
        }
    }

    // Based on the detection flag, construct the appropriate response string.
    const finalVerdict = hasSevenBeenDetected ? "Yes" : "No";
    return finalVerdict;
}