const generatePrimesUpToSqrt = (limitVal) => {
    const MARKED_STATUS_TRUE = 1;
    const UNMARKED_STATUS_FALSE = 0;

    // Initialize an array to track marked numbers.
    // Original code uses `new Array(n)`, which creates an array of length `n` (indices 0 to n-1).
    // This is preserved, as the specific sieve logic (j*j <= n) ensures indices accessed are within bounds
    // or handled by JavaScript's property assignment for out-of-bounds numeric indices.
    let markedStatus = (new Array(limitVal)).fill(UNMARKED_STATUS_FALSE);
    let foundPrimes = [];

    // Outer loop iterates up to sqrt(limitVal)
    for (let currentNum = 2; currentNum * currentNum <= limitVal; currentNum++) {
        // If currentNum is not marked, it's considered prime by this sieve's logic
        if (markedStatus[currentNum] === UNMARKED_STATUS_FALSE) {
            foundPrimes.push(currentNum);

            // Inner loop marks multiples.
            // The condition `multiple * multiple <= limitVal` is a specific characteristic
            // of the original code's sieve implementation and is preserved.
            for (let multiple = currentNum; multiple * multiple <= limitVal; multiple += currentNum) {
                markedStatus[multiple] = MARKED_STATUS_TRUE;
            }
        }
    }
    return foundPrimes;
};

const obtainPrimeFactorCounts = (numberToFactor, primeList) => {
    let primeFactorMap = {};

    // Iterate through the provided list of primes
    for (const currentPrimeVal of primeList) {
        // If the number to factor becomes smaller than the current prime,
        // no more factors from this list can divide it.
        if (numberToFactor < currentPrimeVal) {
            break;
        }
        // Repeatedly divide by currentPrimeVal and count occurrences
        while (numberToFactor % currentPrimeVal === 0) {
            primeFactorMap[currentPrimeVal] = (primeFactorMap[currentPrimeVal] || 0) + 1;
            numberToFactor /= currentPrimeVal;
        }
    }

    // If, after dividing by all primes in the list, the numberToFactor is still greater than 1,
    // it means the remaining number is a prime factor itself (likely larger than any prime in primeList).
    if (numberToFactor > 1) {
        primeFactorMap[numberToFactor] = 1;
    }
    return primeFactorMap;
};

const calculateGreatestCommonDivisor = (valA, valB) => {
    if (valB === 0) {
        return valA;
    }
    const remainder = valA % valB; // Use a helper variable for the modulo result
    return calculateGreatestCommonDivisor(valB, remainder);
};

const processInputAndDetermineCoprimality = (inputString) => {
    const NEWLINE_DELIMITER = "\n";
    const SPACE_DELIMITER = " ";
    const ONE_VALUE = 1; // Constant for the value 1, used in checks

    const inputLines = inputString.split(NEWLINE_DELIMITER);
    const totalCount = Number(inputLines[0]);
    const numberArray = inputLines[1].split(SPACE_DELIMITER).map(Number);

    // Determine the maximum value in the array to set the limit for prime generation
    const maxArrayValue = Math.max(...numberArray);
    const primesForFactorization = generatePrimesUpToSqrt(maxArrayValue);

    // --- Check for pairwise coprimality ---
    // Tracker for prime factors encountered across all numbers.
    // Array size `maxArrayValue + 1` to allow indexing up to `maxArrayValue`.
    let factorPresenceTracker = Array(maxArrayValue + 1).fill(0);
    let isPairwiseCoprimeFlag = true;

    for (let i = 0; i < totalCount; i++) {
        const currentNumber = numberArray[i];
        const factorsObject = obtainPrimeFactorCounts(currentNumber, primesForFactorization);
        const uniquePrimeFactors = Object.keys(factorsObject).map(Number); // Convert keys (strings) to numbers

        for (const currentFactor of uniquePrimeFactors) {
            if (factorPresenceTracker[currentFactor] === ONE_VALUE) {
                isPairwiseCoprimeFlag = false; // Found a common factor, not pairwise coprime
                break; // Exit inner loop
            }
            factorPresenceTracker[currentFactor] = ONE_VALUE; // Mark this factor as seen
        }
        if (!isPairwiseCoprimeFlag) {
            break; // If already determined not pairwise coprime, exit outer loop early
        }
    }

    if (isPairwiseCoprimeFlag) {
        console.log("pairwise coprime");
        return;
    }

    // --- Check for setwise coprimality if not pairwise coprime ---
    // Guard clause for empty array, though problem constraints usually prevent N=0.
    if (numberArray.length === 0) {
        console.log("not coprime");
        return;
    }
    
    let commonDivisor = numberArray[0];
    // Calculate GCD of all elements iteratively
    for (let i = 1; i < numberArray.length; i++) {
        commonDivisor = calculateGreatestCommonDivisor(commonDivisor, numberArray[i]);
        if (commonDivisor === ONE_VALUE) {
            // Optimization: if GCD becomes 1, it will remain 1 for subsequent calculations
            break;
        }
    }

    if (commonDivisor === ONE_VALUE) {
        console.log("setwise coprime");
        return;
    }

    console.log("not coprime");
};

processInputAndDetermineCoprimality(require("fs").readFileSync("/dev/stdin", "utf8"));
