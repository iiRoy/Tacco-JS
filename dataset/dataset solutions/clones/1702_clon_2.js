function ProcessInputAndCompute() {
    // Define constants for modulo arithmetic operations.
    // MOD_PRIME is a large prime number, 10^9 + 7, used for calculations.
    const MOD_PRIME = 1000000007;
    // SPLIT_FACTOR is used for splitting numbers in multiplication to prevent overflow.
    const SPLIT_FACTOR = 100000;

    // Read raw input from standard input, trim any leading/trailing whitespace,
    // split the input into lines, and then split each line by spaces.
    let rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    let processedLines = rawInputData.trim().split("\n").map(function(lineSegment) {
        return lineSegment.split(" ");
    });

    // Parse the total number of elements (N) and the count of elements to select (K)
    // from the first line of the processed input.
    const totalElementsCount = parseInt(processedLines[0][0], 10);
    const elementsToSelect = parseInt(processedLines[0][1], 10);

    // Parse the array of numbers from the second line of the processed input.
    let numberCollection = processedLines[1].map(elementString => parseInt(elementString, 10));

    // Sort the array of numbers by the absolute value of its elements in descending order.
    // This strategy helps in selecting numbers with the largest magnitudes first.
    numberCollection.sort((valA, valB) => Math.abs(valB) - Math.abs(valA));

    // Calculate the product of the selected numbers using a custom computation function
    // that handles modulo arithmetic.
    let finalProductResult = calculateProduct(numberCollection, totalElementsCount, elementsToSelect, MOD_PRIME, SPLIT_FACTOR);

    // Output the final result to the console, ensuring it is a positive value
    // within the modulo range.
    console.log(normalizeModulo(finalProductResult, MOD_PRIME));
}

function calculateProduct(inputNumbers, totalElementsCount, numToSelect, moduloConstant, splitConstant) {
    let currentProduct = 1;
    let negativeCounter = 0;
    let lastPositiveIdx; // Stores the index of the last positive number encountered among the first K elements.
    let lastNegativeIdx; // Stores the index of the last negative number encountered among the first K elements.

    // Iterate through the first 'numToSelect' elements to calculate their product
    // and count the number of negative values.
    for (let loopVar = 0; loopVar < numToSelect; loopVar++) {
        currentProduct = multiplyModulo(currentProduct, inputNumbers[loopVar], moduloConstant, splitConstant);
        // If the product becomes zero at any point, the final result is zero.
        if (currentProduct === 0) return 0;

        // Update indices for the last positive and negative numbers found.
        if (inputNumbers[loopVar] > 0) {
            lastPositiveIdx = loopVar;
        }
        if (inputNumbers[loopVar] < 0) {
            lastNegativeIdx = loopVar;
            negativeCounter++;
        }
    }

    // If all available elements are selected, the current product is the final answer.
    if (numToSelect === totalElementsCount) return currentProduct;

    // If the count of negative numbers in the selected 'numToSelect' elements is even,
    // the product is positive, which is generally optimal.
    if (negativeCounter % 2 === 0) return currentProduct;

    // If the product is currently negative (odd number of negative factors),
    // we need to consider swapping elements to make the product positive or maximize a negative product.
    if (negativeCounter < numToSelect) {
        // Scenario 1: Try to swap a positive number (from selected) with a negative number (from remaining).
        // Find the first negative number outside the initial 'numToSelect' elements.
        let candidatePairOne = [0, 0, -1]; // Format: [new_negative_value, old_positive_value, new_negative_index]
        for (let loopVar = numToSelect; loopVar < totalElementsCount; loopVar++) {
            if (inputNumbers[loopVar] < 0) {
                candidatePairOne = [inputNumbers[loopVar], inputNumbers[lastPositiveIdx], loopVar];
                break;
            }
        }

        // Scenario 2: Try to swap a negative number (from selected) with a positive number (from remaining).
        // Find the first positive number outside the initial 'numToSelect' elements.
        let candidatePairTwo = [0, 0, -1]; // Format: [new_positive_value, old_negative_value, new_positive_index]
        for (let loopVar = numToSelect; loopVar < totalElementsCount; loopVar++) {
            if (inputNumbers[loopVar] > 0) {
                candidatePairTwo = [inputNumbers[loopVar], inputNumbers[lastNegativeIdx], loopVar];
                break;
            }
        }

        // Decide which swap (if any) is most beneficial.
        if (candidatePairTwo[2] === -1) { // Only a negative number can be swapped in (Scenario 1).
            // Remove elements between K and the new negative number's index, then remove the old positive.
            inputNumbers.splice(numToSelect, candidatePairOne[2] - numToSelect);
            inputNumbers.splice(lastPositiveIdx, 1);
        } else if (candidatePairOne[2] === -1) { // Only a positive number can be swapped in (Scenario 2).
            // Remove elements between K and the new positive number's index, then remove the old negative.
            inputNumbers.splice(numToSelect, candidatePairTwo[2] - numToSelect);
            inputNumbers.splice(lastNegativeIdx, 1);
        } else if (BigInt(candidatePairOne[0]) * BigInt(candidatePairTwo[1]) >= BigInt(candidatePairTwo[0]) * BigInt(candidatePairOne[1])) {
            // Compare potential products using BigInt to avoid overflow.
            // If swapping a negative for a positive (Scenario 1) is better or equal.
            inputNumbers.splice(numToSelect, candidatePairOne[2] - numToSelect);
            inputNumbers.splice(lastPositiveIdx, 1);
        } else {
            // If swapping a positive for a negative (Scenario 2) is better.
            inputNumbers.splice(numToSelect, candidatePairTwo[2] - numToSelect);
            inputNumbers.splice(lastNegativeIdx, 1);
        }

        // Recalculate the product with the modified set of 'numToSelect' elements.
        currentProduct = 1;
        for (let loopVar = 0; loopVar < numToSelect; loopVar++) {
            currentProduct = multiplyModulo(currentProduct, inputNumbers[loopVar], moduloConstant, splitConstant);
            if (currentProduct === 0) return 0;
        }
        return currentProduct;
    } else {
        // This branch is executed if all 'numToSelect' elements initially chosen are negative.
        // The product is negative, and we must try to make it positive if possible.
        // Search for a non-negative number outside the initial 'numToSelect' elements.
        for (let loopVar = numToSelect; loopVar < totalElementsCount; loopVar++) {
            if (inputNumbers[loopVar] >= 0) {
                // If a non-negative number is found, swap it with the largest absolute value negative number
                // (which is at 'lastNegativeIdx' due to sorting).
                inputNumbers.splice(numToSelect, loopVar - numToSelect); // Remove elements between K and the new non-negative number's index.
                inputNumbers.splice(lastNegativeIdx, 1); // Remove the old negative number.
                currentProduct = 1;
                for (let innerLoopVar = 0; innerLoopVar < numToSelect; innerLoopVar++) {
                    currentProduct = multiplyModulo(currentProduct, inputNumbers[innerLoopVar], moduloConstant, splitConstant);
                    if (currentProduct === 0) return 0;
                }
                return currentProduct;
            }
        }
        // If no non-negative numbers are available outside the first 'numToSelect' elements,
        // it means all remaining numbers are also negative.
        // In this scenario, the product will remain negative. To maximize a negative product,
        // we need to select the 'numToSelect' numbers with the smallest absolute values.
        // Since the array is sorted by absolute value in descending order, these would be the last 'numToSelect' elements.
        currentProduct = 1;
        for (let loopVar = totalElementsCount - 1; loopVar >= (totalElementsCount - numToSelect); loopVar--) {
            currentProduct = multiplyModulo(currentProduct, inputNumbers[loopVar], moduloConstant, splitConstant);
        }
        return currentProduct;
    }
}

// Function to perform multiplication with modulo, designed to handle potentially large numbers
// by splitting one operand. This helps prevent intermediate overflow before the modulo operation.
function multiplyModulo(operandA, operandB, modulusValue, splitFactor) {
    let quotientPart, remainderPart, intermediateResult;

    // Split 'operandB' into a quotient and a remainder with respect to 'splitFactor'.
    // The bitwise OR 0 (`| 0`) is used for efficient floor division.
    quotientPart = (operandB / splitFactor | 0);
    remainderPart = operandB - (quotientPart * splitFactor);

    // Apply modulo arithmetic using the property: (A * B) % M = ((A * (B_Q * S)) % M + (A * B_R) % M) % M
    // where B = B_Q * S + B_R (B_Q is quotientPart, S is splitFactor, B_R is remainderPart).
    intermediateResult = (operandA * quotientPart % modulusValue) * splitFactor % modulusValue + (operandA * remainderPart);

    // Ensure the final result is within the positive range [0, modulusValue - 1].
    intermediateResult %= modulusValue;
    return intermediateResult;
}

// Function to normalize a number to be within the positive range of a modulo operation.
// This is necessary because JavaScript's '%' operator can return negative results for negative dividends.
function normalizeModulo(value, divisor) {
    // If the result of `value % divisor` is negative, add the absolute value of the divisor
    // to bring it into the positive range. Otherwise, return the result directly.
    return (value % divisor) < 0 ? (value % divisor) + Math.abs(divisor) : (value % divisor);
}

// Execute the main processing function to start the program.
ProcessInputAndCompute();
