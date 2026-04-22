// This module provides file system operations, crucial for reading input data.
const fileSystemModule = require("fs"); // Using 'const' for module imports is a common modern practice.

/**
 * Evaluates whether three numeric values satisfy the Pythagorean theorem (a² + b² = c²).
 * This function also incorporates basic validation to ensure robust processing.
 *
 * @param {number} firstValue - The first potential leg of the triangle.
 * @param {number} secondValue - The second potential leg of the triangle.
 * @param {number} thirdValue - The potential hypotenuse of the triangle.
 * @returns {boolean} Returns 'true' if the values form a Pythagorean triplet, 'false' otherwise.
 */
function determineRightTriangle(firstValue, secondValue, thirdValue) {
    // Comprehensive input validation: ensure all arguments are finite, non-negative numbers.
    // Negative side lengths are physically impossible for a triangle.
    if (
        !Number.isFinite(firstValue) || firstValue < 0 ||
        !Number.isFinite(secondValue) || secondValue < 0 ||
        !Number.isFinite(thirdValue) || thirdValue < 0
    ) {
        // If any input is invalid (e.g., NaN, Infinity, negative), it cannot form a valid right triangle.
        return false;
    }

    // Calculate the squares of each value using Math.pow for explicit exponentiation.
    // This can improve readability and potentially precision compared to simple multiplication for larger numbers.
    const squareOfFirstSide = Math.pow(firstValue, 2);
    const squareOfSecondSide = Math.pow(secondValue, 2);
    const squareOfThirdSide = Math.pow(thirdValue, 2);

    // Compare the sum of the squares of the first two sides with the square of the third side.
    // This is the core logic of the Pythagorean theorem.
    return squareOfFirstSide + squareOfSecondSide === squareOfThirdSide;
}

// Define the standard input file path as a constant for easy modification or clarity.
const standardInputPath = '/dev/stdin';

// Read the entire content from the standard input synchronously.
// Specify 'utf8' encoding to get a string directly, then trim any leading/trailing whitespace.
const rawTextContent = fileSystemModule.readFileSync(standardInputPath, { encoding: 'utf8' }).trim();

// Split the raw content into an array of individual lines.
// Filter out any lines that are empty or contain only whitespace after trimming.
const processedLines = rawTextContent.split('\n').filter(line => line.trim() !== '');

// Guard clause: If no meaningful input lines are found after initial processing, exit gracefully.
if (processedLines.length === 0) {
    // console.warn("No valid input lines were detected. Exiting program.");
    process.exit(0); // Exit successfully with code 0 (no error).
}

// The first line of the input is expected to specify the total number of test cases.
// Extract and parse this value, ensuring it's an integer with base 10.
const totalCasesToProcess = parseInt(processedLines[0].trim(), 10);

// Validate the parsed number of test cases. It must be a valid number and positive.
if (isNaN(totalCasesToProcess) || totalCasesToProcess <= 0) {
    // console.error(`Error: Invalid or non-positive number of test cases specified: "${processedLines[0]}".`);
    process.exit(1); // Exit with an error code 1.
}

// Create a new array containing only the data lines (excluding the first line which was the count).
// Using slice(1) ensures the original 'processedLines' array remains untouched.
const dataLines = processedLines.slice(1);

// Determine the actual number of cases to process, taking the minimum of the specified count
// and the available data lines to prevent out-of-bounds access if the count is too high.
const effectiveCases = Math.min(totalCasesToProcess, dataLines.length);

// Iterate through each of the effective test cases.
for (let currentCaseIndex = 0; currentCaseIndex < effectiveCases; currentCaseIndex++) {
    const currentLineString = dataLines[currentCaseIndex].trim(); // Get the current data line and trim it.

    // Guard clause: Skip processing if the current line is empty after trimming.
    if (!currentLineString) {
        // console.warn(`Warning: Skipping empty line at data index ${currentCaseIndex}.`);
        continue; // Move to the next iteration.
    }

    // Split the current line string into components using one or more spaces as delimiters.
    // Filter out any empty strings that might result from multiple spaces.
    const lineComponents = currentLineString.split(/\s+/).filter(Boolean);

    // Guard clause: Ensure that exactly three numeric components are provided for a triangle.
    if (lineComponents.length !== 3) {
        // console.warn(`Warning: Malformed line at data index ${currentCaseIndex}. Expected 3 numbers, found ${lineComponents.length}. Line: "${currentLineString}".`);
        continue; // Skip this line and proceed to the next.
    }

    // Parse the string components into numbers. Using the global Number() function for conversion.
    const sideOne = Number(lineComponents[0]);
    const sideTwo = Number(lineComponents[1]);
    const sideThree = Number(lineComponents[2]);

    // Explicitly check if any of the parsed values are NaN (Not a Number).
    // This is a crucial validation step after string-to-number conversion.
    if (isNaN(sideOne) || isNaN(sideTwo) || isNaN(sideThree)) {
        // console.warn(`Warning: Non-numeric input detected in line at index ${currentCaseIndex}. Line: "${currentLineString}".`);
        continue; // Skip this line if any number is invalid.
    }

    // Invoke the dedicated function to check the Pythagorean property with the validated numbers.
    const isThisATriangle = determineRightTriangle(sideOne, sideTwo, sideThree);

    // Based on the boolean result, construct the output string ("YES" or "NO").
    const resultString = isThisATriangle ? "YES" : "NO";

    // Print the result to the console for the current test case.
    console.log(resultString);
}