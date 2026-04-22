const calculatePrimesUpToLimit = (upperBound) => {
    // Guard clause: Primes are defined for numbers greater than or equal to 2.
    if (upperBound < 2) {
        return [];
    }

    // Initialize a boolean array where `isCompositeTracker[k]` is true if `k` is found to be composite.
    // The size is `upperBound + 1` to easily map indices to numbers.
    const isCompositeTracker = new Array(upperBound + 1).fill(false);
    const foundPrimesList = []; // This array will store the identified prime numbers.

    // Iterate from the first prime candidate (2) up to the square root of the upper bound.
    // Any composite number `N` must have at least one prime factor less than or equal to `sqrt(N)`.
    for (let currentCandidate = 2; currentCandidate * currentCandidate <= upperBound; currentCandidate++) {
        // If `currentCandidate` has not been marked as composite, it is a prime number.
        if (!isCompositeTracker[currentCandidate]) {
            // Mark all multiples of `currentCandidate` as composite.
            // We start marking from `currentCandidate * currentCandidate` because any smaller multiples
            // (e.g., `2 * currentCandidate`, `3 * currentCandidate`) would have already been marked
            // by their smaller prime factors (2, 3, etc.).
            for (let multiple = currentCandidate * currentCandidate; multiple <= upperBound; multiple += currentCandidate) {
                isCompositeTracker[multiple] = true;
            }
        }
    }

    // After marking all composites, iterate through the tracker to collect the prime numbers.
    // Numbers that remain `false` in `isCompositeTracker` are prime.
    for (let numberIndex = 2; numberIndex <= upperBound; numberIndex++) {
        if (!isCompositeTracker[numberIndex]) {
            foundPrimesList.push(numberIndex);
        }
    }

    return foundPrimesList;
};

const decomposeIntoPrimeFactors = (targetNumber, primeCandidates) => {
    // A Map to store each prime factor and its corresponding exponent.
    const primeFactorsMap = new Map();
    let remainingValue = targetNumber; // Use a mutable copy of the input number.

    // Handle edge cases for numbers less than or equal to 1, which have no prime factors.
    if (remainingValue <= 1) {
        return primeFactorsMap;
    }

    // Iterate through the provided list of potential prime divisors.
    // The list `primeCandidates` should ideally contain primes up to `sqrt(targetNumber)`.
    for (const currentPrime of primeCandidates) {
        // Optimization: If the square of the current prime exceeds the remaining value,
        // it means the remaining value must either be 1 or a prime number itself.
        if (currentPrime * currentPrime > remainingValue && remainingValue > 1) {
            break; // Exit early as no further primes from the list can divide `remainingValue`.
        }

        // Check if the current prime divides the `remainingValue`.
        if (remainingValue % currentPrime === 0) {
            let exponentCount = 0; // Initialize a counter for this prime factor's exponent.
            // Continuously divide `remainingValue` by `currentPrime` until it's no longer divisible.
            while (remainingValue % currentPrime === 0) {
                exponentCount++;
                remainingValue /= currentPrime;
            }
            primeFactorsMap.set(currentPrime, exponentCount); // Store the prime and its count.
        }

        // Additional early exit: if `remainingValue` becomes 1, all factors have been found.
        if (remainingValue === 1) {
            break;
        }
    }

    // If, after checking all `primeCandidates`, `remainingValue` is still greater than 1,
    // it implies that `remainingValue` itself is a prime factor (or a product of primes
    // larger than any in `primeCandidates`).
    if (remainingValue > 1) {
        // Add this remaining prime factor to the map.
        // Use `(primeFactorsMap.get(remainingValue) || 0) + 1` to handle cases where
        // `remainingValue` might have been a prime factor already in `primeCandidates` but
        // also remained as the final value (less common but robust).
        primeFactorsMap.set(remainingValue, (primeFactorsMap.get(remainingValue) || 0) + 1);
    }

    return primeFactorsMap;
};

const computeGreatestCommonDivisor = (firstVal, secondVal) => {
    // Ensure that inputs are non-negative for standard GCD definition.
    // The GCD of two numbers is the same as the GCD of their absolute values.
    let absoluteA = Math.abs(firstVal);
    let absoluteB = Math.abs(secondVal);

    // Apply the Euclidean algorithm iteratively.
    // The algorithm states that GCD(a, b) = GCD(b, a % b).
    // The base case is when `b` becomes 0, at which point `a` is the GCD.
    while (absoluteB !== 0) {
        const remainder = absoluteA % absoluteB;
        absoluteA = absoluteB;
        absoluteB = remainder;
    }
    return absoluteA;
};

const processCoprimalityAnalysis = (rawInputData) => {
    // --- Input Parsing and Validation ---
    const inputLines = rawInputData.trim().split("\n");
    if (inputLines.length < 2) {
        process.stderr.write("Error: Insufficient input data provided. Expected at least two lines.\n");
        return;
    }

    // Parse the count of elements.
    const elementCountStr = inputLines[0];
    const elementCount = parseInt(elementCountStr, 10);

    if (isNaN(elementCount) || elementCount < 1) {
        process.stderr.write("Error: Invalid or non-positive number of elements specified.\n");
        return;
    }

    // Parse the array of numbers.
    const numericArrayStr = inputLines[1].split(" ");
    // Convert strings to numbers and filter out any invalid numeric entries (e.g., empty strings).
    const numericArray = numericArrayStr.map(Number).filter(num => !isNaN(num) && num > 0);

    if (numericArray.length !== elementCount) {
        process.stderr.write("Error: Mismatch between specified element count and actual valid numbers provided.\n");
        return;
    }
    // Ensure all numbers are positive integers as required for coprimality.
    if (numericArray.some(val => !Number.isInteger(val) || val < 1)) {
        process.stderr.write("Error: All numbers in the array must be positive integers.\n");
        return;
    }

    // Handle trivial case of a single element array.
    if (numericArray.length === 1) {
        // A single number is neither pairwise nor setwise coprime with itself in the typical sense.
        // However, if we must classify, it's not "not coprime" either. This often depends on problem spec.
        // For consistency with "not coprime" outcome if not pairwise/setwise, we'll let it fall through.
        // Or, we could explicitly define it. Let's assume it should behave like other non-coprime cases.
    }


    // --- Pairwise Coprimality Check ---
    let isArrayPairwiseCoprime = true;
    const maxArrayValue = Math.max(...numericArray); // Determine the maximum value to limit prime generation.

    // Generate primes up to the maximum value found in the input array.
    const precomputedPrimes = calculatePrimesUpToLimit(maxArrayValue);

    // A Set to efficiently track all unique prime factors encountered across all numbers.
    // If a prime factor is seen again, it implies a common factor between two numbers,
    // making the array not pairwise coprime.
    const uniquePrimeFactorsSeen = new Set();
    let hasDuplicateFactorBeenFound = false; // Flag for early loop termination.

    for (let k = 0; k < numericArray.length; k++) {
        const currentNumber = numericArray[k];

        // Obtain the prime factors for the current number.
        // The `decomposeIntoPrimeFactors` function returns a Map; we extract its keys (the prime factors).
        const currentNumberFactorsMap = decomposeIntoPrimeFactors(currentNumber, precomputedPrimes);
        const currentNumberPrimeFactors = Array.from(currentNumberFactorsMap.keys()).map(Number); // Ensure they are numeric.

        // Iterate through the prime factors of the current number.
        for (const primeFactor of currentNumberPrimeFactors) {
            // If this prime factor has been seen before from another number,
            // then the array is not pairwise coprime.
            if (uniquePrimeFactorsSeen.has(primeFactor)) {
                isArrayPairwiseCoprime = false;
                hasDuplicateFactorBeenFound = true; // Set flag to break the outer loop.
                break; // No need to check other factors for this number.
            }
            uniquePrimeFactorsSeen.add(primeFactor); // Add the factor to the set of seen factors.
        }

        if (hasDuplicateFactorBeenFound) {
            break; // Exit the main loop over `numericArray` elements.
        }
    }

    // If the array is determined to be pairwise coprime, output and terminate.
    if (isArrayPairwiseCoprime) {
        process.stdout.write("pairwise coprime\n");
        return;
    }

    // --- Setwise Coprimality Check ---
    // If the array is not pairwise coprime, proceed to check for setwise coprimality.
    // This involves calculating the greatest common divisor (GCD) of all elements in the array.
    // If the overall GCD is 1, the set is setwise coprime.

    if (numericArray.length === 0) {
        // An empty array cannot be setwise coprime in the usual sense of having elements.
        process.stdout.write("not coprime\n");
        return;
    }

    // Initialize the cumulative GCD with the first element of the array.
    let cumulativeGCD = numericArray[0];
    // Iterate from the second element to compute the GCD of all elements.
    for (let idx = 1; idx < numericArray.length; idx++) {
        cumulativeGCD = computeGreatestCommonDivisor(cumulativeGCD, numericArray[idx]);
        // Optimization: If the cumulative GCD becomes 1 at any point, it cannot decrease further,
        // so we can stop early and conclude it's setwise coprime.
        if (cumulativeGCD === 1) {
            break;
        }
    }

    // If the final cumulative GCD is 1, the array is setwise coprime.
    if (cumulativeGCD === 1) {
        process.stdout.write("setwise coprime\n");
        return;
    }

    // --- Default Case: Not Coprime ---
    // If neither pairwise nor setwise coprime conditions are met.
    process.stdout.write("not coprime\n");
};

// --- Execution Entry Point ---
// A self-invoking anonymous function to manage the program's execution flow,
// including error handling for file operations.
(function executeCoprimalityCheck() {
    try {
        // Read input from standard input, typically used in competitive programming environments.
        const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
        processCoprimalityAnalysis(fileContent); // Call the main analysis function.
    } catch (error) {
        // Log any errors that occur during file reading or initial processing.
        process.stderr.write(`An error occurred during input reading or processing: ${error.message}\n`);
        process.exit(1); // Exit with a non-zero status code to indicate an error.
    }
})();