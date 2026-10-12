function processInputData(rawInputString) {
    const MODULUS_VALUE = 1e+9 + 7;
    const SPLIT_FACTOR = 1e+5;

    const parseInputLines = (data) => data.trim().split("\n").map(line => line.split(" "));
    const parsedLines = parseInputLines(rawInputString);

    const parseNumbersLine = (lineData) => ({
        totalElements: parseInt(lineData[0], 10),
        elementsToSelect: parseInt(lineData[1], 10)
    });
    const { totalElements, elementsToSelect } = parseNumbersLine(parsedLines[0]);

    const parseArrayLine = (lineData) => lineData.map(e => parseInt(e, 10));
    const initialNumbers = parseArrayLine(parsedLines[1]);

    const absoluteValueComparator = (a, b) => Math.abs(b) - Math.abs(a);
    initialNumbers.sort(absoluteValueComparator);

    const finalResult = determineOptimalProduct(initialNumbers, totalElements, elementsToSelect, MODULUS_VALUE, SPLIT_FACTOR);
    console.log(adjustModuloResult(finalResult, MODULUS_VALUE));
}

function calculateKProduct(numbersArray, count, modulus, splitFactor) {
    let productAccumulator = 1;
    for (let i = 0; i < count; i++) {
        productAccumulator = performModularMultiplication(productAccumulator, numbersArray[i], modulus, splitFactor);
        if (productAccumulator === 0) {
            return 0;
        }
    }
    return productAccumulator;
}

function determineOptimalProduct(initialNumbers, totalElements, elementsToSelect, MODULUS_VALUE, SPLIT_FACTOR) {
    if (elementsToSelect === 0) {
        return 1;
    }

    let currentProduct = 1;
    let negativeElementCount = 0;
    let lastPositiveIndex = -1;
    let lastNegativeIndex = -1;

    for (let i = 0; i < elementsToSelect; i++) {
        const currentNumber = initialNumbers[i];
        currentProduct = performModularMultiplication(currentProduct, currentNumber, MODULUS_VALUE, SPLIT_FACTOR);
        if (currentProduct === 0) {
            return 0;
        }
        if (currentNumber > 0) {
            lastPositiveIndex = i;
        }
        if (currentNumber < 0) {
            lastNegativeIndex = i;
            negativeElementCount++;
        }
    }

    if (elementsToSelect === totalElements) {
        return currentProduct;
    }

    const isProductNegative = (negativeElementCount % 2 !== 0);
    if (!isProductNegative) {
        return currentProduct;
    }

    // Product is negative, need to adjust
    if (negativeElementCount < elementsToSelect) {
        // There are positive numbers among the first K elements
        let potentialSwapOption1 = [0, -1, -1]; // [new_negative_val, old_positive_val, new_negative_idx]
        let potentialSwapOption2 = [0, -1, -1]; // [new_positive_val, old_negative_val, new_positive_idx]

        // Find best negative to swap with a positive from first K
        for (let i = elementsToSelect; i < totalElements; i++) {
            if (initialNumbers[i] < 0) {
                potentialSwapOption1 = [initialNumbers[i], initialNumbers[lastPositiveIndex], i];
                break;
            }
        }
        // Find best positive to swap with a negative from first K
        for (let i = elementsToSelect; i < totalElements; i++) {
            if (initialNumbers[i] > 0) {
                potentialSwapOption2 = [initialNumbers[i], initialNumbers[lastNegativeIndex], i];
                break;
            }
        }

        const option1Gain = potentialSwapOption1[0] * potentialSwapOption2[1]; // Product if we swap old_pos with new_neg
        const option2Gain = potentialSwapOption2[0] * potentialSwapOption1[1]; // Product if we swap old_neg with new_pos

        if (option1Gain >= option2Gain) {
            // Perform swap for option 1: replace initialNumbers[lastPositiveIndex] with potentialSwapOption1[0]
            const deleteCountForOption1 = potentialSwapOption1[2] - elementsToSelect;
            initialNumbers.splice(elementsToSelect, deleteCountForOption1);
            initialNumbers.splice(lastPositiveIndex, 1);
        } else {
            // Perform swap for option 2: replace initialNumbers[lastNegativeIndex] with potentialSwapOption2[0]
            const deleteCountForOption2 = potentialSwapOption2[2] - elementsToSelect;
            initialNumbers.splice(elementsToSelect, deleteCountForOption2);
            initialNumbers.splice(lastNegativeIndex, 1);
        }
        return calculateKProduct(initialNumbers, elementsToSelect, MODULUS_VALUE, SPLIT_FACTOR);

    } else {
        // All first K elements are negative
        let foundNonNegativeAfterK = false;
        let firstNonNegativeIndexAfterK = -1;

        for (let i = elementsToSelect; i < totalElements; i++) {
            if (initialNumbers[i] >= 0) {
                firstNonNegativeIndexAfterK = i;
                foundNonNegativeAfterK = true;
                break;
            }
        }

        if (foundNonNegativeAfterK) {
            // Replace initialNumbers[lastNegativeIndex] with initialNumbers[firstNonNegativeIndexAfterK]
            const deleteCountForNonNegative = firstNonNegativeIndexAfterK - elementsToSelect;
            initialNumbers.splice(elementsToSelect, deleteCountForNonNegative);
            initialNumbers.splice(lastNegativeIndex, 1);
            return calculateKProduct(initialNumbers, elementsToSelect, MODULUS_VALUE, SPLIT_FACTOR);
        } else {
            // All numbers are negative or zero. Take the K numbers with smallest absolute values (largest negative values).
            let productOfLastK = 1;
            for (let i = totalElements - 1; i >= (totalElements - elementsToSelect); i--) {
                productOfLastK = performModularMultiplication(productOfLastK, initialNumbers[i], MODULUS_VALUE, SPLIT_FACTOR);
            }
            return productOfLastK;
        }
    }
}

function performModularMultiplication(factorA, factorB, modulus, splitFactor) {
    let quotientPart, remainderPart, result;
    quotientPart = (factorB / splitFactor) | 0;
    remainderPart = factorB - (quotientPart * splitFactor);
    result = (factorA * quotientPart % modulus) * splitFactor % modulus + (factorA * remainderPart);
    result %= modulus;
    return result;
}

function adjustModuloResult(value, modulus) {
    return (value % modulus) < 0 ? (value % modulus) + 0 + (modulus < 0 ? -modulus : modulus) : (value % modulus + 0);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
