// This module provides utilities for mathematical operations, specifically focusing on number theory.

/**
 * Computes the Greatest Common Divisor (GCD) for a list of positive integers.
 * It iteratively applies the Euclidean algorithm.
 *
 * @param {number[]} inputNumbers - An array of positive integers for which to calculate the GCD.
 * @returns {number} The greatest common divisor of all numbers in the array. Returns 0 if the input array is empty or contains non-positive numbers (after initial check).
 */
function determineSharedFactorArray(inputNumbers) {
    // Helper function to calculate GCD of two numbers using the Euclidean algorithm.
    // This is a recursive implementation.
    const computeBinaryGCD = (firstNum, secondNum) => {
        // Ensure numbers are positive, as GCD is typically defined for positive integers.
        // For 0, GCD(a, 0) = a.
        if (secondNum === 0) {
            return Math.abs(firstNum); // GCD(a, 0) = |a|
        }
        // Recursive step: GCD(a, b) = GCD(b, a % b)
        return computeBinaryGCD(secondNum, firstNum % secondNum);
    };

    // --- Input validation and initialization ---
    if (!Array.isArray(inputNumbers) || inputNumbers.length === 0) {
        // If the input array is invalid or empty, the GCD is undefined or could be considered 0 in some contexts.
        console.warn("Warning: Input array for determineSharedFactorArray is empty or invalid. Returning 0.");
        return 0;
    }

    // Initialize the current GCD with the first element of the array.
    // We'll process the rest of the elements from the second one.
    let currentCommonDivisor = inputNumbers[0];

    // Handle single-element array case explicitly.
    if (inputNumbers.length === 1) {
        return Math.abs(currentCommonDivisor); // GCD of a single number is its absolute value.
    }

    // Iterate through the rest of the array elements starting from the second one.
    // Each iteration updates the currentCommonDivisor by finding the GCD with the next number.
    for (let currentIdx = 1; currentIdx < inputNumbers.length; currentIdx++) {
        const nextNumberToProcess = inputNumbers[currentIdx];
        // Update the GCD using the helper function.
        currentCommonDivisor = computeBinaryGCD(currentCommonDivisor, nextNumberToProcess);

        // Optimization: If GCD becomes 1, it cannot get smaller, so we can exit early.
        if (currentCommonDivisor === 1) {
            break;
        }
    }

    return currentCommonDivisor;
}

/**
 * Orchestrates the main computation: parsing input, iterating through number triplets,
 * calculating their GCDs, and summing them up. Finally, it logs the total sum.
 *
 * @param {string} stringValue - The raw input string, expected to be a number (N).
 */
function ExecuteComputation(stringValue) {
    // --- Input parsing and validation ---
    const parsedLimit = parseInt(stringValue, 10); // Use radix 10 for explicit base.

    // Validate the parsed input to ensure it's a positive integer.
    if (isNaN(parsedLimit) || parsedLimit < 1) {
        console.error("Error: Invalid input provided. Expected a positive integer. Got:", stringValue);
        return; // Exit if input is invalid.
    }

    // Use BigInt for the accumulator to prevent potential overflow for very large sums,
    // though standard JS numbers are usually sufficient for typical competitive programming constraints.
    let aggregateResult = 0n; // Initialize as BigInt.

    const loopUpperBound = parsedLimit + 1; // Calculate once for efficiency in loop conditions.

    // --- Nested loops for triplet generation and GCD summation ---
    for (let outerLoopVar = 1; outerLoopVar < loopUpperBound; outerLoopVar++) {
        // Optional: Add a progress indicator for very large N.
        // if (outerLoopVar % 1000 === 0) {
        //     console.debug(`Processing outer loop iteration: ${outerLoopVar}/${parsedLimit}`);
        // }

        for (let middleLoopVar = 1; middleLoopVar < loopUpperBound; middleLoopVar++) {
            for (let innerLoopVar = 1; innerLoopVar < loopUpperBound; innerLoopVar++) {
                // Create an array for the current triplet.
                const currentTriplet = [outerLoopVar, middleLoopVar, innerLoopVar];

                // Calculate the GCD of the current triplet using our specialized function.
                const tripletGCD = determineSharedFactorArray(currentTriplet);

                // Add the calculated GCD to the running total.
                // Ensure type compatibility: convert tripletGCD (number) to BigInt before adding.
                aggregateResult += BigInt(tripletGCD);
            }
        }
    }

    // --- Final Output ---
    // Log the final accumulated sum to the console.
    console.log(aggregateResult.toString()); // Convert BigInt back to string for output.
}

// This section handles standard input/output. It should not be modified.
// It reads the entire standard input, converts it to a UTF-8 string,
// and then passes it to the main computation function.
ExecuteComputation(require("fs").readFileSync("/dev/stdin", "utf8"));