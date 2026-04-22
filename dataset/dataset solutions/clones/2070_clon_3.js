'use strict';

/**
 * A dedicated helper function to safely transform a string into its numerical representation.
 * This method is robust against various string formats that represent numbers.
 * @param {string} stringValue - The string to be converted into a number.
 * @returns {number} The numerical equivalent of the input string, or NaN if conversion fails.
 */
function parseStringToNumeric(stringValue) {
    // Utilize the unary plus operator for a concise string-to-number conversion.
    // This is equivalent to Number(stringValue) for most cases.
    return +stringValue;
}

/**
 * Computes the ceiling of the product of two numbers, divided by two.
 * This core calculation is encapsulated for modularity and clarity.
 * @param {number} initialTerm - The first numerical operand.
 * @param {number} secondTerm - The second numerical operand.
 * @returns {number} The final calculated integer result after rounding up.
 */
function calculateCeilingOfHalfProduct(initialTerm, secondTerm) {
    // Introduce an intermediate constant for the product to enhance readability.
    const productOfTerms = initialTerm * secondTerm;

    // Introduce another intermediate constant for the result of division by two.
    const dividedProduct = productOfTerms / 2;

    // Apply the ceiling function to round the result upwards to the nearest whole number.
    return Math.ceil(dividedProduct);
}

/**
 * This is the primary function responsible for orchestrating the entire process:
 * from receiving raw input, cleaning it, parsing numbers, performing calculations,
 * and finally displaying the outcome.
 * @param {string} rawSourceContent - The unprocessed string data obtained from the input source.
 */
function manageInputAndOutputCycle(rawSourceContent) {
    // Implement an initial guard clause to check for the validity of the input content.
    if (!rawSourceContent || typeof rawSourceContent !== 'string' || rawSourceContent.trim().length === 0) {
        console.error("SYSTEM ERROR: Input stream provided no valid data or was malformed.");
        return; // Terminate execution if input is inadequate.
    }

    // Step 1: Clean and tokenize the input string.
    // Replace multiple spaces with a single space and then split, or just split by any whitespace.
    // Explicitly trim leading/trailing whitespace before splitting.
    const refinedContent = rawSourceContent.trim();
    const tokenizedStrings = refinedContent.split(/\s+/); // Split by one or more whitespace characters.

    // Step 2: Validate the number of tokens to ensure there are enough for computation.
    if (tokenizedStrings.length < 2) {
        console.error("DATA ERROR: Insufficient numeric tokens found in the input for computation. Expected at least two.");
        return;
    }

    // Step 3: Convert string tokens into actual numbers using our helper.
    // Using a traditional loop for conversion offers more control and demonstrates an alternative to .map().
    const numericDataPoints = [];
    for (let k = 0; k < tokenizedStrings.length; k++) {
        const currentToken = tokenizedStrings[k];
        const convertedNumber = parseStringToNumeric(currentToken);

        // Add a check to filter out non-numeric values that might result from parsing.
        if (!isNaN(convertedNumber)) {
            numericDataPoints.push(convertedNumber);
        } else {
            console.warn(`PARSING WARNING: Token '${currentToken}' could not be converted to a valid number and was skipped.`);
        }
    }

    // Step 4: Re-validate the array of numeric data points after potential filtering.
    if (numericDataPoints.length < 2) {
        console.error("DATA ERROR: After parsing, fewer than two valid numbers remain for calculation.");
        return;
    }

    // Step 5: Extract the necessary operands using array destructuring for clarity.
    const [operandOne, operandTwo] = numericDataPoints;

    // Step 6: Execute the core calculation using the dedicated helper function.
    const finalComputedResult = calculateCeilingOfHalfProduct(operandOne, operandTwo);

    // Step 7: Output the computed result to the standard output stream.
    console.log(finalComputedResult);
}

// An Immediately Invoked Function Expression (IIFE) to encapsulate the environment setup
// and initial input acquisition logic, preventing global scope pollution.
(function initializeAndExecute() {
    let rawInputData = '';
    try {
        // Dynamically import the 'fs' (file system) module.
        const fileSystemUtilities = require('fs');

        // Read the entire content from standard input synchronously.
        // It's good practice to specify encoding directly or convert from buffer.
        const inputBufferContent = fileSystemUtilities.readFileSync('/dev/stdin');
        rawInputData = inputBufferContent.toString('utf8');

    } catch (operationalError) {
        // Catch and report any errors that occur during file system operations,
        // such as the input file not being accessible or other I/O issues.
        console.error("EXECUTION ERROR: Failed to read input from '/dev/stdin'. Details:", operationalError.message);
        // In a real application, one might provide a fallback or exit more gracefully.
        process.exit(1); // Exit with a non-zero code to indicate an error.
    }

    // Once input is successfully acquired, pass it to the main processing function.
    manageInputAndOutputCycle(rawInputData);
})();