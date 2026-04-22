const fileSystemOperations = require('node:fs');

/**
 * Defines the standard path for input.
 * @type {string}
 */
const standardInputEndpoint = '/dev/stdin';

/**
 * Specifies the character encoding for file operations.
 * @type {string}
 */
const contentEncodingFormat = 'utf8';

/**
 * A constant divisor used in the transformation calculation.
 * Using a floating-point literal to ensure floating-point division.
 * @type {number}
 */
const mathematicalDivisor = 98.0;

/**
 * A constant integer offset added during the transformation process.
 * @type {number}
 */
const numericalOffsetValue = 2;

/**
 * Processes a string containing numeric data, performing a series of mathematical transformations.
 * This includes parsing, squaring, scaling, offsetting, and finally truncating to an integer.
 *
 * @param {string} rawStringData - The input string, expected to represent a number.
 * @returns {number} The computed integer result. Returns 0 if the input cannot be
 *                   parsed into a valid number.
 */
function processAndTransformNumericString(rawStringData) {
    // It's good practice to trim any leading/trailing whitespace from the input string
    // before attempting numerical parsing, as spaces can cause parsing failures.
    const trimmedInput = rawStringData.trim();

    // Attempt to convert the cleaned string into a floating-point number.
    const parsedNumericValue = parseFloat(trimmedInput);

    // Validate if the parsing was successful. If `parseFloat` returns `NaN`,
    // it indicates the string was not a valid number. In such cases, we
    // return 0, mimicking the original behavior's handling of non-numeric inputs
    // (where `~~(NaN)` evaluates to 0).
    if (isNaN(parsedNumericValue)) {
        return 0;
    }

    // Perform the mathematical operations in distinct, readable steps.
    // First, square the parsed numeric input.
    const squaredInput = parsedNumericValue * parsedNumericValue;

    // Next, divide the squared value by the predefined mathematical divisor.
    const scaledIntermediateResult = squaredInput / mathematicalDivisor;

    // Then, add the numerical offset value to the scaled result.
    const finalAdditiveResult = scaledIntermediateResult + numericalOffsetValue;

    // Finally, truncate the floating-point result to an integer.
    // `Math.floor` is used here as an explicit and readable alternative to the bitwise `~~` operator.
    return Math.floor(finalAdditiveResult);
}

// Read the entire content from the specified standard input path.
// Using an options object for `readFileSync` improves readability and explicitness
// regarding the encoding.
const completeInputContent = fileSystemOperations.readFileSync(
    standardInputEndpoint,
    { encoding: contentEncodingFormat }
);

// Split the obtained content into an array of individual lines.
// A regular expression is used to handle both Unix (`\n`) and Windows (`\r\n`)
// style line endings robustly.
const arrayOfInputLines = completeInputContent.split(/\r?\n/);

// Filter out any lines that are empty or consist only of whitespace characters.
// This ensures that only meaningful lines are processed, aligning with the original
// code's implicit skipping of empty lines (where `i` would be falsy).
const validDataLines = arrayOfInputLines.filter(line => line.trim().length > 0);

// Iterate over each valid line of data.
// A `for...of` loop provides a clear and modern way to iterate over array elements.
for (const currentLineData of validDataLines) {
    // Call the helper function to compute the transformed value for the current line.
    const computedOutcome = processAndTransformNumericString(currentLineData);

    // Output the computed result to the console.
    // This will print 0 for any non-numeric validDataLines, consistent with original logic.
    console.log(computedOutcome);
}