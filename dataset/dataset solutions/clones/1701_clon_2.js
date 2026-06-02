function ProcessInput(rawData) {
    // Define a large prime modulus for calculations, often used in competitive programming.
    const MOD_VAL = 1_000_000_000 + 7;
    // Define a factor for splitting numbers in multiplication to prevent overflow before modulo.
    const FACTOR_VAL = 100_000;

    // Pre-process the raw input string: trim leading/trailing whitespace,
    // split into lines, then split each line by space.
    let processedLines = rawData.trim().split("\n").map(function(lineSegment) {
        return lineSegment.split(" ");
    });

    // Parse the first line to extract the total number of elements (N)
    // and the number of elements to select (K).
    const arraySize = parseInt(processedLines[0][0], 10);
    const elementsToSelect = parseInt(processedLines[0][1], 10);

    // Parse the second line to create the numeric array.
    let numericArray = processedLines[1].map(elementStr => parseInt(elementStr, 10));

    // Sort the array by the absolute value of its elements in descending order.
    // This strategy prioritizes numbers with larger magnitudes.
    numericArray.sort((valA, valB) => Math.abs(valB) - Math.abs(valA));

    // Compute the maximum product of 'elementsToSelect' elements from 'numericArray'.
    let finalResult = computeProduct(numericArray, arraySize, elementsToSelect, MOD_VAL, FACTOR_VAL);

    // Print the final result, ensuring it's a positive value within the modulus.
    console.log(moduloOperation(finalResult, MOD_VAL));
}

// This function calculates the maximum product of 'numToPick' elements
// from the 'dataVector', applying modular arithmetic.
function computeProduct(dataVector, totalElements, numToPick, modulus, multiplier) {
    let currentProduct = 1; // Initialize the product accumulator.
    let negativeCount = 0; // Tracks the number of negative values among the first 'numToPick' elements.
    let firstPositiveIdx;  // Stores the index of the last positive number encountered in the initial 'numToPick' elements.
    let firstNegativeIdx;  // Stores the index of the last negative number encountered in the initial 'numToPick' elements.

    // Iterate through the first 'numToPick' elements to form an initial product
    // and gather information about positive/negative numbers.
    for (let idx = 0; idx < numToPick; idx++) {
        currentProduct = multiplyAndMod(currentProduct, dataVector[idx], modulus, multiplier);
        // If at any point the product becomes zero, the final result is zero.
        if (currentProduct === 0) return 0;

        if (dataVector[idx] > 0) {
            firstPositiveIdx = idx; // Update index of the last positive element.
        }
        if (dataVector[idx] < 0) {
            firstNegativeIdx = idx; // Update index of the last negative element.
            negativeCount++;
        }
    }

    // If all available elements are selected, the current product is the final answer.
    if (numToPick === totalElements) return currentProduct;

    // If the count of negative numbers in the initial 'numToPick' elements is even,
    // the product is positive, which is generally optimal.
    if (negativeCount % 2 === 0) return currentProduct;

    // If the product is currently negative (odd number of negatives),
    // we need to adjust the selection to make it positive or maximize its magnitude.

    // Case 1: There's at least one positive number among the initial 'numToPick' elements.
    // We can try to swap a negative from the initial 'numToPick' with a positive from the remaining,
    // OR swap a positive from the initial 'numToPick' with a negative from the remaining.
    if (negativeCount < numToPick) {
        // console.log("Adjusting for negative product with mixed signs in initial selection."); // Debugging comment
        let potentialSwapOne = [0, -1, -1]; // [new_negative_value, old_positive_value, new_negative_index]
        let potentialSwapTwo = [0, -1, -1]; // [new_positive_value, old_negative_value, new_positive_index]

        // Search for the first negative number outside the initial 'numToPick' elements.
        for (let idx = numToPick; idx < totalElements; idx++) {
            if (dataVector[idx] < 0) {
                potentialSwapOne = [dataVector[idx], dataVector[firstPositiveIdx], idx];
                break;
            }
        }
        // Search for the first positive number outside the initial 'numToPick' elements.
        for (let idx = numToPick; idx < totalElements; idx++) {
            if (dataVector[idx] > 0) {
                potentialSwapTwo = [dataVector[idx], dataVector[firstNegativeIdx], idx];
                break;
            }
        }

        // Compare the potential swaps to determine which one yields a larger (less negative or more positive) product.
        // The comparison `potentialSwapOne[0] * potentialSwapTwo[1] >= potentialSwapTwo[0] * potentialSwapOne[1]`
        // effectively compares `(new_negative * old_negative)` vs `(new_positive * old_positive)`.
        // This helps decide which swap (replacing old_positive with new_negative, or old_negative with new_positive)
        // results in a product with a larger absolute value, while also making it positive.
        if (potentialSwapOne[0] * potentialSwapTwo[1] >= potentialSwapTwo[0] * potentialSwapOne[1]) {
            // Perform the first swap: replace an 'old_positive' with a 'new_negative'.
            // First, remove elements between 'numToPick' and the index of the 'new_negative'.
            dataVector.splice(numToPick, potentialSwapOne[2] - numToPick);
            // Then, remove the 'old_positive' element from its position.
            dataVector.splice(firstPositiveIdx, 1);
        } else {
            // Perform the second swap: replace an 'old_negative' with a 'new_positive'.
            // First, remove elements between 'numToPick' and the index of the 'new_positive'.
            dataVector.splice(numToPick, potentialSwapTwo[2] - numToPick);
            // Then, remove the 'old_negative' element from its position.
            dataVector.splice(firstNegativeIdx, 1);
        }

        // Recalculate the product with the modified 'dataVector'.
        currentProduct = 1;
        for (let idx = 0; idx < numToPick; idx++) {
            currentProduct = multiplyAndMod(currentProduct, dataVector[idx], modulus, multiplier);
            if (currentProduct === 0) return 0;
        }
        return currentProduct;

    } else { // Case 2: All 'numToPick' elements are negative, and the product is negative.
        // console.log("All initial elements are negative, seeking a positive outside."); // Debugging comment
        // Try to replace the negative number with the smallest absolute value (which is `dataVector[firstNegativeIdx]`
        // due to sorting by absolute value) with a non-negative number from outside the initial 'numToPick' elements.
        for (let idx = numToPick; idx < totalElements; idx++) {
            if (dataVector[idx] >= 0) { // Found a non-negative number.
                // Remove elements between 'numToPick' and the index of the found non-negative.
                dataVector.splice(numToPick, idx - numToPick);
                // Remove the negative element that was in the initial 'numToPick' selection.
                dataVector.splice(firstNegativeIdx, 1);

                // Recalculate the product.
                currentProduct = 1;
                for (let jdx = 0; jdx < numToPick; jdx++) {
                    currentProduct = multiplyAndMod(currentProduct, dataVector[jdx], modulus, multiplier);
                    if (currentProduct === 0) return 0;
                }
                return currentProduct;
            }
        }
        // console.log("No positive found outside, selecting K smallest absolute values."); // Debugging comment
        // If no non-negative number is found outside the initial 'numToPick' elements,
        // it means all remaining numbers are also negative.
        // In this scenario, to maximize a negative product, we must select the 'numToPick'
        // numbers with the smallest absolute values. Since the array is sorted by absolute value
        // in descending order, these will be the last 'numToPick' elements in the original array.
        currentProduct = 1;
        for (let idx = totalElements - 1; idx >= (totalElements - numToPick); idx--) {
            currentProduct = multiplyAndMod(currentProduct, dataVector[idx], modulus, multiplier);
        }
        return currentProduct;
    }
}

// This utility function performs modular multiplication,
// splitting one of the operands to handle potentially large intermediate products
// before applying the modulo.
function multiplyAndMod(operandA, operandB, modVal, splitFactor) {
    let quotientPart; // Stores the quotient of operandB divided by splitFactor.
    let remainderPart; // Stores the remainder of operandB divided by splitFactor.
    let intermediateResult; // Accumulates the modular product.

    // Calculate the integer quotient.
    quotientPart = (operandB / splitFactor | 0);
    // Calculate the remainder.
    remainderPart = operandB - (quotientPart * splitFactor);

    // Apply modular multiplication using the split parts:
    // (A * B) % M = (A * (Q * F + R)) % M
    //             = (A * Q * F + A * R) % M
    //             = (((A * Q) % M) * F % M + (A * R)) % M
    intermediateResult = (operandA * quotientPart % modVal) * splitFactor % modVal + (operandA * remainderPart);

    // Ensure the final result is within the modulo range.
    intermediateResult %= modVal;
    return intermediateResult;
}

// This function calculates the modulo of a dividend by a divisor,
// ensuring the result is always non-negative, even if the dividend is negative.
function moduloOperation(dividend, divisor) {
    // Calculate the standard JavaScript modulo.
    const standardMod = dividend % divisor;
    // If the standard modulo result is negative, adjust it by adding the absolute divisor.
    // The `+ 0` is a stylistic choice from the original code, functionally redundant.
    return standardMod < 0 ? (standardMod + 0 + (divisor < 0 ? -divisor : divisor)) : (standardMod + 0);
}

// Read input from standard input (e.g., from a file or console pipe)
// and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
