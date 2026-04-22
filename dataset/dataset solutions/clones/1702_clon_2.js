// Function to handle the primary processing of input data
function ProcessInput(rawData) {
    // Define a large prime modulus for calculations
    const modulusVal = 1000000007;
    // Define a secondary factor base for modular multiplication optimization
    const factorBase = 100000;

    // Pre-process the raw input string: trim, split by newlines, then split each line by spaces
    rawData = rawData
        .trim()
        .split('\n')
        .map(function(item) {
            return item.split(' ');
        });

    // Parse the array length and subset size from the first line of input
    let arrayLength = parseInt(rawData[0][0], 10);
    let subsetSize = parseInt(rawData[0][1], 10);

    // Parse the numbers for the main array from the second line of input
    let numbersArray = rawData[1].map(element => parseInt(element, 10));

    // Sort the numbers array in descending order based on their absolute values
    numbersArray.sort((valA, valB) => Math.abs(valB) - Math.abs(valA));

    // Calculate the final product using the custom logic
    let finalProduct = calculateProduct(numbersArray, arrayLength, subsetSize, modulusVal, factorBase);

    // Output the result after normalizing it with the modulus
    console.log(normalizeModulo(finalProduct, modulusVal));
}


// This routine determines the product of K elements from the sorted numbers array
function calculateProduct(numbersArray, arrayLength, subsetSize, modulusVal, factorBase) {
    let currentProduct = 1; // Initialize the running product
    let negativeCount = 0; // Counter for negative numbers encountered
    let lastPositiveIdx;   // Index of the last positive number included in the initial K elements
    let lastNegativeIdx;   // Index of the last negative number included in the initial K elements

    // Iterate through the first K elements to calculate the initial product and track signs
    for (let idx = 0; idx < subsetSize; idx++) {
        currentProduct = multiplyMod(currentProduct, numbersArray[idx], modulusVal, factorBase);
        if (currentProduct === 0) return 0; // If product becomes 0, the final result will be 0

        if (numbersArray[idx] > 0) {
            lastPositiveIdx = idx; // Update index of the rightmost positive number
        }
        if (numbersArray[idx] < 0) {
            lastNegativeIdx = idx; // Update index of the rightmost negative number
            negativeCount++;       // Increment count of negative numbers
        }
    }

    // If all elements are selected, return the current product
    if (subsetSize === arrayLength) return currentProduct;

    // If the count of negative numbers is even, the product is positive, so return it
    if (negativeCount % 2 === 0) return currentProduct;

    // Handle cases where an odd number of negatives results in a negative product, requiring adjustment
    if (negativeCount < subsetSize) {
        // Prepare two candidate swaps to potentially make the product positive and maximize it
        let candidateOne = [0, 0, -1]; // [new_negative_val, old_positive_val, new_negative_idx]
        let candidateTwo = [0, 0, -1]; // [new_positive_val, old_negative_val, new_positive_idx]

        // Find the first available negative number outside the initial K elements
        for (let idx = subsetSize; idx < arrayLength; idx++) {
            if (numbersArray[idx] < 0) {
                candidateOne = [numbersArray[idx], numbersArray[lastPositiveIdx], idx];
                break;
            }
        }
        // Find the first available positive number outside the initial K elements
        for (let idx = subsetSize; idx < arrayLength; idx++) {
            if (numbersArray[idx] > 0) {
                candidateTwo = [numbersArray[idx], numbersArray[lastNegativeIdx], idx];
                break;
            }
        }

        // Apply the best swap or remove an element if only one type of swap is possible
        if (candidateTwo[2] === -1) { // Only a negative can be swapped in for a positive
            numbersArray.splice(subsetSize, candidateOne[2] - subsetSize); // Remove elements between K and candidate
            numbersArray.splice(lastPositiveIdx, 1); // Remove the last positive
        } else if (candidateOne[2] === -1) { // Only a positive can be swapped in for a negative
            numbersArray.splice(subsetSize, candidateTwo[2] - subsetSize); // Remove elements between K and candidate
            numbersArray.splice(lastNegativeIdx, 1); // Remove the last negative
        } else if (BigInt(candidateOne[0]) * BigInt(candidateTwo[1]) >= BigInt(candidateTwo[0]) * BigInt(candidateOne[1])) {
            // Compare which swap yields a larger product using BigInt for precision
            numbersArray.splice(subsetSize, candidateOne[2] - subsetSize); // Remove elements
            numbersArray.splice(lastPositiveIdx, 1); // Remove the last positive
        } else {
            numbersArray.splice(subsetSize, candidateTwo[2] - subsetSize); // Remove elements
            numbersArray.splice(lastNegativeIdx, 1); // Remove the last negative
        }
        
        // Recalculate the product with the modified set of K elements
        currentProduct = 1;
        for (let idx = 0; idx < subsetSize; idx++) {
            currentProduct = multiplyMod(currentProduct, numbersArray[idx], modulusVal, factorBase);
            if (currentProduct === 0) return 0;
        }
        return currentProduct;

    } else { // All K elements are negative, and the product is negative
        // Try to replace one negative with a positive from the remaining elements
        for (let idx = subsetSize; idx < arrayLength; idx++) {
            if (numbersArray[idx] >= 0) { // Found a positive or zero element
                numbersArray.splice(subsetSize, idx - subsetSize); // Remove elements between K and current idx
                numbersArray.splice(lastNegativeIdx, 1); // Remove the last negative element

                // Recalculate product after replacing a negative with a positive
                currentProduct = 1;
                for (let idx = 0; idx < subsetSize; idx++) {
                    currentProduct = multiplyMod(currentProduct, numbersArray[idx], modulusVal, factorBase);
                    if (currentProduct === 0) return 0;
                }
                return currentProduct;
            }
        }
        // If no positive elements are available to swap, take the K smallest (most negative in absolute value)
        // This means the product will still be negative, and we take the K smallest absolute values.
        currentProduct = 1;
        for (let idx = arrayLength - 1; idx >= (arrayLength - subsetSize); idx--) {
            currentProduct = multiplyMod(currentProduct, numbersArray[idx], modulusVal, factorBase);
        }
        return currentProduct;
    }
}


// Performs modular multiplication (operandA * operandB) % modulusVal efficiently
function multiplyMod(operandA, operandB, modulusVal, factorBase) {
    let quotientPart, remainderPart, resultValue; // Declare variables for intermediate steps

    // Split operandB into two parts: quotient and remainder with respect to factorBase
    quotientPart = (operandB / factorBase) | 0; // Integer division
    remainderPart = operandB - (quotientPart * factorBase); // Remainder part

    // Calculate (operandA * quotientPart * factorBase + operandA * remainderPart) % modulusVal
    resultValue = (operandA * quotientPart % modulusVal) * factorBase % modulusVal + (operandA * remainderPart);

    // Ensure the final result is within the positive range [0, modulusVal-1]
    resultValue %= modulusVal;
    return resultValue;
}


// Ensures that the result of a modulo operation is always positive
function normalizeModulo(valueNum, moduloDivisor) {
    let interimResult = valueNum % moduloDivisor; // Perform standard modulo
    // If the result is negative, adjust it by adding the absolute value of the divisor
    return interimResult < 0 ? (interimResult + (moduloDivisor < 0 ? -moduloDivisor : moduloDivisor)) : interimResult;
}

// Invoke the main processing function with data read from standard input
ProcessInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));