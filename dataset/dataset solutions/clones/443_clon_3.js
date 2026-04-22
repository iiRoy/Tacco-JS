// A utility function to pre-calculate prime numbers up to a specified upper limit
// using a variation of the Sieve of Eratosthenes algorithm.
// This function returns a JavaScript Set object containing all prime numbers
// found within the given range, allowing for efficient O(1) average-time lookups.
function generatePrimeSet(upperLimit) {
    // Input validation: Ensure the upperLimit is a valid non-negative integer.
    // If not, log an error and return an empty Set, as no primes can be generated.
    if (typeof upperLimit !== 'number' || !Number.isInteger(upperLimit) || upperLimit < 0) {
        console.error("Error: Provided upperLimit for prime generation is invalid. Must be a non-negative integer.");
        return new Set();
    }
    // Handle edge cases: No primes exist below 2.
    if (upperLimit < 2) {
        return new Set();
    }

    // Initialize a boolean array, `isPrimeFlags`, where `isPrimeFlags[k]` will be `true`
    // if `k` is considered prime, and `false` otherwise.
    // The array is sized `upperLimit + 1` to include the `upperLimit` itself.
    const isPrimeFlags = new Array(upperLimit + 1).fill(true);

    // Explicitly mark 0 and 1 as non-prime numbers.
    isPrimeFlags[0] = false;
    isPrimeFlags[1] = false;

    // The Sieve algorithm only needs to check for prime factors up to the square root of the upper limit.
    // This optimization significantly reduces the number of iterations.
    const sieveIterationCeiling = Math.floor(Math.sqrt(upperLimit));

    // Iterate through numbers starting from 2 up to the calculated iteration ceiling.
    for (let currentCandidate = 2; currentCandidate <= sieveIterationCeiling; ++currentCandidate) {
        // If the `currentCandidate` is still marked as prime, it means it is a prime number.
        // All multiples of this prime number are consequently not prime.
        if (isPrimeFlags[currentCandidate]) {
            // Mark all multiples of `currentCandidate` as not prime.
            // We start marking from `currentCandidate * currentCandidate` because any smaller
            // multiples (e.g., `2 * currentCandidate`, `3 * currentCandidate`) would have
            // already been marked by their own smaller prime factors.
            for (let multipleValue = currentCandidate * currentCandidate; multipleValue <= upperLimit; multipleValue += currentCandidate) {
                isPrimeFlags[multipleValue] = false; // Mark as composite (not prime)
            }
        }
    }

    // After the sieving process, collect all numbers that remain marked as prime into a Set.
    const discoveredPrimesCollection = new Set();
    for (let numberIndex = 2; numberIndex <= upperLimit; ++numberIndex) {
        if (isPrimeFlags[numberIndex]) {
            discoveredPrimesCollection.add(numberIndex);
        }
    }

    // Return the collection of all prime numbers found.
    return discoveredPrimesCollection;
}

// Define a global constant for the maximum value relevant to both prime generation
// and the dynamic programming sum tracking. This helps maintain consistency.
const MAXIMUM_COMPUTATION_VALUE = 1000000;

// Pre-calculate the set of prime numbers once at the start of the program.
// This set will be reused for all test cases, making prime checks very fast.
const precomputedPrimes = generatePrimeSet(MAXIMUM_COMPUTATION_VALUE);

// --- Main Program Execution Flow ---

// Hardcoded input data for demonstration. In a production environment,
// this would typically be read from standard input or a file system.
const rawInputData = '4 15000\n305\n260\n129\n500\n3 400\n10\n20\n30\n3 200909\n5\n9\n12\n0 0\n';

// Prepare the input data: remove leading/trailing whitespace and split into an array of lines.
const inputLineBuffer = rawInputData.trim().split("\n");

// Begin processing test cases one by one until a termination condition is met.
while (true) {
    // Extract the first line of the current test case, which contains the
    // count of numbers (N) and the target sum limit (X).
    const currentCaseHeaderLine = inputLineBuffer.shift();

    // If there are no more lines, it indicates an unexpected end of input.
    if (!currentCaseHeaderLine) {
        console.error("Critical Error: Ran out of input lines prematurely.");
        break;
    }

    // Parse N and X from the header line. Use `parseInt` with radix 10 for safety.
    const [numCountStr, targetLimitStr] = currentCaseHeaderLine.split(" ");
    const countOfNumbers = parseInt(numCountStr.trim(), 10);
    const targetSumLimit = parseInt(targetLimitStr.trim(), 10);

    // Check for the specific termination condition: N=0 and X=0.
    if (countOfNumbers === 0 && targetSumLimit === 0) {
        break; // Exit the loop, all test cases processed.
    }

    // Basic validation for the header values. If invalid, skip this test case.
    if (isNaN(countOfNumbers) || isNaN(targetSumLimit) || countOfNumbers < 0 || targetSumLimit < 0) {
        console.warn(`Warning: Skipping test case due to invalid N or X values: N=${countOfNumbers}, X=${targetSumLimit}`);
        // To properly skip, one might need to consume `countOfNumbers` lines if `countOfNumbers` was valid.
        // For simplicity, assuming valid structure if not a termination condition.
        continue;
    }
    // Also ensure targetSumLimit is within our precomputed prime range.
    if (targetSumLimit > MAXIMUM_COMPUTATION_VALUE) {
        console.warn(`Warning: Target sum limit (${targetSumLimit}) exceeds maximum computation value (${MAXIMUM_COMPUTATION_VALUE}). Clamping to max.`);
        // For this problem, the `possibleSumsTracker` is fixed size, so we should cap the search.
        // The `targetSumLimit` will be used in the final search, so it's fine if it's larger than `MAXIMUM_COMPUTATION_VALUE`.
        // The search will implicitly be capped by the `possibleSumsTracker` size.
    }


    // Initialize a boolean array `possibleSumsTracker`.
    // `possibleSumsTracker[k]` will be `true` if the sum `k` can be formed using
    // a subset of the input numbers, and `false` otherwise.
    // The size is `MAXIMUM_COMPUTATION_VALUE + 1` to cover all sums up to the maximum.
    const possibleSumsTracker = new Array(MAXIMUM_COMPUTATION_VALUE + 1).fill(false);

    // An array to hold the individual numbers provided for the current test case.
    const numbersForCurrentCase = [];

    // Read `countOfNumbers` lines, each containing a number for the current test case.
    for (let i = 0; i < countOfNumbers; ++i) {
        const rawNumberString = inputLineBuffer.shift();

        // Check for missing input numbers.
        if (!rawNumberString) {
            console.error(`Error: Expected ${countOfNumbers} numbers, but only found ${i} for this case. Incomplete input.`);
            // This case is incomplete, so it's safer to break and potentially invalidate the current processing.
            break;
        }

        const currentNumericValue = parseInt(rawNumberString.trim(), 10);

        // Validate each input number. Skip invalid or out-of-range numbers.
        if (isNaN(currentNumericValue) || currentNumericValue < 0 || currentNumericValue > MAXIMUM_COMPUTATION_VALUE) {
            console.warn(`Warning: Skipping invalid or out-of-range input number: '${rawNumberString}'. Value must be between 0 and ${MAXIMUM_COMPUTATION_VALUE}.`);
            continue; // Do not add this invalid number to the list.
        }

        // Add the valid number to our collection and mark it as a directly achievable sum.
        numbersForCurrentCase.push(currentNumericValue);
        possibleSumsTracker[currentNumericValue] = true;
    }

    // A sum of zero is always achievable (by choosing no numbers).
    possibleSumsTracker[0] = true;

    // Dynamic programming phase: Populate `possibleSumsTracker` with all achievable sums.
    // This implements an "unbounded knapsack" type of logic, where each number
    // in `numbersForCurrentCase` can be used multiple times to form sums.
    // We iterate through all possible sums `currentSum` that can be formed.
    for (let currentSum = 0; currentSum <= MAXIMUM_COMPUTATION_VALUE; ++currentSum) {
        // If `currentSum` is an achievable sum...
        if (possibleSumsTracker[currentSum]) {
            // ...then adding any `itemValue` from `numbersForCurrentCase` to `currentSum`
            // will also result in an achievable sum.
            for (const itemValue of numbersForCurrentCase) {
                const nextPotentialSum = currentSum + itemValue;
                // Ensure the `nextPotentialSum` does not exceed our maximum tracking limit.
                if (nextPotentialSum <= MAXIMUM_COMPUTATION_VALUE) {
                    possibleSumsTracker[nextPotentialSum] = true;
                }
            }
        }
    }

    // Search for the largest prime sum that is less than or equal to `targetSumLimit`.
    // We iterate downwards from `targetSumLimit` to 1 to find the largest such sum efficiently.
    let largestPrimeSubsetSum = 0; // Variable to store the found result.

    // The search limit is capped by `targetSumLimit` and `MAXIMUM_COMPUTATION_VALUE`.
    const effectiveSearchLimit = Math.min(targetSumLimit, MAXIMUM_COMPUTATION_VALUE);

    for (let candidateSum = effectiveSearchLimit; candidateSum >= 1; --candidateSum) {
        // Check two conditions:
        // 1. Is `candidateSum` an achievable sum (from `possibleSumsTracker`)?
        // 2. Is `candidateSum` a prime number (from `precomputedPrimes`)?
        if (possibleSumsTracker[candidateSum] && precomputedPrimes.has(candidateSum)) {
            largestPrimeSubsetSum = candidateSum; // Found the desired sum.
            break; // Exit the loop as we found the largest one.
        }
    }

    // Output the result for the current test case.
    // If `largestPrimeSubsetSum` is still 0, it means no such prime sum was found.
    if (largestPrimeSubsetSum === 0) {
        console.log("NA"); // "Not Available"
    } else {
        console.log(largestPrimeSubsetSum); // Output the found prime sum.
    }
}