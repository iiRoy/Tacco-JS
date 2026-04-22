// A utility function to create a unique string identifier for cache keys.
// This helps in memoization by mapping coordinates to a string.
const cacheKeyGenerator = (rowCoord, colCoord) => `R${rowCoord}_C${colCoord}`;

// A persistent storage mechanism (Map) to store previously computed results.
// This prevents redundant calculations in the recursive function.
const memoizedResults = new Map();

// The primary modulo constant used for all arithmetic operations.
// This ensures results stay within a specific range, often used in combinatorics or number theory.
const MODULO_CONSTANT = 998244353n;

/**
 * Recursively computes a value based on a 2D grid-like problem structure.
 * This function utilizes memoization to optimize performance for overlapping subproblems.
 *
 * @param {BigInt} startRow - The starting row index.
 * @param {BigInt} startCol - The starting column index.
 * @param {BigInt} endRow - The current/target row index for computation.
 * @param {BigInt} endCol - The current/target column index for computation.
 * @returns {BigInt} The computed value modulo MODULO_CONSTANT.
 */
const computeGridValue = (startRow, startCol, endRow, endCol) => {
    // Construct a unique key for the current state (endRow, endCol) to check the cache.
    const currentLookupKey = cacheKeyGenerator(endRow, endCol);

    // If the result for these coordinates has already been computed and stored, return it directly.
    if (memoizedResults.has(currentLookupKey)) {
        return memoizedResults.get(currentLookupKey);
    }

    let calculatedValue; // Variable to hold the result of the current computation.

    // Check for base cases where the computation simplifies.
    // Case 1: If the starting and ending row indices are the same.
    if (startRow === endRow) {
        // The formula for this specific base case.
        calculatedValue = (startRow ** (endCol - startCol)) % MODULO_CONSTANT;
    }
    // Case 2: If the starting and ending column indices are the same.
    else if (startCol === endCol) {
        // The formula for this specific base case.
        calculatedValue = (startCol ** (endRow - startRow)) % MODULO_CONSTANT;
    }
    // Recursive Case: If neither base case is met, break down the problem into smaller subproblems.
    else {
        // Calculate the value for the subproblem (endRow - 1, endCol).
        const valFromRowDecrement = computeGridValue(startRow, startCol, endRow - 1n, endCol);
        // Calculate the value for the subproblem (endRow, endCol - 1).
        const valFromColDecrement = computeGridValue(startRow, startCol, endRow, endCol - 1n);
        // Calculate the value for the subproblem (endRow - 1, endCol - 1).
        const valFromBothDecrement = computeGridValue(startRow, startCol, endRow - 1n, endCol - 1n);

        // Apply the complex recursive formula.
        // Ensure all intermediate products and sums are also modulo MODULO_CONSTANT.
        // The `+ MODULO_CONSTANT` before the final modulo helps ensure a positive result
        // if intermediate subtractions lead to a negative number.
        let term1 = (valFromRowDecrement * endCol) % MODULO_CONSTANT;
        let term2 = (valFromColDecrement * endRow) % MODULO_CONSTANT;
        let term3 = (valFromBothDecrement * (endRow - 1n) * (endCol - 1n)) % MODULO_CONSTANT;

        // Combine terms and apply final modulo.
        calculatedValue = (term1 + term2 - term3);
        calculatedValue = (calculatedValue % MODULO_CONSTANT + MODULO_CONSTANT) % MODULO_CONSTANT;
    }

    // Store the newly computed result in the cache before returning it.
    memoizedResults.set(currentLookupKey, calculatedValue);
    return calculatedValue;
};

/**
 * Orchestrates the reading of input, parsing parameters, solving the problem,
 * and displaying the final result. This serves as the entry point of the program.
 *
 * @param {string} rawInputContent - The raw string content read from the input source.
 */
const processAndDisplayResult = (rawInputContent) => {
    // Split the entire input content by newline characters to get individual lines.
    const inputLines = rawInputContent.split("\n");

    // Basic validation: Ensure there's at least one line of input.
    if (inputLines.length === 0 || inputLines[0].trim() === "") {
        console.error("Error: No valid input provided.");
        return;
    }

    // Extract the first line, which contains the four parameters.
    const paramStrings = inputLines[0].split(" ");

    // More robust validation: Ensure exactly four parameters are provided.
    if (paramStrings.length !== 4) {
        console.error("Error: Expected exactly four parameters, but received " + paramStrings.length);
        return;
    }

    // Parse the string parameters into BigInts.
    // Assign them to descriptive variables for clarity.
    const initialRow = BigInt(paramStrings[0]);
    const initialCol = BigInt(paramStrings[1]);
    const targetRow = BigInt(paramStrings[2]);
    const targetCol = BigInt(paramStrings[3]);

    // Perform a quick validation on the input ranges if needed (e.g., non-negative).
    // This is an added guard for robustness, assuming inputs are usually positive in such problems.
    if (initialRow < 0 || initialCol < 0 || targetRow < 0 || targetCol < 0) {
        console.error("Error: Input parameters must be non-negative.");
        return;
    }
    // Also, ensure target coordinates are not less than initial coordinates.
    // This implicitly handles cases where r1 > r2 or c1 > c2 which would be invalid for the problem's interpretation.
    if (initialRow > targetRow || initialCol > targetCol) {
        console.error("Error: Target coordinates must be greater than or equal to initial coordinates.");
        return;
    }


    // Call the core computation function with the parsed BigInt parameters.
    const finalComputedValue = computeGridValue(initialRow, initialCol, targetRow, targetCol);

    // Output the final result to the console, converting the BigInt back to a standard Number
    // as per the original requirement for console output.
    console.log(Number(finalComputedValue));
};

// Entry point for execution: Read input from standard input and pass it to the main processing function.
try {
    const fileSystemModule = require("fs");
    const inputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    processAndDisplayResult(inputBuffer);
} catch (error) {
    console.error("An error occurred during file reading or processing:", error.message);
    // Exit with a non-zero code to indicate an error, if running in a script environment.
    // process.exit(1); // Uncomment if strict error handling exit is desired.
}