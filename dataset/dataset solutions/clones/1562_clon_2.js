const FindPrimesUpToLimit = (upperBound) => {
    // Create a boolean array to mark composite numbers
    let isMarked = (new Array(upperBound + 1)).fill(false);
    // This array will store all prime numbers found
    let collectedPrimes = [];

    // Iterate from 2 up to the square root of the limit
    for (let currentNumber = 2; currentNumber * currentNumber <= upperBound; currentNumber++) {
        // If currentNumber is not marked, it's a prime
        if (!isMarked[currentNumber]) {
            collectedPrimes.push(currentNumber);
            // Mark all multiples of currentNumber as composite
            for (let multiple = currentNumber; multiple * currentNumber <= upperBound; multiple += currentNumber) {
                isMarked[multiple] = true;
            }
        }
    }
    // Return the list of identified primes
    return collectedPrimes;
};

const DecomposeIntoPrimeFactors = (valueToFactor, knownPrimeList) => {
    // Initialize an object to store prime factors and their counts
    let factorCounts = {};

    // Iterate through the list of known primes
    knownPrimeList.some(primeCandidate => {
        // If the value is smaller than the current prime, no further primes can be factors
        if (valueToFactor < primeCandidate) return true;

        // While the current prime divides the value, count it and reduce the value
        while (valueToFactor % primeCandidate === 0) {
            if (!factorCounts[primeCandidate]) {
                factorCounts[primeCandidate] = 1;
            } else {
                factorCounts[primeCandidate]++;
            }
            valueToFactor /= primeCandidate;
        }
        // Continue to the next prime candidate
        return false;
    });

    // If any value remains after division, it's a prime factor itself
    if (valueToFactor > 1) {
        factorCounts[valueToFactor] = 1;
    }
    // Return the mapping of prime factors to their exponents
    return factorCounts;
};

const CalculateGreatestCommonDivisor = (firstOperand, secondOperand) => {
    // Base case: if the second operand is zero, the first is the GCD
    if (secondOperand === 0) return firstOperand;
    // Base case: if the first operand is zero, the second is the GCD
    else if (firstOperand === 0) return secondOperand;
    // Recursive step using Euclidean algorithm
    return CalculateGreatestCommonDivisor(secondOperand, firstOperand % secondOperand);
};

const ExecuteProgram = (inputDataString) => {
    // Parse the total count of numbers from the input string
    const itemCount = Number(inputDataString.split("\n")[0]);
    // Parse the list of numbers from the input string
    const integerList = inputDataString.split("\n")[1].split(" ").map(Number);

    // Define the maximum possible value for numbers in the list
    const maximumValueAllowed = 10 ** 6 + 1;

    // Generate all primes up to the maximum value using the Sieve method
    const generatedPrimes = FindPrimesUpToLimit(maximumValueAllowed);

    // Initialize an array to track if a prime factor has appeared in any number
    let factorOccurrenceTracker = (new Array(maximumValueAllowed)).fill(false);
    // Flag to determine if all numbers are pairwise coprime
    let areNumbersMutuallyPrime = true;

    // Iterate through each number in the input list
    for (let outerIndex = 0; outerIndex < itemCount; outerIndex++) {
        // Get the unique prime factors for the current number
        const currentNumberFactors = Object.keys(DecomposeIntoPrimeFactors(integerList[outerIndex], generatedPrimes));
        
        // Check each prime factor
        for (let innerIndex = 0; innerIndex < currentNumberFactors.length; innerIndex++) {
            // If this prime factor has been seen before
            if (factorOccurrenceTracker[currentNumberFactors[innerIndex]] === true) {
                areNumbersMutuallyPrime = false; // They are not pairwise coprime
            }
            // Mark this prime factor as seen
            factorOccurrenceTracker[currentNumberFactors[innerIndex]] = true;
        }
    }

    // If the numbers are pairwise coprime, print the result and exit
    if (areNumbersMutuallyPrime) {
        console.log("pairwise coprime");
        return;
    }

    // Calculate the greatest common divisor for all numbers in the list
    let overallGcdResult = 0; // Start with 0 for cumulative GCD calculation
    for (let outerIndex = 0; outerIndex < integerList.length; outerIndex++) {
        overallGcdResult = CalculateGreatestCommonDivisor(overallGcdResult, integerList[outerIndex]);
    }

    // If the overall GCD is 1, they are setwise coprime
    if (overallGcdResult === 1) {
        console.log("setwise coprime");
        return;
    }

    // If neither condition is met, they are not coprime
    console.log("not coprime");
};

ExecuteProgram(require("node:fs").readFileSync("/dev/stdin", "utf8"));