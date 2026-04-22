const retrievePrimesUpTo = (boundaryValue) => {
    // Validate the input parameter to ensure it's a positive whole number.
    if (typeof boundaryValue !== 'number' || !Number.isInteger(boundaryValue) || boundaryValue < 2) {
        // For invalid inputs, an empty collection of primes is returned.
        return [];
    }

    // Initialize a boolean flag array. `isNumberPrime[k]` is true if 'k' is a potential prime, false otherwise.
    // All numbers from 0 up to boundaryValue are initially presumed prime.
    const isNumberPrime = new Array(boundaryValue + 1).fill(true);

    // According to mathematical definitions, 0 and 1 are not considered prime numbers.
    isNumberPrime[0] = false;
    if (boundaryValue >= 1) { // Conditional check for smaller boundaries
        isNumberPrime[1] = false;
    }

    // The core sieving process. We only need to iterate up to the square root of boundaryValue.
    // Any composite number 'N' will have at least one prime factor less than or equal to sqrt(N).
    for (let currentCandidate = 2; currentCandidate * currentCandidate <= boundaryValue; ++currentCandidate) {
        // If 'currentCandidate' has not been marked as composite yet, it is a prime number.
        if (isNumberPrime[currentCandidate]) {
            // Mark all multiples of this prime as composite.
            // We start marking from `currentCandidate * currentCandidate` because smaller multiples
            // (e.g., `2 * currentCandidate`, `3 * currentCandidate`) would have already been marked
            // by their respective smaller prime factors.
            for (let multipleValue = currentCandidate * currentCandidate; multipleValue <= boundaryValue; multipleValue += currentCandidate) {
                isNumberPrime[multipleValue] = false;
            }
        }
    }

    // Compile the final collection of prime numbers from the boolean flag array.
    const primeNumberCollection = [];
    for (let index = 0; index <= boundaryValue; ++index) {
        if (isNumberPrime[index]) {
            primeNumberCollection.push(index);
        }
    }

    // Deliver the generated list of primes.
    return primeNumberCollection;
};

const countUniquePrimeCombinations = (desiredSum, availablePrimeNumbers) => {
    // Basic validation for the target sum.
    if (typeof desiredSum !== 'number' || !Number.isInteger(desiredSum) || desiredSum < 4) {
        // Sums less than 4 (e.g., 2+2) cannot be formed by two primes.
        return 0;
    }

    // A data structure to keep track of unique pairs found.
    // Storing pairs as sorted strings (e.g., "3_7") ensures uniqueness regardless of prime order.
    const discoveredPairKeys = new Set();
    const totalPrimesAvailable = availablePrimeNumbers.length;

    // Iterate through the list of primes for the first component of the pair.
    for (let firstPrimeIndex = 0; firstPrimeIndex < totalPrimesAvailable; ++firstPrimeIndex) {
        const primeComponentOne = availablePrimeNumbers[firstPrimeIndex];

        // Optimization: If the first prime is already greater than or equal to the desired sum,
        // no second prime can be found to form a positive sum.
        if (primeComponentOne >= desiredSum) {
            break;
        }

        // Iterate through the list of primes for the second component.
        // Starting `secondPrimeIndex` from `firstPrimeIndex` ensures that `primeComponentOne <= primeComponentTwo`,
        // which naturally handles duplicate pairs (e.g., (3,7) and (7,3)) without extra checks.
        for (let secondPrimeIndex = firstPrimeIndex; secondPrimeIndex < totalPrimesAvailable; ++secondPrimeIndex) {
            const primeComponentTwo = availablePrimeNumbers[secondPrimeIndex];

            // Optimization: If the second prime is already too large, no further primes in this inner loop will work.
            if (primeComponentTwo >= desiredSum) {
                break;
            }

            const currentPairSum = primeComponentOne + primeComponentTwo;

            // Check if the current pair sums to the desired value.
            if (currentPairSum === desiredSum) {
                // Construct a canonical key for the pair to ensure uniqueness in the Set.
                // Since firstPrimeIndex <= secondPrimeIndex, primeComponentOne <= primeComponentTwo.
                const pairIdentifier = `${primeComponentOne}_${primeComponentTwo}`;
                discoveredPairKeys.add(pairIdentifier);
            } else if (currentPairSum > desiredSum) {
                // Since `availablePrimeNumbers` is sorted, if the sum exceeds the target,
                // any subsequent `primeComponentTwo` will also result in an even larger sum.
                break;
            }
        }
    }
    return discoveredPairKeys.size;
};

// --- Main Execution Block ---

// Define the upper bound for prime number generation. Increased from 50000 to 65000.
const maximumPrimeSearchLimit = 65000;

// Generate the comprehensive list of primes once at the start to optimize repeated lookups.
const precomputedPrimeSet = retrievePrimesUpTo(maximumPrimeSearchLimit);

// Utilize Node.js 'fs' module to synchronously read the entire standard input.
// This is common in competitive programming environments.
const rawInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input: remove leading/trailing whitespace, split into lines,
// and convert each line into a numerical value.
const processedNumericalInputs = rawInputBuffer
    .trim()
    .split('\n')
    .map(Number);

// Iterator for the processed input array.
let currentInputPointer = 0;

// Main application loop: Processes each numerical input until a zero (sentinel value) is encountered.
while (true) {
    // Extract the next target number from the input stream.
    const currentTargetNumber = processedNumericalInputs[currentInputPointer++];

    // Check for the designated termination condition (input value of 0).
    if (currentTargetNumber === 0) {
        break; // Exit the processing loop.
    }

    // Determine the count of unique prime number pairs that sum to the current target.
    const resultPairCount = countUniquePrimeCombinations(currentTargetNumber, precomputedPrimeSet);

    // Output the calculated count to the console.
    console.log(resultPairCount);
}