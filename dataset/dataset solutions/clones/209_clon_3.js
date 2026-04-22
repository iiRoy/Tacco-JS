const fileSystemUtility = require("fs");

const standardInputFileIdentifier = "/dev/stdin";
const standardTextEncoding = "utf8";
const fundamentalDivisorForFactorials = 5;

/**
 * Computes the count of trailing zeros in the factorial of a given non-negative integer.
 * This calculation is based on Legendre's formula, focusing on the prime factor 5.
 *
 * @param {number} inputValueForFactorial - The integer for which to determine trailing zeros in its factorial.
 * @returns {number} The total count of trailing zeros. Returns 0 for non-numeric, negative, or non-integer inputs.
 */
function calculateTrailingZeroesInFactorial(inputValueForFactorial) {
    // Initial validation: Ensure the input is a valid non-negative integer.
    // If the input is not a number, is negative, or is not an integer,
    // the function gracefully returns 0, mirroring behavior for 0! or invalid cases.
    if (typeof inputValueForFactorial !== 'number' || inputValueForFactorial < 0 || !Number.isInteger(inputValueForFactorial)) {
        return 0;
    }

    let currentIterationValue = inputValueForFactorial;
    let accumulatedZeroesTally = 0;

    // The loop continues as long as the current value is sufficiently large
    // to be divided by the fundamental divisor.
    // In each step, we add the integer quotient to our tally and update the value.
    while (currentIterationValue >= fundamentalDivisorForFactorials) {
        currentIterationValue = Math.floor(currentIterationValue / fundamentalDivisorForFactorials);
        accumulatedZeroesTally += currentIterationValue;
    }

    return accumulatedZeroesTally;
}

// --- Main application execution block ---
try {
    // Read all contents from the designated standard input path.
    const rawDataBuffer = fileSystemUtility.readFileSync(standardInputFileIdentifier, standardTextEncoding);

    // Divide the raw input into an array of individual lines.
    // This handles each line as a separate input for factorial calculation.
    const individualInputLines = rawDataBuffer.split('\n');

    // Process each line received from the standard input.
    for (const currentLineContent of individualInputLines) {
        // Remove any leading or trailing whitespace from the current line.
        const processedLineString = currentLineContent.trim();

        // Convert the cleaned string into its numerical representation.
        // The unary plus operator (`+`) is used here for type coercion.
        // It correctly converts an empty string to 0 and non-numeric strings to NaN,
        // which matches the behavior of the original compact code.
        const numericalInputCandidate = +processedLineString;

        // Pass the numerical input to our dedicated function for trailing zero calculation.
        // The function itself handles cases like 0, NaN, or negative numbers by returning 0,
        // thus aligning with the original code's implicit handling of these scenarios.
        const computedTrailingZeroes = calculateTrailingZeroesInFactorial(numericalInputCandidate);

        // Output the final computed result for the current line.
        console.log(computedTrailingZeroes);
    }
} catch (executionIssue) {
    // Catch and report any errors that occur during file reading or processing.
    // In competitive programming, this might just lead to a program crash or a simple error message.
    console.error("An unexpected issue arose during the input processing sequence:");
    console.error(executionIssue.message);
    // Optionally, exit the process with an error code.
    process.exit(1);
}