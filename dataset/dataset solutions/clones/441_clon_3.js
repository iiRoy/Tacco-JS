const MAX_PROCESSING_VALUE = 1_000_000; // Defines the maximum value for prime number generation and Dynamic Programming table capacity.

/**
 * Computes a mapping of prime numbers up to a specified upper bound using an optimized Sieve of Eratosthenes.
 *
 * This function initializes a boolean array, marks non-prime numbers, and then compiles the primes into an object
 * for efficient O(1) average-time lookup.
 *
 * @param {number} upperBoundInclusive - The highest integer (inclusive) for which primality should be determined.
 * @returns {Object<number, boolean>} A hash map where keys are prime numbers found and values are `true`.
 *                                     Returns an empty object if the upper bound is less than 2, as primes start from 2.
 */
function determinePrimesUpToLimit(upperBoundInclusive) {
    // Guard clause: Primes are defined for numbers greater than or equal to 2.
    if (upperBoundInclusive < 2) {
        return {};
    }

    // Initialize a boolean array. Each index `i` corresponds to the number `i`.
    // Initially, all numbers are assumed to be prime (`true`).
    const isDefinitelyPrime = new Array(upperBoundInclusive + 1).fill(true);

    // By definition, 0 and 1 are not prime numbers.
    isDefinitelyPrime[0] = false;
    isDefinitelyPrime[1] = false;

    // The sieve algorithm only needs to iterate up to the square root of the upper bound.
    // Any composite number `n` will have at least one prime factor less than or equal to `sqrt(n)`.
    const sieveIterationLimit = Math.floor(Math.sqrt(upperBoundInclusive));

    // Iterate from the first prime number (2) up to the calculated limit.
    for (let currentNumber = 2; currentNumber <= sieveIterationLimit; ++currentNumber) {
        // If `currentNumber` is still marked as prime, it means it is indeed a prime number.
        if (isDefinitelyPrime[currentNumber]) {
            // Mark all multiples of `currentNumber` as not prime.
            // Start marking from `currentNumber * currentNumber` because any smaller multiples
            // (e.g., `2 * currentNumber`, `3 * currentNumber`) would have already been marked
            // by their smaller prime factors (e.g., 2, 3).
            for (let multipleOfPrime = currentNumber * currentNumber; multipleOfPrime <= upperBoundInclusive; multipleOfPrime += currentNumber) {
                isDefinitelyPrime[multipleOfPrime] = false;
            }
        }
    }

    // After the sieving process, compile the primes into an object for fast lookup.
    const primeNumberSet = {};
    for (let index = 2; index <= upperBoundInclusive; ++index) {
        if (isDefinitelyPrime[index]) {
            primeNumberSet[index] = true;
        }
    }

    return primeNumberSet; // Return the generated map of prime numbers.
}

// Pre-calculate all prime numbers up to MAX_PROCESSING_VALUE once.
// This global cache improves performance by avoiding repeated prime calculations.
const precomputedPrimes = determinePrimesUpToLimit(MAX_PROCESSING_VALUE);

/**
 * Reads all input lines from standard input (stdin) and returns them as an array of strings.
 * Includes error handling for robust input processing.
 *
 * @returns {string[]} An array where each element is a line from the standard input.
 *                     Returns an empty array if an error occurs or input is empty.
 */
const readInputLines = () => {
    try {
        // Read the entire standard input as a UTF-8 string.
        // `process.stdin.fd` is used for robust file descriptor access.
        // `.trim()` removes leading/trailing whitespace, including the final newline.
        const rawInputStream = (require('fs').readFileSync(process.stdin.fd, 'utf8') || '').trim();
        // Split the input string into an array of lines.
        return rawInputStream.split('\n');
    } catch (error) {
        console.error("An error occurred while attempting to read standard input:", error);
        return []; // Return an empty array to prevent further processing issues.
    }
};

/**
 * Parses a single space-separated string line into an array of numbers.
 * Handles potential empty or non-numeric line inputs gracefully.
 *
 * @param {string} lineString - The input string line to be parsed.
 * @returns {number[]} An array of numbers parsed from the input string.
 *                     Returns an empty array if the input line is invalid or empty.
 */
const parseNumericLine = (lineString) => {
    // Validate the input: ensure it's a non-empty string.
    if (typeof lineString !== 'string' || lineString.trim() === '') {
        return [];
    }
    // Split the line by spaces and convert each part to a number.
    return lineString.trim().split(' ').map(Number);
};

// --- Main Program Execution Flow ---

const inputDataLines = readInputLines(); // Load all input data into an array of lines.
let testCaseCounter = 0; // Initialize a counter for the number of processed problem sets.

// Begin an infinite loop to process multiple test cases until a specific termination condition is met.
while (true) {
    testCaseCounter++; // Increment the counter for the current test case.

    // Extract and parse the first line of the current test case, which contains N and X.
    const currentDataSetParameters = parseNumericLine(inputDataLines.shift());

    const numberOfItems = currentDataSetParameters[0]; // N: Represents the count of items available.
    const targetValue = currentDataSetParameters[1];   // X: Represents the specific sum we are trying to achieve.

    // Termination condition: If both N and X are 0, it signals the end of input.
    if (numberOfItems === 0 && targetValue === 0) {
        break; // Exit the main processing loop.
    }

    // Input validation for problem parameters.
    // Negative counts or target values are usually invalid in such problems.
    if (numberOfItems < 0 || targetValue < 0) {
        console.error(`Warning: Invalid parameters (N=${numberOfItems}, X=${targetValue}) encountered for test case ${testCaseCounter}. Skipping.`);
        console.log("NA"); // Output "NA" as a placeholder for invalid input.
        continue; // Proceed to the next iteration (next test case).
    }

    // Initialize the Dynamic Programming (DP) table.
    // `possibleSumCombinations[s]` will be `true` if sum `s` can be formed using the available items.
    // The table is sized up to `MAX_PROCESSING_VALUE` to handle all potential sums.
    const possibleSumCombinations = new Array(MAX_PROCESSING_VALUE + 1).fill(false);

    // Base case for DP: A sum of 0 can always be achieved by choosing no items.
    possibleSumCombinations[0] = true;

    // Collect the individual item values for the current test case.
    const availableItemValues = [];
    for (let itemIndex = 0; itemIndex < numberOfItems; ++itemIndex) {
        // Parse each item's value from the subsequent input lines.
        const singleItemValue = parseInt(inputDataLines.shift(), 10);
        availableItemValues.push(singleItemValue);

        // Optimization: If a single item's value is within the DP table bounds,
        // it can directly form that sum.
        if (singleItemValue <= MAX_PROCESSING_VALUE) {
            possibleSumCombinations[singleItemValue] = true;
        }
    }

    // Core Dynamic Programming logic: This is an unbounded knapsack variant.
    // Iterate through all possible sums from 0 up to the maximum target value.
    for (let currentSumPossibility = 0; currentSumPossibility <= targetValue; ++currentSumPossibility) {
        // If the `currentSumPossibility` itself is not achievable, then
        // we cannot form larger sums by adding items to it. Skip to the next sum.
        if (!possibleSumCombinations[currentSumPossibility]) {
            continue;
        }

        // For each achievable `currentSumPossibility`, try adding every `itemToAdd`.
        for (let k = 0; k < availableItemValues.length; ++k) {
            const itemToAdd = availableItemValues[k];
            const newPotentialSum = currentSumPossibility + itemToAdd;

            // Update the DP table:
            // If `newPotentialSum` is within our defined limits (MAX_PROCESSING_VALUE)
            // and has not yet been marked as achievable, mark it as true.
            if (newPotentialSum <= MAX_PROCESSING_VALUE && !possibleSumCombinations[newPotentialSum]) {
                possibleSumCombinations[newPotentialSum] = true;
            }
        }
    }

    // After computing all possible sums, search for the largest prime sum.
    // We need to find the largest prime number less than or equal to `targetValue`
    // that can be formed by summing the `availableItemValues`.
    let largestAchievablePrimeSum = 0; // Default value, signifies no prime sum found.

    // Iterate downwards from the `targetValue` to 1.
    // This ensures we find the largest prime sum first.
    for (let candidateSum = targetValue; candidateSum >= 1; --candidateSum) {
        // Check two conditions:
        // 1. Is `candidateSum` achievable using the available items?
        // 2. Is `candidateSum` a prime number (checked against our precomputed primes)?
        if (possibleSumCombinations[candidateSum] && precomputedPrimes.hasOwnProperty(candidateSum)) {
            largestAchievablePrimeSum = candidateSum; // Found the largest such prime sum.
            break; // Exit the loop as the largest has been found.
        }
    }

    // Output the final result.
    // If `largestAchievablePrimeSum` is still 0, it means no such prime sum was found.
    // Otherwise, print the value of the largest prime sum.
    console.log(largestAchievablePrimeSum === 0 ? "NA" : `${largestAchievablePrimeSum}`);
}