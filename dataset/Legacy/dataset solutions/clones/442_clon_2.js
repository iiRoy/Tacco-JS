function findPrimesUpTo(upperBound) {
    // This array will be used for the Sieve of Eratosthenes algorithm.
    let sieveArray = [];

    // Initialize the array with numbers from 0 up to the specified upper bound.
    for (let idx = 0; idx <= upperBound; idx++) {
        sieveArray[idx] = idx;
    }

    // Mark 0 and 1 as not prime numbers.
    sieveArray[0] = false;
    sieveArray[1] = false;

    // Calculate the integer part of the square root of the upper bound for optimization.
    const limitSqrt = Math.floor(Math.sqrt(upperBound));

    // Iterate from 2 up to the square root of the upper bound.
    for (let idx = 2; idx <= limitSqrt; idx++) {
        // If the current number is already marked as not prime, skip to the next number.
        if (sieveArray[idx] === false) {
            continue;
        }
        // Mark all multiples of the current prime number as not prime.
        // Start from idx * idx, but the original starts from idx + idx, which is also correct for marking multiples.
        for (let multiplier = idx + idx; multiplier <= upperBound; multiplier += idx) {
            sieveArray[multiplier] = false;
        }
    }

    // Create an object (hash map) to store prime numbers for efficient lookup.
    const primeMap = {};

    // Populate the prime map with numbers that are still marked as prime in the sieve array.
    for (let idx = 0; idx <= upperBound; idx++) {
        if (sieveArray[idx] !== false) {
            primeMap[sieveArray[idx]] = true;
        }
    }
    return primeMap;
}

// Pre-calculate prime numbers up to 1,000,000 and store them in a cache.
const primeNumbersCache = findPrimesUpTo(1000000);

// Read all input data from standard input as a UTF-8 string.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim whitespace from the input and split it into an array of lines.
let lineSegments = (rawData.trim()).split("\n");

// Process each test case from the input until a termination condition is met.
while (true) {
    // Get the current line, split it by space, and convert the parts to numbers.
    const currentLineParts = lineSegments.shift().split(" ").map(Number);
    // Extract the count of numbers for the current test case.
    const countOfNumbers = currentLineParts[0];
    // Extract the target sum value for the current test case.
    const targetValue = currentLineParts[1];

    // If both countOfNumbers and targetValue are zero, it's the termination signal.
    if (countOfNumbers === 0 && targetValue === 0) {
        break;
    }

    // Initialize a dynamic programming array to track all reachable sums.
    let reachableSums = [];
    // Mark all sums as unreachable initially.
    for (let idx = 0; idx <= 1000000; idx++) {
        reachableSums[idx] = false;
    }

    // Store the numbers provided for the current test case.
    let inputNumbers = [];
    // Read the 'n' numbers and mark them as directly reachable sums.
    for (let idx = 0; idx < countOfNumbers; idx++) {
        // Convert the string representation of the number to an actual number.
        const currentNum = lineSegments.shift() - 0;
        inputNumbers.push(currentNum);
        reachableSums[currentNum] = true;
    }

    // The sum of zero is always reachable (by choosing no numbers).
    reachableSums[0] = true;

    // Iterate through all possible sums from 0 up to the maximum allowed sum.
    for (let currentSum = 0; currentSum <= 1000000; currentSum++) {
        // For each current sum, try adding each of the input numbers.
        for (let numIdx = 0; numIdx < inputNumbers.length; numIdx++) {
            // If adding the number exceeds the maximum sum, skip this combination.
            if (currentSum + inputNumbers[numIdx] > 1000000) {
                continue;
            }
            // If the current sum is reachable, then currentSum + inputNumbers[numIdx] is also reachable.
            if (reachableSums[currentSum]) {
                reachableSums[currentSum + inputNumbers[numIdx]] = true;
            }
        }
    }

    // Search for the largest prime sum that is less than or equal to 'targetValue' and is reachable.
    let foundPrimeSum = 0; // Initialize to 0, indicating no prime sum found yet.
    for (let searchSum = targetValue; searchSum > 0; searchSum--) {
        // If the current sum is reachable AND it is a prime number, we have found our answer.
        if (reachableSums[searchSum] && primeNumbersCache.hasOwnProperty(searchSum)) {
            foundPrimeSum = searchSum; // Store the found sum.
            break; // Exit the loop as we found the largest such sum.
        }
    }
    // Output the result: "NA" if no such prime sum is found, otherwise output the sum.
    console.log((foundPrimeSum === 0) ? "NA" : foundPrimeSum);
}
