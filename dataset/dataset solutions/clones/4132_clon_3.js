/*
 * This script analyzes a set of four numerical inputs to determine
 * the balance state of an imaginary scale.
 * It compares the sum of the first two values (left side)
 * against the sum of the last two values (right side).
 * The output indicates whether the scale is 'Left' heavy, 'Right' heavy,
 * or 'Balanced'.
 */

/**
 * Parses a string value into an integer. If the string cannot be
 * converted to a valid number, it defaults to 0, mimicking the behavior
 * of bitwise NOT operator (~~) for non-numeric inputs.
 * @param {string} inputString - The string to be parsed.
 * @returns {number} The parsed integer, or 0 if parsing fails.
 */
const safeNumericConversion = (inputString) => {
    // Ensure the input is treated as a string before attempting conversion.
    const numericCandidate = Number(String(inputString).trim());
    // If the conversion results in NaN (Not a Number), return 0.
    // Otherwise, return the converted number.
    return isNaN(numericCandidate) ? 0 : numericCandidate;
};

/**
 * Orchestrates the balance evaluation based on input data.
 * It processes the raw input string, calculates the sums for
 * both sides of the scale, and determines the final balance status.
 * @param {string} rawDataPayload - A string containing space or newline-separated numbers.
 */
function evaluateWeightDistribution(rawDataPayload) {
    // A variable to store the descriptive status of the scale balance.
    let balanceAssessment = 'Balanced'; // Default assumption

    // Guard clause: Check if the input payload is empty or not a string.
    if (!rawDataPayload || typeof rawDataPayload !== 'string' || rawDataPayload.trim().length === 0) {
        console.log("Invalid Input Data");
        return; // Exit early if input is invalid.
    }

    // Split the raw input string into individual tokens based on whitespace.
    // Filter out any empty strings that might result from multiple spaces.
    const rawValueTokens = rawDataPayload.split(/\s+/).filter(Boolean);

    // Ensure we have at least four numeric values for comparison.
    // If not, print an error and exit.
    if (rawValueTokens.length < 4) {
        console.log("Insufficient Data Provided");
        return;
    }

    // Convert the first four tokens into numeric values using the safe converter.
    const processedNumericSet = rawValueTokens.slice(0, 4).map(safeNumericConversion);

    // Extract individual weight components for clarity.
    const firstItemWeight = processedNumericSet[0];
    const secondItemWeight = processedNumericSet[1];
    const thirdItemWeight = processedNumericSet[2];
    const fourthItemWeight = processedNumericSet[3];

    // Calculate the total weight for the left side of the scale.
    const leftSideTotalWeight = firstItemWeight + secondItemWeight;
    // Calculate the total weight for the right side of the scale.
    const rightSideTotalWeight = thirdItemWeight + fourthItemWeight;

    // Determine the net difference between the two sides.
    const netWeightDifference = leftSideTotalWeight - rightSideTotalWeight;

    // Use a conditional structure to set the balance assessment.
    // This uses a nested 'if' to clearly separate the 'not balanced' cases.
    if (netWeightDifference !== 0) {
        // If the difference is not zero, the scale is not balanced.
        if (netWeightDifference > 0) {
            // A positive difference means the left side is heavier.
            balanceAssessment = 'Left';
        } else {
            // A negative difference means the right side is heavier.
            balanceAssessment = 'Right';
        }
    }
    // If netWeightDifference is 0, balanceAssessment remains 'Balanced' from its initial assignment.

    // Output the final balance status to the console.
    console.log(balanceAssessment);
}

// Entry point of the script: read input from standard input and process it.
const systemInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
evaluateWeightDistribution(systemInputContent);