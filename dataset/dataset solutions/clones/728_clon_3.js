#!/usr/bin/node
// This script processes numerical data received from standard input (stdin).
// It expects input in a specific format:
// The very first line should contain a single integer, representing the total number of data cases to follow.
// Each subsequent line, up to the specified number of cases, must contain three space-separated integers.
// The script then performs a complex calculation for each data line and prints the result to standard output.

/**
 * Safely parses a string into an integer.
 * @param {string} value The string to parse.
 * @returns {number} The parsed integer, or NaN if the string cannot be parsed.
 */
const parseNumericValue = (value) => {
    const parsedInteger = parseInt(value, 10);
    return isNaN(parsedInteger) ? NaN : parsedInteger;
};

// Define constants for the magic numbers used in the main calculation formula.
// This improves readability and makes future modifications easier.
const INITIAL_OFFSET_VALUE = 196471;
const PARAM_A_SCALING_FACTOR = 195;
const PARAM_A_DIV_THREE_SCALING_FACTOR = 5;
const PARAM_B_SCALING_FACTOR = 20;
const PARAM_A_MODULO_THRESHOLD = 2; // Used in the conditional adjustment for param A.

let allRawInput = ''; // Buffer to accumulate all data chunks read from stdin.

// Configure the standard input stream.
const standardInputChannel = process.openStdin();
standardInputChannel.setEncoding('utf8');

// Event listener for when data chunks are received from stdin.
standardInputChannel.on('data', (incomingChunk) => {
    allRawInput += incomingChunk; // Append each chunk to the buffer.
});

// Event listener for when the standard input stream has ended.
standardInputChannel.on('end', () => {
    // Once all input is received, process the accumulated data.
    // Split the buffer into individual lines, clean them up, and filter out empty ones.
    const cleanInputLines = allRawInput
        .split('\n')
        .map(line => line.trim()) // Remove leading/trailing whitespace from each line.
        .filter(line => line.length > 0); // Discard any lines that are empty after trimming.

    // Basic validation: Check if any meaningful input was provided.
    if (cleanInputLines.length === 0) {
        console.error("Error: No valid input data was detected. Please provide input via stdin.");
        process.exit(1); // Exit with an error code.
    }

    // The first line is expected to be the count of subsequent data cases.
    const numberOfCasesString = cleanInputLines.shift();
    const totalDataCases = parseNumericValue(numberOfCasesString);

    // Validate the parsed number of data cases.
    if (isNaN(totalDataCases) || totalDataCases < 0) {
        console.error(`Error: Invalid or negative value for the number of data cases: "${numberOfCasesString}". Aborting.`);
        process.exit(1);
    }

    // Iterate through each expected data case.
    for (let currentCaseIndex = 0; currentCaseIndex < totalDataCases; currentCaseIndex++) {
        // Guard clause: Ensure we don't try to access a line that doesn't exist.
        if (currentCaseIndex >= cleanInputLines.length) {
            console.error(`Warning: Expected ${totalDataCases} data cases, but only found ${currentCaseIndex} valid data lines. Stopping further processing.`);
            break; // Exit the loop if we run out of input lines prematurely.
        }

        const currentDataLine = cleanInputLines[currentCaseIndex];
        const stringComponents = currentDataLine.split(" ");

        // Validate the structure of the current data line.
        if (stringComponents.length < 3) {
            console.error(`Warning: Skipping malformed data line (expected 3 space-separated numbers): "${currentDataLine}"`);
            continue; // Move to the next iteration if the line format is incorrect.
        }

        // Convert the string components into an array of numbers.
        const numericComponents = stringComponents.map(parseNumericValue);

        // Validate that all components were successfully parsed as numbers.
        if (numericComponents.some(isNaN)) {
            console.error(`Warning: Skipping data line with non-numeric parts: "${currentDataLine}"`);
            continue; // Move to the next iteration if any part is not a valid number.
        }

        // Destructure the numerical parameters for clarity.
        const [rawParamA, rawParamB, rawParamC] = numericComponents;

        // Apply initial adjustments to the first two parameters as per the algorithm.
        const adjustedParamA = rawParamA - 1;
        const adjustedParamB = rawParamB - 1;

        let dynamicCorrectionValue = 0;
        // Calculate a conditional dynamic correction based on adjustedParamA.
        if (adjustedParamA % 3 !== PARAM_A_MODULO_THRESHOLD) {
            dynamicCorrectionValue = Math.floor(adjustedParamB / 2);
        }

        // Calculate intermediate parts of the final result for better readability.
        const termOne = adjustedParamA * PARAM_A_SCALING_FACTOR;
        const termTwo = Math.floor(adjustedParamA / 3) * PARAM_A_DIV_THREE_SCALING_FACTOR;
        const termThree = adjustedParamB * PARAM_B_SCALING_FACTOR;

        // Combine all terms and constants to compute the final result for the current case.
        const finalComputedResult = INITIAL_OFFSET_VALUE - termOne - termTwo - termThree + dynamicCorrectionValue - rawParamC;
        
        // Output the calculated result.
        console.log(finalComputedResult);
    }
});

// Implement a global error handler for any unexpected exceptions.
process.on('uncaughtException', (error) => {
    console.error('An unhandled error occurred during script execution:', error.message);
    // Optionally log the stack trace for debugging.
    // console.error(error.stack);
    process.exit(1); // Ensure the process exits with an error code.
});