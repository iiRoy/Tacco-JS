function findPrimes(upperBound) {
    // Initialize an array to represent numbers up to upperBound.
    // We'll use this for the Sieve of Eratosthenes.
    let sieveArray = [];
    for (let idx = 0; idx <= upperBound; idx++) {
        sieveArray[idx] = idx;
    }

    // 0 and 1 are not prime numbers.
    sieveArray[0] = false;
    sieveArray[1] = false;

    // Calculate the square root of the upper bound for optimization.
    const limit = Math.floor(Math.sqrt(upperBound));

    // Apply the Sieve of Eratosthenes algorithm.
    for (let idx = 2; idx <= limit; idx++) {
        // If the current number is marked as false, it's not prime, so skip it.
        if (sieveArray[idx] === false) {
            continue;
        }
        // Mark all multiples of the current prime number as not prime.
        for (let multipleIdx = idx + idx; multipleIdx <= upperBound; multipleIdx += idx) {
            sieveArray[multipleIdx] = false;
        }
    }

    // Create an object (hash map) to store prime numbers for quick lookup.
    const primeMap = {};
    for (let idx = 0; idx <= upperBound; idx++) {
        // If a number is not marked as false, it's prime.
        if (sieveArray[idx] !== false) {
            primeMap[sieveArray[idx]] = true;
        }
    }
    return primeMap;
}

// Pre-calculate prime numbers up to 1,000,000.
const primeNumbers = findPrimes(1000000);

// Read all input from stdin.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into an array of lines and trim whitespace.
const lineData = (rawData.trim()).split("\n");

// Process input lines until a "0 0" sentinel is encountered.
while (true) {
    // Get the current line, split by space, and convert to numbers.
    const currentLineNums = lineData.shift().split(" ").map(Number);
    const countItems = currentLineNums[0]; // Number of items in the current set.
    const targetSum = currentLineNums[1]; // The target sum to reach.

    // Check for the termination condition.
    if (countItems === 0 && targetSum === 0) {
        break;
    }

    // Initialize a dynamic programming array to track reachable sums.
    // `reachableSums[k]` will be true if sum `k` can be formed.
    const reachableSums = [];
    for (let idx = 0; idx <= 1000000; idx++) {
        reachableSums[idx] = false;
    }

    // Read the item values for the current test case.
    const itemValues = [];
    for (let idx = 0; idx < countItems; idx++) {
        const currentValue = lineData.shift() - 0; // Convert string to number.
        itemValues.push(currentValue);
        reachableSums[currentValue] = true; // A single item can form its own sum.
    }

    // A sum of 0 is always reachable (by choosing no items).
    reachableSums[0] = true;

    // Populate the `reachableSums` array using dynamic programming.
    // For each possible sum `idx` up to `targetSum`:
    // If `idx` is reachable, then `idx + itemValues[j]` is also reachable.
    for (let idx = 0; idx <= targetSum; idx++) {
        for (let j = 0; j < itemValues.length; j++) {
            // Ensure we don't go out of bounds for `reachableSums`.
            if (reachableSums[idx] && (idx + itemValues[j] <= targetSum)) {
                reachableSums[idx + itemValues[j]] = true;
            }
        }
    }

    // Find the largest reachable sum `idx` (starting from `targetSum` down to 1)
    // that is also a prime number.
    let resultSum = 0;
    for (let idx = targetSum; idx > 0; idx--) {
        // If `idx` is reachable and `idx` is a prime number.
        if (reachableSums[idx] && primeNumbers.hasOwnProperty(idx)) {
            resultSum = idx;
            break; // Found the largest prime sum.
        }
    }

    // Output the result. If no such prime sum was found, output "NA".
    console.log((resultSum === 0) ? "NA" : resultSum);
}
