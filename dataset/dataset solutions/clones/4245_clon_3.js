"use strict"; // Enforce strict mode for cleaner code and best practices.

// --- Global Configuration and Constants ---
// Define the standard input path and encoding for consistent access.
const SYSTEM_INPUT_PATH = "/dev/stdin";
const FILE_ENCODING_TYPE = "utf8";

// --- Input Handling Module ---
// This immediate-invoked function expression (IIFE) creates a self-contained
// module for processing input tokens, enhancing encapsulation.
const InputParserUtility = (function() {
    let tokenSequence = []; // Stores all parsed string tokens from the input.
    let currentTokenPosition = 0; // Tracks the current index in the tokenSequence.

    /**
     * Initializes the input parser by reading data from the specified source
     * and splitting it into individual tokens.
     * @param {string} sourceFile - The path to the input file (e.g., /dev/stdin).
     * @param {string} encoding - The character encoding of the input file.
     */
    function setupInputSource(sourceFile, encoding) {
        try {
            // Dynamically require the 'fs' module, as it's Node.js specific.
            const fileSystem = require("fs");
            const rawDataString = fileSystem.readFileSync(sourceFile, encoding);

            // Split the raw string by any sequence of whitespace characters (spaces, newlines, tabs)
            // and then filter out any empty strings that might result from multiple delimiters.
            tokenSequence = rawDataString.split(/\s+/).filter(segment => segment.length > 0);
            currentTokenPosition = 0; // Reset position for new input.
        } catch (errorDetails) {
            // Log an error if input reading fails, preventing program crash.
            console.error("Failed to initialize input stream:", errorDetails.message);
            tokenSequence = []; // Ensure an empty state on error.
        }
    }

    /**
     * Retrieves the next available token from the sequence and advances the internal pointer.
     * @returns {string | undefined} The next token as a string, or `undefined` if no more tokens.
     */
    function fetchNextToken() {
        if (currentTokenPosition >= tokenSequence.length) {
            // If we've exhausted the tokens, return undefined to signal end-of-input.
            return undefined;
        }
        return tokenSequence[currentTokenPosition++];
    }

    /**
     * Reads the next token and attempts to convert it into a standard JavaScript number.
     * @returns {number} The parsed number. Returns `NaN` if the token is not a valid number.
     */
    function extractNumericValue() {
        const tokenValue = fetchNextToken();
        return tokenValue !== undefined ? Number(tokenValue) : NaN;
    }

    /**
     * Reads the next token directly as a string.
     * @returns {string | undefined} The next token as a string.
     */
    function extractStringValue() {
        return fetchNextToken();
    }

    /**
     * Reads the next token and attempts to convert it into a BigInt.
     * This is useful for very large integer values beyond standard number precision.
     * @returns {BigInt} The parsed BigInt. Throws an error if input is exhausted or invalid for BigInt.
     */
    function extractBigIntValue() {
        const tokenValue = fetchNextToken();
        if (tokenValue === undefined) {
            throw new Error("Attempted to read BigInt beyond the available input tokens.");
        }
        return BigInt(tokenValue);
    }

    /**
     * Reads a specified quantity of tokens and compiles them into an array.
     * Optionally, these tokens can be converted to numbers.
     * @param {number} quantity - The number of tokens to read. Must be non-negative.
     * @param {boolean} [returnAsStrings=false] - If true, tokens are returned as strings;
     *                                             otherwise, they are converted to numbers.
     * @returns {Array<string|number>} An array containing the read tokens.
     */
    function readArrayOfTokens(quantity, returnAsStrings = false) {
        if (quantity <= 0) {
            return []; // Return an empty array for invalid quantities.
        }
        const collectedItems = [];
        for (let k = 0; k < quantity; k++) {
            const token = fetchNextToken();
            if (token === undefined) {
                // Issue a warning if the expected number of tokens is not met.
                console.warn(`Warning: Expected ${quantity} tokens, but only found ${k} before end of input.`);
                break; // Stop collecting if input runs out.
            }
            collectedItems.push(returnAsStrings ? token : Number(token));
        }
        return collectedItems;
    }

    // The original `nextm` (matrix reading) and `xArray` (N-dim array creation) functions
    // were not utilized by the main algorithm. In line with Type III clone requirements
    // (deletion of non-essential fragments), they are omitted for a cleaner and more focused clone.

    return {
        setupInputSource,
        extractNumericValue,
        extractStringValue,
        extractBigIntValue,
        readArrayOfTokens,
        // Helper to check if there are more tokens available.
        hasRemainingTokens: () => currentTokenPosition < tokenSequence.length
    };
})();

// Initialize the input processing system immediately.
InputParserUtility.setupInputSource(SYSTEM_INPUT_PATH, FILE_ENCODING_TYPE);

/**
 * Implements the core business logic of the program.
 * This function processes an array of numbers based on a specific algorithm
 * involving divisors and conditional zeroing of elements.
 * @returns {number | undefined} The final calculated sum of array elements,
 *                               or `undefined` if processing failed due to invalid input.
 */
function executePrimaryAlgorithm() {
    // Read the primary dimension (N) for our data collection.
    const collectionSize = InputParserUtility.extractNumericValue();

    // Basic validation for the input size.
    if (isNaN(collectionSize) || collectionSize < 1) {
        console.error("Error: Invalid or non-positive collection size provided. Aborting.");
        return undefined; // Indicate an unrecoverable error.
    }

    // Read the actual data elements into a temporary array.
    const incomingDataSlice = InputParserUtility.readArrayOfTokens(collectionSize);

    // Verify that the number of elements read matches the expected size.
    if (incomingDataSlice.length !== collectionSize) {
        console.error(`Error: Input mismatch. Expected ${collectionSize} elements but received ${incomingDataSlice.length}.`);
        return undefined;
    }

    // Construct the main mutable data collection.
    // The original logic prepends a '0' at index 0, effectively making it 1-indexed for the algorithm.
    const workingCollection = [0, ...incomingDataSlice];

    // --- Main Processing Loop ---
    // Iterate downwards from the maximum possible divisor (collectionSize) to 1.
    // This loop processes elements based on their divisibility properties.
    for (let currentDivisorCandidate = collectionSize; currentDivisorCandidate >= 1; --currentDivisorCandidate) {
        let temporarySum = 0; // Accumulates the sum of elements that are multiples of `currentDivisorCandidate`.
        let indicesToReset = []; // Stores indices of elements that might need to be set to zero.

        // Inner loop: Traverse through all multiples of `currentDivisorCandidate` within the array bounds.
        for (let multiplePosition = currentDivisorCandidate; multiplePosition <= collectionSize; multiplePosition += currentDivisorCandidate) {
            const elementValue = workingCollection[multiplePosition];

            // Robustness: Ensure the element is a valid number before summing.
            if (typeof elementValue !== 'number' || isNaN(elementValue)) {
                console.warn(`Warning: Non-numeric value encountered at index ${multiplePosition}. Skipping for sum calculation.`);
                continue; // Skip problematic elements to prevent `NaN` propagation.
            }
            temporarySum += elementValue;
            indicesToReset.push(multiplePosition); // Keep track of these indices.
        }

        // Conditional Action: If the accumulated sum for the current divisor is negative,
        // all elements that were part of this sum (i.e., its multiples) are reset to zero.
        if (temporarySum < 0) {
            // Apply the zeroing operation to all collected indices.
            // This is a core transformation step of the algorithm.
            for (const targetIndex of indicesToReset) {
                workingCollection[targetIndex] = 0;
            }
        }
    }

    // --- Final Result Aggregation ---
    let overallFinalSum = 0;
    // Iterate through the modified collection to compute the total sum.
    // Using a 'for...of' loop as an alternative to `Array.prototype.reduce` for diversity.
    for (const itemValue of workingCollection) {
        // Final robustness check before adding to the total.
        if (typeof itemValue === 'number' && !isNaN(itemValue)) {
            overallFinalSum += itemValue;
        } else {
            console.warn(`Warning: Non-numeric or invalid value encountered during final summation: ${itemValue}. Ignoring.`);
        }
    }

    return overallFinalSum;
}

// --- Program Entry Point and Output Management ---
let computedResult;
try {
    // Execute the main algorithm within a try-catch block for error handling.
    computedResult = executePrimaryAlgorithm();
} catch (runtimeError) {
    console.error("An unhandled exception occurred during program execution:", runtimeError.message);
    computedResult = undefined; // Ensure `undefined` if any critical error occurs.
}

// Only display output if a valid, non-undefined result was produced.
if (computedResult !== undefined && computedResult !== null) {
    // Convert the numeric result to a string before printing to console.
    console.log(String(computedResult));
} else {
    // Optionally, log a message if the program completed without a printable result.
    // console.log("Program concluded without generating a valid output for display.");
}