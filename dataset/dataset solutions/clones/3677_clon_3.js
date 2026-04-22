'use strict';

/**
 * This module is responsible for processing a string of input data,
 * extracting numerical values, and performing a specific evaluation
 * to determine a resulting character symbol.
 */

/**
 * Core function to evaluate numerical operands based on predefined conditions.
 * It reads two numbers from the provided raw string payload, calculates
 * their sum and product, and then outputs a specific character symbol
 * (+, *, or x) based on whether these calculations match a target value.
 *
 * @param {string} rawInputPayload - The complete string content read from the input source.
 *                                   Expected format: "number1 number2\nother lines..."
 * @returns {void} Outputs the determined symbol to standard output.
 */
const executeNumericalLogic = (rawInputPayload) => {
    // Define the constant target value used for comparisons.
    const OPERATION_TARGET_VALUE = 15;
    // Initialize the default result symbol.
    let finalOperationSymbol = 'x';

    // --- Input Pre-processing and Initial Validation ---

    // Trim any leading/trailing whitespace from the entire payload,
    // then split it into an array of lines.
    const inputLinesArray = rawInputPayload.trim().split('\n');

    // Guard clause: Ensure there's at least one non-empty line to process.
    if (!inputLinesArray.length || inputLinesArray[0].trim().length === 0) {
        console.error("ERROR: Input payload contains no discernible lines of data.");
        // We could output 'x' here for a default failure state, but erroring out is more explicit.
        return;
    }

    // Extract only the very first line for our primary operation.
    const primaryDataLine = inputLinesArray[0];

    // Split the primary line by spaces to isolate potential numerical string tokens.
    const stringNumberTokens = primaryDataLine.split(' ');

    // Guard clause: Verify that we have at least two tokens to parse as numbers.
    if (stringNumberTokens.length < 2) {
        console.error("ERROR: The first line of input does not contain at least two space-separated values.");
        return;
    }

    // --- Numerical Parsing and Validation ---

    // Parse the first two string tokens into numerical values.
    // Using the unary plus operator for type conversion to number.
    const firstNumericalOperand = +stringNumberTokens[0];
    const secondNumericalOperand = +stringNumberTokens[1];

    // Comprehensive validation for parsed numbers:
    // Ensure both operands are finite numbers (not NaN, Infinity, or -Infinity).
    if (
        !Number.isFinite(firstNumericalOperand) ||
        !Number.isFinite(secondNumericalOperand)
    ) {
        console.error("ERROR: One or both of the parsed input values are not valid finite numbers.");
        return;
    }

    // --- Core Conditional Evaluation ---

    // Calculate the sum of the two operands.
    const computedSum = firstNumericalOperand + secondNumericalOperand;
    // Calculate the product of the two operands.
    const computedProduct = firstNumericalOperand * secondNumericalOperand;

    // Evaluate conditions sequentially to determine the correct symbol.
    if (computedSum === OPERATION_TARGET_VALUE) {
        finalOperationSymbol = '+'; // Sum matches the target.
    } else if (computedProduct === OPERATION_TARGET_VALUE) {
        finalOperationSymbol = '*'; // Product matches the target.
    }
    // If neither condition is met, 'finalOperationSymbol' remains its initial 'x'.

    // Output the final determined symbol to standard output.
    console.log(finalOperationSymbol);
};

// --- Application Entry Point ---

// This block handles reading input from standard input and invoking the main logic.
try {
    // Dynamically import the 'fs' (file system) module.
    const fileSystemUtility = require('fs');
    // Define the standard input file path.
    const standardInputSource = '/dev/stdin';
    // Specify the character encoding for reading the file.
    const inputDataEncoding = 'utf8';

    // Synchronously read the entire content of the standard input.
    const completeInputContent = fileSystemUtility.readFileSync(standardInputSource, inputDataEncoding);

    // Pass the raw content to our main processing function.
    executeNumericalLogic(completeInputContent);

} catch (ioError) {
    // Catch and report any errors that occur during file reading or initial setup.
    console.error(`RUNTIME ERROR: Failed to read input from /dev/stdin. Details: ${ioError.message}`);
    // As a fallback for input reading failures, we might still want to output 'x'
    // to indicate that no valid operation could be performed.
    // console.log('x');
}