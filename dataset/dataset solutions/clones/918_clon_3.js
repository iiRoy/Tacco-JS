// This utility module provides essential file system operations for interacting with files.
const fileSystemInterface = require('fs');

/**
 * A dedicated helper function designed to ascertain whether a given numerical input is odd.
 * This method is robust, checking the absolute remainder to correctly identify odd numbers,
 * especially useful for handling both positive and negative integer values.
 *
 * @param {number} evaluationTarget - The specific integer value to be examined.
 * @returns {boolean} Returns `true` if the `evaluationTarget` is odd; otherwise, returns `false`.
 */
const checkValueForOddness = (evaluationTarget) => {
    // A preliminary check to ensure the input is indeed a number and not NaN.
    // This adds a layer of validation to the helper function itself.
    if (typeof evaluationTarget !== 'number' || isNaN(evaluationTarget)) {
        console.error("Runtime Error: The 'checkValueForOddness' utility received an invalid non-numeric input.");
        // Depending on requirements, one might throw an error here, but returning false
        // allows the main logic to proceed with a 'not odd' interpretation.
        return false;
    }
    // The core logic: an odd number will always have an absolute remainder of 1 when divided by 2.
    return Math.abs(evaluationTarget % 2) === 1;
};

// --- Primary Application Logic Begins Here ---

// Step 1: Read the entire content from the standard input stream.
// The encoding option is explicitly provided for clarity and to ensure correct string interpretation.
const rawInputDataBuffer = fileSystemInterface.readFileSync('/dev/stdin', { encoding: 'utf8' });

// Step 2: Pre-process the raw input string by removing any leading or trailing whitespace characters.
const cleanedInputString = rawInputDataBuffer.trim();

// Step 3: Divide the cleaned input string into an array of individual string segments.
// A regular expression is used to split by one or more whitespace characters,
// making the parsing more resilient to varied input formatting.
const stringSegments = cleanedInputString.split(/\s+/);

// Step 4: Implement a critical validation check for the number of input segments.
// The program expects exactly four numerical inputs. If this condition is not met,
// an error message is displayed, and the application terminates prematurely.
if (stringSegments.length !== 4) {
    console.error("Input Data Error: Expected precisely four distinct numerical inputs, but instead found " + stringSegments.length + " entries.");
    process.exit(1); // Exits the Node.js process with a non-zero status code, indicating an error.
}

// Step 5: Convert each string segment into its numerical representation.
// Each value is assigned to a clearly named constant for better readability.
const firstNumericValue = Number(stringSegments[0]);
const secondNumericValue = Number(stringSegments[1]);
const thirdNumericValue = Number(stringSegments[2]);
const fourthNumericValue = Number(stringSegments[3]);

// Step 6: Validate that all converted values are indeed valid numbers (not NaN).
// This is another essential guard clause to prevent erroneous calculations.
if (isNaN(firstNumericValue) || isNaN(secondNumericValue) || isNaN(thirdNumericValue) || isNaN(fourthNumericValue)) {
    console.error("Data Conversion Error: At least one of the provided input segments could not be successfully transformed into a valid number.");
    process.exit(1);
}

// Step 7: Perform the first arithmetic operation: multiplication of the first two numbers.
const productOfFirstPair = firstNumericValue * secondNumericValue;

// Step 8: Perform the second arithmetic operation: addition of the last two numbers.
const sumOfSecondPair = thirdNumericValue + fourthNumericValue;

// Step 9: Utilize the `checkValueForOddness` helper function to determine
// the oddness property of both calculated results.
const isProductOfPairOneOdd = checkValueForOddness(productOfFirstPair);
const isSumOfPairTwoOdd = checkValueForOddness(sumOfSecondPair);

// Step 10: Initialize a mutable variable to store the final output message.
// The default assumption is "Yes", which will be overridden only if a specific condition is met.
let finalOutputMessage = "Yes";

// Step 11: Evaluate the primary conditional logic.
// The original problem states: if (product is odd AND sum is odd), output "No".
// Otherwise, output "Yes".
// This implementation directly reflects that logic.
if (isProductOfPairOneOdd && isSumOfPairTwoOdd) {
    finalOutputMessage = "No"; // The specific condition for "No" is satisfied.
}

// Step 12: Output the final determined message to the standard console.
console.log(finalOutputMessage);