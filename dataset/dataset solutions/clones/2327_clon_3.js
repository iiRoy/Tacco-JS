// This module handles numerical input processing, performing a series of operations
// that include prime factorization and value comparison to derive a final result.

/**
 * Main entry point for processing the raw system input.
 * It parses two integers, performs a factorization-like process,
 * calculates their greatest common divisor (GCD), and then outputs
 * the maximum among the GCD and the two original input numbers.
 *
 * @param {string} rawSystemInput - The complete input data received from the system,
 *                                  expected to contain space-separated numbers on the first line.
 */
function executeCalculationsAndOutput(rawSystemInput) {
    // Define an upper bound for factor searching, mirroring the original's array size.
    const FACTOR_SEARCH_LIMIT = 100000;

    // Split the entire input string into an array of lines.
    const inputLineSegments = rawSystemInput.split("\n");

    // Extract the string representations of the two numbers from the first line.
    const numberTokens = inputLineSegments[0].split(" ");

    // Convert the string tokens into integer values.
    // These variables retain the original values, similar to 'aft' and 'bft' in the source.
    const initialNumericValueA = parseInt(numberTokens[0], 10);
    const initialNumericValueB = parseInt(numberTokens[1], 10);

    // --- Type III Addition: Input Validation ---
    // Ensure that both parsed values are valid positive integers.
    if (isNaN(initialNumericValueA) || isNaN(initialNumericValueB) || initialNumericValueA <= 0 || initialNumericValueB <= 0) {
        console.error("Validation Error: Please provide two positive whole numbers as input.");
        return; // Terminate execution if input is invalid.
    }

    // Create mutable copies of the initial numbers for the factorization process.
    // These are analogous to the 'a' and 'b' variables in the original code that get modified.
    let currentNumberForFactoringA = initialNumericValueA;
    let currentNumberForFactoringB = initialNumericValueB;

    // --- Type III Change: Replace fixed-size arrays with Maps ---
    // Use Maps to dynamically store the counts of prime factors for each number.
    // This is more flexible and memory-efficient than large fixed-size arrays.
    const primeFactorCountsForA = new Map();
    const primeFactorCountsForB = new Map();

    // Initialize a variable to accumulate the Greatest Common Divisor (GCD).
    // This variable corresponds to 'ans' in the original code.
    let accumulatedGcd = 1;

    // --- Type III Change: Refactored Prime Factorization Loops ---
    // Iterate through potential divisors from 2 up to the defined limit.
    // This loop populates the prime factor count Maps.
    for (let currentCandidateDivisor = 2; currentCandidateDivisor <= FACTOR_SEARCH_LIMIT; currentCandidateDivisor++) {
        // Factorize 'currentNumberForFactoringA' by 'currentCandidateDivisor'
        // The original `for (var j=0; j<1; j)` with `j=1` break is replaced by a `while` loop.
        while (currentNumberForFactoringA > 1 && currentNumberForFactoringA % currentCandidateDivisor === 0) {
            primeFactorCountsForA.set(currentCandidateDivisor, (primeFactorCountsForA.get(currentCandidateDivisor) || 0) + 1);
            currentNumberForFactoringA /= currentCandidateDivisor;
        }

        // Factorize 'currentNumberForFactoringB' by 'currentCandidateDivisor'
        // Similarly, the inner loop for 'b' is converted to a `while` loop.
        while (currentNumberForFactoringB > 1 && currentNumberForFactoringB % currentCandidateDivisor === 0) {
            primeFactorCountsForB.set(currentCandidateDivisor, (primeFactorCountsForB.get(currentCandidateDivisor) || 0) + 1);
            currentNumberForFactoringB /= currentCandidateDivisor;
        }
    }

    // --- Type III Change: Rewritten GCD Calculation Logic ---
    // The original code's 'ans' calculation effectively computed the GCD.
    // We recreate this logic by iterating over all unique factors found.
    const allUniqueFactorsDetected = new Set([...primeFactorCountsForA.keys(), ...primeFactorCountsForB.keys()]);

    for (const factorValue of allUniqueFactorsDetected) {
        const countOccurrencesA = primeFactorCountsForA.get(factorValue) || 0;
        const countOccurrencesB = primeFactorCountsForB.get(factorValue) || 0;

        // If 'factorValue' is a common factor to both numbers, multiply 'accumulatedGcd' by it
        // for the minimum number of times it appears in either factorization.
        // This corresponds to the `if(aso[i] != 0 && bso[i] != 0)` block of the original.
        if (countOccurrencesA > 0 && countOccurrencesB > 0) {
            const minimumCommonOccurrences = Math.min(countOccurrencesA, countOccurrencesB);
            for (let multiplierIterator = 0; multiplierIterator < minimumCommonOccurrences; multiplierIterator++) {
                accumulatedGcd *= factorValue;
            }
        }
        // The original code's `else if` branches for non-common factors are not included
        // in GCD calculation, so they are omitted here to faithfully calculate GCD.
    }

    // --- Final Result Determination (Type III: Maintained Original's Max Logic) ---
    // The original code calculated the maximum among 'ans' (GCD), 'aft' (original A), and 'bft' (original B).
    // We replicate this exact comparison structure, even though `Math.max(GCD, A, B)` simplifies to `Math.max(A, B)`
    // because GCD is always less than or equal to A and B.
    let finalMaximumValue = 0;

    // Compare with the calculated GCD.
    if (accumulatedGcd > finalMaximumValue) {
        finalMaximumValue = accumulatedGcd;
    }
    // Compare with the first original input value.
    if (initialNumericValueA > finalMaximumValue) {
        finalMaximumValue = initialNumericValueA;
    }
    // Compare with the second original input value.
    if (initialNumericValueB > finalMaximumValue) {
        finalMaximumValue = initialNumericValueB;
    }

    // Output the final determined maximum value.
    console.log(finalMaximumValue);
}

// --- Standard I/O Handling (Untouched) ---
// This section reads input from standard input and passes it to the main processing function.
executeCalculationsAndOutput(require("fs").readFileSync("/dev/stdin", "utf8"));