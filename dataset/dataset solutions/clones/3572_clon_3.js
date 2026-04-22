'use strict';

/**
 * Counts the number of integers within a specified range [1, limit]
 * that yield a particular remainder when divided by a given divisor.
 *
 * @param {number} limit - The upper bound of the range (inclusive).
 * @param {number} divisor - The number by which to divide.
 * @param {number} remainder - The desired remainder.
 * @returns {number} The count of matching numbers. Returns 0 for invalid inputs.
 */
const countNumbersWithSpecificRemainder = (limit, divisor, remainder) => {
    // Robust input validation for the helper function.
    if (!Number.isInteger(limit) || limit <= 0 ||
        !Number.isInteger(divisor) || divisor <= 0 ||
        !Number.isInteger(remainder) || remainder < 0 || remainder >= divisor) {
        // For internal helper, we can return 0 directly for invalid parameters.
        return 0;
    }

    let matchingCount = 0;
    if (remainder === 0) {
        // If the required remainder is 0, numbers are multiples of the divisor (K, 2K, ...).
        matchingCount = Math.floor(limit / divisor);
    } else {
        // If the required remainder is non-zero, numbers are remainder, remainder + K, ...
        // We ensure 'limit' is at least 'remainder' to avoid issues.
        if (limit >= remainder) {
            // Calculate how many times 'divisor' can be added to 'remainder' without exceeding 'limit'.
            // (limit - remainder) / divisor gives the number of full 'divisor' steps.
            // Adding 1 accounts for the initial 'remainder' value itself (when p=0).
            matchingCount = Math.floor((limit - remainder) / divisor) + 1;
        }
    }
    return matchingCount;
};

/**
 * Calculates the total number of triplets (a, b, c) such that 1 <= a, b, c <= N
 * and (a + b) % K == 0, (a + c) % K == 0, and (b + c) % K == 0.
 *
 * @param {string} dataString - A string containing two space-separated integers, N and K.
 * @returns {number} The total count of valid triplets, or 0 if input is invalid.
 */
const calculateTriplets = (dataString) => {
    // Parse the input string, robustly handling multiple spaces or leading/trailing whitespace.
    const inputComponents = dataString.split(/\s+/).filter(Boolean);

    // Ensure we have exactly two numerical components as required by the problem.
    if (inputComponents.length !== 2) {
        console.error("Input format error: Expected two numbers, N and K, separated by space.");
        return 0;
    }

    const upperLimitN = Number(inputComponents[0]);
    const modulusK = Number(inputComponents[1]);

    // Comprehensive validation for N and K, ensuring they are positive integers.
    if (!Number.isInteger(upperLimitN) || upperLimitN <= 0 ||
        !Number.isInteger(modulusK) || modulusK <= 0) {
        console.error(`Invalid input values: N='${inputComponents[0]}', K='${inputComponents[1]}'. Both N and K must be positive integers.`);
        return 0;
    }

    // A memoization table (Map) to store the counts of numbers for a given remainder.
    // This optimizes repeated calculations for 'b' and 'c' counts, improving efficiency.
    // Key: remainder value, Value: count of numbers in [1, N] matching that remainder.
    const remainderCountMemo = new Map();

    let cumulativeValidTripletCount = 0; // This variable will accumulate the final result.

    // Iterate through all possible values for 'a' from 1 up to N (inclusive).
    for (let currentAValue = 1; currentAValue <= upperLimitN; ++currentAValue) {
        // Step 1: Determine the required remainder for 'b' and 'c' based on 'a'.
        // For (a + x) % K == 0, 'x % K' must be equivalent to '(K - (a % K)) % K'.
        const remainderOfA = currentAValue % modulusK;
        const targetRemainderForBAndC = (modulusK - remainderOfA) % modulusK;

        // Step 2: Check the third condition: (b + c) % K == 0.
        // Since we know b%K == targetRemainderForBAndC and c%K == targetRemainderForBAndC,
        // this simplifies to checking if (targetRemainderForBAndC * 2) % K == 0.
        if ((targetRemainderForBAndC * 2) % modulusK === 0) {
            // If this condition holds, then for this 'currentAValue',
            // we can form valid (b, c) pairs where both 'b' and 'c' have 'targetRemainderForBAndC'.

            let countForTargetRemainder;

            // Check if the count for this specific remainder is already memoized.
            if (remainderCountMemo.has(targetRemainderForBAndC)) {
                countForTargetRemainder = remainderCountMemo.get(targetRemainderForBAndC);
            } else {
                // If not, calculate it using the helper function and then store it in the memo.
                countForTargetRemainder = countNumbersWithSpecificRemainder(
                    upperLimitN,
                    modulusK,
                    targetRemainderForBAndC
                );
                remainderCountMemo.set(targetRemainderForBAndC, countForTargetRemainder);
            }

            // For each valid 'a', the number of valid 'b's is 'countForTargetRemainder',
            // and similarly for 'c'. Thus, the total number of (b, c) pairs is the
            // square of this count. Add this to the cumulative total.
            cumulativeValidTripletCount += countForTargetRemainder * countForTargetRemainder;
        }
        // If (targetRemainderForBAndC * 2) % modulusK !== 0,
        // then no valid (b, c) pairs can be formed for this 'currentAValue'
        // under all three given triplet conditions. In this scenario,
        // 'cumulativeValidTripletCount' remains unchanged for this iteration.
    }

    return cumulativeValidTripletCount;
};


// --- Execution Control Block (Enhanced for Type III changes) ---

// A flag to easily switch between development/testing mode and production mode.
const isDevelopmentEnvironment = false; // Set to 'true' for local testing with predefined inputs.

if (isDevelopmentEnvironment) {
    // In development mode, execute predefined test cases and log their results.
    console.log("--- DEVELOPMENT MODE TEST RUNS ---");

    // Test cases from the original problem description.
    console.log("Test Case 1 (N=3, K=2): Result =", calculateTriplets('3 2'));
    console.log("Test Case 2 (N=5, K=3): Result =", calculateTriplets('5 3'));
    console.log("Test Case 3 (N=31415, K=9265): Result =", calculateTriplets('31415 9265'));
    console.log("Test Case 4 (N=35897, K=932): Result =", calculateTriplets('35897 932'));

    // Additional test cases for robustness and edge conditions.
    console.log("Test Case 5 (N=1, K=1): Result =", calculateTriplets('1 1'));
    console.log("Test Case 6 (N=10, K=5): Result =", calculateTriplets('10 5'));
    console.log("Test Case 7 (Invalid N 'abc', K=10): Result =", calculateTriplets('abc 10'));
    console.log("Test Case 8 (N=10, Invalid K '0'): Result =", calculateTriplets('10 0'));
    console.log("Test Case 9 (Missing K): Result =", calculateTriplets('10'));
    console.log("Test Case 10 (Extra input): Result =", calculateTriplets('10 20 30'));

    console.log("--- END OF DEVELOPMENT MODE ---");

} else {
    // In production mode, read input from standard input and print the result.
    // This block is designed to be robust against file system errors.
    const executeProductionLogic = () => {
        try {
            // Dynamically require 'fs' to avoid issues if not running in Node.js environment.
            const fileSystemHandler = require('fs');
            // Read input, trim any leading/trailing whitespace (like newlines from input files).
            const rawInputData = fileSystemHandler.readFileSync('/dev/stdin', 'utf8').trim();
            const finalResult = calculateTriplets(rawInputData);
            console.log(finalResult);
        } catch (error) {
            // Catch and log any errors encountered during file reading or calculation.
            console.error("An error occurred during production execution:", error.message);
            // Exit the process with a non-zero code to indicate a failure.
            process.exit(1);
        }
    };
    executeProductionLogic();
}