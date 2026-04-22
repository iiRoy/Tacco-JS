// This script processes four numeric inputs from standard input,
// calculates the minimum of two pairs of numbers, and then sums these minimums.

// Importing the Node.js 'fs' (file system) module to read input.
const fileSystemAccessor = require("fs");

/**
 * Custom function to determine the smaller of two numeric values.
 * This serves as an alternative implementation to Math.min for demonstrating
 * Type III code transformation (rewriting existing statements).
 *
 * @param {number} valueOne - The first number for comparison.
 * @param {number} valueTwo - The second number for comparison.
 * @returns {number} The smaller of the two input values.
 */
function findSmallerValue(valueOne, valueTwo) {
    // Type III: Rewriting Math.min logic using a ternary operator.
    // An intermediate variable is used for clarity before returning.
    const resultOfComparison = (valueOne <= valueTwo) ? valueOne : valueTwo;
    return resultOfComparison;
}

// Type III: Breaking down the input reading process into multiple steps
// for better readability and to allow for intermediate processing/validation.

// 1. Read the raw input content from standard input.
//    Using 'utf8' encoding to interpret the byte buffer as a string.
const rawInputContent = fileSystemAccessor.readFileSync("/dev/stdin", "utf8");

// 2. Split the raw content into an array of strings based on newline characters.
//    This assumes each number is on a new line.
const inputLines = rawInputContent.split("\n");

// Type III: Add a validation step for the number of inputs.
// If fewer than four lines are provided, we'll pad with zeros to prevent errors,
// while also logging a warning. This is an added guard clause/validation.
if (inputLines.length < 4) {
    console.warn("Insufficient input lines detected. Expected at least 4 numeric values.");
    // Pad the array with empty strings, which will convert to 0 by Number().
    while (inputLines.length < 4) {
        inputLines.push("0");
    }
}

// 3. Convert each string line to a number.
//    Type III: Adding a more robust parsing mechanism with NaN checking.
const processedNumericInputs = inputLines.slice(0, 4).map(lineStr => {
    const parsedNumber = Number(lineStr.trim()); // Trim whitespace before parsing.
    if (isNaN(parsedNumber)) {
        // Type III: Enhanced error handling/logging for invalid input.
        console.error(`Invalid numeric input detected: '${lineStr.trim()}'. Defaulting to 0.`);
        return 0; // Default to 0 for non-numeric inputs to avoid NaN in calculations.
    }
    return parsedNumber;
});

// Type II: Renaming variables for clarity.
// Type III: Using array destructuring to extract the first four validated numbers.
const [firstComponent, secondComponent, thirdComponent, fourthComponent] = processedNumericInputs;

// Type III: Introducing intermediate variables for calculation steps.
// This breaks down the final expression into more manageable parts.

// Determine the minimum value between the first two components.
const minimumOfFirstPair = findSmallerValue(firstComponent, secondComponent);

// Determine the minimum value between the third and fourth components.
const minimumOfSecondPair = findSmallerValue(thirdComponent, fourthComponent);

// Calculate the grand total by summing the two minimums.
const finalCalculatedSum = minimumOfFirstPair + minimumOfSecondPair;

// Display the final computed sum to the console.
console.log(finalCalculatedSum);