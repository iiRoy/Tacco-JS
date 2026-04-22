'use strict';

// This segment initializes the standard input stream for data reception.
process.stdin.resume();
process.stdin.setEncoding('utf-8'); // Ensures consistent character encoding.

// A dynamic buffer to accumulate all incoming data from the standard input.
let inputDataAccumulator = '';
// An index to keep track of the current line being processed from the buffered input.
let lineReadIndex = 0;

// Event listener: Appends each received data chunk to the input buffer.
process.stdin.on('data', function(incomingChunk) {
    inputDataAccumulator += incomingChunk;
});

// Event listener: Triggered once all data has been received from stdin.
process.stdin.on('end', function() {
    // Pre-process the accumulated input:
    // 1. Trim leading/trailing whitespace from the entire buffer.
    // 2. Split the buffer into an array of lines based on newline characters.
    // 3. Filter out any lines that are empty after splitting.
    inputDataAccumulator = inputDataAccumulator.trim().split('\n').filter(line => line.length > 0);
    // Once input is ready, initiate the core processing logic.
    executeCoreLogic();
});

/**
 * Fetches the next available line from the pre-processed input buffer.
 * Automatically advances the internal line pointer.
 * @returns {string} The next line of input as a string. Returns an empty string
 *                   or logs an error if an attempt is made to read beyond available input.
 */
function fetchInputLine() {
    // Defensive check to prevent reading past the end of the input array.
    if (lineReadIndex >= inputDataAccumulator.length) {
        console.error("Runtime Error: Attempted to read beyond the end of the available input lines.");
        return ''; // Or a more robust error handling mechanism.
    }
    return inputDataAccumulator[lineReadIndex++];
}

// A constant defining the lower bound for the final computed result.
const MINIMUM_POSSIBLE_RESULT = 0;

/**
 * Parses a single input line containing space-separated numeric values into an array of numbers.
 * This helper function enhances modularity and readability.
 * @param {string} lineString - The input string containing numbers separated by spaces.
 * @returns {number[]} An array of numbers parsed from the input string.
 */
function parseNumericLine(lineString) {
    // Utilizes the Number constructor for robust string-to-number conversion.
    return lineString.split(' ').map(Number);
}

/**
 * The central function encapsulating the primary business logic of the application.
 * It coordinates input retrieval, data parsing, calculation, and result output.
 */
function executeCoreLogic() {
    // Retrieve the initial line of parameters from the input.
    const rawParamsLine = fetchInputLine();
    // Parse the raw line into an array of numeric parameters.
    const numericParams = parseNumericLine(rawParamsLine);

    // Destructure the parsed parameters into clearly named constants for better understanding.
    const totalItems = numericParams[0];    // Corresponds to 'n' in original problem.
    const startValue = numericParams[1];    // Corresponds to 'a' in original problem.
    const endValue = numericParams[2];      // Corresponds to 'b' in original problem.

    // --- Type III Addition: Input Validation Guard Clause ---
    // This check ensures that essential parameters are valid before proceeding with calculations.
    if (totalItems === undefined || startValue === undefined || endValue === undefined || totalItems < 0) {
        console.error("Input Validation Error: One or more required parameters are missing or invalid.");
        console.log(MINIMUM_POSSIBLE_RESULT); // Output a default safe value on error.
        return; // Halt execution if input is critically flawed.
    }

    let calculatedOutcome; // Variable to store the final result of the computation.

    // --- Type III Update: Breakdown of Calculation into Intermediate Steps ---
    // This improves clarity and makes the formula easier to debug or modify.
    const valueRangeDifference = endValue - startValue;
    const adjustedItemCount = totalItems - 2;

    // Perform the core arithmetic calculation based on the problem's formula.
    const baseCalculationResult = (adjustedItemCount * valueRangeDifference) + 1;

    // Apply the minimum result threshold, ensuring the outcome is never below zero.
    // This effectively implements the `Math.max(..., 0)` part of the original logic.
    calculatedOutcome = Math.max(baseCalculationResult, MINIMUM_POSSIBLE_RESULT);

    // Output the final computed value to standard output.
    console.log(calculatedOutcome);
}