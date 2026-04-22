const ioHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const inputDataBuffer = [];

ioHandler.on('line', (currentLineData) => {
    inputDataBuffer.push(currentLineData);
});

/**
 * Decomposes a given positive integer into its prime factors using an optimized trial division method.
 * The optimization ensures that the search for the next prime factor starts from the last found factor,
 * preventing redundant checks of smaller divisors.
 *
 * @param {number} valueToFactor - The positive integer for which to find prime factors.
 * @returns {number[]} An array containing the prime factors of `valueToFactor`. Returns `[1]` for input `1`,
 *                     and an empty array for non-positive or invalid inputs.
 */
function determinePrimeFactors(valueToFactor) {
    const factorCollection = [];

    // Guard clause for non-positive integers, as prime factorization is typically defined for positive integers.
    if (valueToFactor <= 0) {
        return [];
    }
    // Special handling for the number 1, which conventionally has itself as its only "factor" in this context.
    if (valueToFactor === 1) {
        return [1];
    }

    // `initialDivisorSearch` tracks the smallest potential prime factor to test.
    // It's optimized to start from the last successfully found factor.
    let initialDivisorSearch = 2;
    // `mutableTarget` is a temporary variable that gets divided down as factors are found.
    let mutableTarget = valueToFactor;

    // The main loop continues until `mutableTarget` is fully factored down to 1.
    while (mutableTarget > 1) {
        let currentDivisorCandidate = initialDivisorSearch;

        // Inner loop: Finds the smallest prime factor of `mutableTarget` starting from `initialDivisorSearch`.
        // This loop is guaranteed to find a divisor because `mutableTarget` is always greater than 1.
        while (true) {
            if (mutableTarget % currentDivisorCandidate === 0) {
                factorCollection.push(currentDivisorCandidate); // Add the found factor to our collection.
                mutableTarget /= currentDivisorCandidate;        // Reduce `mutableTarget` by the factor.
                break;                                           // Exit inner loop as a factor has been found.
            }
            currentDivisorCandidate++; // Increment to test the next potential divisor.
        }
        // Update `initialDivisorSearch` for the next iteration. This is the core optimization:
        // we don't need to re-check smaller divisors that have already been processed.
        initialDivisorSearch = currentDivisorCandidate;
    }

    return factorCollection;
}

// This block contains the main application logic, which executes after all input lines are received.
ioHandler.on('close', () => {
    // Define a constant for the upper boundary of the product.
    const UPPER_PRODUCT_BOUNDARY = 1_000_000_000; // Using numeric separators for enhanced readability.

    // --- Input Validation and Processing ---
    // Ensure that at least one line of input was provided.
    if (inputDataBuffer.length === 0) {
        console.error("Error: No input data detected. Please provide a positive integer.");
        return; // Terminate execution if no input.
    }

    const firstInputLine = inputDataBuffer[0];
    const parsedInputAsNumber = Number(firstInputLine);

    // Perform comprehensive validation on the parsed input to ensure it's a valid positive integer.
    if (isNaN(parsedInputAsNumber) || !Number.isInteger(parsedInputAsNumber) || parsedInputAsNumber <= 0) {
        console.error(`Error: Invalid input "${firstInputLine}". Expected a positive integer.`);
        return; // Terminate if input is not valid.
    }

    // --- Core Calculation Logic ---
    // Obtain the list of prime factors for the validated input number.
    const primeFactorsArray = determinePrimeFactors(parsedInputAsNumber);

    // Handle the special case where the input number itself is 1.
    if (parsedInputAsNumber === 1) {
        console.log(`0 0 1 0 0 1`); // Output format for 1 is fixed.
        return;
    }

    // `factorA` will accumulate the product of prime factors, aiming to be the largest possible
    // value less than `UPPER_PRODUCT_BOUNDARY`.
    let factorA = 1;
    // `currentFactorIndex` tracks our position when traversing the `primeFactorsArray`.
    let currentFactorIndex = 0;

    // This loop constructs `factorA` by multiplying prime factors from largest to smallest.
    // The goal is to find the largest `factorA` such that `factorA < UPPER_PRODUCT_BOUNDARY`
    // and `factorA` is a divisor of `parsedInputAsNumber`.
    // This re-written loop directly builds `factorA` without exceeding the limit and then correcting,
    // achieving the same functional outcome as the original code's `w = w / n[...]` step.
    while (currentFactorIndex < primeFactorsArray.length) {
        // Retrieve factors starting from the end of the array (which contains the largest prime factors).
        const nextFactorFromEnd = primeFactorsArray[primeFactorsArray.length - 1 - currentFactorIndex];

        // Calculate what `factorA` would be if `nextFactorFromEnd` were included.
        const projectedProduct = factorA * nextFactorFromEnd;

        // If the `projectedProduct` remains below the defined boundary, include it.
        if (projectedProduct < UPPER_PRODUCT_BOUNDARY) {
            factorA = projectedProduct;          // Update `factorA` with the new product.
            currentFactorIndex++;                // Move to the next smaller prime factor.
        } else {
            // If including the current `nextFactorFromEnd` would cause `factorA` to exceed
            // the `UPPER_PRODUCT_BOUNDARY`, we stop. `factorA` now holds the largest valid product.
            break;
        }
    }

    // Calculate the complementary factor, `factorB`, such that `factorA * factorB = parsedInputAsNumber`.
    const factorB = parsedInputAsNumber / factorA;

    // Construct the final output message in the specified format: "0 0 factorA 0 0 factorB".
    const finalOutputMessage = `0 0 ${factorA} 0 0 ${factorB}`;

    // Display the computed result to standard output.
    console.log(finalOutputMessage);
});