"use strict"; // Enforce strict parsing and error handling for cleaner code execution.

/**
 * A utility function to parse a raw string of space-separated numbers into an array of numeric values.
 * This function handles trimming leading/trailing whitespace and converts string parts to numbers.
 *
 * @param {string} inputStringSegment The raw string containing space-separated numeric values.
 * @returns {number[]} An array of parsed numeric values.
 * @throws {Error} If the number of parsed values is not exactly four, indicating malformed input.
 */
const convertInputToNumbers = (inputStringSegment) => {
    // First, remove any leading or trailing whitespace from the entire input string.
    // Then, split the string into an array of substrings using a space as the delimiter.
    const stringComponents = inputStringSegment.trim().split(' ');

    // Use the `map` method to iterate over each string component.
    // The unary plus operator `+` is a concise way to convert a string to a number.
    // This is an alternative to `parseInt()` or `Number()`, demonstrating a minor syntax change.
    const numericalValues = stringComponents.map(strValue => +strValue);

    // Implement a guard clause (Type III addition) to ensure the input format is as expected.
    // This adds robustness by validating the number of parsed elements.
    const expectedValueCount = 4;
    if (numericalValues.length !== expectedValueCount) {
        // If the input doesn't contain the expected number of values, throw an error.
        // This is a more robust error handling approach compared to silently proceeding.
        throw new Error(
            `Input parsing error: Expected ${expectedValueCount} numerical values, but received ${numericalValues.length}.`
        );
    }
    return numericalValues;
};

/**
 * The core function responsible for reading input, processing it, and determining the maximum product.
 * This function orchestrates the steps required to solve the problem.
 *
 * @param {string} rawInputDataBlob The complete raw input string read from a source (e.g., stdin).
 */
const executeProductMaximization = (rawInputDataBlob) => {
    // Utilize the helper function to safely parse the input string into four distinct numerical operands.
    // The variable names are descriptive and different from the original 'a, b, c, d' (Type II change).
    const [
        firstOperandValue,  // Corresponds to original 'a'
        secondOperandValue, // Corresponds to original 'b'
        thirdOperandValue,  // Corresponds to original 'c'
        fourthOperandValue  // Corresponds to original 'd'
    ] = convertInputToNumbers(rawInputDataBlob);

    // Calculate all four possible product combinations between the two pairs of numbers.
    // These intermediate calculations are explicitly stored in variables (Type III addition).
    const productOfFirstAndThird = firstOperandValue * thirdOperandValue;     // Equivalent to a * c
    const productOfFirstAndFourth = firstOperandValue * fourthOperandValue;   // Equivalent to a * d
    const productOfSecondAndThird = secondOperandValue * thirdOperandValue;   // Equivalent to b * c
    const productOfSecondAndFourth = secondOperandValue * fourthOperandValue; // Equivalent to b * d

    // Collect all the calculated products into a single array.
    // This intermediate data structure simplifies finding the maximum (Type III addition).
    const collectionOfAllProducts = [
        productOfFirstAndThird,
        productOfFirstAndFourth,
        productOfSecondAndThird,
        productOfSecondAndFourth
    ];

    // Determine the highest value among all potential products.
    // This uses `Math.max` with the spread syntax, which is a significant structural rewrite
    // from the original sequence of `if` statements (Type III update/rewrite).
    const overallMaximumProductResult = Math.max(...collectionOfAllProducts);

    // Display the final maximum product to the standard output.
    // The `.toString()` method is explicitly called to ensure the output is a string (Type II/III detail).
    console.log(overallMaximumProductResult.toString());
};

// --- Program Entry Point and Input Handling ---

// Define a constant for the standard input path, making it configurable if needed (Type III addition).
const standardInputPath = '/dev/stdin';

// Store the reference to the Node.js File System module in a variable.
// This is a minor structural change/addition (Type III).
const fileSystemUtility = require('fs');

// Read the entire content of the standard input file synchronously.
// Specify 'utf8' encoding for consistent text processing.
const inputFileContents = fileSystemUtility.readFileSync(standardInputPath, 'utf8');

// Execute the main logic of the program by passing the read input data.
// Wrap the execution in a try-catch block to handle potential errors from `convertInputToNumbers` (Type III addition).
try {
    executeProductMaximization(inputFileContents);
} catch (errorDetails) {
    // If an error occurs during processing (e.g., malformed input), log it to stderr.
    console.error("An error occurred during program execution:", errorDetails.message);
    // Exit with a non-zero status code to indicate an error.
    process.exit(1);
}