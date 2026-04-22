// Function to identify prime numbers up to a specified upper bound using a sieve method.
// Returns an object where keys are prime numbers and values are 'true'.
function generatePrimeIndicators(upperBound) {
    // Validate input: ensure the upper bound is a non-negative integer.
    if (typeof upperBound !== 'number' || !Number.isInteger(upperBound) || upperBound < 0) {
        console.error("Invalid input for generatePrimeIndicators: upperBound must be a non-negative integer.");
        return {}; // Return an empty object for invalid input
    }
    if (upperBound < 2) {
        return {}; // No primes below 2
    }

    // Initialize a boolean array; true means potentially prime, false means composite.
    // The array index corresponds to the number.
    const isPrimeFlags = new Array(upperBound + 1).fill(true);

    // Mark 0 and 1 as not prime.
    isPrimeFlags[0] = false;
    isPrimeFlags[1] = false;

    // Calculate the square root of the upper bound for the sieve limit.
    // Numbers only need to be checked up to their square root.
    const sieveLimit = Math.floor(Math.sqrt(upperBound));

    // Sieve of Eratosthenes algorithm.
    // Iterate from 2 up to the square root of the upper bound.
    for (let currentNumber = 2; currentNumber <= sieveLimit; currentNumber++) {
        // If currentNumber is marked as prime, then its multiples are composite.
        if (isPrimeFlags[currentNumber]) {
            // Mark all multiples of currentNumber as not prime, starting from currentNumber * currentNumber
            // (multiples less than currentNumber * currentNumber would have already been marked by smaller primes).
            for (let multiple = currentNumber * currentNumber; multiple <= upperBound; multiple += currentNumber) {
                isPrimeFlags[multiple] = false;
            }
        }
    }

    // Collect all prime numbers into a lookup object for quick access.
    const primeLookupMap = {};
    for (let num = 2; num <= upperBound; num++) {
        if (isPrimeFlags[num]) {
            primeLookupMap[num] = true;
        }
    }

    return primeLookupMap;
}

// Pre-calculate primes up to a significant limit for efficiency.
const MAX_PRIME_LIMIT = 1000000;
const cachedPrimesCollection = generatePrimeIndicators(MAX_PRIME_LIMIT);

// Read input data from standard input.
const rawDataInput = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process input: trim whitespace and split into individual lines.
const processedLines = rawDataInput.trim().split('\n');

let lineIndex = 0; // To manage reading lines from processedLines

// Main processing loop. Continues until a termination condition is met.
while (true) {
    // Check if there are enough lines left to process the next N X pair.
    if (lineIndex >= processedLines.length) {
        break; // No more input lines
    }

    // Parse the current line for numElements (N) and targetSumLimit (X).
    const currentLineParts = processedLines[lineIndex++].split(' ');
    const numElements = parseInt(currentLineParts[0], 10);
    const targetSumLimit = parseInt(currentLineParts[1], 10);

    // Termination condition: N=0 and X=0.
    if (numElements === 0 && targetSumLimit === 0) {
        break;
    }

    // Initialize a dynamic programming array to track reachable sums.
    // `possibleSums[s]` is true if sum `s` can be formed, false otherwise.
    const possibleSums = new Array(targetSumLimit + 1).fill(false);
    possibleSums[0] = true; // A sum of 0 is always possible (by choosing no elements).

    // Read the 'numElements' subsequent numbers that can be used to form sums.
    const availableValues = [];
    for (let i = 0; i < numElements; i++) {
        if (lineIndex >= processedLines.length) {
            // Handle unexpected end of input if N lines are not available
            console.error("Error: Not enough input lines for specified N. Skipping current N X pair.");
            // Reset lineIndex to avoid infinite loop if this was the last line and N was too large
            // or just break if input is completely exhausted.
            // For now, let's break this inner loop and let the outer loop handle the next N X pair.
            break;
        }
        availableValues.push(parseInt(processedLines[lineIndex++], 10));
    }
    // If we didn't read all 'numElements' due to early break from input exhaustion,
    // or if `numElements` was invalid (e.g., negative or non-integer),
    // skip this iteration and try the next N X pair.
    if (availableValues.length !== numElements) {
        continue;
    }

    // Dynamic programming approach to find all possible sums.
    // Iterate through all possible sums from 0 up to targetSumLimit.
    for (let currentSum = 0; currentSum <= targetSumLimit; currentSum++) {
        // If currentSum is not reachable, skip it as it cannot form any new sums.
        if (!possibleSums[currentSum]) {
            continue;
        }

        // For each reachable currentSum, try adding each available value.
        for (const valueToAdd of availableValues) {
            // Ensure valueToAdd is a positive number. If not, it won't contribute meaningfully
            // to growing the sum in a typical subset sum context, or could lead to errors.
            if (isNaN(valueToAdd) || valueToAdd <= 0) {
                continue; // Skip invalid or non-positive values
            }

            const nextSum = currentSum + valueToAdd;

            // If the nextSum exceeds the targetSumLimit, it's not relevant.
            if (nextSum > targetSumLimit) {
                continue;
            }

            // Mark the nextSum as reachable.
            possibleSums[nextSum] = true;
        }
    }

    // Search for the largest reachable sum that is also a prime number.
    let largestPrimeSum = 0; // Initialized to 0, which corresponds to the "NA" case.

    // Iterate backwards from the targetSumLimit down to 1.
    for (let potentialSum = targetSumLimit; potentialSum > 0; potentialSum--) {
        // Check if the current potentialSum is reachable AND is a prime number.
        // We use hasOwnProperty for robustness against prototype chain pollution,
        // although for a simple object created this way, direct access would also work.
        if (possibleSums[potentialSum] && cachedPrimesCollection.hasOwnProperty(potentialSum)) {
            largestPrimeSum = potentialSum; // Found the largest prime sum.
            break; // Exit the loop as we found the largest.
        }
    }

    // Output the result. If no prime sum was found (largestPrimeSum remains 0), output "NA".
    if (largestPrimeSum === 0) {
        console.log("NA");
    } else {
        console.log(largestPrimeSum);
    }
}