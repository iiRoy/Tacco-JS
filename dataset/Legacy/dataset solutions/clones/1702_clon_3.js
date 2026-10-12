function parseInputData(rawInputString) {
    const lines = rawInputString.trim().split("\n").map(function(line) { return line.split(" "); });
    const totalElements = parseInt(lines[0][0], 10);
    const selectionCount = parseInt(lines[0][1], 10);
    const numbersArray = lines[1].map(element => parseInt(element, 10));
    return { totalElements, selectionCount, numbersArray };
}

function modularMultiply(operandA, operandB, modulusValue, splitFactor) {
    const quotientPart = Math.floor(operandB / splitFactor);
    const remainderPart = operandB - (quotientPart * splitFactor);
    let result = (operandA * quotientPart % modulusValue) * splitFactor % modulusValue + (operandA * remainderPart);
    result %= modulusValue;
    return result;
}

function normalizeModulo(value, modulus) {
    const remainder = value % modulus;
    return remainder < 0 ? (remainder + modulus) : remainder;
}

function computeSubsetProduct(numbers, count, modulusValue, splitFactor) {
    let currentProduct = 1;
    for (let i = 0; i < count; i++) {
        currentProduct = modularMultiply(currentProduct, numbers[i], modulusValue, splitFactor);
        if (currentProduct === 0) return 0;
    }
    return currentProduct;
}

function findFirstNegativeAfterIndex(arr, startIndex) {
    for (let i = startIndex; i < arr.length; i++) {
        if (arr[i] < 0) return { value: arr[i], index: i };
    }
    return null;
}

function findFirstPositiveAfterIndex(arr, startIndex) {
    for (let i = startIndex; i < arr.length; i++) {
        if (arr[i] > 0) return { value: arr[i], index: i };
    }
    return null;
}

function calculateProduct(numbersArray, totalElements, selectionCount, modulusValue, splitFactor) {
    let productResult = 1;
    let negativeCount = 0;
    let lastPositiveIdx = -1;
    let lastNegativeIdx = -1;

    numbersArray.sort((a, b) => Math.abs(b) - Math.abs(a));

    for (let i = 0; i < selectionCount; i++) {
        productResult = modularMultiply(productResult, numbersArray[i], modulusValue, splitFactor);
        if (productResult === 0) return 0;

        if (numbersArray[i] > 0) {
            lastPositiveIdx = i;
        } else if (numbersArray[i] < 0) {
            lastNegativeIdx = i;
            negativeCount++;
        }
    }

    if (selectionCount === totalElements) {
        return productResult;
    }

    if (negativeCount % 2 === 0) {
        return productResult;
    }

    if (negativeCount < selectionCount) {
        const newNegCandidate = findFirstNegativeAfterIndex(numbersArray, selectionCount);
        const newPosCandidate = findFirstPositiveAfterIndex(numbersArray, selectionCount);

        let chosenK_elements = numbersArray.slice(0, selectionCount);

        const oldPosVal = numbersArray[lastPositiveIdx];
        const oldNegVal = numbersArray[lastNegativeIdx];

        if (newPosCandidate === null) {
            if (newNegCandidate !== null) {
                chosenK_elements[lastPositiveIdx] = newNegCandidate.value;
            }
        } else if (newNegCandidate === null) {
            chosenK_elements[lastNegativeIdx] = newPosCandidate.value;
        } else {
            if (BigInt(newNegCandidate.value) * BigInt(oldNegVal) >= BigInt(newPosCandidate.value) * BigInt(oldPosVal)) {
                chosenK_elements[lastPositiveIdx] = newNegCandidate.value;
            } else {
                chosenK_elements[lastNegativeIdx] = newPosCandidate.value;
            }
        }
        productResult = computeSubsetProduct(chosenK_elements, selectionCount, modulusValue, splitFactor);
        return productResult;

    } else {
        const newPosCandidate = findFirstPositiveAfterIndex(numbersArray, selectionCount);

        if (newPosCandidate !== null) {
            let chosenK_elements = numbersArray.slice(0, selectionCount);
            chosenK_elements[lastNegativeIdx] = newPosCandidate.value;
            productResult = computeSubsetProduct(chosenK_elements, selectionCount, modulusValue, splitFactor);
            return productResult;
        } else {
            let chosenK_elements = numbersArray.slice(totalElements - selectionCount, totalElements);
            productResult = computeSubsetProduct(chosenK_elements, selectionCount, modulusValue, splitFactor);
            return productResult;
        }
    }
}

function ProcessInput(rawData) {
    const MOD_VAL = 1e+9 + 7;
    const SPLIT_FACTOR = 1e+5;

    const { totalElements, selectionCount, numbersArray } = parseInputData(rawData);

    const finalProduct = calculateProduct(numbersArray, totalElements, selectionCount, MOD_VAL, SPLIT_FACTOR);
    console.log(normalizeModulo(finalProduct, MOD_VAL));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
