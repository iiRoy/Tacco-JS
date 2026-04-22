// This module provides access to file system operations, crucial for reading input.
const fileSystemHandler = require("fs");

// Define a constant for the standard input file path, making it easily configurable.
const standardInputFile = "/dev/stdin";
// Specify the character encoding for reading the input file to ensure correct interpretation.
const inputEncodingScheme = "utf8";

// Create a local alias for console.log to improve readability and allow for potential future redirection.
const renderOutput = console.log;

// Read the entire content of the standard input file synchronously.
// The content is stored in a buffer, then converted to a string using the specified encoding.
let rawInputContentBuffer = fileSystemHandler.readFileSync(standardInputFile, inputEncodingScheme);

// Process the raw input string:
// 1. Use .trim() to remove any leading or trailing whitespace characters.
// 2. Use .split(" ") to break the string into an array of substrings, using space as a delimiter.
// 3. Use .map() to iterate over each substring and convert it into an integer.
//    parseInt() is used with a radix of 10 to ensure decimal conversion reliability.
let processedNumericalArguments = rawInputContentBuffer
  .trim()
  .split(" ")
  .map(strFragment => parseInt(strFragment, 10));

// --- Enhanced Input Validation (Type III Addition) ---
// Introduce a validation step to ensure that the expected number of arguments are provided.
// If fewer than two numerical arguments are found, an error message is displayed, and the process exits.
const minimumRequiredArgs = 2;
if (processedNumericalArguments.length < minimumRequiredArgs) {
    renderOutput(`Error: Expected at least ${minimumRequiredArgs} numeric inputs, but only ${processedNumericalArguments.length} were found.`);
    // Exiting with a non-zero status code indicates an abnormal termination.
    process.exit(1);
}

// --- Argument Extraction (Type II & III) ---
// Utilize array destructuring to extract the first two numerical arguments into distinct, descriptive variables.
// This is a structural change from direct array indexing.
const [primaryValue, reductionFactor] = processedNumericalArguments;

// --- Core Calculation (Type II & III) ---
// Compute an initial difference between the primary value and the reduction factor.
let preliminaryResult = primaryValue - reductionFactor;

// --- Conditional Result Determination (Type II & III) ---
// Declare a variable to store the final value that will be presented as output.
let finalComputedResult;

// Implement a conditional logic block to determine the final output based on the reduction factor.
// If the reduction factor is exactly 1, the problem specifies the output should be 0, overriding the difference.
// Otherwise, the previously calculated preliminary difference is considered the correct final result.
if (reductionFactor === 1) {
    finalComputedResult = 0;
    // An optional, non-essential logging statement for debugging or clarity (Type III addition).
    // renderOutput("Debug Info: Reduction factor was 1, so the output is set to zero.");
} else {
    finalComputedResult = preliminaryResult;
}

// --- Final Output Display (Type II) ---
// Display the determined final computed result to the console.
renderOutput(finalComputedResult);