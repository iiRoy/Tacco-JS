function ProcessInputData(inputLinesRaw) {
    // This function processes the raw input string to determine the coprimality status
    // of a sequence of numbers.

    // Step 1: Parse the raw input.
    // The input is expected to be multi-line, with the second line containing space-separated numbers.
    const parsedLines = inputLinesRaw.split("\n");

    // The first line often contains 'N', the count of numbers, but it's not strictly
    // necessary for the core logic if we can directly parse the array from the second line.
    // We omit parsing N for a Type III structural change.

    // Extract the sequence of numerical elements from the second line of input.
    const numericalElements = parsedLines[1].split(" ").map(Number);

    // Define a constant for the upper limit of numbers to be processed.
    // This impacts array sizing and loop boundaries for frequency and factor checks.
    const MAXIMUM_NUMBER_VALUE = 1000001; // Based on typical problem constraints.

    // --- Phase 1: Check for "not coprime" condition ---
    // The numbers are "not coprime" if their greatest common divisor (GCD) is greater than 1.
    // This is the broadest definition of non-coprimality.
    const overallGcdResult = calculateGreatestCommonDivisor(numericalElements);
    if (overallGcdResult !== 1) {
        console.log("not coprime");
        return; // Terminate early as the most general condition is met.
    }

    // --- Phase 2: Prepare for "pairwise coprime" vs "setwise coprime" distinction ---
    // Initialize an array to act as a frequency map or occurrence counter for each number.
    // This helps in efficiently checking for duplicates and multiples.
    const elementFrequencyCounts = new Array(MAXIMUM_NUMBER_VALUE).fill(0);

    // A boolean flag to track if the sequence remains potentially pairwise coprime.
    // It is initially assumed true and set to false if any condition for setwise coprimality is met.
    let isCurrentlyPairwiseCoprime = true;

    // First iteration through the input elements:
    // 1. Populate the frequency map.
    // 2. Identify if any number (other than 1) appears more than once,
    //    which immediately violates pairwise coprimality.
    for (const currentNumericalValue of numericalElements) {
        // Guard clause: Handle numbers that are outside the expected range
        // or are the special value 1.
        if (currentNumericalValue < 1 || currentNumericalValue >= MAXIMUM_NUMBER_VALUE) {
            // For competitive programming, assume valid input within bounds.
            // If 1, it doesn't affect GCDs with other numbers positively for pairwise check,
            // so we can skip frequency counting for it, as it's coprime to everything.
            if (currentNumericalValue === 1) continue;
            // For other out-of-bounds values, problem context dictates behavior.
            // Here, we proceed assuming they are valid within limits.
        }

        // Increment the count for the current number in our frequency map.
        elementFrequencyCounts[currentNumericalValue]++;

        // If a number (greater than 1) appears more than once, it means
        // gcd(number, number) = number. If number > 1, then these two
        // identical numbers are not coprime, making the entire set not pairwise coprime.
        if (currentNumericalValue > 1 && elementFrequencyCounts[currentNumericalValue] > 1) {
            isCurrentlyPairwiseCoprime = false;
            // We don't break here because we still need to fully populate
            // the frequency map for the subsequent factor check.
        }
    }

    // Optimization: If we've already determined it's not pairwise coprime due to duplicates,
    // we can skip the more computationally intensive prime factor checking phase.
    if (!isCurrentlyPairwiseCoprime) {
        console.log("setwise coprime");
        return;
    }

    // Second phase of checks: Iterate through potential common divisors (starting from 2).
    // For each potential divisor, count how many numbers in the input sequence are its multiples.
    // If two or more numbers share a common divisor (other than 1), they are not pairwise coprime.
    for (let candidateDivisor = 2; candidateDivisor < MAXIMUM_NUMBER_VALUE; candidateDivisor++) {
        let countOfSharedMultiples = 0; // Tracks how many input numbers are multiples of `candidateDivisor`.

        // Iterate through all multiples of the `candidateDivisor` up to the `MAXIMUM_NUMBER_VALUE`.
        for (let currentMultiple = candidateDivisor; currentMultiple < MAXIMUM_NUMBER_VALUE; currentMultiple += candidateDivisor) {
            // If `currentMultiple` exists in our input sequence (i.e., its frequency is > 0),
            // add its occurrences to `countOfSharedMultiples`.
            if (elementFrequencyCounts[currentMultiple] > 0) {
                countOfSharedMultiples += elementFrequencyCounts[currentMultiple];
            }

            // If we find that two or more numbers in the original sequence share this `candidateDivisor`,
            // then the sequence is not pairwise coprime.
            if (countOfSharedMultiples >= 2) {
                isCurrentlyPairwiseCoprime = false;
                // Optimization: No need to check further multiples for this specific `candidateDivisor`.
                break;
            }
        }

        // Optimization: If we've already determined the sequence is not pairwise coprime
        // during the current divisor check, we can stop checking further divisors.
        if (!isCurrentlyPairwiseCoprime) {
            break;
        }
    }

    // --- Phase 3: Final Output ---
    // Based on the `isCurrentlyPairwiseCoprime` flag, print the appropriate result.
    if (isCurrentlyPairwiseCoprime) {
        console.log("pairwise coprime");
    } else {
        console.log("setwise coprime");
    }
}

/**
 * Calculates the greatest common divisor (GCD) for an array of integers.
 * This implementation uses the iterative Euclidean algorithm within a reduce operation.
 * @param {number[]} numbersToEvaluate An array of integers for which to compute the GCD.
 * @returns {number} The GCD of all numbers. Returns 0 if the input array is empty.
 */
function calculateGreatestCommonDivisor(numbersToEvaluate) {
    // Guard clause for an empty input array.
    if (!numbersToEvaluate || numbersToEvaluate.length === 0) {
        return 0; // The GCD of an empty set is conventionally undefined or 0 in some contexts.
    }

    /**
     * Helper function to compute the GCD of two numbers using the iterative Euclidean algorithm.
     * @param {number} valueA The first number.
     * @param {number} valueB The second number.
     * @returns {number} The GCD of valueA and valueB.
     */
    const computePairwiseGcd = (valueA, valueB) => {
        // Ensure numbers are positive for GCD calculation.
        let a = Math.abs(valueA);
        let b = Math.abs(valueB);

        // Euclidean algorithm: repeatedly replace (a, b) with (b, a % b) until b is 0.
        while (b !== 0) {
            const remainder = a % b; // Calculate the remainder
            a = b;                   // Update 'a' to 'b'
            b = remainder;           // Update 'b' to the remainder
        }
        return a; // When 'b' is 0, 'a' holds the GCD.
    };

    // Use the Array.prototype.reduce method to apply the `computePairwiseGcd` function
    // cumulatively across all numbers in the array. The GCD of multiple numbers
    // is found by repeatedly taking the GCD of the current result and the next number.
    const finalGcdOfAllNumbers = numbersToEvaluate.reduce((accumulatorGcd, currentElementValue) => {
        return computePairwiseGcd(accumulatorGcd, currentElementValue);
    });

    return finalGcdOfAllNumbers;
}

// Node.js specific entry point:
// Reads the entire content of standard input synchronously using 'fs' module,
// decodes it as UTF-8, and then passes it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));