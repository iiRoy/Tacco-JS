// Module: CoinCombinator - Designed to find specific combinations of coins that sum to a target value.

/**
 * Validates if a given value is a non-negative integer.
 * @param {*} value - The value to validate.
 * @returns {boolean} - True if value is a non-negative integer, false otherwise.
 */
const isValidNonNegativeInteger = (value) => {
    const num = Number(value); // Ensure it's a number, handling potential string inputs
    return Number.isInteger(num) && num >= 0;
};

/**
 * Calculates the sum for a given combination of coins based on their counts and denominations.
 * This helper ensures the calculation logic is encapsulated and reusable.
 * @param {number} countHigh - Count of the highest denomination coin.
 * @param {number} countMedium - Count of the medium denomination coin.
 * @param {number} countLow - Count of the lowest denomination coin.
 * @param {object} denominations - An object containing the values of each coin type.
 * @returns {number} - The total monetary sum for the given combination.
 */
const calculateCombinationSum = (countHigh, countMedium, countLow, denominations) => {
    return (denominations.VALUE_HIGH * countHigh) +
           (denominations.VALUE_MEDIUM * countMedium) +
           (denominations.VALUE_LOW * countLow);
};


// The primary function responsible for orchestrating the combination search process.
const executeCombinationSearch = (inputPayload) => {
    // Define coin denominations as named constants for enhanced readability and ease of modification.
    const COIN_DENOMINATIONS = {
        VALUE_HIGH: 500,   // Represents the 500-unit coin value
        VALUE_MEDIUM: 100, // Represents the 100-unit coin value
        VALUE_LOW: 50      // Represents the 50-unit coin value
    };

    // Pre-process the raw input string: remove leading/trailing whitespace and split into individual lines.
    const lines = inputPayload.trim().split('\n');

    // --- Robust Input Validation and Parsing ---
    // Guard clause: Check if the number of input lines meets the minimum requirement.
    if (lines.length < 4) {
        console.warn("Warning: Input data is incomplete. Expected at least 4 lines for limits and target value.");
        console.log(0); // Output 0 combinations as input is invalid.
        return;
    }

    // Parse the numerical parameters from the input lines.
    // Each parameter represents a limit for a specific coin type or the target sum.
    const maxCountHigh = parseInt(lines[0], 10);    // Maximum allowed count for the 500-unit coin.
    const maxCountMedium = parseInt(lines[1], 10);  // Maximum allowed count for the 100-unit coin.
    const maxCountLow = parseInt(lines[2], 10);     // Maximum allowed count for the 50-unit coin.
    const targetSumValue = parseInt(lines[3], 10);  // The desired total sum to achieve.

    // Comprehensive validation for all parsed numerical inputs.
    // Ensures all parameters are valid non-negative integers before proceeding.
    if (!isValidNonNegativeInteger(maxCountHigh) ||
        !isValidNonNegativeInteger(maxCountMedium) ||
        !isValidNonNegativeInteger(maxCountLow) ||
        !isValidNonNegativeInteger(targetSumValue)) {
        console.error("Error: One or more input values are not valid non-negative integers. Please check input format.");
        console.log(0); // Output 0 for invalid numerical inputs.
        return;
    }

    // Additional guard clause: The target sum must be a multiple of the smallest coin denomination.
    // If not, it's impossible to reach the target exactly, so we can exit early.
    if (targetSumValue % COIN_DENOMINATIONS.VALUE_LOW !== 0) {
        console.log(0); // No combinations possible under this condition.
        return;
    }

    let successfulCombinations = 0; // Initialize a counter for valid combinations found.

    // --- Core Logic: Nested Loops for Combinatorial Search ---
    // The algorithm iterates through all possible counts for each coin type within their specified limits.
    // This is a brute-force approach to find all combinations.

    // Outer loop: Iterates through possible counts for the highest value coin (500 units).
    for (let currentHighCount = 0; currentHighCount <= maxCountHigh; currentHighCount++) {
        const currentHighValue = COIN_DENOMINATIONS.VALUE_HIGH * currentHighCount;

        // Optimization: If the current value from the highest coin alone already exceeds the target sum,
        // there's no need to proceed with inner loops for this `currentHighCount` or any higher counts.
        // This is because all coin values are positive.
        if (currentHighValue > targetSumValue) {
            break; // Exit the outer loop early.
        }

        // Middle loop: Iterates through possible counts for the medium value coin (100 units).
        for (let currentMediumCount = 0; currentMediumCount <= maxCountMedium; currentMediumCount++) {
            const currentMediumValue = COIN_DENOMINATIONS.VALUE_MEDIUM * currentMediumCount;
            const sumSoFar = currentHighValue + currentMediumValue;

            // Optimization: If the combined value from high and medium coins exceeds the target,
            // no need to check the lowest coin for this `currentMediumCount` or any higher.
            if (sumSoFar > targetSumValue) {
                break; // Exit the middle loop early.
            }

            // Inner loop: Iterates through possible counts for the lowest value coin (50 units).
            for (let currentLowCount = 0; currentLowCount <= maxCountLow; currentLowCount++) {
                // Calculate the total sum for the current combination using the helper function.
                const currentCombinationSum = calculateCombinationSum(
                    currentHighCount,
                    currentMediumCount,
                    currentLowCount,
                    COIN_DENOMINATIONS
                );

                // Check if the calculated sum exactly matches the desired target value.
                if (currentCombinationSum === targetSumValue) {
                    successfulCombinations++; // Increment the counter if a match is found.
                    // No 'break' here, as other combinations for different outer loop counts might still exist.
                } else if (currentCombinationSum > targetSumValue) {
                    // Optimization: If the current sum exceeds the target, and since `currentLowCount`
                    // only adds positive value, any subsequent `currentLowCount` will also exceed the target.
                    break; // Exit the inner loop early.
                }
            }
        }
    }
    
    // Display the final tally of successful combinations to standard output.
    console.log(successfulCombinations);
};

// Entry point of the script: Read raw input data from standard input.
// The data is expected to be a string, which is then passed to the main processing function.
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
executeCombinationSearch(rawInputData);