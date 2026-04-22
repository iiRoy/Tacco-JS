// This JavaScript code is a Type III clone, significantly refactored from an original
// compact version. It aims to maintain the core functionality while introducing
// extensive structural changes, renaming, and additional helper constructs.

// Define constants for improved readability and maintainability.
const STANDARD_INPUT_SOURCE_PATH = "/dev/stdin";
const TEXT_ENCODING_FORMAT = "utf8";
const NUMBER_OF_TRANSFORMATION_STEPS = 10;
const OUTPUT_DECIMAL_PRECISION = 8;

// A dedicated function to safely acquire raw input data from a specified file path.
function acquireRawInputData(sourcePath, encoding) {
    let fileContent = "";
    try {
        // Dynamically load the Node.js file system module for I/O operations.
        const systemFileModule = require("fs");
        fileContent = systemFileModule.readFileSync(sourcePath, encoding);
    } catch (dataReadError) {
        // Log any errors encountered during file reading. In a production system,
        // more sophisticated error handling or fallback mechanisms would be implemented.
        console.error("An error occurred while attempting to read input data:", dataReadError.message);
        // Return an empty string to prevent downstream processing errors.
        return "";
    }
    return fileContent;
}

// This function encapsulates the complex numerical transformation logic for a single value.
function applyIterativeNumericTransform(initialNumericValue) {
    // Convert the input to a floating-point number. If conversion fails, default to 0.
    let currentProcessingValue = parseFloat(initialNumericValue || "0"); // Handle potential null/undefined input.
    let cumulativeCalculationSum = 0.0; // Accumulator for the modified values.

    // Pre-validation: If the input is not a valid number, return 0 immediately.
    if (isNaN(currentProcessingValue)) {
        return 0.0;
    }

    // Execute the transformation loop for a predefined number of steps.
    for (let stepIndex = 0; stepIndex < NUMBER_OF_TRANSFORMATION_STEPS; stepIndex++) {
        // Determine if the current step is an odd-indexed iteration (0-indexed).
        // (stepIndex % 2 !== 0) implies 1st, 3rd, 5th, etc., steps.
        const isCurrentStepOdd = (stepIndex % 2 !== 0);

        // Apply the specific mathematical operation based on the step's parity.
        if (isCurrentStepOdd) {
            currentProcessingValue = currentProcessingValue * 2; // Double the value for odd steps.
        } else {
            currentProcessingValue = currentProcessingValue / 3; // Divide by three for even steps.
        }
        
        // Add the value *after* transformation in the current step to the running sum.
        cumulativeCalculationSum += currentProcessingValue;
    }
    return cumulativeCalculationSum;
}

// The main execution routine, designed as an Immediately Invoked Function Expression (IIFE).
(function mainExecutionSequence() {
    // Fetch the raw text content from the standard input.
    const rawTextContent = acquireRawInputData(STANDARD_INPUT_SOURCE_PATH, TEXT_ENCODING_FORMAT);

    // Parse the raw content into an array of string tokens, splitting by any sequence of whitespace.
    const inputTokenArray = rawTextContent.split(/\s+/);

    let tokenIterationIndex = 0; // Initialize an explicit index for token traversal.

    // Process each valid token found in the input array.
    while (tokenIterationIndex < inputTokenArray.length) {
        let currentInputToken = inputTokenArray[tokenIterationIndex];
        tokenIterationIndex++; // Advance the index for the next iteration.

        // Implement a guard clause to skip empty or purely whitespace tokens.
        if (!currentInputToken || currentInputToken.trim() === "") {
            continue; // Proceed to the next token without processing.
        }

        // Perform the core calculation on the current token.
        const finalCalculatedValue = applyIterativeNumericTransform(currentInputToken);

        // Format the resulting number to a fixed number of decimal places for output.
        const formattedOutputString = finalCalculatedValue.toFixed(OUTPUT_DECIMAL_PRECISION);

        // Display the formatted result to standard output.
        console.log(formattedOutputString);
    }
})();