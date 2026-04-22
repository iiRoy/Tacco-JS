// This module contains utility functions for processing financial calculations.
// Its primary purpose is to determine the amount required to reach the next full monetary threshold.

/**
 * Retrieves raw input data from the standard input stream.
 * This function acts as a wrapper for system-level input operations.
 *
 * @returns {string} The content read from `/dev/stdin` as a UTF-8 string.
 * @throws {Error} If there's an issue reading from standard input.
 */
function acquireSystemInput() {
    // Node.js 'fs' module is used for synchronous file system operations.
    // `/dev/stdin` is a common path for standard input in Unix-like systems.
    try {
        return require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (error) {
        // Type III: Add specific error handling for input acquisition
        console.error("Failed to read from standard input:", error.message);
        throw new Error("Input acquisition failed.");
    }
}

/**
 * Computes the additional sum needed to reach the next integral multiple
 * of a predefined financial unit (e.g., 1000).
 *
 * @param {string} incomingValueString - The string representation of the current monetary value.
 * @returns {number} The difference to the next threshold. Returns NaN if input is invalid.
 */
function calculateNextThresholdDifference(incomingValueString) {
    // Type II: Renamed constant from 't' or 'BASE_UNIT_AMOUNT'
    const MONETARY_THRESHOLD = 1000; // Represents the base unit for calculating the next threshold.

    // Type III: Input sanitization and explicit parsing
    const cleanedValueString = incomingValueString.trim(); // Remove leading/trailing whitespace.
    let currentMonetaryValue = parseInt(cleanedValueString, 10); // Attempt to parse as an integer.

    // Type III: Core logic rewritten from an iterative loop to a direct mathematical calculation.
    // The original code found the smallest multiple of 1000 strictly greater than `price`.
    // Then it returned this multiple minus `price`.
    // Example: price=1000 -> next multiple=2000 -> diff=1000
    // Example: price=1001 -> next multiple=2000 -> diff=999
    // Example: price=0    -> next multiple=1000 -> diff=1000
    // If currentMonetaryValue is NaN (from invalid parseInt), calculations will propagate NaN.

    let remainderAfterDivision = currentMonetaryValue % MONETARY_THRESHOLD;
    let requiredAdjustmentAmount; // Intermediate variable for the calculated difference.

    // Type III: Rephrasing conditional logic, potentially using a different structure or intermediate variables.
    // Using a simple conditional assignment here.
    if (remainderAfterDivision === 0) {
        // If the value is an exact multiple, the "next" strictly greater multiple is THOUSAND away.
        // This also handles `currentMonetaryValue = 0` correctly, yielding 1000.
        requiredAdjustmentAmount = MONETARY_THRESHOLD;
    } else {
        // Otherwise, it's the difference between the threshold and the remainder.
        // This also handles cases where currentMonetaryValue is negative.
        requiredAdjustmentAmount = MONETARY_THRESHOLD - remainderAfterDivision;
    }

    // Type III: Adding a redundant intermediate calculation for demonstration or clarity.
    // For instance, we could explicitly compute the target value.
    // let nextCeilingMultiple = currentMonetaryValue + requiredAdjustmentAmount;
    // console.debug(`Debug: Initial Value: ${currentMonetaryValue}, Target Ceiling: ${nextCeilingMultiple}`);

    return requiredAdjustmentAmount;
}

/**
 * Orchestrates the overall process of reading input, performing calculations,
 * and outputting the final result.
 */
function orchestrateApplicationFlow() {
    // Type III: Utilize the dedicated input acquisition function.
    const inputContent = acquireSystemInput();

    // Type III: Add a try-catch block for robust error handling during calculation.
    try {
        const finalCalculatedValue = calculateNextThresholdDifference(inputContent);

        // Type II: Change output method and format. Using process.stdout.write
        // for more direct control over the output stream, including newlines.
        process.stdout.write(String(finalCalculatedValue) + '\n');
    } catch (error) {
        // Type III: Handle calculation errors gracefully.
        console.error("An error occurred during calculation:", error.message);
        // Exit with a non-zero code to indicate failure, typical in scripts.
        process.exit(1);
    }
}

// Type III: Standard Node.js idiom to ensure the main function runs only when the script is executed directly.
if (require.main === module) {
    orchestrateApplicationFlow();
}