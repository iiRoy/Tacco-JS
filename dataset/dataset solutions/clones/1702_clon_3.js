// This module provides utilities for processing numerical array problems.
// It includes functions for modular arithmetic and selection of elements
// to maximize a product under specific constraints.

// --- Global Configuration and Constants ---
const DATA_SOURCE_PATH = "/dev/stdin"; // Specifies the file path for input data.
const DATA_ENCODING = "utf8"; // Defines the character encoding for reading input.

// A large prime number used for modular arithmetic. This helps in preventing
// integer overflows when dealing with potentially very large products and
// ensures the final result remains within a manageable range.
const PRIMARY_MODULO_VALUE = 1_000_000_007; // Original C: 1e+9 + 7

// A base value employed in modular multiplication to strategically split
// numbers into smaller components. This technique is designed to prevent
// intermediate multiplication results from exceeding JavaScript's safe integer
// limits before the main modulo operation is applied.
const MULTIPLICATION_SPLIT_BASE = 100_000; // Original C2: 1e+5

// --- Helper Functions for Modular Arithmetic ---

/**
 * Ensures a numerical result from a modulo operation is always non-negative.
 * Standard JavaScript's '%' operator can yield negative values if the dividend
 * is negative. This utility adjusts such results to be within the [0, divisor - 1] range.
 *
 * @param {number} inputVal The number to apply the modulo operation to.
 * @param {number} modDivisor The positive divisor for the modulo operation.
 * @returns {number} The non-negative result of `inputVal % modDivisor`.
 */
function normalizeModuloResult(inputVal, modDivisor) {
    let outcome = inputVal % modDivisor;
    if (outcome < 0) {
        // If the result is negative, add the divisor to make it positive.
        outcome += modDivisor;
    }
    return outcome;
}

/**
 * Executes modular multiplication between two numbers, `factorA` and `factorB`,
 * with respect to a given `currentModulus`. It incorporates a `splitBase`
 * strategy to mitigate potential intermediate overflows when `factorB` is large.
 * The calculation leverages `BigInt` for intermediate products to maintain precision
 * with numbers exceeding `Number.MAX_SAFE_INTEGER`, before converting back to `number`
 * for the final modular result.
 *
 * @param {number} factorA The first multiplicand.
 * @param {number} factorB The second multiplicand.
 * @param {number} currentModulus The modulus to apply (e.g., `PRIMARY_MODULO_VALUE`).
 * @param {number} splitBase The base used for splitting `factorB` (e.g., `MULTIPLICATION_SPLIT_BASE`).
 * @returns {number} The calculated modular product: `(factorA * factorB) % currentModulus`.
 */
function calculateModularProduct(factorA, factorB, currentModulus, splitBase) {
    // Early exit for zero factors to optimize performance.
    if (factorB === 0 || factorA === 0) return 0;

    // Convert all relevant numbers to BigInt to safely handle large intermediate products.
    const bigFactorA = BigInt(factorA);
    const bigFactorB = BigInt(factorB);
    const bigCurrentModulus = BigInt(currentModulus);
    const bigSplitBase = BigInt(splitBase);

    // Decompose bigFactorB into a quotient and a remainder relative to the splitBase.
    const quotientPart = bigFactorB / bigSplitBase; // Integer division for the quotient.
    const remainderPart = bigFactorB % bigSplitBase; // Modulo for the remainder.

    // Calculate `(factorA * quotientPart * splitBase + factorA * remainderPart) % currentModulus`.
    // Each term is modularized individually to prevent overflow at each step.
    let termOne = (bigFactorA * quotientPart) % bigCurrentModulus;
    termOne = (termOne * bigSplitBase) % bigCurrentModulus;

    const termTwo = (bigFactorA * remainderPart) % bigCurrentModulus;

    // Sum the terms and apply the final modulus.
    const finalProduct = (termOne + termTwo) % bigCurrentModulus;

    // Convert the BigInt result back to a standard JavaScript number.
    // This conversion is safe as the final result is within the modulus range.
    return Number(finalProduct);
}

// --- Core Problem-Solving Logic ---

/**
 * Computes the maximum possible product of a subset of `subsetSize` elements
 * chosen from `sourceElements`, with the result calculated modulo `moduloValue`.
 * The algorithm prioritizes selecting elements with the largest absolute values.
 * If the initial product of the chosen subset is negative (due to an odd count
 * of negative numbers), it then explores swapping elements to achieve a positive
 * or a "less negative" (closer to zero) product.
 *
 * @param {number[]} sourceElements The array of numbers available for selection.
 * @param {number} totalElements The total number of elements in `sourceElements` (N).
 * @param {number} subsetSize The desired number of elements in the product subset (K).
 * @param {number} moduloValue The modulus to apply for all product calculations.
 * @param {number} splitFactor The base used for splitting numbers in modular multiplication.
 * @returns {number} The maximum product, normalized modulo `moduloValue`.
 */
function calculateOptimalProduct(sourceElements, totalElements, subsetSize, moduloValue, splitFactor) {
    // Handle edge cases for `subsetSize`.
    if (subsetSize === 0) {
        // The product of an empty set is conventionally 1.
        return 1;
    }
    if (totalElements < subsetSize) {
        // If there aren't enough elements to form the subset, the product is 0
        // (or an error condition, depending on problem constraints).
        return 0;
    }

    let currentProductAccumulator = 1; // Stores the running product.
    let negativeElementCount = 0; // Tracks negative numbers within the selected subset.
    let lastPositiveIndexInSubset = -1; // Index of the positive element with smallest absolute value in subset.
    let lastNegativeIndexInSubset = -1; // Index of the negative element with smallest absolute value in subset.

    // Step 1: Form the initial subset (the first `subsetSize` elements)
    // and calculate their product. These elements have the largest absolute values
    // due to the pre-sorting of `sourceElements`.
    const initialChosenSubset = [];
    for (let idx = 0; idx < subsetSize; ++idx) {
        const currentElement = sourceElements[idx];
        initialChosenSubset.push(currentElement);
        currentProductAccumulator = calculateModularProduct(
            currentProductAccumulator,
            currentElement,
            moduloValue,
            splitFactor
        );

        // Update indices for the smallest absolute positive and negative numbers
        // encountered so far within this `subsetSize` window.
        // Since `sourceElements` is sorted by `Math.abs(desc)`, the last element
        // (at `idx`) of a given sign will have the smallest absolute value among its peers.
        if (currentElement > 0) {
            lastPositiveIndexInSubset = idx;
        } else if (currentElement < 0) {
            lastNegativeIndexInSubset = idx;
            negativeElementCount++;
        }
    }

    // Early exit if the subset covers all available elements.
    if (totalElements === subsetSize) {
        return currentProductAccumulator;
    }

    // If the count of negative numbers in the initial subset is even,
    // the product is positive and already maximized. No further swaps needed.
    if (negativeElementCount % 2 === 0) {
        return currentProductAccumulator;
    }

    // Step 2: The current product is negative (odd number of negatives).
    // We must attempt to modify the subset to achieve a positive or a larger negative product.
    // This involves swapping an element from `initialChosenSubset` with an element from the remainder.

    // Scenario A: The initial subset contains both positive and negative numbers.
    // This means `negativeElementCount < subsetSize`.
    // We explore two potential swap types to turn the product positive:
    // 1. Replace a positive number from the subset with a negative number from the remainder.
    // 2. Replace a negative number from the subset with a positive number from the remainder.
    if (negativeElementCount < subsetSize) {
        let candidateNegFromRemainder = { value: 0, originalIndex: -1 }; // Smallest abs negative from elements N-K to N-1
        let candidatePosFromRemainder = { value: 0, originalIndex: -1 }; // Smallest abs positive from elements N-K to N-1

        // Search for the first negative number in `sourceElements` starting from `subsetSize`.
        // This will be the negative number with the smallest absolute value among the remaining elements.
        for (let j = subsetSize; j < totalElements; ++j) {
            if (sourceElements[j] < 0) {
                candidateNegFromRemainder.value = sourceElements[j];
                candidateNegFromRemainder.originalIndex = j;
                break; // Found the best negative candidate.
            }
        }

        // Search for the first positive number in `sourceElements` starting from `subsetSize`.
        // This will be the positive number with the smallest absolute value among the remaining elements.
        for (let j = subsetSize; j < totalElements; ++j) {
            if (sourceElements[j] > 0) {
                candidatePosFromRemainder.value = sourceElements[j];
                candidatePosFromRemainder.originalIndex = j;
                break; // Found the best positive candidate.
            }
        }

        let potentialSwapProductValue1 = -Infinity; // Product if positive is swapped with negative.
        let potentialSwapProductValue2 = -Infinity; // Product if negative is swapped with positive.

        const positiveValToReplace = initialChosenSubset[lastPositiveIndexInSubset]; // Smallest abs positive in subset.
        const negativeValToReplace = initialChosenSubset[lastNegativeIndexInSubset]; // Smallest abs negative in subset.

        // Evaluate Option 1: Swap `positiveValToReplace` with `candidateNegFromRemainder`.
        if (lastPositiveIndexInSubset !== -1 && candidateNegFromRemainder.originalIndex !== -1) {
            // The comparison `BigInt(tmp01[0]) * BigInt(tmp02[1]) >= BigInt(tmp02[0]) * BigInt(tmp01[1])`
            // from the original code implies comparing (new_neg * old_neg) vs (new_pos * old_pos)
            // relative to the "current" product, or simply comparing the magnitudes of the swaps.
            // Simplified, it's about which swap yields a larger positive outcome.
            // Here, we compare `candidateNegFromRemainder * negativeValToReplace` vs `candidatePosFromRemainder * positiveValToReplace`.
            // The product `currentProduct / positiveValToReplace * candidateNegFromRemainder.value`
            // is compared to `currentProduct / negativeValToReplace * candidatePosFromRemainder.value`.
            // This simplifies to comparing `candidateNegFromRemainder.value * negativeValToReplace`
            // with `candidatePosFromRemainder.value * positiveValToReplace`.
            // We use BigInt for this comparison to avoid overflow.
            potentialSwapProductValue1 = BigInt(candidateNegFromRemainder.value) * BigInt(negativeValToReplace);
        }

        // Evaluate Option 2: Swap `negativeValToReplace` with `candidatePosFromRemainder`.
        if (lastNegativeIndexInSubset !== -1 && candidatePosFromRemainder.originalIndex !== -1) {
            potentialSwapProductValue2 = BigInt(candidatePosFromRemainder.value) * BigInt(positiveValToReplace);
        }

        const finalSubsetForSwap = [...initialChosenSubset]; // Create a mutable copy of the initial subset.

        // Determine which swap, if any, yields the better result.
        if (potentialSwapProductValue1 === -Infinity && potentialSwapProductValue2 === -Infinity) {
            // No valid swaps could be performed. The current negative product is the best possible.
            // This scenario implies a very specific distribution of numbers.
            return currentProductAccumulator;
        } else if (potentialSwapProductValue1 === -Infinity) {
            // Only Option 2 is viable.
            finalSubsetForSwap[lastNegativeIndexInSubset] = candidatePosFromRemainder.value;
        } else if (potentialSwapProductValue2 === -Infinity) {
            // Only Option 1 is viable.
            finalSubsetForSwap[lastPositiveIndexInSubset] = candidateNegFromRemainder.value;
        } else if (potentialSwapProductValue1 >= potentialSwapProductValue2) {
            // Option 1 yields a greater or equal product.
            finalSubsetForSwap[lastPositiveIndexInSubset] = candidateNegFromRemainder.value;
        } else {
            // Option 2 yields a greater product.
            finalSubsetForSwap[lastNegativeIndexInSubset] = candidatePosFromRemainder.value;
        }

        // Recalculate the product for the chosen, modified subset.
        let recalculatedProduct = 1;
        for (const element of finalSubsetForSwap) {
            recalculatedProduct = calculateModularProduct(recalculatedProduct, element, moduloValue, splitFactor);
        }
        return recalculatedProduct;

    } else { // Scenario B: All `subsetSize` elements are negative (`negativeElementCount === subsetSize`).
        // The current product is negative. To make it positive, we need to swap
        // a negative element from the subset with a positive element from the remainder.
        // If no positive elements exist in the remainder, then all `totalElements` are negative.

        let positiveElementFoundInRemainder = -1;
        for (let j = subsetSize; j < totalElements; ++j) {
            if (sourceElements[j] >= 0) { // Search for any non-negative number.
                positiveElementFoundInRemainder = sourceElements[j];
                break;
            }
        }

        if (positiveElementFoundInRemainder !== -1) {
            // A positive element was found. Swap the smallest absolute negative from the subset
            // (`initialChosenSubset[lastNegativeIndexInSubset]`) with this positive element.
            const swappedSubset = [...initialChosenSubset];
            swappedSubset[lastNegativeIndexInSubset] = positiveElementFoundInRemainder;

            let recalculatedProduct = 1;
            for (const element of swappedSubset) {
                recalculatedProduct = calculateModularProduct(recalculatedProduct, element, moduloValue, splitFactor);
            }
            return recalculatedProduct;
        } else {
            // No positive elements were found in the remainder.
            // This implies all `totalElements` are negative, and `subsetSize` is odd.
            // In this case, any product of `subsetSize` elements will be negative.
            // To maximize a negative product (i.e., make it the "least negative"),
            // we must select the `subsetSize` numbers that have the *smallest* absolute values.
            // Since `sourceElements` is sorted by absolute value in descending order,
            // these are the last `subsetSize` elements of the `sourceElements` array.
            let finalProductForNegativeOnlyCase = 1;
            // Iterate from `totalElements - 1` down to `totalElements - subsetSize` (inclusive).
            for (let kElementIndex = totalElements - 1; kElementIndex >= (totalElements - subsetSize); --kElementIndex) {
                finalProductForNegativeOnlyCase = calculateModularProduct(
                    finalProductForNegativeOnlyCase,
                    sourceElements[kElementIndex],
                    moduloValue,
                    splitFactor
                );
            }
            return finalProductForNegativeOnlyCase;
        }
    }
}

// --- Input Processing and Execution Entry Point ---

/**
 * The primary function responsible for orchestrating the problem-solving process.
 * It reads input data, parses it into numerical formats, applies the core
 * product calculation logic, and outputs the final, normalized result to the console.
 */
function executeProblemSolver() {
    // Read the raw input content from the specified file path.
    const rawInputTextContent = require("fs").readFileSync(DATA_SOURCE_PATH, DATA_ENCODING);

    // Process the raw input:
    // 1. Remove leading/trailing whitespace.
    // 2. Split the content into individual lines.
    // 3. For each line, split it further by space characters.
    // Example: "10 3\n1 2 3..." becomes `[["10", "3"], ["1", "2", "3", ...]]`.
    const structuredInputLines = rawInputTextContent.trim().split("\n").map(function(lineSegment) {
        return lineSegment.split(" ");
    });

    // Extract the total number of elements (N) and the subset size (K)
    // from the first processed line, converting them to numbers.
    const totalElementsCount = Number(structuredInputLines[0][0]); // Corresponds to N
    const subsetSelectionSize = Number(structuredInputLines[0][1]); // Corresponds to K

    // Parse the array of numbers from the second processed line.
    // Each string element is converted into its numerical representation.
    const numericalArray = structuredInputLines[1].map(singleElement => Number(singleElement));

    // Sort the numerical array based on the absolute values of its elements
    // in descending order. This arrangement is fundamental for the selection
    // strategy to maximize the product.
    numericalArray.sort((valueA, valueB) => {
        const absoluteA = Math.abs(valueA);
        const absoluteB = Math.abs(valueB);
        // Explicit comparison to ensure robust sorting logic,
        // especially for edge cases or floating-point considerations.
        if (absoluteA < absoluteB) return 1; // `absoluteB` is larger, so `valueB` should come first.
        if (absoluteA > absoluteB) return -1; // `absoluteA` is larger, so `valueA` should come first.
        return 0; // Absolute values are equal, maintain relative order.
    });

    // Invoke the core logic to calculate the optimal product using the prepared data.
    const finalCalculatedProduct = calculateOptimalProduct(
        numericalArray,
        totalElementsCount,
        subsetSelectionSize,
        PRIMARY_MODULO_VALUE,
        MULTIPLICATION_SPLIT_BASE
    );

    // Output the final result to the console, ensuring it is normalized
    // to be non-negative with respect to the primary modulo value.
    console.log(normalizeModuloResult(finalCalculatedProduct, PRIMARY_MODULO_VALUE));
}

// Initiate the problem-solving process by calling the main execution function.
executeProblemSolver();