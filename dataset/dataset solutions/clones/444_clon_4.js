function generatePrimeSet(limitValue) {
    // Using Uint8Array for memory efficiency to mark composite numbers.
    // 0 indicates prime, 1 indicates composite.
    const compositeTracker = new Uint8Array(limitValue + 1);
    
    // 0 and 1 are not prime.
    compositeTracker[0] = 1;
    compositeTracker[1] = 1;

    // Sieve of Eratosthenes optimization: iterate up to sqrt(limitValue)
    const upperFactorBound = Math.floor(Math.sqrt(limitValue));
    for (let currentFactor = 2; currentFactor <= upperFactorBound; currentFactor++) {
        // If currentFactor is not marked as composite, it's a prime.
        if (compositeTracker[currentFactor] === 0) {
            // Mark all multiples of this prime as composite, starting from its square.
            // Multiples less than currentFactor * currentFactor would have already been marked
            // by smaller prime factors.
            for (let multiple = currentFactor * currentFactor; multiple <= limitValue; multiple += currentFactor) {
                compositeTracker[multiple] = 1;
            }
        }
    }

    // Collect all numbers not marked as composite into a Set.
    const primeNumbers = new Set();
    for (let numberCandidate = 2; numberCandidate <= limitValue; numberCandidate++) {
        if (compositeTracker[numberCandidate] === 0) {
            primeNumbers.add(numberCandidate);
        }
    }
    return primeNumbers;
}

const PRIME_LIMIT = 1000000;
const primeNumbersCache = generatePrimeSet(PRIME_LIMIT);

const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLinesQueue = rawInputData.trim().split("\n");

while (true) {
    const currentLineParts = inputLinesQueue.shift().split(" ").map(Number);
    const elementCount = currentLineParts[0];
    const targetValue = currentLineParts[1];

    if (elementCount === 0 && targetValue === 0) {
        break;
    }

    const inputElements = [];
    for (let idx = 0; idx < elementCount; idx++) {
        inputElements.push(Number(inputLinesQueue.shift()));
    }

    // Dynamic programming approach using a Set to store reachable sums.
    // This is an alternative to a boolean array, representing the set of all
    // possible sums that can be formed using a subset of inputElements.
    let reachableSums = new Set([0]); // 0 is always reachable (by choosing no elements)

    for (const currentElement of inputElements) {
        // To correctly implement subset sum with a Set, we iterate over the sums
        // that were reachable *before* considering the currentElement.
        // We create a temporary array of these sums to avoid issues with
        // modifying the Set while iterating over it.
        const sumsToExpand = Array.from(reachableSums); 
        
        for (const existingSum of sumsToExpand) {
            const potentialNewSum = existingSum + currentElement;
            // Only add if the new sum does not exceed the targetValue.
            if (potentialNewSum <= targetValue) {
                reachableSums.add(potentialNewSum);
            }
        }
    }

    let largestPrimeSum = 0; // Default to 0, which will result in "NA" if no prime sum is found.

    // Iterate downwards from targetValue to find the largest prime sum.
    for (let checkSum = targetValue; checkSum > 0; checkSum--) {
        // Check if the current sum is reachable AND is a prime number.
        if (reachableSums.has(checkSum) && primeNumbersCache.has(checkSum)) {
            largestPrimeSum = checkSum;
            break; // Found the largest, so we can stop.
        }
    }

    console.log((largestPrimeSum === 0) ? "NA" : largestPrimeSum);
}
