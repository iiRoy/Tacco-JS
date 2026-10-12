function findPrimes(upperBound) {
    // Initialize an array to act as a sieve for prime number identification.
    // Each index `idx` will initially store `idx`.
    let sieveArray = [];
    for (let idx = 0; idx <= upperBound; idx++) {
        sieveArray[idx] = idx;
    }

    // Mark 0 and 1 as not prime numbers, as per definition.
    sieveArray[0] = false;
    sieveArray[1] = false;

    // Calculate the square root of the upper bound.
    // This is an optimization for the Sieve of Eratosthenes.
    const limitSqrt = Math.floor(Math.sqrt(upperBound));

    // Apply the Sieve of Eratosthenes algorithm.
    // Iterate from 2 up to the square root of the upper bound.
    for (let idx = 2; idx <= limitSqrt; idx++) {
        // If the current number `idx` has already been marked as not prime,
        // then all its multiples would have been marked by its prime factors.
        if (sieveArray[idx] === false) {
            continue;
        }
        // If `idx` is prime, mark all its multiples (starting from `2*idx`) as not prime.
        for (let multipleIdx = idx + idx; multipleIdx <= upperBound; multipleIdx += idx) {
            sieveArray[multipleIdx] = false;
        }
    }

    // Create a hash map (object) for efficient lookup of prime numbers.
    // Keys will be prime numbers, values will be `true`.
    const primeMap = {};
    for (let idx = 0; idx <= upperBound; idx++) {
        // If `sieveArray[idx]` is not false, it means `idx` is a prime number.
        if (sieveArray[idx] !== false) {
            primeMap[sieveArray[idx]] = true;
        }
    }
    return primeMap;
}

// Pre-calculate a map of prime numbers up to 1,000,000.
const primeNumbersMap = findPrimes(1000000);

// Read all input data from standard input.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Trim leading/trailing whitespace and split the input into an array of lines.
const inputLines = (rawData.trim()).split("\n");

// Process each test case from the input lines.
while (true) {
    // Extract the first line, split it by space, and convert parts to numbers.
    const currentLineNums = inputLines.shift().split(" ").map(Number);
    const numElements = currentLineNums[0]; // Represents 'N' in problem statement.
    const targetSum = currentLineNums[1];   // Represents 'X' in problem statement.

    // Check for the termination condition: N=0 and X=0.
    if (numElements === 0 && targetSum === 0) {
        break;
    }

    // Initialize a dynamic programming array to track which sums are reachable.
    // `reachableSums[k]` will be `true` if sum `k` can be formed, `false` otherwise.
    const reachableSums = [];
    for (let currentIdx = 0; currentIdx <= targetSum; currentIdx++) {
        reachableSums[currentIdx] = false;
    }

    // Read the `numElements` values for the current test case.
    const elementValues = [];
    for (let currentIdx = 0; currentIdx < numElements; currentIdx++) {
        elementValues.push(inputLines.shift() - 0); // Convert string to number.
    }

    // Base case for dynamic programming: sum 0 is always reachable (by choosing no elements).
    reachableSums[0] = true;

    // Populate the `reachableSums` array using dynamic programming.
    // Iterate through all possible sums from 0 up to `targetSum - 1`.
    for (let currentSum = 0; currentSum < targetSum; currentSum++) {
        // For each reachable `currentSum`, try adding each `elementValue`.
        for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
            // If adding the current element exceeds the `targetSum`, skip.
            if (currentSum + elementValues[elementIndex] > targetSum) {
                continue;
            }
            // If `currentSum` is reachable, then `currentSum + elementValues[elementIndex]` is also reachable.
            if (reachableSums[currentSum]) {
                reachableSums[currentSum + elementValues[elementIndex]] = true;
            }
        }
    }

    // Find the largest reachable sum that is also a prime number.
    let resultSum = 0; // Initialize with 0, which will indicate "NA" if no prime sum is found.
    // Iterate downwards from `targetSum` to 1.
    for (resultSum = targetSum; resultSum > 0; resultSum--) {
        // Check if the current `resultSum` is reachable AND it exists in our `primeNumbersMap`.
        if (reachableSums[resultSum] && primeNumbersMap.hasOwnProperty(resultSum)) {
            break; // Found the largest such sum, so exit the loop.
        }
    }

    // Output the result: the found prime sum, or "NA" if none was found.
    console.log((resultSum === 0) ? "NA" : resultSum);
}
