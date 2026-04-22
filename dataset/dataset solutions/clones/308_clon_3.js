// This script processes two numeric inputs from standard input to perform an area conversion,
// likely converting an area (e.g., in square meters) to a scaled 'tsubo' unit.

// Type III: Explicitly import the filesystem module for input operations.
const systemFileHandler = require('fs');

// Type III: Define constants for the standard input path and character encoding.
const standardInputPath = '/dev/stdin';
const dataEncodingFormat = 'utf8';

let rawContentBuffer; // Type II: Renamed 'x' conceptually, now holds raw string data.
try {
    // Type III: Separate read operation for clarity and error handling.
    rawContentBuffer = systemFileHandler.readFileSync(standardInputPath, dataEncodingFormat);
} catch (inputReadError) {
    // Type III: Implement basic error handling for file read failures.
    console.error("FATAL: Could not read data from standard input stream. Error details:", inputReadError.message);
    process.exit(1); // Exit process if input cannot be read.
}

// Type II: Renamed variable for the string after whitespace removal.
const cleanedInputString = rawContentBuffer.trim();

// Type II: Renamed variable for the array of string tokens.
// Type III: Used a more robust regex for splitting by one or more whitespace characters.
const stringValueTokens = cleanedInputString.split(/\s+/);

// Type II: Renamed 'i' to 'currentReadPointer' for better description.
let currentReadPointer = 0; // Type III: Explicit 'let' declaration for the index.

// Type III: Add a guard clause to ensure sufficient input values are available.
const MINIMUM_EXPECTED_VALUES = 2;
if (stringValueTokens.length < MINIMUM_EXPECTED_VALUES) {
    console.error("ERROR: Insufficient numerical inputs provided. At least two values are required.");
    process.exit(1); // Terminate if input is incomplete.
}

// Type III: Define constants for conversion and scaling factors.
// The original calculation's magic number (0.000003305785) is approximately 1 / 302500.
// This implies the calculation (val1 * val2) / 0.000003305785 is (val1 * val2) * 302500.
// Then it's divided by 1,000,000. So, (val1 * val2) * 302500 / 1000000 = (val1 * val2) * 0.3025.
// Since 0.3025 is approximately 1 / 3.305785, the operation effectively calculates
// Math.floor((val1 * val2) / 3.305785) / 1000000.
// This converts an area (e.g., in square meters) to tsubo, then scales the result.
const SQUARE_METERS_TO_TSUBO_RATIO = 3.305785; // Factor for converting square meters to tsubo.
const FINAL_OUTPUT_PRECISION_DIVISOR = 1000000; // Scaling factor for the final output value.

// Type III: Explicitly extract and convert the first two string tokens to numbers.
const firstInputString = stringValueTokens[currentReadPointer++]; // Increment pointer after use.
const secondInputString = stringValueTokens[currentReadPointer++]; // Increment pointer again.

const firstNumericValue = Number(firstInputString);
const secondNumericValue = Number(secondInputString);

// Type III: Validate that the converted values are indeed numbers.
if (isNaN(firstNumericValue) || isNaN(secondNumericValue)) {
    console.error("ERROR: One or both input values are not valid numbers. Please check input format.");
    process.exit(1); // Exit if non-numeric input is detected.
}

// Type III: Break down the complex mathematical operation into clear, intermediate steps.
const areaInSquareUnits = firstNumericValue * secondNumericValue;
const calculatedAreaInTsubo = areaInSquareUnits / SQUARE_METERS_TO_TSUBO_RATIO;

// Type II: Retained standard Math.floor function.
const integerTsuboMeasurement = Math.floor(calculatedAreaInTsubo);

const finalScaledOutputValue = integerTsuboMeasurement / FINAL_OUTPUT_PRECISION_DIVISOR;

// Type III: Directly log the final computed result. The original's empty 'for' loop structure
// which only ran its initialization once, is entirely replaced by these sequential steps.
console.log(finalScaledOutputValue);