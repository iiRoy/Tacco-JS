/**
 * This module provides a specialized recursive function to calculate
 * a sum based on certain divisor properties of numbers.
 * It also includes an entry point for processing standard input.
 */

/**
 * Recursively calculates a cumulative sum based on specific divisor conditions
 * for a given target value and a threshold.
 *
 * @param {number} targetValue The main number 'm' to analyze for divisors.
 * @param {number} limitThreshold The threshold 'd' used in the divisor conditions.
 * @returns {number} The total calculated sum based on the defined criteria.
 */
function calculateSpecialDivisorSum(targetValue, limitThreshold) {

    /**
     * An internal helper function that recursively probes for factors of the
     * current `targetValue` starting from a given candidate number.
     * Factors are counted based on specific conditions involving `limitThreshold`.
     *
     * @param {number} currentFactorCandidate The number 'n' from which to start checking for factors.
     * @returns {number} The sum of contributions from factors found for the current `targetValue`.
     */
    const probeForFactors = (currentFactorCandidate) => {
        // Optimization: If the square of the current candidate exceeds the target,
        // any further candidates would have their corresponding factors already found
        // or would be less than the current candidate, so we stop.
        const candidateSquared = currentFactorCandidate * currentFactorCandidate;
        if (candidateSquared > targetValue) {
            return 0; // No more unique factor pairs to consider.
        }

        let currentIterationContribution = 0;
        // Determine if the current candidate is a perfect divisor of the target value.
        const remainderAfterDivision = targetValue % currentFactorCandidate;

        if (remainderAfterDivision === 0) { // If `currentFactorCandidate` perfectly divides `targetValue`.
            const correspondingFactor = targetValue / currentFactorCandidate;

            // Condition Check 1: The corresponding factor must be a single-digit number (i.e., less than 10).
            if (correspondingFactor < 10) {
                // Create a new value by conceptually concatenating (digit-wise) the corresponding factor
                // and the current candidate. For example, if correspondingFactor=5 and currentFactorCandidate=3,
                // this value becomes 53.
                const combinedNumericValue = (correspondingFactor * 10) + currentFactorCandidate;

                // Condition Check 2: The combined numeric value must be less than the global `limitThreshold`.
                // Condition Check 3: The two factors (`correspondingFactor` and `currentFactorCandidate`) must be distinct.
                // This prevents double-counting for perfect squares when the factors are the same.
                if (combinedNumericValue < limitThreshold && correspondingFactor !== currentFactorCandidate) {
                    currentIterationContribution = 2; // Count both factors as distinct and meeting criteria.
                } else {
                    currentIterationContribution = 1; // Count one factor (either distinct or identical factors).
                }
            }
        }
        // Recursively continue checking with the next potential factor candidate
        // and add its contribution to the current one.
        return currentIterationContribution + probeForFactors(currentFactorCandidate + 1);
    };

    // Base condition for the outer recursive function:
    // If the target value is less than 4, it doesn't meet the problem's criteria for
    // meaningful divisor calculations, so we return zero.
    if (targetValue < 4) {
        return 0;
    }

    // Calculate the contribution from the current `targetValue` by starting the
    // factor probe from the number 2.
    const currentTargetContribution = probeForFactors(2);

    // Recursively call this function for the decremented target value
    // to accumulate results from previous numbers.
    const accumulatedPreviousContribution = calculateSpecialDivisorSum(targetValue - 1, limitThreshold);

    // The total sum is the combination of the current target's contribution
    // and the sum from all preceding target values.
    return currentTargetContribution + accumulatedPreviousContribution;
}

/**
 * The primary entry point function responsible for reading and parsing program input,
 * then orchestrating the divisor calculation, and finally displaying the result.
 *
 * @param {string} rawInputString The raw string input, typically from standard input.
 */
function ProcessInputData(rawInputString) {
    // Clean and split the input string by space to get individual parameters.
    const inputComponents = rawInputString.trim().split(" ");

    // Input validation: Ensure that at least two numerical components are provided.
    if (inputComponents.length < 2) {
        console.error("Error: Not enough input parameters. Expected two numeric values.");
        return; // Terminate execution if input is invalid.
    }

    // Parse the string components into integer numbers, using base 10.
    let firstNumericParam = parseInt(inputComponents[0], 10);
    let secondNumericParam = parseInt(inputComponents[1], 10);

    // Further validation: Check if the parsed values are indeed valid numbers.
    if (isNaN(firstNumericParam) || isNaN(secondNumericParam)) {
        console.error("Error: One or both input parameters could not be parsed as valid numbers.");
        return; // Terminate if parsing failed.
    }

    // Store the validated and parsed parameters in a structured object
    // for clearer passing to the calculation function.
    const calculationParameters = {
        primaryValue: firstNumericParam,
        comparisonThreshold: secondNumericParam
    };

    // Execute the main calculation logic with the prepared parameters.
    const finalResultantSum = calculateSpecialDivisorSum(
        calculationParameters.primaryValue,
        calculationParameters.comparisonThreshold
    );

    // Output the final computed sum to the console, using a template literal for clarity.
    console.log(`The final computed divisor sum is: ${finalResultantSum}`);
}

// This line handles reading from standard input and invoking the main processing function.
// It should not be modified as it's part of the environment setup.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));