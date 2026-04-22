// A utility function to determine prime numbers up to a specified upper bound.
// This implementation uses a modified Sieve of Eratosthenes algorithm.
const calculatePrimesUpTo = (upperBound) => {
    // Validation: Primes are defined for numbers greater than 1.
    if (upperBound < 2) {
        return []; // No prime numbers exist below 2.
    }

    // Initialize a boolean array, where 'true' indicates a potential prime number.
    // 'false' will be used to mark composite numbers.
    const isCompositeMarker = new Array(upperBound + 1).fill(true);
    isCompositeMarker[0] = false; // 0 is not prime.
    isCompositeMarker[1] = false; // 1 is not prime.

    const resultantPrimesList = []; // This list will store all primes found.

    // Iterate from the first prime number (2) up to the square root of the limit.
    for (let currentCandidate = 2; currentCandidate * currentCandidate <= upperBound; currentCandidate++) {
        // If currentCandidate is still marked as true, it means it's a prime.
        if (isCompositeMarker[currentCandidate]) {
            // Mark all multiples of this prime as composite.
            // We start marking from currentCandidate * currentCandidate because
            // smaller multiples (e.g., 2*p, 3*p) would have already been marked
            // by their respective smaller prime factors (2, 3, etc.).
            for (let multipleValue = currentCandidate * currentCandidate; multipleValue <= upperBound; multipleValue += currentCandidate) {
                isCompositeMarker[multipleValue] = false; // Mark as composite.
            }
        }
    }

    // Collect all numbers that remained marked as true (prime) after the sieving process.
    for (let numberIterator = 2; numberIterator <= upperBound; numberIterator++) {
        if (isCompositeMarker[numberIterator]) {
            resultantPrimesList.push(numberIterator);
        }
    }

    return resultantPrimesList; // Return the complete list of prime numbers.
};

// Function to find the distinct prime factors of a given integer.
// It uses a precomputed list of primes to optimize the factorization process.
const decomposeIntoPrimes = (valueForFactoring, precomputedPrimeList) => {
    // Edge case: Numbers less than or equal to 1 have no prime factors.
    if (valueForFactoring <= 1) {
        return {};
    }

    const distinctPrimeFactorsMap = {}; // Stores the unique prime factors as keys.
    let mutableValue = valueForFactoring; // A temporary variable to modify during division.

    // Iterate through the list of precomputed primes.
    for (const currentPrimeFactor of precomputedPrimeList) {
        // Optimization: If the square of the current prime exceeds the remaining value,
        // then the remaining 'mutableValue' must either be 1 or a prime itself.
        if (currentPrimeFactor * currentPrimeFactor > mutableValue) {
            break;
        }

        // If the current prime divides the mutable value.
        if (mutableValue % currentPrimeFactor === 0) {
            distinctPrimeFactorsMap[currentPrimeFactor] = true; // Record this prime as a distinct factor.
            // Divide the mutable value by this prime repeatedly until it's no longer divisible.
            while (mutableValue % currentPrimeFactor === 0) {
                mutableValue /= currentPrimeFactor;
            }
        }
    }

    // After iterating through all relevant precomputed primes, if 'mutableValue' is still
    // greater than 1, it means the remaining value is a prime factor itself (a large prime).
    if (mutableValue > 1) {
        distinctPrimeFactorsMap[mutableValue] = true;
    }

    return distinctPrimeFactorsMap; // Return the map containing distinct prime factors.
};

// Calculates the Greatest Common Divisor (GCD) of two integers using the Euclidean algorithm.
const findCommonDivisor = (firstOperand, secondOperand) => {
    // Ensure both operands are non-negative for standard GCD definition.
    const absFirst = Math.abs(firstOperand);
    const absSecond = Math.abs(secondOperand);

    // Base case: If the second operand is 0, the GCD is the first operand.
    if (absSecond === 0) {
        return absFirst;
    }

    // Recursive step: GCD(a, b) = GCD(b, a % b).
    return findCommonDivisor(absSecond, absFirst % absSecond);
};

// The primary function to process input numbers and determine their coprimality status.
const analyzeInputNumbers = (inputData) => {
    // Initial validation of the input string.
    if (typeof inputData !== 'string' || inputData.trim() === '') {
        console.error("Input error: Provided data is empty or not a string.");
        return;
    }

    const dataLines = inputData.trim().split("\n");

    // Parse the count of elements from the first line.
    const numberOfElements = parseInt(dataLines[0], 10);
    if (isNaN(numberOfElements) || numberOfElements < 1) {
        console.error("Input error: Invalid count of elements specified.");
        return;
    }

    // Parse the sequence of numbers from the second line.
    const numericSequence = dataLines[1].split(" ").map(Number);

    // Consistency check between declared count and actual array length.
    if (numericSequence.length !== numberOfElements) {
        console.warn(`Warning: Declared element count (${numberOfElements}) differs from actual sequence length (${numericSequence.length}). Proceeding with actual length.`);
    }

    // Define the maximum value to consider for prime generation.
    // This constant is often derived from problem constraints (e.g., 10^6 + 1).
    const PRIME_SEARCH_UPPER_BOUND = 1000001;

    // Generate all primes up to the defined limit using the sieve.
    const generatedPrimes = calculatePrimesUpTo(PRIME_SEARCH_UPPER_BOUND);

    // --- Check for Pairwise Coprimality ---
    // A boolean array to keep track of prime factors encountered so far.
    // An index 'i' being true means prime 'i' has been a factor of at least one number.
    const encounteredPrimeFactors = new Array(PRIME_SEARCH_UPPER_BOUND).fill(false);
    let isPairwiseCoprimeResult = true; // Flag to store the result of pairwise coprimality check.

    // Iterate through each number in the input sequence.
    for (let elementIdx = 0; elementIdx < numberOfElements; elementIdx++) {
        const currentNumberInSequence = numericSequence[elementIdx];

        // Special handling for 1: it is coprime with all integers, and has no prime factors > 1.
        if (currentNumberInSequence === 1) {
            continue;
        }

        // Obtain the unique prime factors for the current number.
        const currentNumberDistinctFactors = Object.keys(decomposeIntoPrimes(currentNumberInSequence, generatedPrimes));

        // Examine each distinct prime factor.
        for (let factorIdx = 0; factorIdx < currentNumberDistinctFactors.length; factorIdx++) {
            const primeFactor = parseInt(currentNumberDistinctFactors[factorIdx], 10);

            // If this prime factor has already been encountered from a previous number,
            // then the set is not pairwise coprime.
            if (encounteredPrimeFactors[primeFactor]) {
                isPairwiseCoprimeResult = false; // Mark as not pairwise coprime.
                break; // No need to check further factors for this number.
            }
            // Mark this prime factor as encountered.
            encounteredPrimeFactors[primeFactor] = true;
        }

        // Early exit: If we've already determined it's not pairwise coprime, no more checks needed.
        if (!isPairwiseCoprimeResult) {
            break;
        }
    }

    // Output the result for pairwise coprimality.
    if (isPairwiseCoprimeResult) {
        console.log("pairwise coprime");
        return; // Exit if pairwise coprime.
    }

    // --- Check for Setwise Coprimality ---
    // If not pairwise coprime, we proceed to check for setwise coprimality.
    // This involves calculating the GCD of all numbers in the sequence.
    let cumulativeGreatestCommonDivisor = 0; // Accumulator for the overall GCD.

    // Compute the GCD across the entire number sequence.
    for (let seqIndex = 0; seqIndex < numericSequence.length; seqIndex++) {
        cumulativeGreatestCommonDivisor = findCommonDivisor(cumulativeGreatestCommonDivisor, numericSequence[seqIndex]);
        // Optimization: If the cumulative GCD becomes 1, it cannot decrease further.
        if (cumulativeGreatestCommonDivisor === 1) {
            break;
        }
    }

    // Output the result for setwise coprimality.
    if (cumulativeGreatestCommonDivisor === 1) {
        console.log("setwise coprime");
        return; // Exit if setwise coprime.
    }

    // If neither of the above conditions is met, the numbers are not coprime.
    console.log("not coprime");
};

// Invoke the main analysis function by reading input from standard input.
analyzeInputNumbers(require("fs").readFileSync("/dev/stdin", "utf8"));