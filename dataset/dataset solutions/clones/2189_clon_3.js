'use strict';

/**
 * Analyzes a given text-based input to determine if a specific numerical condition holds true.
 * This function expects the input to contain at least two lines:
 * - The first line should contain a single integer representing a threshold value.
 * - The second line should contain multiple space-separated integers, which will be summed.
 * The condition is met if the sum of the integers from the second line is greater than or equal to the threshold.
 *
 * @param {string} rawInputString - The complete raw string received, typically from a standard input stream.
 */
function evaluateDataCondition(rawInputString) {
    // Pre-process the input string: ensure it's a string and trim any leading/trailing whitespace.
    const cleanedInput = String(rawInputString || '').trim();

    // Implement a guard clause for empty input.
    if (!cleanedInput) {
        // In a production environment, this might throw an error or log more extensively.
        console.error("Error: No data provided for analysis.");
        return;
    }

    // Break down the cleaned input into individual lines.
    // We anticipate at least two lines for valid processing.
    const dataLines = cleanedInput.split('\n');

    // Another guard clause: check if the minimum required number of lines is present.
    if (dataLines.length < 2) {
        console.warn("Insufficient input lines. Expected at least two lines of numerical data.");
        // Depending on requirements, we might default to 'No' or exit here.
        return;
    }

    // Extract and parse the threshold value from the initial line.
    // Split by one or more whitespace characters and filter out any empty strings.
    const thresholdTokens = dataLines[0].split(/\s+/).filter(token => token.length > 0);

    // Validate if a threshold token was successfully extracted.
    if (thresholdTokens.length === 0) {
        console.error("Parsing error: No valid threshold value found on the first line.");
        return;
    }

    // Convert the first token from the first line into a number.
    const comparisonThreshold = Number(thresholdTokens[0]);

    // Validate the numerical integrity of the parsed threshold.
    if (isNaN(comparisonThreshold)) {
        console.error(`Data conversion error: '${thresholdTokens[0]}' is not a valid number for the threshold.`);
        return;
    }

    // Process the second line to accumulate the data points.
    const numericalTokens = dataLines[1].split(/\s+/).filter(token => token.length > 0);

    // Use a functional approach (reduce) to sum up all numerical values.
    // Each token is converted to a number, and any non-numeric tokens are treated as zero.
    const totalAccumulatedValue = numericalTokens.reduce((currentSum, currentToken) => {
        const parsedValue = Number(currentToken);
        return currentSum + (isNaN(parsedValue) ? 0 : parsedValue);
    }, 0); // Initialize the sum with zero.

    // Evaluate the primary condition: is the accumulated sum greater than or equal to the threshold?
    const isSumSufficient = (totalAccumulatedValue >= comparisonThreshold);

    // Output the result based on the evaluation using a concise ternary expression.
    console.log(isSumSufficient ? "Yes" : "No");
}

// The following code block is responsible for standard input/output handling.
// It should typically remain unaltered to ensure proper interaction with system environments.
// It reads all available data from standard input and dispatches it to our main processing routine.
evaluateDataCondition(require("fs").readFileSync("/dev/stdin", "utf8"));