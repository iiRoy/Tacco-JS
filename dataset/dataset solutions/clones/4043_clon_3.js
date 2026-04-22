/*
 * This module processes a multi-line string input, performing numerical calculations
 * on two datasets and evaluating a specific condition. It's designed for scenarios
 * where data integrity and validation are important before core logic execution.
 */
function processInputData(rawDataText) {
    // --- Input Validation and Parsing Phase ---

    // Ensure the raw input is a valid string, not empty or of an incorrect type.
    if (typeof rawDataText !== 'string' || rawDataText.trim().length === 0) {
        console.error("Error: Provided input for processing is either not a string or is empty.");
        // In case of invalid input, we default to "No" as the outcome.
        console.log("No");
        return;
    }

    // Break down the monolithic input text into individual lines.
    // Each line is expected to hold distinct pieces of information.
    const contentLines = rawDataText.split("\n");

    // A minimum of three lines is required: one for count, two for data arrays.
    if (contentLines.length < 3) {
        console.error("Error: Insufficient number of data lines detected in the input.");
        console.log("No");
        return;
    }

    // The first line typically specifies the expected count of elements in the subsequent data arrays.
    // We trim whitespace and convert it to a numerical value.
    const expectedItemCount = Number(contentLines[0].trim());

    // Validate the parsed count: must be a positive integer.
    if (isNaN(expectedItemCount) || expectedItemCount <= 0 || !Number.isInteger(expectedItemCount)) {
        console.error("Error: The declared item count (first line) is not a valid positive integer.");
        console.log("No");
        return;
    }

    // Process the second line to obtain the first numerical sequence.
    // We split by space, filter out any empty string tokens, and then convert to numbers.
    const primaryValueSequence = contentLines[1].split(" ").filter(s => s !== '').map(Number);

    // Process the third line for the second numerical sequence, following the same parsing logic.
    const secondaryValueSequence = contentLines[2].split(" ").filter(s => s !== '').map(Number);

    // Validate that both parsed sequences conform to the `expectedItemCount`.
    if (primaryValueSequence.length !== expectedItemCount || secondaryValueSequence.length !== expectedItemCount) {
        console.error(`Error: Mismatch in dataset lengths. Expected ${expectedItemCount} items, but received primary: ${primaryValueSequence.length}, secondary: ${secondaryValueSequence.length}.`);
        console.log("No");
        return;
    }

    // Further validate that all elements within both sequences are indeed finite numbers.
    const allElementsAreValidNumbers = [...primaryValueSequence, ...secondaryValueSequence].every(num => Number.isFinite(num));
    if (!allElementsAreValidNumbers) {
        console.error("Error: One or more elements within the provided datasets are not valid finite numbers.");
        console.log("No");
        return;
    }

    // --- Core Logic and Calculation Phase ---

    // Initialize variables to accumulate sums of both sequences and a special difference quotient.
    let totalSumOfPrimary = 0;
    let totalSumOfSecondary = 0;
    let cumulativeModifiedDifference = 0; // This accumulates ceil(max(secondary_i - primary_i, 0) / 2)

    /**
     * Helper function to compute the ceiling of half the positive difference between two numbers.
     * If the difference is not positive, it contributes zero.
     * @param {number} valB - The second value (e.g., from secondaryValueSequence).
     * @param {number} valA - The first value (e.g., from primaryValueSequence).
     * @returns {number} The calculated ceiling of half the positive difference, or 0.
     */
    const calculateCeilingOfHalfPositiveDiff = (valB, valA) => {
        const directDifference = valB - valA;
        // Only proceed with calculation if the difference is strictly positive.
        if (directDifference > 0) {
            return Math.ceil(directDifference / 2);
        }
        return 0; // Negative or zero differences yield no contribution.
    };

    // Iterate through the sequences concurrently to perform calculations.
    // The loop runs for the `expectedItemCount` which is guaranteed to be the length of both arrays.
    for (let index = 0; index < expectedItemCount; ++index) {
        const currentPrimaryVal = primaryValueSequence[index];
        const currentSecondaryVal = secondaryValueSequence[index];

        // Accumulate the sum for each sequence.
        totalSumOfPrimary += currentPrimaryVal;
        totalSumOfSecondary += currentSecondaryVal;

        // Apply the specific modified difference calculation and add to the cumulative total.
        cumulativeModifiedDifference += calculateCeilingOfHalfPositiveDiff(currentSecondaryVal, currentPrimaryVal);
    }

    // --- Final Evaluation and Output Phase ---

    // The final decision is based on a comparison:
    // Is `cumulativeModifiedDifference` less than or equal to the total difference between the sums?
    // This can be expressed as: cumulativeModifiedDifference <= (totalSumOfSecondary - totalSumOfPrimary)
    // Or, equivalently and sometimes preferred for large numbers to avoid potential intermediate negative:
    // cumulativeModifiedDifference + totalSumOfPrimary <= totalSumOfSecondary
    const isConditionMet = (cumulativeModifiedDifference + totalSumOfPrimary <= totalSumOfSecondary);

    // Output the final verdict based on the evaluation.
    console.log(isConditionMet ? "Yes" : "No");
}

// Define the standard path for input file, commonly used in competitive programming environments.
const STDIN_PATH = "/dev/stdin";

// Read the content of the standard input file synchronously.
// Ensure UTF-8 encoding and trim any leading/trailing whitespace from the entire file content.
const fileContent = require("fs").readFileSync(STDIN_PATH, "utf8").trim();

// Invoke the primary processing function with the obtained file content.
processInputData(fileContent);