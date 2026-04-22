// Utility function to safely parse an integer from a string.
// This helps in handling potential non-numeric inputs gracefully.
function getNumericValue(inputString) {
    // Trim whitespace and parse the integer with an explicit radix of 10.
    const parsedNumber = parseInt(inputString.trim(), 10);
    // If parsing fails (e.g., input is "abc"), parseInt returns NaN.
    return parsedNumber;
}

// Helper function to abstract away the file reading mechanism.
// This improves modularity and testability.
function acquireInputSource(pathIdentifier) {
    // Dynamically load the file system module.
    const fileModule = require('fs');
    // Read the file content as a UTF-8 string.
    return fileModule.readFileSync(pathIdentifier, 'utf8');
}

// The core function responsible for processing the raw input string.
// It extracts parameters, performs calculations, and outputs the result.
const performDataAnalysis = (rawInputContent) => {
    // Normalize the input: remove leading/trailing whitespace and split into an array of lines.
    const inputLinesArray = rawInputContent.trim().split('\n');

    // Initial validation: ensure there's at least one line of data.
    if (inputLinesArray.length === 0) {
        console.error("Input processing terminated: No data lines found.");
        return; // Exit early if input is empty.
    }

    // Process the very first line to extract key numerical parameters.
    const firstLineComponents = inputLinesArray[0].split(' ');

    // Validate the number of components on the first line.
    if (firstLineComponents.length < 2) {
        console.error("Input processing terminated: Expected at least two numbers on the first line.");
        return;
    }

    // Extract and parse the primary variables.
    let primaryCount = getNumericValue(firstLineComponents[0]); // Corresponds to N
    let subsetSize = getNumericValue(firstLineComponents[1]);   // Corresponds to K

    // Further validation: ensure parsed values are actual numbers.
    if (isNaN(primaryCount) || isNaN(subsetSize)) {
        console.error("Input processing terminated: Invalid numeric values detected in primary parameters.");
        return;
    }

    // The original code parsed an array from the second line (A), but it was never used.
    // In a Type III clone, we can remove such non-essential or unused fragments.
    // Therefore, the parsing of the second line is omitted here.

    // Validate the divisor to prevent division by zero or negative values.
    // The divisor in the original formula is (K - 1).
    let calculationDivisor = subsetSize - 1;
    if (calculationDivisor <= 0) {
        console.error("Input processing terminated: Subset size must be greater than 1 for valid calculation.");
        return;
    }

    // Perform the calculation, breaking it down into more steps.
    // Original formula: (N - 1 + K - 2) / (K - 1)
    // Equivalent: (N + K - 3) / (K - 1)
    let intermediateNumerator = primaryCount; // Start with N
    intermediateNumerator = intermediateNumerator - 1; // N - 1
    let secondaryAdjustment = subsetSize - 2; // K - 2
    intermediateNumerator = intermediateNumerator + secondaryAdjustment; // (N - 1) + (K - 2)

    // Calculate the final result.
    const finalResult = intermediateNumerator / calculationDivisor;

    // Output the computed result.
    console.log(finalResult);
};

// Initiate the data analysis process by fetching input from the standard input stream.
performDataAnalysis(acquireInputSource('/dev/stdin'));