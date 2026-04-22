// This script ensures the standard input stream remains open and active
process.stdin.resume();
// Specifies that incoming data from standard input should be treated as UTF-8 encoded text
process.stdin.setEncoding('utf8');

/**
 * A utility function to safely parse a string into an integer.
 * It handles cases where the string might not represent a valid number,
 * returning a default value (0) instead of NaN.
 * @param {string} inputString - The string value to be converted to a number.
 * @returns {number} The integer representation of the string, or 0 if parsing fails.
 */
function convertToIntegerSafely(inputString) {
    const numericValue = Number(inputString);
    // If the conversion results in NaN (Not-a-Number), return 0 to prevent errors.
    return isNaN(numericValue) ? 0 : numericValue;
}

/**
 * This is the primary function responsible for processing the input data
 * and performing the main calculation logic.
 * It receives all standard input as a single string.
 * @param {string} entireInputContent - The complete raw data read from standard input.
 */
function performCoreCalculation(entireInputContent) {
    // Divide the entire input content into an array of strings, where each element
    // corresponds to a new line from the input.
    const parsedInputLines = entireInputContent.split("\n");

    // A crucial check to ensure we have enough lines of input to proceed.
    // The problem requires at least two lines for its parameters.
    if (parsedInputLines.length < 2) {
        console.error("Error: Insufficient input lines provided. Expected at least two data lines.");
        return; // Terminate execution if input is incomplete.
    }

    // Extract parameters from the first line of input.
    // The first line is expected to contain space-separated values.
    const firstLineSegments = parsedInputLines[0].split(" ");
    // Convert the first segment of the first line into our primary loop counter.
    const numberOfIterations = convertToIntegerSafely(firstLineSegments[0]);

    // Extract parameters from the second line of input.
    // The second line is also expected to contain space-separated values.
    const secondLineSegments = parsedInputLines[1].split(" ");
    // Convert the first segment of the second line into our threshold value.
    const comparisonThreshold = convertToIntegerSafely(secondLineSegments[0]);

    // Input validation: Ensure the number of iterations is positive.
    // A non-positive iteration count would mean the loop doesn't run or runs unexpectedly.
    if (numberOfIterations <= 0) {
        console.warn("Warning: The configured number of iterations is zero or negative. No operations will be executed.");
        console.info("Resulting final value: 1 (initial state)"); // Output the initial value as nothing changed.
        return; // Exit if no iterations are planned.
    }
    // Input validation: Ensure the comparison threshold is a valid number.
    if (isNaN(comparisonThreshold)) {
        console.error("Error: The comparison threshold value could not be properly interpreted.");
        return; // Exit if the threshold is invalid.
    }

    // Initialize the primary result accumulator. This variable will hold
    // the running total or computed value throughout the process.
    let currentAccumulatedValue = 1;

    // Execute the main iterative logic. The loop will run for the specified
    // 'numberOfIterations' times, adjusting the 'currentAccumulatedValue'
    // based on the 'comparisonThreshold'.
    for (let iterationIndex = 0; iterationIndex < numberOfIterations; iterationIndex++) {
        // Conditional logic: check if the current accumulated value is less than the threshold.
        if (currentAccumulatedValue < comparisonThreshold) {
            // If it is, double the accumulated value. Using a bitwise left shift
            // is an equivalent and often performant way to multiply by 2.
            currentAccumulatedValue = currentAccumulatedValue << 1;
        } else {
            // Otherwise (if current value is greater than or equal to the threshold),
            // add the threshold value to the accumulated value.
            currentAccumulatedValue = currentAccumulatedValue + comparisonThreshold;
        }
    }

    // Store the final computed value in a distinct variable for clarity before logging.
    const finalCalculatedOutcome = currentAccumulatedValue;

    // Display the ultimate computed result to the console.
    // Using console.info for general informational output.
    console.info("Final computed outcome: " + finalCalculatedOutcome);
}

// This critical line of code is responsible for reading all data from standard input
// and then passing it to our main processing function.
// It should not be altered, as it handles the interaction with the execution environment.
performCoreCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));