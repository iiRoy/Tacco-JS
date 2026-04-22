function obtainSmallestPrimeFactor(inputVal) {
    // This function aims to find the smallest prime divisor of a given non-negative integer.
    // If the number itself is prime, it returns the number.
    // Numbers less than 2 are returned as is, as they are not prime and have no prime factors.
    if (inputVal < 2) {
        return inputVal;
    }

    // Efficiently check for divisibility by the first prime, 2.
    if (inputVal % 2 === 0) {
        return 2;
    }

    // Iterate through odd numbers starting from 3 up to the square root of the input value.
    // Any composite number 'n' must have at least one prime factor less than or equal to sqrt(n).
    for (let currentDivisor = 3; currentDivisor * currentDivisor <= inputVal; currentDivisor += 2) {
        if (inputVal % currentDivisor === 0) {
            return currentDivisor; // Found a factor, return the smallest one.
        }
    }

    // If no factors were found after checking up to the square root, the number itself must be prime.
    return inputVal;
}

// Initialize a dynamic list to store prime numbers found.
// The initial primes, 2 and 3, are explicitly added as they don't fit the 6k ± 1 pattern directly for k>=1.
const primeNumbersList = [2, 3];

// Define the exclusive upper bound for prime number generation.
// This constant dictates the maximum value for which primes will be sought.
const PRIME_GENERATION_UPPER_EXCLUSIVE_BOUND = 50024; // Corresponds to original `l` value.

// Generate additional prime numbers using the 6k ± 1 optimization.
// This method efficiently checks numbers of the form 6k-1 and 6k+1, which are candidates for primality.
for (let iterationStep = 1; ; iterationStep++) {
    const candidateOne = (iterationStep * 6) - 1; // First potential prime candidate (e.g., 5, 11, 17...)
    const candidateTwo = (iterationStep * 6) + 1; // Second potential prime candidate (e.g., 7, 13, 19...)

    // Check if the first candidate has exceeded or reached the generation limit.
    // If so, all subsequent candidates in this iteration will also be too high.
    if (candidateOne >= PRIME_GENERATION_UPPER_EXCLUSIVE_BOUND) {
        break;
    }

    // If the candidate is prime (its smallest prime factor is itself), add it to the list.
    // We also ensure it's greater than 1, though 6k-1 for k>=1 is always > 1.
    if (obtainSmallestPrimeFactor(candidateOne) === candidateOne) {
        primeNumbersList.push(candidateOne);
    }

    // Check if the second candidate has exceeded or reached the generation limit.
    if (candidateTwo >= PRIME_GENERATION_UPPER_EXCLUSIVE_BOUND) {
        break;
    }

    // If the second candidate is prime, add it to the list.
    if (obtainSmallestPrimeFactor(candidateTwo) === candidateTwo) {
        primeNumbersList.push(candidateTwo);
    }
}

// Store the total number of primes generated for efficient access.
const totalPrimesCount = primeNumbersList.length;

// Helper function to safely retrieve a prime number from the list by index.
// Returns `null` if the index is out of bounds, preventing errors.
const getSafePrime = (idx) => (idx >= 0 && idx < totalPrimesCount) ? primeNumbersList[idx] : null;

// Configure input processing from the standard input stream.
// This event listener processes incoming data chunks.
process.stdin.on("data", (inputDataBuffer) => {
    // Convert the input buffer to a string, remove leading/trailing whitespace,
    // and split it into individual lines (each representing a target number).
    // The `.some` method iterates over each line, processing it.
    String(inputDataBuffer).trim().split("\n").some((currentLineText) => {
        // Convert the string representation of the number to an actual numeric type.
        const targetNumber = Number(currentLineText);

        // Iterate through the pre-computed list of primes to find the "neighboring" primes
        // for the current target number.
        for (let primeIndex = 0; primeIndex < totalPrimesCount; primeIndex++) {
            const currentPrimeInList = primeNumbersList[primeIndex];

            // When the current prime in the list is greater than the target number,
            // we've found our range.
            if (targetNumber < currentPrimeInList) {
                // Retrieve the prime immediately preceding the current one in the list.
                const previousPrime = getSafePrime(primeIndex - 1);
                // Retrieve the prime two positions before the current one (needed if targetNumber is prime).
                const secondPreviousPrime = getSafePrime(primeIndex - 2);

                // Determine the output based on whether the target number itself is a prime in our list.
                // If `previousPrime` exists and is equal to the `targetNumber`, it means `targetNumber` is prime.
                if (previousPrime !== null && previousPrime === targetNumber) {
                    // Output the prime before `targetNumber` and the prime after `targetNumber`.
                    console.log(secondPreviousPrime, currentPrimeInList);
                } else {
                    // If `targetNumber` is not prime (or smaller than the first prime in the list),
                    // output the prime just before the found range and the prime just after.
                    console.log(previousPrime, currentPrimeInList);
                }
                break; // Stop searching once the pair of neighboring primes is found for this target number.
            }
        }
        // Return `false` to ensure that `.some()` continues processing all input lines.
        return false;
    });
}).resume(); // Ensure the standard input stream remains open to receive more data.