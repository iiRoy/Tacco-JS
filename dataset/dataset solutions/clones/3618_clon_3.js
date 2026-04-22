// A utility function to safely parse an integer from a string.
const parseNumericValue = (strVal, radix = 10) => {
    // Attempt to convert the string to a number.
    const numericForm = Number(strVal);

    // Validate if the conversion resulted in a valid number.
    if (isNaN(numericForm)) {
        // Log a warning for non-numeric input and return a default safe value.
        console.error("Warning: Input string could not be interpreted as a number:", strVal);
        return 0; // A reasonable default for invalid numeric data.
    }
    // Ensure the number is an integer, handling potential floating-point results.
    return Math.floor(numericForm);
};

// Main entry point for processing the raw input data from the system.
function ProcessSystemInput(rawInputData) {
    // The raw input is expected to be a single string; split it into individual lines.
    const dataLines = rawInputData.split('\n');

    // Implement a guard clause to ensure essential input data is present.
    if (dataLines.length === 0 || dataLines[0].trim() === '') {
        console.error("Error: No valid input lines detected or the first line is empty.");
        // Terminate execution if critical input is missing.
        return;
    }

    // Extract the first line, remove leading/trailing whitespace, and split by one or more spaces.
    const numericTokens = dataLines[0].trim().split(/\s+/);

    // Another guard clause to verify the expected number of numerical tokens.
    if (numericTokens.length < 2) {
        console.error("Error: Insufficient numerical tokens found on the initial input line.");
        return;
    }

    // Parse the first token as the primary number for the division check.
    const mainDividendCandidate = parseNumericValue(numericTokens[0]);
    // Parse the second token as the value to check for modulo.
    const divisorForModulusOperation = parseNumericValue(numericTokens[1]);

    let finalComputationResult; // This variable will hold the binary outcome (0 or 1).

    // Introduce an intermediate boolean variable to clearly represent the divisibility condition.
    // Also, explicitly check for a non-zero divisor to prevent NaN from modulo by zero.
    const isEvenlyDivisible = (divisorForModulusOperation !== 0 && mainDividendCandidate % divisorForModulusOperation === 0);

    // Assign the result based on the divisibility check.
    if (isEvenlyDivisible) {
        finalComputationResult = 0; // If the candidate is perfectly divisible, the result is zero.
    } else {
        finalComputationResult = 1; // Otherwise (not divisible or divisor was zero), the result is one.
    }

    // Output the computed result to standard output, ensuring it's treated as a string.
    console.log(String(finalComputationResult));
}

// Execute the primary processing function by reading all data from standard input.
// The 'utf8' encoding is specified for proper character interpretation.
ProcessSystemInput(require("fs").readFileSync("/dev/stdin", "utf8"));