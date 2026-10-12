'use strict';

// Helper function to process the raw input string into a structure suitable for calculation.
// This function encapsulates the initial input transformation step.
function processInputStringForCalculation(rawInputContent) {
    // The original code uses `input.split()`. When called without arguments,
    // `split()` typically results in an array containing the original string as its single element
    // if the string does not contain whitespace, e.g., "5" -> ['5'].
    // This behavior is crucial for the subsequent implicit type coercion.
    const inputSegments = rawInputContent.split();

    // Return the array of segments. The original code then assigned this array to `r`.
    // We maintain this array structure to preserve the exact implicit coercion behavior
    // when it's used in a numeric context (multiplication).
    return inputSegments;
}

// Core function to perform the calculation and display the result.
// It receives the processed input (an array) and performs the squaring operation.
function performCalculationAndOutput(inputArrayForNumericCoercion) {
    // In the original code, `let r = input;` where `input` was the array from `split()`.
    // Then `r * r` was performed. We replicate this by assigning the array to a variable
    // and then multiplying it by itself.
    let numericContextValue = inputArrayForNumericCoercion;

    // JavaScript's implicit type coercion will convert an array with a single numeric string
    // element (e.g., `['5']`) to its numeric value (e.g., `5`) when used in a numeric context.
    // Thus, `['5'] * ['5']` becomes `5 * 5`.
    // This exact behavior, including handling of non-numeric strings (resulting in NaN)
    // or empty strings (resulting in 0), is preserved.
    let finalComputedResult = numericContextValue * numericContextValue;

    // Output the result to the console, matching the original's side effect.
    console.log(finalComputedResult);
}

// Define a constant for the standard input file path, making the source explicit.
const standardInputFilePath = "/dev/stdin";

// Read the content from the standard input file.
// This uses the 'fs' module and reads synchronously, matching the original's approach.
const fileContentFromStdin = require("fs").readFileSync(standardInputFilePath, "utf8");

// Step 1: Process the raw input string to obtain the array representation.
const processedInputArray = processInputStringForCalculation(fileContentFromStdin);

// Step 2: Perform the calculation and output the result using the processed array.
performCalculationAndOutput(processedInputArray);
