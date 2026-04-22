const MAX_PROBLEM_VALUE = 1000000;

/**
 * Constructs a Set containing all prime numbers up to a specified upper bound
 * utilizing an optimized variant of the Sieve of Eratosthenes.
 *
 * @param {number} upperLimit - The inclusive maximum integer for prime generation.
 * @returns {Set<number>} A collection of prime numbers within the given range.
 */
function buildPrimeCache(upperLimit) {
    // Implement a basic guard for invalid input, a common Type III addition.
    if (typeof upperLimit !== 'number' || !Number.isInteger(upperLimit) || upperLimit < 2) {
        console.warn("Warning: Invalid limit provided for prime cache generation. Returning empty set.");
        return new Set();
    }

    // A boolean array where `isComposite[k]` is true if k is not prime.
    // Initialize all to false (indicating potentially prime), then mark composites.
    const isComposite = new Array(upperLimit + 1).fill(false);

    // 0 and 1 are not considered prime numbers.
    isComposite[0] = true;
    isComposite[1] = true;

    // The sieve only needs to iterate up to the square root of the limit.
    const iterationCeiling = Math.trunc(Math.sqrt(upperLimit));

    // Iterate from 2 up to the square root of the limit.
    for (let currentNumber = 2; currentNumber <= iterationCeiling; ++currentNumber) {
        // If 'currentNumber' is already marked as composite, skip it.
        // This means it's a multiple of a smaller prime we've already processed.
        if (isComposite[currentNumber]) {
            continue;
        }

        // If 'currentNumber' is prime, mark all its multiples as composite.
        // Start marking from 'currentNumber * 2' (or 'currentNumber + currentNumber')
        // as smaller multiples would have already been handled by their prime factors.
        for (let multipleOfPrime = currentNumber * 2; multipleOfPrime <= upperLimit; multipleOfPrime += currentNumber) {
            isComposite[multipleOfPrime] = true;
        }
    }

    // Collect all numbers that remain unmarked (i.e., are not composite) into a Set.
    const primeNumbers = new Set();
    for (let val = 2; val <= upperLimit; ++val) {
        if (!isComposite[val]) {
            primeNumbers.add(val);
        }
    }

    return primeNumbers;
}

// Pre-compute the set of primes once for efficiency.
const primeNumberSet = buildPrimeCache(MAX_PROBLEM_VALUE);

// --- Main Program Execution ---

// Initialize input data holder.
let rawInputContents = '';
try {
    // Use `fs` module to read synchronous input.
    rawInputContents = require('fs').readFileSync('/dev/stdin', 'utf8');
} catch (readError) {
    // Type III: Add error handling for file operations.
    console.error(`Error reading input from /dev/stdin: ${readError.message}`);
    // Terminate or provide default empty input to prevent further errors.
    process.exit(1);
}

// Process raw input: trim whitespace and split into an array of lines.
const inputDataLines = rawInputContents.trim().split('\n');
let currentLinePointer = 0; // A pointer to manage reading lines, an alternative to `shift()`.

// Loop through each test case until a termination condition is met.
while (true) {
    // Type III: Guard clause for unexpected end of input.
    if (currentLinePointer >= inputDataLines.length) {
        console.warn("Warning: Reached end of input unexpectedly.");
        break;
    }

    // Parse the current line for the number of elements (N) and target sum (X).
    const currentTestCaseParams = inputDataLines[currentLinePointer++]
                                  .split(' ')
                                  .map(Number);

    // Type III: Input validation for the parameter line.
    if (currentTestCaseParams.length !== 2 || currentTestCaseParams.some(isNaN)) {
        console.error(`Error: Malformed parameter line encountered: "${inputDataLines[currentLinePointer - 1]}". Skipping to next.`);
        continue; // Skip this problematic test case.
    }

    const [numElements, targetSumValue] = currentTestCaseParams;

    // Termination condition: N=0 and X=0.
    if (numElements === 0 && targetSumValue === 0) {
        break;
    }

    // `possibleSums[k]` will be true if sum `k` can be formed by a subset of `numElements`.
    const possibleSums = new Array(MAX_PROBLEM_VALUE + 1).fill(false);
    possibleSums[0] = true; // A sum of 0 is always achievable (by selecting no elements).

    const inputElementList = []; // Stores the 'N' elements for the current test case.

    // Read the `numElements` elements for this test case.
    for (let elemIdx = 0; elemIdx < numElements; ++elemIdx) {
        // Type III: Guard clause for insufficient input lines.
        if (currentLinePointer >= inputDataLines.length) {
            console.error("Error: Insufficient input lines for elements. Terminating.");
            // Break from outer loop as well, if serious. Or just skip this test case.
            // For now, let's break the entire processing.
            currentLinePointer = inputDataLines.length; // Ensure main loop terminates.
            break;
        }

        const elementValue = Number(inputDataLines[currentLinePointer++]);

        // Type III: Validate each element value.
        if (isNaN(elementValue) || elementValue < 0 || elementValue > MAX_PROBLEM_VALUE) {
            console.warn(`Warning: Invalid element value "${inputDataLines[currentLinePointer - 1]}". Skipping this element.`);
            continue; // Skip adding this invalid element.
        }

        inputElementList.push(elementValue);
        // If the element itself is within bounds, mark it as a possible sum directly.
        // This is a slight optimization / initial state for DP.
        if (elementValue <= MAX_PROBLEM_VALUE) {
            possibleSums[elementValue] = true;
        }
    }

    // If the element reading loop was prematurely broken, skip DP for this test case.
    if (elemIdx < numElements) { // If elemIdx didn't reach numElements, it means an error occurred.
        continue;
    }

    // Dynamic Programming phase: Determine all possible sums.
    // Iterate through every sum 's' from 0 up to MAX_PROBLEM_VALUE.
    for (let currentComputedSum = 0; currentComputedSum <= MAX_PROBLEM_VALUE; ++currentComputedSum) {
        // If `currentComputedSum` is not reachable, it cannot form larger reachable sums.
        // This is an optimization for the DP process.
        if (!possibleSums[currentComputedSum]) {
            continue;
        }

        // For each reachable sum, try adding each element from the input list.
        for (const singleElement of inputElementList) { // Using `for...of` for clarity (Type III).
            const potentialNewSum = currentComputedSum + singleElement;

            // If the `potentialNewSum` exceeds the global maximum or is already marked as reachable, skip.
            // This avoids redundant work and out-of-bounds access.
            if (potentialNewSum > MAX_PROBLEM_VALUE || possibleSums[potentialNewSum]) {
                continue;
            }

            // Mark `potentialNewSum` as reachable.
            possibleSums[potentialNewSum] = true;
        }
    }

    // Search for the largest prime sum that is less than or equal to `targetSumValue`.
    let resultPrimeSum = -1; // Sentinel value to indicate no prime sum found.

    // Iterate downwards from `targetSumValue` to 1.
    for (let candidateResult = targetSumValue; candidateResult >= 1; --candidateResult) {
        // Check if `candidateResult` is a sum we can form AND it is a prime number.
        if (possibleSums[candidateResult] && primeNumberSet.has(candidateResult)) {
            resultPrimeSum = candidateResult; // Found the largest such sum.
            break; // Exit the loop early.
        }
    }

    // Output the final result for the current test case.
    // Type III: Use an explicit `if-else` for output clarity.
    if (resultPrimeSum !== -1) {
        console.log(resultPrimeSum);
    } else {
        console.log("NA");
    }
}