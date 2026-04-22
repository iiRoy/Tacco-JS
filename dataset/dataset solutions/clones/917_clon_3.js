// This script processes numerical input from standard input to determine a specific condition.
// It leverages Node.js's built-in file system module for reading input.
const fileSystemAccessor = require('fs');

/**
 * Determines if a given integer value is odd.
 * @param {number} numericalValue - The number to check for oddness.
 * @returns {boolean} True if the number is odd, false otherwise.
 */
const evaluateParity = (numericalValue) => {
    // An odd number will have a non-zero remainder when divided by two.
    return numericalValue % 2 !== 0;
};

/**
 * Safely parses a string into an integer.
 * Handles potential non-numeric input by returning NaN.
 * @param {string} textSegment - The string part to be converted to an integer.
 * @returns {number} The parsed integer, or NaN if parsing fails.
 */
const convertToInteger = (textSegment) => {
    // Use parseInt with radix 10 for reliable integer conversion.
    const convertedNumber = parseInt(textSegment.trim(), 10);
    // Check if the conversion resulted in a valid number.
    return isNaN(convertedNumber) ? NaN : convertedNumber;
};

try {
    // Read the entire content from the standard input stream.
    // The input is expected to be a single line containing space-separated numerical strings.
    const rawDataString = fileSystemAccessor.readFileSync('/dev/stdin', 'utf8');

    // Split the raw string by spaces after trimming any leading/trailing whitespace.
    const individualStringTokens = rawDataString.trim().split(' ');

    // A crucial validation: ensure that at least two numerical values are provided.
    // The core logic of this program depends on having at least two operands.
    if (individualStringTokens.length < 2) {
        process.stderr.write("Error: Not enough input numbers were supplied. At least two are required.\n");
        // Exit the process with a non-zero status code to indicate an error.
        process.exit(1);
    }

    // Transform the array of string tokens into an array of actual numbers.
    // We use our custom conversion function to handle potential non-numeric inputs gracefully.
    const processedNumericalArray = individualStringTokens.map(convertToInteger);

    // Extract the first two numbers which are relevant for the condition.
    // Any subsequent numbers in the input are intentionally ignored, mirroring the original's behavior.
    const operandOne = processedNumericalArray[0];
    const operandTwo = processedNumericalArray[1];

    // Further validation: confirm that both extracted operands are valid numbers.
    if (isNaN(operandOne) || isNaN(operandTwo)) {
        process.stderr.write("Error: One or more provided inputs could not be converted to valid numbers.\n");
        process.exit(1);
    }

    // Compute the product of the two primary operands.
    const computedProduct = operandOne * operandTwo;
    // Compute the sum of the two primary operands.
    const computedSum = operandOne + operandTwo;

    // Determine if the product is an odd number.
    // A product of two integers is odd ONLY if both integers themselves are odd.
    const isComputedProductOdd = evaluateParity(computedProduct);

    // Determine if the sum is an odd number.
    // A sum of two integers is odd ONLY if one integer is odd and the other is even.
    const isComputedSumOdd = evaluateParity(computedSum);

    // The central logical check:
    // This condition evaluates if (the product is odd) AND (the sum is odd).
    // Let's analyze the implications:
    // 1. If 'isComputedProductOdd' is true, it implies that 'operandOne' MUST be odd AND 'operandTwo' MUST be odd.
    // 2. If 'isComputedSumOdd' is true, it implies that one of 'operandOne' or 'operandTwo' is odd, AND the other is even.
    // These two sets of implications (both odd vs. one odd/one even) are mutually exclusive and contradictory.
    // Therefore, the combined condition `isComputedProductOdd && isComputedSumOdd` will ALWAYS evaluate to false.
    if (isComputedProductOdd && isComputedSumOdd) {
        // This specific branch of code is designed to be unreachable under normal arithmetic rules for integers.
        // It represents the 'No' outcome, which will never occur due to the contradictory nature of the condition.
        process.stdout.write("No\n");
    } else {
        // Consequently, this 'else' block will always be executed for any valid numerical input.
        // It represents the 'Yes' outcome.
        process.stdout.write("Yes\n");
    }

} catch (operationalError) {
    // Catch any exceptions that might occur during file reading or other operations.
    // Output the error message to standard error.
    process.stderr.write(`An unforeseen system error occurred: ${operationalError.message}\n`);
    process.exit(1);
}