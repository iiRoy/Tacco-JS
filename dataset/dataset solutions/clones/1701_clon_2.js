function processInput(rawData) {
    const MODULUS_VAL = 1_000_000_007; // A large prime constant for modular arithmetic
    const CHUNK_SIZE = 100_000;       // A chunk size for optimized modular multiplication

    let processedLines = rawData
        .trim()
        .split("\n")
        .map(function(lineStr) {
            return lineStr.split(" ");
        });

    const elementCount = parseInt(processedLines[0][0], 10); // Total number of elements
    const selectionCount = parseInt(processedLines[0][1], 10); // Number of elements to select

    let numberArray = processedLines[1].map(element => parseInt(element, 10)); // Array of input numbers

    // Sort the array by the absolute value of elements in descending order
    // This prioritizes elements with larger magnitudes.
    numberArray.sort((valA, valB) => Math.abs(valB) - Math.abs(valA));

    let finalResult = calculateProduct(numberArray, elementCount, selectionCount, MODULUS_VAL, CHUNK_SIZE);

    // Print the final calculated product modulo MODULUS_VAL
    console.log(applyModulo(finalResult, MODULUS_VAL));
}

function calculateProduct(numList, totalElements, numToSelect, modBase, divisorChunk) {
    let currentProduct = 1;
    let negativeCount = 0;
    let lastPositiveIdx; // Stores the index of the last positive number found in the top K
    let lastNegativeIdx; // Stores the index of the last negative number found in the top K

    // Calculate the product of the first 'numToSelect' elements and count negatives/positives
    for (let idx = 0; idx < numToSelect; idx++) {
        currentProduct = multiplyMod(currentProduct, numList[idx], modBase, divisorChunk);
        if (currentProduct === 0) return 0; // If product becomes zero, return immediately

        if (numList[idx] > 0) {
            lastPositiveIdx = idx;
        }
        if (numList[idx] < 0) {
            lastNegativeIdx = idx;
            negativeCount++;
        }
    }

    // If 'numToSelect' equals 'totalElements', no further adjustments are possible
    if (numToSelect === totalElements) {
        return currentProduct;
    }

    // If the count of negative numbers in the top 'numToSelect' is even,
    // the product is positive, which is the desired outcome.
    if (negativeCount % 2 === 0) {
        return currentProduct;
    }

    // If the product is currently negative (odd count of negatives),
    // we try to make it positive by swapping elements.

    // Scenario 1: There are both positive and negative numbers in the top 'numToSelect'
    // and also elements remaining beyond 'numToSelect'.
    if (negativeCount < numToSelect) {
        let negativeCandidate = [0, -1, -1]; // [value_from_remaining, old_positive_from_topK, index_in_remaining]
        let positiveCandidate = [0, -1, -1]; // [value_from_remaining, old_negative_from_topK, index_in_remaining]

        // Search for the first negative number in the remaining elements
        for (let idx = numToSelect; idx < totalElements; idx++) {
            if (numList[idx] < 0) {
                negativeCandidate = [numList[idx], numList[lastPositiveIdx], idx];
                break;
            }
        }

        // Search for the first positive number in the remaining elements
        for (let idx = numToSelect; idx < totalElements; idx++) {
            if (numList[idx] > 0) {
                positiveCandidate = [numList[idx], numList[lastNegativeIdx], idx];
                break;
            }
        }

        // Compare which swap yields a larger positive product:
        // (new_negative_from_remaining * old_negative_from_topK) vs (new_positive_from_remaining * old_positive_from_topK)
        if (negativeCandidate[0] * positiveCandidate[1] >= positiveCandidate[0] * negativeCandidate[1]) {
            // Option chosen: replace an old positive from top K with a new negative from remaining
            numList.splice(numToSelect, negativeCandidate[2] - numToSelect); // Remove intermediate elements
            numList.splice(lastPositiveIdx, 1); // Remove the old positive element
        } else {
            // Option chosen: replace an old negative from top K with a new positive from remaining
            numList.splice(numToSelect, positiveCandidate[2] - numToSelect); // Remove intermediate elements
            numList.splice(lastNegativeIdx, 1); // Remove the old negative element
        }

        // Recalculate product with the modified top K elements
        currentProduct = 1;
        for (let idx = 0; idx < numToSelect; idx++) {
            currentProduct = multiplyMod(currentProduct, numList[idx], modBase, divisorChunk);
            if (currentProduct === 0) return 0;
        }
        return currentProduct;

    } else {
        // Scenario 2: All 'numToSelect' elements are negative (product is negative)
        // We must find a non-negative element in the remaining part to swap.
        for (let idx = numToSelect; idx < totalElements; idx++) {
            if (numList[idx] >= 0) {
                // Found a non-negative element to swap with an old negative
                numList.splice(numToSelect, idx - numToSelect); // Remove intermediate elements
                numList.splice(lastNegativeIdx, 1); // Remove the old negative element

                // Recalculate product with the modified top K elements
                currentProduct = 1;
                for (let j = 0; j < numToSelect; j++) {
                    currentProduct = multiplyMod(currentProduct, numList[j], modBase, divisorChunk);
                    if (currentProduct === 0) return 0;
                }
                return currentProduct;
            }
        }

        // If no non-negative element was found in the entire array to make the product positive,
        // and 'numToSelect' is odd (meaning the current product of K largest magnitudes is negative),
        // we must choose the K elements that result in the largest (closest to zero) negative product.
        // This means selecting the K elements with the smallest absolute values.
        currentProduct = 1;
        for (let idx = totalElements - 1; idx >= (totalElements - numToSelect); idx--) {
            currentProduct = multiplyMod(currentProduct, numList[idx], modBase, divisorChunk);
        }
        return currentProduct;
    }
}

// Performs modular multiplication (operandA * operandB) % modBase
// Optimized to handle large numbers by splitting operandB
function multiplyMod(operandA, operandB, modBase, divisorChunk) {
    let quotientPart, remainderPart, productResult;

    quotientPart = (operandB / divisorChunk) | 0; // Integer division for the quotient
    remainderPart = operandB - (quotientPart * divisorChunk); // Remainder part

    // Calculate the product in two parts to prevent intermediate overflow
    productResult = (operandA * quotientPart % modBase) * divisorChunk % modBase + (operandA * remainderPart);

    productResult %= modBase; // Ensure final result is within the modulo range
    return productResult;
}

// Ensures a number is a positive result after modulo operation
function applyModulo(value, modulus) {
    return (value % modulus < 0) ? (value % modulus) + modulus : (value % modulus);
}

// Read input from standard input and start the processing
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));