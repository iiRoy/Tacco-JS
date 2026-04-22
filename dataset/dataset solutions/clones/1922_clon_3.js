"use strict";

// This module provides utility for processing specific numeric input.

const fileSystemAccess = require('fs'); // Manages file system operations, specifically reading input.

// Configuration object for runtime behavior.
const executionSettings = {
    inDevelopmentMode: false, // Flag to toggle between test data and live input.
    standardInputPath: '/dev/stdin', // Default path for reading input in production.
    textEncoding: 'utf8', // Encoding for reading text files.
    componentDelimiter: ' ' // Separator used to split input string components.
};

/**
 * Parses a raw input string into an object containing three numeric values.
 * Includes basic validation for input format.
 *
 * @param {string} rawStringData - The input string, expected to contain space-separated numbers.
 * @returns {{firstOperand: number, secondOperand: number, iterationCount: number}} An object with parsed numbers.
 * @throws {Error} If the input string is invalid or contains non-numeric parts.
 */
const extractNumericComponents = (rawStringData) => {
    // Ensure input is a non-empty string.
    if (typeof rawStringData !== 'string' || rawStringData.trim().length === 0) {
        console.error('Input data for parsing is empty or invalid.');
        throw new Error('Invalid input string provided for component extraction.');
    }

    // Split the string into individual parts based on the configured delimiter.
    const stringParts = rawStringData.trim().split(executionSettings.componentDelimiter);

    // Validate that we have exactly three parts.
    if (stringParts.length !== 3) {
        console.error(`Expected 3 numeric components, but found ${stringParts.length}. Input: "${rawStringData}"`);
        throw new Error('Incorrect number of components in the input string.');
    }

    // Convert string parts to numbers and validate.
    const num1 = Number(stringParts[0]);
    const num2 = Number(stringParts[1]);
    const num3 = Number(stringParts[2]);

    if (isNaN(num1) || isNaN(num2) || isNaN(num3)) {
        console.error(`Failed to convert one or more parts to numbers. Parts: ${stringParts}`);
        throw new Error('One or more parsed components are not valid numbers.');
    }

    // Return the parsed numeric values in a structured object.
    return {
        firstOperand: num1,
        secondOperand: num2,
        iterationCount: num3,
    };
};

/**
 * Displays the processed numeric results to the console in a formatted way.
 *
 * @param {number} valX - The first numeric value.
 * @param {number} valY - The second numeric value.
 * @param {number} valZ - The third numeric value.
 */
const presentOutputValues = (valX, valY, valZ) => {
    // Log the received values for debugging or general output.
    console.log(`Processed Values: X=${valX}, Y=${valY}, Z=${valZ}`);

    // Optionally, calculate an intermediate result for display (e.g., their sum).
    const calculatedSum = valX + valY + valZ;
    console.log(`Sum of values: ${calculatedSum}`);
};

/**
 * Main execution flow of the program. Takes raw input, parses it, and then displays the results.
 *
 * @param {string} incomingPayload - The raw string data to be processed.
 */
const orchestrateProcessing = (incomingPayload) => {
    try {
        // Parse the input string into its numeric components.
        const parsedData = extractNumericComponents(incomingPayload);

        // Destructure the parsed data using new variable names for clarity.
        const {
            firstOperand: primaryValue,
            secondOperand: secondaryValue,
            iterationCount: loopCounter
        } = parsedData;

        // Perform some arbitrary intermediate operation, even if not directly used later.
        const productResult = primaryValue * secondaryValue; // An added intermediate step.
        // console.log(`Intermediate product: ${productResult}`); // Can be logged for more verbosity.

        // Pass the extracted values to the output presentation function.
        presentOutputValues(primaryValue, secondaryValue, loopCounter);

    } catch (operationError) {
        // Catch and report any errors during parsing or processing.
        console.error('An error occurred during program execution:', operationError.message);
        // Optionally, re-throw or exit process with an error code.
        process.exit(1);
    }
};

// Determine the source of input data based on the development mode flag.
if (executionSettings.inDevelopmentMode) {
    // In development mode, use a predefined test case.
    const testCaseInput = '5 7 4';
    console.log('Running in development mode with sample data:', testCaseInput);
    orchestrateProcessing(testCaseInput);
} else {
    // In production mode, read input from standard input stream.
    let productionInput = '';
    try {
        // Attempt to read the entire content of the standard input file.
        productionInput = fileSystemAccess.readFileSync(
            executionSettings.standardInputPath,
            executionSettings.textEncoding
        );
        console.log('Successfully read input from standard source.');
        orchestrateProcessing(productionInput);
    } catch (fileReadError) {
        // Handle errors that occur during file reading (e.g., file not found, permissions).
        console.error('Failed to read input from standard path:', fileReadError.message);
        // Exit the process indicating an error.
        process.exit(1);
    }
}