// This module contains a set of functions designed to process a numeric input
// to find specific numbers meeting certain divisibility criteria.

/**
 * Computes the factorial of a given non-negative integer.
 * It uses BigInt to handle potentially very large factorial results,
 * as standard JavaScript numbers can overflow quickly.
 *
 * @param {number} inputNumber - The non-negative integer for which to calculate the factorial.
 * @returns {bigint | NaN} The factorial as a BigInt, or NaN if the input is invalid.
 */
const computeFactorial = (inputNumber) => {
    // Input validation: Factorial is mathematically defined for non-negative integers.
    if (inputNumber < 0 || !Number.isInteger(inputNumber)) {
        console.error("Error: Factorial input must be a non-negative integer.");
        return NaN; // Indicate an invalid result.
    }

    // Base case for factorial: 0! is 1 by definition.
    if (inputNumber === 0) {
        return 1n; // Return as BigInt for consistency.
    }

    let currentProduct = 1n; // Initialize accumulator as BigInt.
    let iterationIndex = 1n; // Initialize loop counter as BigInt.

    // Loop from 1 up to inputNumber, multiplying each value.
    while (iterationIndex <= inputNumber) {
        currentProduct *= iterationIndex;
        iterationIndex++;
    }

    return currentProduct;
};

/**
 * Determines the total count of positive divisors for a given integer (or BigInt).
 * This implementation iterates through all numbers up to the value itself.
 *
 * @param {number | bigint} valueToAnalyze - The positive integer or BigInt for which to count divisors.
 * @returns {number} The total count of positive divisors. Returns 0 for invalid inputs.
 */
const countPositiveDivisors = (valueToAnalyze) => {
    // Input validation: Divisor count is typically for positive integers.
    if (typeof valueToAnalyze === 'number') {
        if (!Number.isInteger(valueToAnalyze) || valueToAnalyze <= 0) {
            // console.warn("Warning: Numeric divisor count input must be a positive integer.");
            return 0;
        }
        // Convert number to BigInt for consistent BigInt operations within the function.
        valueToAnalyze = BigInt(valueToAnalyze);
    } else if (typeof valueToAnalyze !== 'bigint' || valueToAnalyze <= 0n) {
        // console.warn("Warning: BigInt divisor count input must be a positive BigInt.");
        return 0;
    }

    let divisorTally = 0;
    let potentialDivisor = 1n; // Start checking from 1, as a BigInt.

    // Iterate through all numbers from 1 up to the value itself.
    // This approach is straightforward but not optimized for very large numbers (e.g., sqrt(N) method).
    while (potentialDivisor <= valueToAnalyze) {
        // Check if the current potential divisor divides the value without remainder.
        if (valueToAnalyze % potentialDivisor === 0n) {
            divisorTally++; // Increment the count if it's a divisor.
        }
        potentialDivisor++;
    }

    return divisorTally;
};

/**
 * The primary function that orchestrates the program's logic.
 * It reads a numeric input, calculates its factorial, and then identifies
 * numbers below this factorial that are divisors of the factorial and
 * possess exactly 75 positive divisors themselves.
 *
 * @param {string} programInput - The raw string input, typically from stdin.
 */
const executeMainProgram = (programInput) => {
    // Helper function to safely parse the initial numeric input.
    const parseNumericArgument = (inputString) => {
        // Extract the first line of the input string and convert it to a number.
        const cleanedNumericValue = Number(inputString.split("\n")[0]);

        // Validate if the parsed value is a valid, positive integer.
        if (Number.isNaN(cleanedNumericValue) || !Number.isInteger(cleanedNumericValue) || cleanedNumericValue < 1) {
            console.error("Program Aborted: Invalid input detected. Please provide a positive integer.");
            return null; // Indicate parsing failure.
        }
        return cleanedNumericValue;
    };

    const initialNumericValue = parseNumericArgument(programInput);

    // Guard clause: Exit if input parsing failed.
    if (initialNumericValue === null) {
        return;
    }

    // Calculate the upper bound for our search space by computing the factorial.
    // The result is a BigInt to prevent overflow for larger inputs.
    const calculatedFactorialLimit = computeFactorial(initialNumericValue);

    // Initialize a counter for numbers that satisfy the specific divisor criteria.
    let desiredDivisorCountMatch = 0;

    // Additional guard: Ensure the factorial calculation yielded a valid BigInt.
    if (typeof calculatedFactorialLimit !== 'bigint' || calculatedFactorialLimit <= 0n) {
        console.error("Program Aborted: Factorial calculation resulted in an invalid upper bound.");
        return;
    }

    // Iterate through numbers from 1 up to (but not including) the calculated factorial limit.
    // All iteration variables and comparisons must use BigInt for consistency with calculatedFactorialLimit.
    for (let currentCandidate = 1n; currentCandidate < calculatedFactorialLimit; currentCandidate++) {
        // First condition: Check if the current number is a divisor of the main factorial value.
        if (calculatedFactorialLimit % currentCandidate === 0n) {
            // Second condition: If it's a divisor of the factorial,
            // then determine how many positive divisors *this current candidate itself* has.
            const divisorsOfCurrentCandidate = countPositiveDivisors(currentCandidate);

            // If the current candidate has exactly 75 positive divisors, increment our main counter.
            if (divisorsOfCurrentCandidate === 75) {
                desiredDivisorCountMatch++;
            }
        }
    }

    // Display the final tally of numbers found that meet all criteria.
    console.log(`Final Result: ${desiredDivisorCountMatch} numbers found with precisely 75 divisors.`);
};

// Entry point: Execute the main program by reading input from standard input.
// The input is read as a buffer and then converted to a UTF-8 string.
executeMainProgram(require('fs').readFileSync('/dev/stdin').toString('utf8'));