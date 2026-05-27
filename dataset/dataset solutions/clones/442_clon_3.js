const GLOBAL_MAX_VALUE = 1000000;

function findPrimes(upperBound) {
    // Initialize a boolean array for the sieve, marking all numbers as potentially prime
    let sieveArray = new Array(upperBound + 1).fill(true);

    // 0 and 1 are not prime numbers
    sieveArray[0] = false;
    sieveArray[1] = false;

    // Calculate the square root limit for the sieve optimization
    const sqrtLimit = Math.floor(Math.sqrt(upperBound));

    // Apply the Sieve of Eratosthenes algorithm
    for (let currentNum = 2; currentNum <= sqrtLimit; currentNum++) {
        // If currentNum is marked as prime, then its multiples are not prime
        if (sieveArray[currentNum]) {
            // Mark multiples of currentNum as not prime
            for (let multiple = currentNum * 2; multiple <= upperBound; multiple += currentNum) {
                sieveArray[multiple] = false;
            }
        }
    }

    // Create an object (hash map) to quickly check if a number is prime
    const primeMap = {};
    for (let numToCheck = 2; numToCheck <= upperBound; numToCheck++) {
        if (sieveArray[numToCheck]) {
            primeMap[numToCheck] = true;
        }
    }
    return primeMap;
}

// Pre-calculate primes up to GLOBAL_MAX_VALUE
const cachedPrimes = findPrimes(GLOBAL_MAX_VALUE);

// Read input from stdin
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = rawData.trim().split('\n');

// Process each test case
while (true) {
    // Parse the current line for N and X
    const currentLine = inputLines.shift();
    const currentLineNums = currentLine.split(' ').map(Number);
    const numElements = currentLineNums[0];
    const targetSum = currentLineNums[1];

    // Termination condition: N=0 and X=0
    if (numElements === 0 && targetSum === 0) {
        break;
    }

    // Initialize dynamic programming array to track reachable sums
    let reachableSums = new Array(GLOBAL_MAX_VALUE + 1).fill(false);
    const elementValues = [];

    // Read N elements, add them to elementValues, and mark them as individually reachable
    for (let k = 0; k < numElements; k++) {
        const currentElement = parseInt(inputLines.shift(), 10); // Explicitly parse as integer
        elementValues.push(currentElement);
        reachableSums[currentElement] = true; // Mark individual elements as reachable
    }

    // Base case: sum of 0 is always reachable (by choosing no elements)
    reachableSums[0] = true;

    // Populate the DP array: for each reachable sum, add each element to find new reachable sums
    for (let currentSum = 0; currentSum <= GLOBAL_MAX_VALUE; currentSum++) {
        // Guard clause: if currentSum is not reachable, no need to try adding elements to it
        if (!reachableSums[currentSum]) {
            continue;
        }
        for (let elemIdx = 0; elemIdx < elementValues.length; elemIdx++) {
            const elementToAdd = elementValues[elemIdx];
            const nextSum = currentSum + elementToAdd;

            // Ensure the next sum is within bounds
            if (nextSum <= GLOBAL_MAX_VALUE) {
                reachableSums[nextSum] = true;
            }
        }
    }

    // Search for the largest prime sum less than or equal to X
    let largestPrimeReachableSum = 0;
    for (let searchSum = targetSum; searchSum > 0; searchSum--) {
        // Check if the sum is reachable and if it's a prime number
        if (reachableSums[searchSum] && cachedPrimes.hasOwnProperty(searchSum)) {
            largestPrimeReachableSum = searchSum;
            break; // Found the largest, so break the loop
        }
    }

    // Output the result based on whether a prime sum was found
    console.log((largestPrimeReachableSum === 0) ? "NA" : largestPrimeReachableSum);
}
