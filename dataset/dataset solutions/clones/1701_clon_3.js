function processInputData(rawDataString) {
    // Define modular arithmetic constants
    // MOD_PRIME is a large prime number used for modular operations to prevent integer overflow.
    // BLOCK_FACTOR is used in modular multiplication for splitting large numbers, optimizing calculations.
    const MOD_PRIME = 1000000007; // A common prime modulus (1e9 + 7)
    const BLOCK_FACTOR = 100000;  // A factor for splitting numbers (1e5)

    // Parse and prepare the input data
    // Steps: Trim leading/trailing whitespace, split into lines, then split each line by spaces.
    let parsedLines = rawDataString.trim().split("\n").map(line => line.split(" "));

    // Extract problem parameters: totalElements (N), selectionCount (K)
    const totalElements = parseInt(parsedLines[0][0], 10);
    const selectionCount = parseInt(parsedLines[0][1], 10);

    // --- Input Validation ---
    // Basic checks to ensure parameters are valid and within expected range.
    if (isNaN(totalElements) || isNaN(selectionCount) || totalElements < 1 || selectionCount < 1) {
        console.error("Error: Invalid or non-positive problem dimensions (N, K) provided.");
        return; // Exit if dimensions are invalid
    }
    if (selectionCount > totalElements) {
        // Log a warning or handle as an error if K > N, as this scenario is usually invalid for selection problems.
        console.error("Warning: Selection count (K) exceeds total elements (N). Adjusting K to N.");
        // Depending on problem specifics, this might be an error or K should be capped at N.
        // For this problem, it's assumed K <= N as per typical constraints.
        throw new Error("Selection count (K) cannot be greater than total elements (N).");
    }

    // Extract and parse the array of numbers
    // Converts string elements from the second line into integers.
    let numberSequence = parsedLines[1].map(valStr => parseInt(valStr, 10));

    // Sort the number sequence by absolute value in descending order.
    // This strategy is crucial as it prioritizes numbers with larger magnitudes,
    // which are generally more influential in maximizing a product.
    numberSequence.sort((valA, valB) => Math.abs(valB) - Math.abs(valA));

    // Execute the core logic to compute the optimal product based on the sorted sequence.
    let finalCalculatedProduct = computeOptimalProduct(numberSequence, totalElements, selectionCount, MOD_PRIME, BLOCK_FACTOR);

    // Print the final result, ensuring it's a positive value within the modulo range.
    console.log(ensurePositiveMod(finalCalculatedProduct, MOD_PRIME));
}

/**
 * Computes the product of 'selectionCount' elements from 'numberArray', aiming to maximize
 * the product while ensuring it's positive if possible, using modular arithmetic.
 *
 * @param {number[]} numberArray The array of numbers, sorted by absolute value descending.
 * @param {number} totalCount Total number of elements (N).
 * @param {number} selectionCount Number of elements to select (K).
 * @param {number} modulus The prime modulus.
 * @param {number} splitFactor The block factor used in modular multiplication.
 * @returns {number} The computed optimal product modulo modulus.
 */
function computeOptimalProduct(numberArray, totalCount, selectionCount, modulus, splitFactor) {
    let currentProduct = 1; // Accumulator for the product
    let negCountInSelection = 0; // Tracks count of negative numbers within the initial K elements
    let minAbsPositiveIndex = -1; // Index of the positive number with smallest absolute value in first K
    let minAbsNegativeIndex = -1; // Index of the negative number with smallest absolute value in first K

    // --- Step 1: Initial Selection and Product Calculation ---
    // Iterate through the first 'selectionCount' elements (those with largest absolute values).
    // Calculate their product and gather statistics needed for potential adjustments.
    for (let i = 0; i < selectionCount; i++) {
        const currentElement = numberArray[i];
        currentProduct = safeModularMultiply(currentProduct, currentElement, modulus, splitFactor);

        // If at any point the product becomes zero, it will remain zero.
        if (currentProduct === 0) {
            return 0;
        }

        // Update counts and indices for smallest absolute positive/negative in the selection.
        if (currentElement < 0) {
            negCountInSelection++;
            if (minAbsNegativeIndex === -1 || Math.abs(currentElement) < Math.abs(numberArray[minAbsNegativeIndex])) {
                minAbsNegativeIndex = i;
            }
        } else if (currentElement > 0) {
            if (minAbsPositiveIndex === -1 || Math.abs(currentElement) < Math.abs(numberArray[minAbsPositiveIndex])) {
                minAbsPositiveIndex = i;
            }
        }
    }

    // --- Step 2: Handle Simple Cases Based on Negative Count Parity ---

    // If all 'totalCount' elements are selected, no further optimization is possible.
    if (selectionCount === totalCount) {
        return currentProduct;
    }

    // If the count of negative numbers in the initial 'selectionCount' is even,
    // the product is already positive (or zero, handled above), which is optimal.
    if (negCountInSelection % 2 === 0) {
        return currentProduct;
    }

    // --- Step 3: Product is Currently Negative (Odd Count of Negative Numbers) ---
    // We need to perform a swap to make the product positive and maximize its value.

    // Scenario A: There is at least one positive number within the initial 'selectionCount' elements.
    // This allows for two types of swaps to turn the product positive.
    if (minAbsPositiveIndex !== -1) {
        let candidateNegFromRemaining = { value: 0, index: -1 }; // Largest absolute negative from remaining elements
        let candidatePosFromRemaining = { value: 0, index: -1 }; // Largest absolute positive from remaining elements

        // Search for the best candidates from the elements *not* initially selected.
        for (let i = selectionCount; i < totalCount; i++) {
            const element = numberArray[i];
            if (element < 0) {
                // Find the negative number with the largest absolute value (closest to -Infinity)
                if (candidateNegFromRemaining.index === -1 || Math.abs(element) > Math.abs(candidateNegFromRemaining.value)) {
                    candidateNegFromRemaining = { value: element, index: i };
                }
            } else if (element > 0) {
                // Find the positive number with the largest absolute value (closest to +Infinity)
                if (candidatePosFromRemaining.index === -1 || element > candidatePosFromRemaining.value) {
                    candidatePosFromRemaining = { value: element, index: i };
                }
            }
        }

        // Values involved in potential swaps:
        const oldPosVal = numberArray[minAbsPositiveIndex]; // Smallest absolute positive in selection
        const oldNegVal = numberArray[minAbsNegativeIndex]; // Smallest absolute negative in selection
        const newNegVal = candidateNegFromRemaining.value;  // Largest absolute negative in remaining
        const newPosVal = candidatePosFromRemaining.value;  // Largest absolute positive in remaining

        let finalOptimizedProduct = currentProduct;
        let swapOccurred = false;

        // Determine which swap yields a larger positive product.
        // The original logic compares (new_neg * old_neg) vs (new_pos * old_pos).
        // Ensure candidates exist before attempting comparison.
        if (newNegVal !== 0 && newPosVal !== 0) { // Both swap options are available
            if (safeModularMultiply(newNegVal, oldNegVal, modulus, splitFactor) >= safeModularMultiply(newPosVal, oldPosVal, modulus, splitFactor)) {
                // Swap 1: Replace smallest absolute positive with largest absolute negative from remaining.
                finalOptimizedProduct = safeModularMultiply(finalOptimizedProduct, modularInverse(oldPosVal, modulus, splitFactor), modulus, splitFactor);
                finalOptimizedProduct = safeModularMultiply(finalOptimizedProduct, newNegVal, modulus, splitFactor);
                swapOccurred = true;
            } else {
                // Swap 2: Replace smallest absolute negative with largest absolute positive from remaining.
                finalOptimizedProduct = safeModularMultiply(finalOptimizedProduct, modularInverse(oldNegVal, modulus, splitFactor), modulus, splitFactor);
                finalOptimizedProduct = safeModularMultiply(finalOptimizedProduct, newPosVal, modulus, splitFactor);
                swapOccurred = true;
            }
        } else if (newNegVal !== 0 && oldPosVal !== 0) { // Only swap 1 is possible
            finalOptimizedProduct = safeModularMultiply(finalOptimizedProduct, modularInverse(oldPosVal, modulus, splitFactor), modulus, splitFactor);
            finalOptimizedProduct = safeModularMultiply(finalOptimizedProduct, newNegVal, modulus, splitFactor);
            swapOccurred = true;
        } else if (newPosVal !== 0 && oldNegVal !== 0) { // Only swap 2 is possible
            finalOptimizedProduct = safeModularMultiply(finalOptimizedProduct, modularInverse(oldNegVal, modulus, splitFactor), modulus, splitFactor);
            finalOptimizedProduct = safeModularMultiply(finalOptimizedProduct, newPosVal, modulus, splitFactor);
            swapOccurred = true;
        }

        if (swapOccurred) {
            return finalOptimizedProduct;
        }
    }

    // Scenario B: All 'selectionCount' numbers in the initial selection were negative.
    // (negCountInSelection === selectionCount). The product is negative.
    // We must replace one negative from the selection with a non-negative from remaining, if available.
    // If no non-negative numbers are available in the remaining array, then all N numbers are negative.
    if (negCountInSelection === selectionCount) {
        let bestPosFromRemaining = { value: 0, index: -1 }; // The largest positive number from remaining elements

        // Search for a positive number in the remaining part of the array.
        for (let i = selectionCount; i < totalCount; i++) {
            const element = numberArray[i];
            if (element >= 0) { // We are looking for any non-negative number to make the product positive.
                if (bestPosFromRemaining.index === -1 || element > bestPosFromRemaining.value) {
                    bestPosFromRemaining = { value: element, index: i };
                }
            }
        }

        if (bestPosFromRemaining.index !== -1) {
            // Replace the smallest absolute negative from the initial selection with this positive number.
            currentProduct = safeModularMultiply(currentProduct, modularInverse(numberArray[minAbsNegativeIndex], modulus, splitFactor), modulus, splitFactor);
            currentProduct = safeModularMultiply(currentProduct, bestPosFromRemaining.value, modulus, splitFactor);
            return currentProduct;
        } else {
            // If no positive numbers were found in the remaining array, it means all N numbers are negative.
            // Since 'selectionCount' is odd, the product will always be negative.
            // To maximize a negative product, its absolute value must be minimized.
            // This means selecting the 'selectionCount' numbers with the smallest absolute values.
            // These are the last 'selectionCount' elements in the `numberArray` due to the initial sort.
            let productOfSmallestAbsValues = 1;
            for (let i = totalCount - 1; i >= totalCount - selectionCount; i--) {
                productOfSmallestAbsValues = safeModularMultiply(productOfSmallestAbsValues, numberArray[i], modulus, splitFactor);
            }
            return productOfSmallestAbsValues;
        }
    }

    // This return statement should ideally not be reached if all logical paths are covered,
    // but serves as a failsafe, returning the current product in an unexpected scenario.
    return currentProduct;
}

/**
 * Performs modular multiplication (a * b) % m, optimized to prevent intermediate overflow.
 * It uses a split-block method where b is broken into (Q * splitBlock + R).
 *
 * @param {number} factorA The first operand.
 * @param {number} factorB The second operand.
 * @param {number} modulo The modulus.
 * @param {number} splitBlock The block size for splitting factorB (e.g., 1e5).
 * @returns {number} (factorA * factorB) % modulo.
 */
function safeModularMultiply(factorA, factorB, modulo, splitBlock) {
    // Ensure factors are positive within the modulo range before calculation.
    factorA = ensurePositiveMod(factorA, modulo);
    factorB = ensurePositiveMod(factorB, modulo);

    // If either factor is zero, the product is zero.
    if (factorA === 0 || factorB === 0) {
        return 0;
    }

    // Split factorB to prevent overflow during intermediate multiplication:
    // factorB = (quotientB * splitBlock) + remainderB
    const quotientB = Math.floor(factorB / splitBlock);
    const remainderB = factorB % splitBlock;

    // Apply modular arithmetic property: (A * B) % M = ((A * Q * S) % M + (A * R) % M) % M
    // Note: The recursive call `safeModularMultiply(factorA, quotientB, modulo, splitBlock)`
    // is to handle cases where `factorA * quotientB` itself might overflow before `* splitBlock`.
    // This makes the multiplication very robust.
    let result = (safeModularMultiply(factorA, quotientB, modulo, splitBlock) * splitBlock) % modulo;
    result = (result + (factorA * remainderB) % modulo) % modulo;

    return result;
}

/**
 * Calculates the modular multiplicative inverse of 'num' modulo a prime 'mod'.
 * This is used for performing modular division (a / b = a * b^-1 mod m).
 * It relies on Fermat's Little Theorem, which requires 'mod' to be a prime number.
 *
 * @param {number} num The number for which to find the inverse.
 * @param {number} mod The prime modulus.
 * @param {number} splitBlock The block factor for safe modular multiplication within the power function.
 * @returns {number} The modular inverse of 'num' modulo 'mod'.
 * @throws {Error} If 'num' is 0, as modular inverse for 0 is undefined.
 */
function modularInverse(num, mod, splitBlock) {
    if (num === 0) {
        throw new Error("Modular inverse of 0 is undefined.");
    }
    // According to Fermat's Little Theorem, if 'mod' is a prime number,
    // then a^(mod-2) % mod is the modular inverse of a % mod.
    return power(num, mod - 2, mod, splitBlock);
}

/**
 * Computes (base^exponent) % modulus efficiently using modular exponentiation (binary exponentiation).
 *
 * @param {number} base The base number.
 * @param {number} exponent The exponent.
 * @param {number} modulus The modulus.
 * @param {number} splitBlock The block factor for safe modular multiplication.
 * @returns {number} (base^exponent) % modulus.
 */
function power(base, exponent, modulus, splitBlock) {
    let result = 1; // Initialize result as 1 (base^0)
    base = ensurePositiveMod(base, modulus); // Ensure base is within [0, modulus-1]

    while (exponent > 0) {
        // If exponent is odd, multiply result by current base
        if (exponent % 2 === 1) {
            result = safeModularMultiply(result, base, modulus, splitBlock);
        }
        // Square the base for the next iteration
        base = safeModularMultiply(base, base, modulus, splitBlock);
        // Halve the exponent
        exponent = Math.floor(exponent / 2);
    }
    return result;
}

/**
 * Ensures that a number resulting from a modulo operation is always positive.
 * JavaScript's '%' operator can return negative results for negative inputs.
 *
 * @param {number} value The number to normalize.
 * @param {number} modulus The modulus.
 * @returns {number} A positive result of (value % modulus).
 */
function ensurePositiveMod(value, modulus) {
    // The standard and robust way to achieve a positive modulo result:
    // ((value % modulus) + modulus) % modulus
    return ((value % modulus) + modulus) % modulus;
}

// --- Main Execution Block ---
// This block simulates reading input from standard input, common in competitive programming.
// For different environments (e.g., browser, Node.js script with file argument),
// this line would need to be adapted to the specific input mechanism.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));