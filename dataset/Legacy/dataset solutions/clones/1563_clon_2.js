const PrimeFilter = (limitVal) => {
    // Initialize an array to track composite numbers.
    let markedFlags = (new Array(limitVal)).fill(0);
    // This array will store the identified prime numbers.
    let primeNumbers = [];

    for (let idx = 2; idx * idx <= limitVal; idx++) {
        // If the current number 'idx' has not been marked as composite
        if (!markedFlags[idx]) {
            primeNumbers.push(idx); // It's a prime, add it to our list.
            // Mark all multiples of 'idx' as composite.
            for (let subIdx = idx; subIdx * subIdx <= limitVal; subIdx += idx) {
                markedFlags[subIdx] = 1;
            }
        }
    }
    return primeNumbers;
};

const DecomposeByPrimes = (targetNumber, availablePrimes) => {
    let primeFactorsMap = {}; // Object to store prime factors and their counts (here, just presence).

    // Iterate through the list of primes.
    availablePrimes.some(currentPrime => {
        // If the target number is smaller than the current prime, we can stop.
        if (targetNumber < currentPrime) return true;
        // If the current prime divides the target number, record it.
        if (targetNumber % currentPrime === 0) primeFactorsMap[currentPrime] = 1;
    });

    // If after checking all primes, the target number is still greater than 1,
    // it means the remaining targetNumber itself is a prime factor.
    if (targetNumber > 1) primeFactorsMap[targetNumber] = 1;
    return primeFactorsMap;
};


const ComputeGreatestCommonDivisor = (valA, valB) => {
    if (valB === 0) return valA; // Base case: GCD(a, 0) = a
    else if (valA === 0) return valB; // Base case: GCD(0, b) = b
    return ComputeGreatestCommonDivisor(valB, valA % valB); // Recursive step using Euclidean algorithm
};

const ProcessInput = (inputString) => {
    const countOfNumbers = Number(inputString.split("\n")[0]);
    const inputNumbers = inputString.split("\n")[1].split(" ").map(Number);

    const maximumValue = 10 ** 6 + 1; // Define the upper bound for prime generation.

    // Generate primes up to maximumValue using the sieve.
    const generatedPrimes = PrimeFilter(maximumValue);
    // An array to track if a prime factor has been encountered across all numbers.
    let factorPresenceTracker = [...new Array(maximumValue)].fill(0);
    let arePairwiseCoprime = true; // Flag to determine if numbers are pairwise coprime.

    // Iterate through each number in the input array.
    for (let outerIndex = 0; outerIndex < countOfNumbers; outerIndex++) {
        // Get the unique prime factors for the current number.
        const currentFactors = Object.keys(DecomposeByPrimes(inputNumbers[outerIndex], generatedPrimes));
        // Check each prime factor.
        for (let innerIndex = 0; innerIndex < currentFactors.length; innerIndex++) {
            // If this prime factor has already been seen in a previous number,
            // then the numbers are not pairwise coprime.
            if (factorPresenceTracker[currentFactors[innerIndex]] === 1) {
                arePairwiseCoprime = false;
            }
            // Mark this prime factor as seen.
            factorPresenceTracker[currentFactors[innerIndex]] = 1;
        }
    }

    // If the numbers are pairwise coprime, print the result and exit.
    if (arePairwiseCoprime) {
        console.log("pairwise coprime");
        return;
    }

    // If not pairwise coprime, check for setwise coprime.
    let overallGCD = 0; // Initialize GCD accumulator.
    for (let outerIndex = 0; outerIndex < inputNumbers.length; outerIndex++) {
        // Compute GCD of all numbers.
        overallGCD = ComputeGreatestCommonDivisor(overallGCD, inputNumbers[outerIndex]);
    }

    // If the overall GCD is 1, the numbers are setwise coprime.
    if (overallGCD === 1) {
        console.log("setwise coprime");
        return;
    }

    // If neither pairwise nor setwise coprime, print "not coprime".
    console.log("not coprime");
};

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
