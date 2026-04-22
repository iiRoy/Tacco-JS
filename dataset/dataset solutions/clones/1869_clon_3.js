/*
 * This module is designed to process a string of numerical inputs,
 * performing a specific conditional arithmetic operation.
 * It expects a sequence of four integer values, space-separated,
 * from which it derives two primary operands and a threshold value
 * for its calculation logic.
 */
const ProcessInputData = (sourceDataString) => {
    // --- Input Validation and Pre-processing ---

    // Initial check for null, undefined, or non-string input, or an empty string.
    if (!sourceDataString || typeof sourceDataString !== 'string' || sourceDataString.trim().length === 0) {
        // In a real application, this might throw an error or return a specific status.
        console.error("Error: The provided input data is either empty, null, or not a string. Cannot proceed.");
        return;
    }

    // Split the raw string into individual components based on space.
    // Trimming ensures no leading/trailing whitespace affects the split.
    const tokenizedValues = sourceDataString.trim().split(/\s+/); // Using regex to handle multiple spaces

    // Define the minimum number of tokens expected for the core logic.
    const REQUIRED_TOKEN_COUNT = 4;

    // Validate if enough numerical tokens were provided.
    if (tokenizedValues.length < REQUIRED_TOKEN_COUNT) {
        console.error(`Error: Insufficient numerical tokens provided. Expected at least ${REQUIRED_TOKEN_COUNT}, but received ${tokenizedValues.length}.`);
        return;
    }

    // --- Parsing Numerical Inputs ---

    // Parse the first operand, representing a positive contribution or initial state.
    // Explicitly using radix 10 for decimal conversion.
    const initialPositiveContribution = parseInt(tokenizedValues[0], 10);

    // Parse the second operand, representing a neutral or additional contribution.
    const supplementaryContribution = parseInt(tokenizedValues[1], 10);

    // The third token (index 2) was present in the original input but was never utilized
    // in the core calculation logic. As part of Type III cloning, non-essential fragments
    // can be removed. Hence, the parsing of tokenizedValues[2] is deliberately omitted here,
    // showcasing a deletion of dead code.
    // Original: const unusedValue = parseInt(tokenizedValues[2], 10);

    // Parse the fourth token, which serves as the critical threshold or limit.
    const operationalThreshold = parseInt(tokenizedValues[3], 10);

    // --- Post-Parsing Validation ---

    // Verify that all critical parsed values are indeed valid numbers.
    if (isNaN(initialPositiveContribution) || isNaN(supplementaryContribution) || isNaN(operationalThreshold)) {
        console.error("Error: One or more essential input values could not be parsed as valid numbers (resulted in NaN).");
        return;
    }

    // --- Core Calculation Logic ---

    // Calculate the combined sum of the initial and supplementary contributions.
    const totalCurrentContribution = initialPositiveContribution + supplementaryContribution;

    // Evaluate the condition: Is the total contribution greater than or equal to the threshold?
    if (totalCurrentContribution >= operationalThreshold) {
        // If the condition is met, the outcome is simply the initial positive contribution.
        // A temporary variable is used for clarity before outputting.
        const directResult = initialPositiveContribution;
        console.log(directResult);
    } else {
        // If the total contribution is less than the threshold, a different calculation is performed.
        // This path indicates a 'shortfall' or 'deficit' scenario.

        // First, calculate the magnitude of the deficit relative to the threshold.
        // This represents how much the 'totalCurrentContribution' falls short of the 'operationalThreshold'.
        const requiredAdjustmentAmount = operationalThreshold - totalCurrentContribution; // Equivalent to k - (a + b)

        // Then, adjust the initial positive contribution by subtracting this deficit.
        // This formula (initialPositiveContribution - requiredAdjustmentAmount)
        // is mathematically equivalent to (a - (k - a - b)), which simplifies to (2 * a + b - k).
        const adjustedOutputValue = initialPositiveContribution - requiredAdjustmentAmount;
        
        // Output the final computed value for this scenario.
        console.log(adjustedOutputValue);
    }
};

// --- Execution Entry Point ---

// This block ensures the function is called with data read from standard input.
// It's a common pattern in environments like competitive programming.
// The 'utf8' encoding is specified for robust string handling.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));