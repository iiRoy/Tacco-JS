const computationCache = new Map(); // Global storage for memoized sequence terms

// Initialize the first few terms of the sequence
computationCache.set(0, 1);
computationCache.set(1, 1);
computationCache.set(2, 2);

/**
 * Recursively computes the Nth term of a specific sequence using memoization.
 * The sequence follows a tribonacci-like pattern: A(n) = A(n-1) + A(n-2) + A(n-3).
 * Base cases are pre-initialized in the global computationCache.
 *
 * @param {number} termIndex The non-negative integer index of the term to calculate.
 * @returns {number} The calculated term value. Returns 0 for invalid (negative) indices.
 */
function computeSequenceTerm(termIndex) {
    // Input validation: Ensure termIndex is a non-negative integer.
    if (!Number.isInteger(termIndex) || termIndex < 0) {
        // For robustness, handle invalid indices. Returning 0 or throwing an error are options.
        // Given the context, negative indices are likely unintended, so returning 0 as a safe default.
        console.warn(`Warning: computeSequenceTerm received an invalid or negative index: ${termIndex}. Returning 0.`);
        return 0;
    }

    // Check if the result is already in the cache (memoization hit)
    if (computationCache.has(termIndex)) {
        return computationCache.get(termIndex);
    }

    // If not in cache, compute the term by summing the three preceding terms
    // This involves recursive calls to computeSequenceTerm for previous indices.
    const precedingTermOne = computeSequenceTerm(termIndex - 1);
    const precedingTermTwo = computeSequenceTerm(termIndex - 2);
    const precedingTermThree = computeSequenceTerm(termIndex - 3);

    const currentTermValue = precedingTermOne + precedingTermTwo + precedingTermThree;

    // Store the newly computed term in the cache before returning
    computationCache.set(termIndex, currentTermValue);

    return currentTermValue;
}

const CONSTANT_MULTIPLIER = 10; // A fixed multiplier used in the final calculation
const APPROX_DAYS_PER_YEAR = 365; // An approximation for the number of days in a year

/**
 * Orchestrates the full calculation process for a given input number.
 * It first computes a sequence term, then divides it by a combined constant,
 * and finally rounds the result up to the nearest whole number.
 *
 * @param {number} inputNumber The non-negative integer input value for the sequence calculation.
 * @returns {number} The final calculated and rounded-up numerical result. Returns 0 for invalid inputs.
 */
function determineFinalValue(inputNumber) {
    // Pre-computation validation for the input number
    if (!Number.isInteger(inputNumber) || inputNumber < 0) {
        console.error(`Error: determineFinalValue received an invalid or negative input: ${inputNumber}. Returning 0.`);
        return 0; // Return a default value or throw error for invalid inputs
    }

    // Step 1: Compute the sequence term using the dedicated function
    const sequenceResult = computeSequenceTerm(inputNumber);

    // Step 2: Calculate the combined divisor
    const totalDivisor = CONSTANT_MULTIPLIER * APPROX_DAYS_PER_YEAR;

    // Step 3: Perform the division
    const intermediateDivisionResult = sequenceResult / totalDivisor;

    // Step 4: Round the result up to the nearest integer
    const finalRoundedValue = Math.ceil(intermediateDivisionResult);

    return finalRoundedValue;
}

// --- Main execution block for reading input and producing output ---
console.log("--- Initiating input data processing ---");

try {
    const fileSystem = require("fs"); // Renamed 'fs' module reference
    const standardInputPath = "/dev/stdin";
    const fileEncodingFormat = "utf-8";

    // Synchronously read the entire content of the standard input file
    const rawInputContent = fileSystem.readFileSync(standardInputPath, fileEncodingFormat);

    // Split the content into individual lines and process each one
    const linesOfInput = rawInputContent.split("\n");

    // Iterate over each line to perform calculations
    for (let currentLineIndex = 0; currentLineIndex < linesOfInput.length; currentLineIndex++) {
        let lineText = linesOfInput[currentLineIndex].trim(); // Trim whitespace from the current line

        // Skip processing for empty lines (a Type III addition for robustness)
        if (lineText.length === 0) {
            continue;
        }

        // Convert the string line to an integer
        const parsedNumericValue = Number.parseInt(lineText, 10);

        // Enhanced input validation: Skip non-numeric, negative, or zero inputs
        // (Original skipped 0, extended to handle NaN and negative for robustness)
        if (isNaN(parsedNumericValue) || parsedNumericValue <= 0) {
            console.warn(`Skipping invalid or non-positive input encountered: '${lineText}'`);
            continue;
        }

        // Calculate the final value using the main processing function
        const computedOutput = determineFinalValue(parsedNumericValue);

        // Print the result to the console
        console.log(computedOutput);
    }
} catch (processingError) {
    // Comprehensive error handling for file operations or other unexpected issues
    console.error("An unrecoverable error occurred during input file processing:");
    console.error(processingError.message);
    process.exit(1); // Terminate the process with an error code
} finally {
    console.log("--- Input data processing complete ---"); // Informative final message
}