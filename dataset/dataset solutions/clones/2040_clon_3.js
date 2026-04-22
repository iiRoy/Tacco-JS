// Define a constant for the standard input file path, enhancing readability and maintainability.
const STANDARD_INPUT_SOURCE = "/dev/stdin";

// Reference to the Node.js file system module for input operations.
const fileSystemUtility = require("fs");

// Global array to store all input lines read from the source.
let inputDataLines = [];
// Index to track the current line being processed, ensuring sequential access.
let currentLineIndex = 0;

// --- Input Parsing Utility Functions ---

/**
 * Retrieves the next line from the globally managed input data array
 * and increments the line pointer for subsequent reads.
 * Includes a basic check to prevent reading beyond available input.
 * @returns {string} The next line of input as a string.
 */
const fetchNextLine = () => {
    // Guard clause: If the index exceeds the array bounds, it indicates an attempt
    // to read more lines than available. In a robust system, this might throw.
    if (currentLineIndex >= inputDataLines.length) {
        console.error("Runtime Error: Attempted to read beyond the end of input data.");
        return ""; // Return an empty string or handle error appropriately.
    }
    // Return the current line and then advance the index.
    return inputDataLines[currentLineIndex++];
};

/**
 * Converts the next line of input into a numerical value using `Number()`.
 * This function is not used in the current problem's core logic but is a common utility.
 * @returns {number} The parsed number.
 */
const convertLineToNumber = () => Number(fetchNextLine());

/**
 * Splits the next line of input by spaces and filters out any empty string parts
 * that might result from multiple spaces or leading/trailing spaces.
 * @returns {string[]} An array of non-empty string tokens.
 */
const splitLineIntoStrings = () => fetchNextLine().split(' ').filter(token => token !== '');

/**
 * Reads the next line, splits it into string tokens, and then maps each token
 * to a numerical value using `Number()`. This is crucial for obtaining numerical inputs.
 * @returns {number[]} An array of parsed numerical values.
 */
const splitLineIntoNumbers = () => splitLineIntoStrings().map(Number);

// The original `b()` and `ba()` (BigInt related) utility functions have been removed
// as they were not utilized by the core logic and are non-essential for this problem.

// --- Core Calculation Helper Function ---

/**
 * Calculates the number of unique pairs (combinations of 2) that can be formed
 * from a given set of `setSize` items. This is equivalent to "n choose 2".
 * Formula: `n * (n - 1) / 2`.
 * Includes robust checks for non-positive or insufficient set sizes.
 * @param {number} setSize The total number of items available in the set.
 * @returns {number} The count of unique pairs. Returns 0 for invalid inputs.
 */
const calculatePairCombinations = (setSize) => {
    // Type III addition: Guard clauses for invalid or insufficient input values.
    // Combinations of 2 are undefined or 0 for sets with fewer than 2 items.
    if (typeof setSize !== 'number' || isNaN(setSize) || setSize < 2) {
        return 0;
    }

    // Type III addition: Introduce intermediate variables for clarity.
    const productOfConsecutiveIntegers = setSize * (setSize - 1);
    const divisorForPairs = 2; // Named constant for the divisor.

    // Rewriting the calculation slightly for structural variation.
    return productOfConsecutiveIntegers / divisorForPairs;
};

// --- Main Program Logic ---

/**
 * Serves as the primary function to process the problem's specific input
 * and compute the final aggregate result. It orchestrates input parsing
 * and applies the core combinatorial logic.
 * @returns {number} The final computed sum of combinations. Returns 0 on input error.
 */
function computeResult() {
    // Read the first line of input, which is expected to contain two numerical values.
    const rawInputValues = splitLineIntoNumbers();

    // Type III addition: Robust input validation.
    // Check if the expected number of values was actually provided.
    if (rawInputValues.length < 2) {
        console.error("Input Processing Error: Expected at least two numerical values on the first line.");
        return 0; // Return a default value or signal an error condition.
    }

    // Extract the two primary quantities from the parsed input.
    const firstQuantity = rawInputValues[0];
    const secondQuantity = rawInputValues[1];

    // Type III addition: Further validation for the extracted quantities.
    // Ensure they are valid non-negative numbers before proceeding with calculations.
    if (typeof firstQuantity !== 'number' || isNaN(firstQuantity) || firstQuantity < 0 ||
        typeof secondQuantity !== 'number' || isNaN(secondQuantity) || secondQuantity < 0) {
        console.error("Input Validation Error: Both quantities must be non-negative numerical values.");
        return 0;
    }

    // Type III addition: Introduce intermediate steps and helper function usage.
    // Calculate the number of pairs for the first set.
    const combinationsFromFirstSet = calculatePairCombinations(firstQuantity);
    // Calculate the number of pairs for the second set.
    const combinationsFromSecondSet = calculatePairCombinations(secondQuantity);

    // Sum the individual contributions to arrive at the overall final outcome.
    const finalOutcome = combinationsFromFirstSet + combinationsFromSecondSet;

    return finalOutcome;
}

// --- Program Execution Entry Point ---

/**
 * This function orchestrates the entire program flow, from reading raw input
 * to executing the main computation and printing the final output.
 * It encapsulates error handling for file operations.
 */
const orchestrateExecution = () => {
    try {
        // Read the entire content of the standard input file.
        // Convert the raw buffer to a UTF-8 string, remove surrounding whitespace,
        // and then split the string into an array of individual lines.
        const rawInputString = fileSystemUtility.readFileSync(STANDARD_INPUT_SOURCE, "utf8");
        inputDataLines = rawInputString.trim().split("\n");

        // Type III addition: Validate if any meaningful input lines were read.
        if (inputDataLines.length === 0 || (inputDataLines.length === 1 && inputDataLines[0] === '')) {
            console.error("Execution Aborted: No valid input data was found in the source.");
            return;
        }

        // Execute the main computation logic to get the result.
        const programOutput = computeResult();

        // Display the final computed result to the standard output.
        console.log(programOutput);

    } catch (processingError) {
        // Type III addition: Generic error handling for file reading or other unexpected issues.
        console.error("An unhandled exception occurred during program execution:", processingError.message);
        // For debugging, the full stack trace could be logged:
        // console.error(processingError.stack);
    }
};

// Initiate the program execution by calling the orchestration function.
orchestrateExecution();