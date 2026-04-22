// This module is designed to process numerical input and identify a specific divisor
// based on its frequency within a generated set of factors.
function processInputData(inputString) {
    // Begin by sanitizing the input string and extracting the numerical parameters.
    // We split by any whitespace character to handle various input formats gracefully.
    const inputParts = inputString.trim().split(/\s+/);

    // Implement a guard clause to ensure the input contains the expected number of arguments.
    if (inputParts.length < 2) {
        console.error("Error: Input string must contain at least two space-separated integers.");
        return; // Terminate execution if input is malformed.
    }

    // Parse the first number as the 'required count' (N) and the second as the 'target number' (P).
    // Using radix 10 for parseInt to ensure correct base interpretation.
    const minimumOccurrences = parseInt(inputParts[0], 10);
    const primaryValue = parseInt(inputParts[1], 10);

    // Perform validation on the parsed numbers to catch non-numeric or invalid inputs.
    if (isNaN(minimumOccurrences) || isNaN(primaryValue)) {
        console.error("Error: One or both input values are not valid numbers.");
        return;
    }

    // Another guard clause: If the minimum occurrence count is non-positive,
    // the logic for finding a divisor that appears that many times becomes trivial or nonsensical.
    // In such cases, we default to the base value 1 as the result.
    if (minimumOccurrences <= 0) {
        console.log(1);
        return;
    }
    
    // Generate a list of prime components (factors) for the primary value.
    // This helper function replaces the original 'getAllFactorsFor'.
    const collectedDivisorCandidates = extractPrimeComponents(primaryValue);
    
    // Crucially, the original logic included the primary value itself in the list of numbers to check.
    // We replicate this behavior by adding 'primaryValue' to our candidates list.
    collectedDivisorCandidates.push(primaryValue);

    // To determine frequencies, we use a Map object as an efficient occurrence counter.
    // This replaces the original's non-functional 'map' array.
    const divisorFrequencyMap = new Map();
    for (const currentCandidate of collectedDivisorCandidates) {
        // Increment the count for the current candidate, or initialize it to 1 if first seen.
        divisorFrequencyMap.set(currentCandidate, (divisorFrequencyMap.get(currentCandidate) || 0) + 1);
    }

    // Initialize our result variable, which will store the largest divisor meeting the criteria.
    // It starts at 1, as 1 is a universal divisor and the smallest possible result.
    let maximalQualifiedDivisor = 1;

    // Iterate through each unique divisor and its corresponding count stored in our frequency map.
    for (const [uniqueDivisor, actualCount] of divisorFrequencyMap.entries()) {
        // Check if the current unique divisor's count meets or exceeds our required minimum.
        if (actualCount >= minimumOccurrences) {
            // If it does, and this divisor is larger than our current maximal qualified divisor,
            // then we update our maximal value.
            if (uniqueDivisor > maximalQualifiedDivisor) {
                maximalQualifiedDivisor = uniqueDivisor;
            }
        }
    }

    // Finally, print the determined maximal qualified divisor to standard output.
    console.log(maximalQualifiedDivisor);
}

// This auxiliary function computes the prime factors of a given positive integer.
// It is an optimized version of the original 'getAllFactorsFor' function.
function extractPrimeComponents(numberToDecompose) {
    const primeFactorList = []; // This array will store all prime factors found.
    let currentDecompositionTarget = numberToDecompose; // Use a mutable variable for the decomposition process.

    // Handle edge cases for numbers less than or equal to 1.
    // Prime factorization is typically defined for integers greater than 1.
    if (currentDecompositionTarget <= 1) {
        return primeFactorList; // Return an empty list for 0 or 1.
    }

    // First, efficiently factor out all occurrences of the prime number 2.
    while (currentDecompositionTarget % 2 === 0) {
        primeFactorList.push(2);
        currentDecompositionTarget /= 2;
    }

    // Next, iterate through odd numbers starting from 3 up to the square root of the remaining target.
    // This optimization significantly reduces the number of division checks.
    for (let currentTestDivisor = 3; currentTestDivisor * currentTestDivisor <= currentDecompositionTarget; currentTestDivisor += 2) {
        while (currentDecompositionTarget % currentTestDivisor === 0) {
            primeFactorList.push(currentTestDivisor);
            currentDecompositionTarget /= currentTestDivisor;
        }
    }

    // If, after all previous divisions, the 'currentDecompositionTarget' is still greater than 1,
    // it means the remaining value itself is a prime factor (and it's the largest one).
    if (currentDecompositionTarget > 1) {
        primeFactorList.push(currentDecompositionTarget);
    }

    return primeFactorList; // Return the complete list of prime factors.
}

// This is the execution entry point for the script.
// It reads input from standard input (/dev/stdin) using Node.js's file system module,
// and then passes the content to our main processing function.
processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));