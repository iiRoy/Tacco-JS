let collectedInputLines = []; // Buffer to store all incoming lines from standard input

// Using a more descriptive name for the readline module
const inputOutputInterfaceModule = require('readline');

// Create an instance for handling line-by-line input and output
const lineReaderHandler = inputOutputInterfaceModule.createInterface({
    input: process.stdin,  // Directing to standard input stream
    output: process.stdout // Directing to standard output stream
});

/**
 * Determines if a given positive integer is a prime number.
 * This function incorporates common optimizations for primality testing.
 *
 * @param {number} candidateNum The integer to be checked for primality.
 * @returns {boolean} True if `candidateNum` is prime, false otherwise.
 */
function checkPrimality(candidateNum) {
    if (candidateNum <= 1) return false; // Numbers less than or equal to 1 are not prime.
    if (candidateNum <= 3) return true;  // 2 and 3 are prime numbers.

    // If the number is divisible by 2 or 3, it's not prime (unless it's 2 or 3 itself, already handled).
    if (candidateNum % 2 === 0 || candidateNum % 3 === 0) return false;

    // Optimized loop for checking factors: all primes greater than 3 can be expressed
    // in the form 6k ± 1. We only need to check divisors up to the square root.
    for (let currentFactor = 5; currentFactor * currentFactor <= candidateNum; currentFactor += 6) {
        if (candidateNum % currentFactor === 0 || candidateNum % (currentFactor + 2) === 0) {
            return false; // Found a factor, so the number is not prime.
        }
    }
    return true; // No factors found, the number is prime.
}

/**
 * Evaluates whether a given integer qualifies as a "special number" based on specific rules.
 * A number `value` is special if:
 * 1. It is 1, 2, or 3.
 * 2. It is greater than or equal to 4, AND is a prime number itself,
 *    AND the result of `(value + 1) / 2` is also a prime number.
 *
 * @param {number} value The integer to assess for the "special" property.
 * @returns {boolean} True if `value` is a special number, false otherwise.
 */
function isSpecialNumber(value) {
    // Rule 1: Numbers 1, 2, and 3 are always considered special.
    if (value >= 1 && value <= 3) {
        return true;
    }
    // Numbers outside the positive integer range are not special in this context.
    if (value < 1) {
        return false;
    }

    // Rule 2: For values 4 or greater, they must meet primality conditions.
    // First, `value` itself must be a prime number.
    if (!checkPrimality(value)) {
        return false;
    }

    // Calculate the intermediate value: `(value + 1) / 2`.
    const derivedValue = (value + 1) / 2;

    // Both conditions must be met: `derivedValue` must be an integer AND it must be prime.
    // `Number.isInteger` ensures that `value` was odd (as `value` is prime and > 3, it must be odd).
    if (Number.isInteger(derivedValue) && checkPrimality(derivedValue)) {
        return true;
    }

    return false; // If any condition is not met, the number is not special.
}

// Event handler for each line of input received.
lineReaderHandler.on('line', (currentInputLine) => {
    collectedInputLines.push(currentInputLine); // Store the line in our buffer.
});

// Event handler for when the input stream closes, signaling all data has been received.
lineReaderHandler.on('close', () => {
    // The first line contains the total number of queries. Parse and remove it from the buffer.
    const totalQueryCases = parseInt(collectedInputLines.shift(), 10);

    // Process the remaining lines to extract the [L, R] range pairs for each query.
    // Using `split(/\s+/)` to handle multiple spaces between numbers robustly.
    const queryRangeDefinitions = collectedInputLines.map(queryDefinitionLine => {
        return queryDefinitionLine.split(/\s+/).map(numericString => parseInt(numericString, 10));
    });

    // Determine the maximum 'R' value across all queries. This helps in sizing
    // the prefix sum array efficiently to avoid unnecessary calculations or memory.
    let greatestRangeUpperLimit = 0;
    for (const rangePair of queryRangeDefinitions) {
        // Basic validation for array structure and numeric content.
        if (rangePair.length >= 2 && !isNaN(rangePair[1]) && rangePair[1] > greatestRangeUpperLimit) {
            greatestRangeUpperLimit = rangePair[1];
        }
    }

    // Initialize an array to store prefix counts of special numbers.
    // `specialNumberPrefixCounts[k]` will hold the cumulative count of special numbers
    // from 1 up to `k`.
    const specialNumberPrefixCounts = new Array(greatestRangeUpperLimit + 1).fill(0);

    // Populate the `specialNumberPrefixCounts` array.
    // This loop efficiently builds the prefix sum by reusing previous counts
    // and incrementing only if the current number is special.
    for (let currentNumber = 1; currentNumber <= greatestRangeUpperLimit; currentNumber++) {
        // Inherit the count from the previous number.
        specialNumberPrefixCounts[currentNumber] = specialNumberPrefixCounts[currentNumber - 1];
        // If the current number is special, increment its count.
        if (isSpecialNumber(currentNumber)) {
            specialNumberPrefixCounts[currentNumber]++;
        }
    }

    // Iterate through each defined query and provide the required output.
    for (let queryIndex = 0; queryIndex < totalQueryCases; queryIndex++) {
        const currentQueryBounds = queryRangeDefinitions[queryIndex];
        const queryLowerBound = currentQueryBounds[0];
        const queryUpperBound = currentQueryBounds[1];

        // Specific handling for queries where the lower and upper bounds are identical.
        // As per original code's logic, such a query always yields '1'.
        if (queryLowerBound === queryUpperBound) {
            console.log(1);
        } else {
            // For queries where lower bound is less than upper bound, calculate the count
            // of special numbers within the range [queryLowerBound, queryUpperBound - 1].
            // This directly uses the precomputed prefix sums.
            const calculatedCount = specialNumberPrefixCounts[queryUpperBound - 1] - specialNumberPrefixCounts[queryLowerBound - 1];
            console.log(calculatedCount);
        }
    }
});