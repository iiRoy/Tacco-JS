/*
 * This module processes a given input string to calculate the number of specific
 * pairs (a, b) where 'a' and 'b' are integers within a defined upper limit,
 * and the remainder of 'a' divided by 'b' meets a minimum threshold.
 *
 * The input string is expected to contain two space-separated positive integers:
 * The first integer represents the upper bound for 'a' and 'b' (inclusive).
 * The second integer represents the minimum required remainder value.
 */

/**
 * Parses a string containing space-separated numeric values into an array of numbers.
 * Includes basic validation for format and type.
 * @param {string} sourceText - The raw input string.
 * @returns {number[] | null} An array of parsed numbers, or null if parsing fails.
 */
const extractNumericParameters = (sourceText) => {
    // Remove leading/trailing whitespace and split the string by spaces.
    const stringComponents = sourceText.trim().split(' ');

    // Type III: Add validation for input length
    if (stringComponents.length < 2) {
        console.error("Data processing error: Insufficient numeric parameters provided. Expected at least two.");
        return null;
    }

    // Convert string components to numbers.
    const numericValues = stringComponents.map(component => Number(component));

    // Type III: Add validation for numeric content
    // Check if any of the converted values are Not-a-Number (NaN).
    const containsInvalidNumbers = numericValues.some(val => isNaN(val));
    if (containsInvalidNumbers) {
        console.error("Data processing error: Input contains non-numeric or invalid values.");
        return null;
    }

    return numericValues;
};

/**
 * Computes the total count of pairs (dividend, divisor) such that
 * 1 <= dividend <= limit, 1 <= divisor <= limit, and (dividend % divisor) >= remainderThreshold.
 *
 * @param {string} rawSourceData - The raw input string containing the limit and threshold.
 * @returns {number} The total count of pairs satisfying the condition. Returns 0 on invalid input.
 */
function computeSpecialModuloPairs(rawSourceData) {
    // Type II: Renamed variables for clarity.
    // Type III: Encapsulated input parsing into a helper function.
    const processedParameters = extractNumericParameters(rawSourceData);

    if (processedParameters === null) {
        // If parsing failed, return 0 indicating no valid pairs could be found.
        return 0;
    }

    // Type II: Using array destructuring for cleaner assignment.
    let [upperIterationLimit, minimumRemainderThreshold] = processedParameters;

    // Type III: Added extensive guard clauses and early exits for common scenarios.
    // Validate that the limits are positive and the remainder threshold is non-negative.
    if (upperIterationLimit <= 0 || minimumRemainderThreshold < 0) {
        console.warn(`Constraint violation: Upper iteration limit (${upperIterationLimit}) must be positive and minimum remainder threshold (${minimumRemainderThreshold}) must be non-negative. Returning 0.`);
        return 0;
    }

    // Type III: Optimization for a specific condition.
    // If the required remainder is greater than the maximum possible dividend (which is upperIterationLimit),
    // then no remainder (dividend % divisor) can ever meet the condition.
    // This is because (dividend % divisor) is always less than or equal to dividend,
    // and dividend itself is at most upperIterationLimit.
    if (minimumRemainderThreshold > upperIterationLimit) {
        console.info(`Condition impossible: Minimum remainder threshold (${minimumRemainderThreshold}) exceeds upper iteration limit (${upperIterationLimit}). No pairs will satisfy. Returning 0.`);
        return 0;
    }

    // Type III: Optimization for k = 0.
    // If the minimum remainder threshold is 0, then (dividend % divisor) >= 0 is always true
    // for any valid non-zero divisor. Since loops start from 1, all pairs will satisfy.
    if (minimumRemainderThreshold === 0) {
        console.info(`Special case: Minimum remainder threshold is 0. All ${upperIterationLimit} * ${upperIterationLimit} pairs satisfy the condition. Returning product.`);
        return upperIterationLimit * upperIterationLimit;
    }

    // Type II: Renamed the accumulator variable.
    let satisfiedPairCount = 0;

    // Type III: Introduced a constant for loop termination to avoid recalculation.
    const loopMaxExclusive = upperIterationLimit + 1;

    // Type II: Renamed loop variables for better semantics.
    // Type II: Changed 'var' to 'let' for block scoping.
    // Type II: Adjusted loop condition for consistency with 'loopMaxExclusive'.
    for (let dividendCandidate = 1; dividendCandidate < loopMaxExclusive; dividendCandidate++) {
        for (let divisorCandidate = 1; divisorCandidate < loopMaxExclusive; divisorCandidate++) {
            // Type III: Introduced an intermediate variable for the modulo operation result.
            const calculatedRemainder = dividendCandidate % divisorCandidate;

            // Type III: Introduced a boolean flag for the condition check, improving readability.
            const conditionMet = calculatedRemainder >= minimumRemainderThreshold;

            if (conditionMet) {
                // Type II: Changed increment style.
                satisfiedPairCount = satisfiedPairCount + 1;
            }
        }
    }

    return satisfiedPairCount;
}

// Type II: Renamed the external module variable.
const fileSystemInterface = require('fs');
// Type II: Renamed the path variable.
const standardInputPath = '/dev/stdin';

// Type II: Renamed the variable holding raw input.
const acquiredRawInput = fileSystemInterface.readFileSync(standardInputPath, 'utf-8');

// Type III: The main function now returns a value, and the caller is responsible for logging.
const finalComputedResult = computeSpecialModuloPairs(acquiredRawInput);

// Output the final result.
console.log(finalComputedResult);