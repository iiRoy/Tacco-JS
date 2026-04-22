'use strict';

/**
 * Utility function to parse a string line containing space-separated numbers.
 * It handles potential empty strings and validates number conversion.
 * @param {string} lineContent - The string line to be parsed.
 * @returns {number[]} An array of numbers successfully parsed from the line.
 */
const parseNumericSequence = (lineContent) => {
    // Defensive check: Ensure the input is a non-empty string.
    if (typeof lineContent !== 'string' || lineContent.trim().length === 0) {
        console.error("Parsing Error: Provided line content is invalid or empty.");
        return [];
    }

    // Split by spaces, filter out any resulting empty strings (e.g., from multiple spaces),
    // and then attempt to convert each part to an integer using radix 10.
    const stringTokens = lineContent.split(' ').filter(token => token !== '');
    const convertedNumbers = stringTokens.map(token => {
        const parsedValue = parseInt(token, 10);
        // Validate if the parsing was successful.
        if (isNaN(parsedValue)) {
            console.warn(`Warning: Non-numeric token "${token}" encountered and skipped during parsing.`);
            return null; // Mark invalid entries
        }
        return parsedValue;
    }).filter(value => value !== null); // Remove all nulls (unparsed values)

    return convertedNumbers;
};

/**
 * Calculates a specific derived value based on three input parameters
 * and a predefined conditional logic.
 * @param {number} paramAlpha - The first input parameter (corresponds to A).
 * @param {number} paramBeta - The second input parameter (corresponds to B).
 * @param {number} paramGamma - The third input parameter (corresponds to C), used in the condition.
 * @returns {number} The computed final result.
 */
const computeSpecialResult = (paramAlpha, paramBeta, paramGamma) => {
    // Intermediate sum for clarity in the condition.
    const sumOfAlphaBeta = paramAlpha + paramBeta;
    let calculatedOutcome; // Variable to hold the final result.

    // The condition 'C <= A + B' is rephrased as 'A + B >= C'.
    if (sumOfAlphaBeta >= paramGamma) {
        // If condition is met, the result is 'C + B'.
        calculatedOutcome = paramGamma + paramBeta;
    } else {
        // If condition is not met, the original formula was:
        // (C + B) - (C - B - A) + 1
        // Simplifying this algebraically:
        // C + B - C + B + A + 1
        // = 2B + A + 1
        // Using our parameter names: 2 * paramBeta + paramAlpha + 1.
        calculatedOutcome = (2 * paramBeta) + paramAlpha + 1;
    }

    return calculatedOutcome;
};

/**
 * Main application entry point for processing input and generating output.
 * This function orchestrates the reading, parsing, calculation, and display.
 * @param {string} fullInputString - The complete raw input content, typically from stdin.
 */
const processApplicationData = (fullInputString) => {
    // Extracting the first relevant line from the multi-line input string.
    // Trimming ensures no leading/trailing whitespace affects parsing.
    const primaryInputLine = fullInputString.split('\n')[0].trim();

    // Use the helper function to get an array of numbers.
    const numericParameters = parseNumericSequence(primaryInputLine);

    // A critical validation step: ensure we have exactly three numbers as expected.
    const REQUIRED_NUMBER_COUNT = 3;
    if (numericParameters.length !== REQUIRED_NUMBER_COUNT) {
        console.error(`System Error: Expected ${REQUIRED_NUMBER_COUNT} numeric values, but found ${numericParameters.length}. Cannot proceed.`);
        // Terminate execution gracefully due to invalid input format.
        return;
    }

    // Assigning the parsed values to distinct, descriptive variables.
    const firstOperand = numericParameters[0];  // Corresponds to 'A'
    const secondOperand = numericParameters[1]; // Corresponds to 'B'
    const limitValue = numericParameters[2];    // Corresponds to 'C'

    // Delegate the core calculation to a specialized function.
    const finalOutputValue = computeSpecialResult(
        firstOperand,
        secondOperand,
        limitValue
    );

    // Output the final computed result to the console.
    console.log(finalOutputValue);
};

// --- Execution Start ---
// This block handles reading input from the standard input stream.
try {
    const filesystemModule = require('fs');
    const standardInputPath = '/dev/stdin'; // Standard path for input on POSIX systems.
    const contentEncoding = 'utf8';         // Specify character encoding.

    // Read the entire content of the standard input synchronously.
    const stdinContent = filesystemModule.readFileSync(standardInputPath, contentEncoding);

    // Invoke the main processing function with the obtained input data.
    processApplicationData(stdinContent);

} catch (inputReadError) {
    // Catch and report any errors that occur during file reading.
    console.error(`An exception occurred while attempting to read from stdin: ${inputReadError.message}`);
    // Indicate failure to the operating system.
    process.exit(1);
}