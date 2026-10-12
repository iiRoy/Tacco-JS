function ProcessInput(inputData) {
    const MODULUS_PRIME = 1e9 + 7;
    const SPLIT_FACTOR = 1e5;

    inputData = inputData.trim().split("\n").map(function(line) { return line.split(" "); });
    const totalElements = parseInt(inputData[0][0], 10);
    const selectionSize = parseInt(inputData[0][1], 10);
    const sourceNumbers = inputData[1].map(element => parseInt(element, 10));

    sourceNumbers.sort((a, b) => Math.abs(b) - Math.abs(a));

    const finalResult = DetermineProduct(sourceNumbers, totalElements, selectionSize, MODULUS_PRIME, SPLIT_FACTOR);
    console.log(PositiveModulo(finalResult, MODULUS_PRIME));
}

function DetermineProduct(sourceNumbers, totalElements, selectionSize, MODULUS_PRIME, SPLIT_FACTOR) {
    let currentProduct = 1;
    let negativeCount = 0;
    let smallestAbsPositiveValInK = Infinity;
    let smallestAbsNegativeValInK = -Infinity;

    for (let idx = 0; idx < selectionSize; idx++) {
        const currentVal = sourceNumbers[idx];
        currentProduct = ModularMultiply(currentProduct, currentVal, MODULUS_PRIME, SPLIT_FACTOR);
        if (currentVal < 0) {
            negativeCount++;
            if (currentVal > smallestAbsNegativeValInK) {
                smallestAbsNegativeValInK = currentVal;
            }
        } else if (currentVal > 0) {
            if (currentVal < smallestAbsPositiveValInK) {
                smallestAbsPositiveValInK = currentVal;
            }
        }
    }

    if (currentProduct === 0) return 0;
    if (selectionSize === totalElements || negativeCount % 2 === 0) return currentProduct;

    const remainingNumbers = sourceNumbers.slice(selectionSize);
    const largestAbsNegativeValOutsideK = remainingNumbers.find(num => num < 0) || null;
    const largestAbsPositiveValOutsideK = remainingNumbers.find(num => num > 0) || null;

    let finalProduct = currentProduct;

    if (negativeCount < selectionSize) {
        let swapOption1Score = null;
        let swapOption2Score = null;

        if (smallestAbsPositiveValInK !== Infinity && largestAbsNegativeValOutsideK !== null) {
            swapOption1Score = largestAbsNegativeValOutsideK * smallestAbsNegativeValInK;
        }

        if (smallestAbsNegativeValInK !== -Infinity && largestAbsPositiveValOutsideK !== null) {
            swapOption2Score = largestAbsPositiveValOutsideK * smallestAbsPositiveValInK;
        }

        if (swapOption1Score !== null && (swapOption2Score === null || swapOption1Score >= swapOption2Score)) {
            finalProduct = ModularMultiply(finalProduct, modInverse(smallestAbsPositiveValInK, MODULUS_PRIME), MODULUS_PRIME, SPLIT_FACTOR);
            finalProduct = ModularMultiply(finalProduct, largestAbsNegativeValOutsideK, MODULUS_PRIME, SPLIT_FACTOR);
        } else if (swapOption2Score !== null) {
            finalProduct = ModularMultiply(finalProduct, modInverse(smallestAbsNegativeValInK, MODULUS_PRIME), MODULUS_PRIME, SPLIT_FACTOR);
            finalProduct = ModularMultiply(finalProduct, largestAbsPositiveValOutsideK, MODULUS_PRIME, SPLIT_FACTOR);
        }
    } else {
        if (smallestAbsNegativeValInK !== -Infinity && largestAbsPositiveValOutsideK !== null) {
            finalProduct = ModularMultiply(finalProduct, modInverse(smallestAbsNegativeValInK, MODULUS_PRIME), MODULUS_PRIME, SPLIT_FACTOR);
            finalProduct = ModularMultiply(finalProduct, largestAbsPositiveValOutsideK, MODULUS_PRIME, SPLIT_FACTOR);
        } else {
            finalProduct = 1;
            sourceNumbers.slice(totalElements - selectionSize, totalElements).forEach(val => {
                finalProduct = ModularMultiply(finalProduct, val, MODULUS_PRIME, SPLIT_FACTOR);
            });
        }
    }
    return finalProduct;
}

function ModularMultiply(factorA, factorB, modulus, splitConstant) {
    const quotientB = Math.floor(factorB / splitConstant);
    const remainderB = factorB - (quotientB * splitConstant);
    let result = (factorA * quotientB % modulus) * splitConstant % modulus + (factorA * remainderB);
    result %= modulus;
    return result;
}

function power(base, exponent, modulus, splitConstant) {
    let res = 1;
    base = PositiveModulo(base, modulus);
    while (exponent > 0) {
        if (exponent % 2 === 1) res = ModularMultiply(res, base, modulus, splitConstant);
        base = ModularMultiply(base, base, modulus, splitConstant);
        exponent = Math.floor(exponent / 2);
    }
    return res;
}

function modInverse(number, modulus) {
    return power(number, modulus - 2, modulus, 1e5);
}

function PositiveModulo(value, modulus) {
    return (value % modulus + modulus) % modulus;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
