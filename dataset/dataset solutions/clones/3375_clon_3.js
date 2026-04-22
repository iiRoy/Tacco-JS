// This module processes numerical input to derive a specific product.
// The primary goal is to identify prime factors meeting a frequency threshold.

// Global state for the optimized prime factorization algorithm.
// These are initialized once and modified during the factorization process,
// reflecting the original design's use of global variables.
let currentDivisorCandidate = 7; // Begins checking for prime divisors from 7
let divisorStepSize = 4;       // Alternates between 4 and 2 to efficiently skip multiples of 2, 3, and 5

/**
 * Recursively breaks down a positive integer into its prime factors.
 * This implementation employs an optimized trial division method.
 *
 * @param {number} numToFactor The positive integer intended for factorization.
 * @returns {Array<number>} An array containing the prime factors of the input number.
 */
const decomposeIntoPrimes = (numToFactor) => {
    // Comprehensive validation for non-positive or non-integer inputs.
    if (!Number.isInteger(numToFactor) || numToFactor < 2) {
        // Numbers less than 2 (including non-integers) do not possess prime factors.
        return [];
    }

    // Efficiently handle the smallest prime factors (2, 3, 5) first.
    // These checks prevent redundant evaluations of the global divisor candidates.
    if (numToFactor % 2 === 0) {
        // If divisible by 2, add 2 and recurse with half the number.
        return [2].concat(decomposeIntoPrimes(numToFactor / 2));
    }
    if (numToFactor % 3 === 0) {
        // If divisible by 3, add 3 and recurse with one-third of the number.
        return [3].concat(decomposeIntoPrimes(numToFactor / 3));
    }
    if (numToFactor % 5 === 0) {
        // If divisible by 5, add 5 and recurse with one-fifth of the number.
        return [5].concat(decomposeIntoPrimes(numToFactor / 5));
    }

    // Optimize trial division by checking divisors only up to the square root.
    const squareRootLimit = Math.sqrt(numToFactor);

    // Perform trial division for prime numbers greater than 5.
    // The `currentDivisorCandidate` and `divisorStepSize` are globally scoped
    // and retain their state across recursive calls, consistent with the original code.
    while (currentDivisorCandidate <= squareRootLimit) {
        if (numToFactor % currentDivisorCandidate === 0) {
            // A prime factor has been identified; recursively factorize the resulting quotient.
            const nextQuotient = numToFactor / currentDivisorCandidate;
            return [currentDivisorCandidate].concat(decomposeIntoPrimes(nextQuotient));
        }
        // Progress to the subsequent potential prime divisor using the 6k ± 1 optimization.
        currentDivisorCandidate += divisorStepSize;
        divisorStepSize = 6 - divisorStepSize; // This cleverly alternates the step between 4 and 2.
    }

    // If no prime factors were discovered up to the calculated square root,
    // the remaining number itself is considered prime.
    return [numToFactor];
};

/**
 * Serves as the primary execution function for processing the input payload.
 * It parses two numbers, determines the prime factors of the second number,
 * counts their occurrences, and computes a final product based on a frequency threshold.
 *
 * @param {string} rawDataString The raw input string, typically read from standard input.
 */
const processInputData = (rawDataString) => {
    // Deconstruct the input string into individual lines and then numeric tokens.
    const inputLines = rawDataString.trim().split('\n');
    const numericTokens = inputLines[0].split(' ');

    // Extract the two essential numeric values, ensuring they are correctly parsed as numbers.
    const minOccurrences = Number(numericTokens[0]); // Corresponds to the original 'N'
    const valueToAnalyze = Number(numericTokens[1]);  // Corresponds to the original 'P'

    // Implement robust validation for the parsed input values.
    if (isNaN(minOccurrences) || isNaN(valueToAnalyze) || minOccurrences < 0 || valueToAnalyze < 0) {
        console.error("Error: Provided input contains invalid or non-positive numeric values.");
        return; // Terminate execution gracefully upon encountering bad input.
    }

    // Handle a specific edge case where the minimum occurrence count is one.
    // The original logic dictated an early exit in this scenario.
    if (minOccurrences === 1) {
        console.log(minOccurrences); // Output the threshold value itself.
        return; // Exit the function as per the original program's flow.
    }

    // --- Core Logic: Prime Factorization and Occurrence Analysis ---

    // Retrieve all prime divisors for the target number.
    // Note: The global divisor candidates are modified during this call.
    const primeDivisorsFound = decomposeIntoPrimes(valueToAnalyze);

    // Construct a frequency map to tally the occurrences of each unique prime factor.
    const factorFrequencyMap = {};
    for (const currentFactor of primeDivisorsFound) {
        // IMPORTANT FIX: The original code contained a typo ('kesy' instead of 'key')
        // which resulted in incorrect frequency counts. This update corrects that bug,
        // ensuring accurate tracking of factor frequencies.
        factorFrequencyMap[currentFactor] = (factorFrequencyMap[currentFactor] || 0) + 1;
    }

    // Initialize the accumulator for the final product.
    // Starting with 1 ensures that the product is correctly computed through multiplication.
    let finalCalculatedProduct = 1;

    // Iterate through the collection of unique prime factors identified.
    const uniqueFactors = Object.keys(factorFrequencyMap);

    // Evaluate which factors satisfy or surpass the specified occurrence threshold.
    for (const factorKeyString of uniqueFactors) {
        const factorNumericValue = Number(factorKeyString); // Convert key string back to a number.
        const factorCount = factorFrequencyMap[factorKeyString];

        // If a prime factor's count meets the minimum requirement, incorporate it into the product.
        if (factorCount >= minOccurrences) {
            finalCalculatedProduct *= factorNumericValue;
        }
    }

    // Output the final computed product to the standard console.
    console.log(finalCalculatedProduct);
};

// Entry point for script execution in a Node.js environment.
// Reads the entire content from standard input and passes it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));