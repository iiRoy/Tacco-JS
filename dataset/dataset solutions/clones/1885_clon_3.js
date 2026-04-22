"use strict";

// This script is designed to process a sequence of parenthesis strings
// to determine if they can be concatenated in a specific order to form a
// globally balanced parenthesis sequence.

// --- Core Module Imports and Input Configuration ---
// Import Node.js File System module for reading input.
const fileSystemUtility = require("fs");
// Define the standard input stream path.
const standardInputPath = "/dev/stdin";

// --- Global Input Tokenization and Cursor Management ---
// Read the entire input file, decode it as UTF-8, and split it into an array of tokens.
// Tokens are delimited by either spaces or newline characters.
const inputTokenBuffer = fileSystemUtility.readFileSync(standardInputPath, "utf8").split(/ |\n/);
// Initialize a pointer to keep track of the current position within the token buffer.
let currentTokenPointer = 0;

// --- Input Parsing Helper Functions ---

/**
 * Retrieves the next available token from the global input buffer.
 * Advances the token pointer after retrieval.
 * @param {boolean} [asRawString=false] - If true, the token is returned as a string.
 *                                        Otherwise, it attempts to convert the token to a number.
 * @returns {string|number} The retrieved token, either as a string or a parsed number.
 * @throws {Error} If an attempt is made to read beyond the end of the input buffer.
 */
function retrieveNextInputToken(asRawString = false) {
    // Implement a safeguard against reading past the end of the input.
    if (currentTokenPointer >= inputTokenBuffer.length) {
        throw new Error("Input buffer exhausted. No more tokens available.");
    }
    const tokenValue = inputTokenBuffer[currentTokenPointer++];
    return asRawString ? tokenValue : Number(tokenValue);
}

/**
 * Fetches a specified quantity of tokens from the input buffer.
 * @param {number} quantity - The total number of tokens to fetch.
 * @param {boolean} [returnStrings=false] - If true, all tokens in the array will be strings.
 *                                          Otherwise, they will be numbers.
 * @returns {(string|number)[]} An array containing the requested tokens.
 */
function fetchMultipleInputTokens(quantity, returnStrings = false) {
    const collectedValues = [];
    for (let i = 0; i < quantity; i++) {
        collectedValues.push(retrieveNextInputToken(returnStrings));
    }
    return collectedValues;
}

/**
 * Acquires a 2D matrix of data from the input stream.
 * This function is retained for structural completeness, though not directly used in the main logic for this problem.
 * @param {number} matrixRows - The number of rows for the matrix.
 * @param {number} matrixCols - The number of columns per row.
 * @param {boolean} [preserveStrings=false] - If true, matrix elements remain strings; otherwise, they are numbers.
 * @returns {(string|number)[][]} A two-dimensional array representing the matrix.
 */
function acquireMatrixData(matrixRows, matrixCols, preserveStrings = false) {
    const generatedMatrix = [];
    for (let rowIndex = 0; rowIndex < matrixRows; rowIndex++) {
        const currentRow = [];
        for (let colIndex = 0; colIndex < matrixCols; colIndex++) {
            currentRow.push(retrieveNextInputToken(preserveStrings));
        }
        generatedMatrix.push(currentRow);
    }
    return generatedMatrix;
}

// --- Specialized Helper for Parenthesis String Analysis ---

/**
 * Analyzes a single string to determine its parenthesis balance characteristics.
 * It calculates the final balance (net '(' minus ')') and the lowest point the balance reached.
 * @param {string} targetString - The parenthesis string to be analyzed.
 * @returns {{netBalance: number, deepestDeficit: number}} An object containing the final balance and the minimum balance encountered (deepest deficit).
 */
function analyzeParenthesisString(targetString) {
    let currentRunningBalance = 0;
    let minBalanceAchieved = 0; // Tracks the lowest balance value throughout the string.

    // Define constants for parenthesis characters for readability.
    const OPEN_PAREN = '(';
    const CLOSE_PAREN = ')';

    // Iterate through each character of the input string.
    for (const char of targetString) {
        if (char === OPEN_PAREN) {
            currentRunningBalance++;
        } else if (char === CLOSE_PAREN) {
            currentRunningBalance--;
        }
        // Update the minimum balance if the current balance drops lower.
        if (currentRunningBalance < minBalanceAchieved) {
            minBalanceAchieved = currentRunningBalance;
        }
    }
    return { netBalance: currentRunningBalance, deepestDeficit: minBalanceAchieved };
}

// --- Main Program Entry Point and Execution ---

// Declare a variable to store the outcome of the primary logic.
let finalProgramOutcome = null;

// Wrap the main execution in a try-catch block for robust error handling.
try {
    finalProgramOutcome = executeMainProblemSolver();
} catch (executionError) {
    // Log any unexpected errors encountered during the solver's execution.
    console.error("An unhandled exception occurred during problem solving:", executionError.message);
    finalProgramOutcome = "ERROR_STATE"; // Indicate a failure state.
}

// Output the result to standard output, ensuring it's converted to a string and followed by a newline.
// Only print if a meaningful outcome was produced.
if (finalProgramOutcome !== null && finalProgramOutcome !== undefined) {
    process.stdout.write(String(finalProgramOutcome) + "\n");
}

/**
 * Implements the core logic to determine if a collection of parenthesis strings
 * can be arranged to form a single, perfectly balanced sequence.
 * This involves two main phases: initial analysis and subsequent reordering/matching.
 * @returns {string} Returns "Yes" if a balanced sequence can be formed, "No" otherwise.
 */
function executeMainProblemSolver() {
    // Define constant strings for the two possible outcomes.
    const SUCCESS_MESSAGE = "Yes";
    const FAILURE_MESSAGE = "No";

    // Read the total number of parenthesis strings provided in the input.
    const numberOfStrings = retrieveNextInputToken();

    // Edge case: If there are no strings, an empty sequence is considered balanced.
    if (numberOfStrings === 0) {
        return SUCCESS_MESSAGE;
    }

    // This array will store details for strings that end with a net deficit (e.g., ")")
    // or are perfectly balanced (net 0) but might have internal deficits.
    let deficitSegments = [];
    // Accumulates the sum of all strings' net balances. Must be 0 for overall balance.
    let cumulativeBalance = 0;
    // Tracks the number of available open parentheses from strings that end with a surplus.
    let availableOpenPrefixes = 0;

    // --- Phase 1: Initial Processing of Each String ---
    // Iterate through each of the provided parenthesis strings.
    for (let stringIndex = 0; stringIndex < numberOfStrings; stringIndex++) {
        const currentStringBeingProcessed = retrieveNextInputToken(true); // Read string as-is.
        const { netBalance, deepestDeficit } = analyzeParenthesisString(currentStringBeingProcessed);

        cumulativeBalance += netBalance; // Update the total balance.

        if (netBalance > 0) {
            // Strings that end with a net surplus of '(' can act as prefixes.
            availableOpenPrefixes += netBalance;
        } else {
            // Strings that end with a net deficit (or zero) are candidates for `deficitSegments`.
            // We store how many open parentheses they *minimally need* to cover their deepest deficit,
            // and their overall net effect.
            deficitSegments.push({
                minimumRequiredPrefix: -deepestDeficit, // E.g., for "))", deepestDeficit is -2, so minRequiredPrefix is 2.
                finalNetEffect: netBalance              // E.g., for "))", finalNetEffect is -2.
            });
        }
    }

    // Critical check: If the sum of all individual string balances is not zero,
    // it's impossible to form a balanced sequence.
    if (cumulativeBalance !== 0) {
        return FAILURE_MESSAGE;
    }

    // --- Phase 2: Attempt to Balance Deficit Segments ---
    // Sort the deficit segments. Prioritize those that require the most leading open parentheses.
    // This greedy approach tries to satisfy the "hardest" requirements first.
    deficitSegments.sort((segmentA, segmentB) => segmentB.minimumRequiredPrefix - segmentA.minimumRequiredPrefix);

    // Iterate through the sorted deficit segments.
    for (const segmentDetails of deficitSegments) {
        const { minimumRequiredPrefix, finalNetEffect } = segmentDetails;

        // If the currently available open parentheses cannot cover the minimum needed
        // for this segment, then a balanced sequence cannot be formed.
        if (minimumRequiredPrefix > availableOpenPrefixes) {
            return FAILURE_MESSAGE;
        }

        // Adjust the count of available open parentheses by the net effect of this segment.
        // Since `finalNetEffect` for these segments is always <= 0, this effectively reduces `availableOpenPrefixes`.
        availableOpenPrefixes += finalNetEffect;

        // An additional internal consistency check: availableOpenPrefixes should not drop below zero.
        // If it does, it implies an issue in logic or problem constraints not fully met.
        if (availableOpenPrefixes < 0) {
            // This scenario should ideally be caught by `minimumRequiredPrefix > availableOpenPrefixes` earlier.
            // It acts as a robust safeguard.
            return FAILURE_MESSAGE;
        }
    }

    // If all strings have been processed and all conditions met, a balanced sequence can be formed.
    return SUCCESS_MESSAGE;
}