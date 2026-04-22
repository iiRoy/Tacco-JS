// This module provides a utility function to determine the maximum number of specific arrangements
// based on the availability of two distinct component types: 'S' and 'C'.
// The core logic aims to optimize the use of 'S' components, which are more restrictive.

/**
 * Calculates the maximum possible arrangements given counts of S and C components.
 * An arrangement requires either one 'S' component and two 'C' components (S+2C)
 * or, for leftover 'C' components, four 'C' components (4C).
 *
 * @param {string} rawInputString - A string containing two space-separated non-negative integers.
 *                                  The first integer represents the count of 'S' components,
 *                                  and the second represents the count of 'C' components.
 * @returns {number} The total count of optimal arrangements, or -1 if input is invalid.
 */
const computeOptimalArrangement = (rawInputString) => {
    // Ensure the input string is valid and not empty.
    if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim() === '') {
        console.error("Error: Input string is invalid or empty. Please provide two space-separated numbers.");
        return -1; // Indicate an error condition
    }

    // Split the raw input string by space(s) to get individual component counts as strings.
    const componentTokens = rawInputString.trim().split(/\s+/);

    // Validate if exactly two numeric tokens were provided as expected.
    if (componentTokens.length !== 2) {
        console.error("Error: Expected exactly two numeric components in input, but received " + componentTokens.length + ".");
        return -1; // Indicate an error condition
    }

    // Parse the string tokens into integer values. Use parseInt with radix 10 for explicit base.
    let sComponentCount = parseInt(componentTokens[0], 10);
    let cComponentCount = parseInt(componentTokens[1], 10);

    // Validate if parsed values are indeed non-negative integers.
    if (isNaN(sComponentCount) || isNaN(cComponentCount) || sComponentCount < 0 || cComponentCount < 0) {
        console.error("Error: Component counts must be non-negative integers. Received S=" + componentTokens[0] + ", C=" + componentTokens[1] + ".");
        return -1; // Indicate an error condition
    }

    // Initialize a variable to accumulate the total count of arrangements.
    let totalArrangements = 0;

    // A temporary variable to hold intermediate calculated values for clarity.
    let temporaryValueHolder;

    // The primary logic: determine the optimal usage strategy for components.
    // This condition checks if 'S' components are relatively more abundant than 'C' components
    // when considering the (S+2C) type of arrangement.
    // If we have more than half 'C' components' worth of 'S' components,
    // it implies 'C' components are the limiting factor for (S+2C) arrangements.
    if (sComponentCount * 2 > cComponentCount) {
        // Case 1: 'C' components are the bottleneck for forming (S+2C) arrangements.
        // We can only form as many (S+2C) combinations as allowed by the 'C' components.
        // Each (S+2C) combination uses 2 'C's.
        temporaryValueHolder = Math.floor(cComponentCount / 2);
        totalArrangements += temporaryValueHolder;
        // In this specific branch, the original logic implies no further combinations
        // are considered after utilizing 'C' components for (S+2C) arrangements.
    } else {
        // Case 2: 'S' components are the bottleneck for forming (S+2C) arrangements, or equally balanced.
        // First, utilize all available 'S' components to form (S+2C) combinations.
        // Each 'S' component allows for one (S+2C) combination.
        const initialSUtilization = sComponentCount;
        totalArrangements += initialSUtilization; // Add these combinations to the total.

        // These (S+2C) combinations also consume 'C' components. Each (S+2C) needs 2 'C's.
        // Update the count of available 'C' components.
        // Using Math.max(0, ...) ensures the count does not go negative in case of unexpected inputs,
        // though with valid inputs and logic, it should not.
        cComponentCount = Math.max(0, cComponentCount - (initialSUtilization * 2));

        // After using all 'S' components (and their corresponding 'C's),
        // check if there are any 'C' components remaining that can form additional arrangements.
        // Any remaining 'C' components can be used to form a different type of arrangement:
        // one that requires 4 'C' components.
        if (cComponentCount >= 4) {
            temporaryValueHolder = Math.floor(cComponentCount / 4);
            totalArrangements += temporaryValueHolder;
        }
        // If cComponentCount is less than 4, no further 4C arrangements can be made from remaining 'C's.
    }

    // Return the final calculated number of arrangements.
    return totalArrangements;
};

// Helper function to handle the output, abstracting the console.log operation.
const displayCalculationResult = (valueToDisplay) => {
    // Perform basic validation for the output value before logging.
    if (typeof valueToDisplay === 'number' && valueToDisplay >= -1) { // -1 is a valid error code
        console.log(valueToDisplay);
    } else {
        console.error("System Error: Calculated result is not a valid number for display:", valueToDisplay);
        // As a fallback for unexpected values, log a generic error indicator.
        console.log(-1);
    }
};

// Main execution block:
// This section reads input from standard input (/dev/stdin), typical for competitive programming.
// A robust try-catch block is used to handle potential file reading errors.
let programInputData;
try {
    // Attempt to read the input from the file system.
    // The 'utf8' encoding is specified to correctly interpret text input.
    programInputData = require("fs").readFileSync("/dev/stdin", "utf8");
} catch (fileReadError) {
    // If reading from /dev/stdin fails (e.g., during local testing or if the file path is invalid),
    // a warning is issued, and a default example input is provided.
    console.warn("Warning: Could not read input from /dev/stdin. Falling back to default example input for demonstration.");
    programInputData = "12345 678901"; // Example input for testing purposes
    // Alternatively, one could throw an error or exit the process here if default input is not desired.
    // throw new Error("Failed to read program input: " + fileReadError.message);
}

// Execute the main calculation function with the obtained input data.
const finalCalculatedArrangements = computeOptimalArrangement(programInputData);

// Display the final result using the dedicated helper function.
displayCalculationResult(finalCalculatedArrangements);

// An example of an additional, non-essential utility function.
// This function is not used in the main program flow but demonstrates Type III additions
// that might be present for debugging, future extensions, or alternative calculations.
const calculateComponentRatio = (sCount, cCount) => {
    if (cCount === 0) return sCount > 0 ? Infinity : 0;
    return sCount / (cCount / 2);
};
// console.log("Debug Info: S to C/2 ratio for example input: " + calculateComponentRatio(12345, 678901)); // Example usage.