function calculateProductOfDivisors(dataString) {
    // Parse the input string to obtain the maximum number for factorization.
    let upperBound = parseInt(dataString);

    // Initialize an object to store the total counts of each prime factor found.
    // The keys will be prime numbers, and values will be their cumulative exponents.
    const primeFactorCounts = {};

    // Iterate through each integer from 2 up to the specified upper bound.
    for (let currentNumber = 2; currentNumber <= upperBound; currentNumber++) {
        let tempNumber = currentNumber; // A temporary variable to perform factorization without altering 'currentNumber'.

        // Find prime factors of 'tempNumber' by checking potential divisors up to its square root.
        for (let divisorCandidate = 2; divisorCandidate * divisorCandidate <= tempNumber; divisorCandidate++) {
            // If 'divisorCandidate' divides 'tempNumber' evenly, it's a prime factor.
            if (tempNumber % divisorCandidate === 0) {
                let factorOccurrence = 0; // Counter for how many times this prime factor appears.
                // Continuously divide 'tempNumber' by 'divisorCandidate' until it's no longer divisible.
                while (tempNumber % divisorCandidate === 0) {
                    factorOccurrence++;
                    tempNumber /= divisorCandidate;
                }
                // Add the count of this prime factor to our global map.
                if (primeFactorCounts[divisorCandidate]) {
                    primeFactorCounts[divisorCandidate] += factorOccurrence;
                } else {
                    primeFactorCounts[divisorCandidate] = factorOccurrence;
                }
            }
        }

        // If 'tempNumber' is still greater than 1 after the loop, it means
        // the remaining 'tempNumber' itself is a prime factor (it was not fully divided by smaller primes).
        if (tempNumber !== 1) {
            if (primeFactorCounts[tempNumber]) {
                primeFactorCounts[tempNumber]++;
            } else {
                primeFactorCounts[tempNumber] = 1;
            }
        }
    }

    // Initialize the variable that will hold the final computed result.
    let finalResult = 1;
    // Define the modulo constant to keep the result within a manageable range.
    const moduloValue = 1000000007;

    // Iterate over the collected prime factors and their total counts.
    // The formula for the number of divisors is the product of (exponent + 1) for each unique prime factor.
    for (const primeFactor in primeFactorCounts) {
        // Ensure we are only processing properties directly on the object, not from its prototype chain.
        if (Object.prototype.hasOwnProperty.call(primeFactorCounts, primeFactor)) {
            finalResult = (finalResult * (primeFactorCounts[primeFactor] + 1)) % moduloValue;
        }
    }

    // Output the final calculated result to the console.
    console.log(finalResult);
}

// Read the input from standard input using Node.js 'fs' module
// and then invoke the main calculation function with the obtained data.
calculateProductOfDivisors(require("fs").readFileSync("/dev/stdin", "utf8"));
