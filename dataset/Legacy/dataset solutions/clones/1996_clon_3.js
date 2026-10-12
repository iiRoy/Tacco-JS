function ensurePositiveModulo(value, modulus) {
    const result = value % modulus;
    return (result < 0) ? (result + modulus) : result;
}

function performModularMultiplication(operandA, operandB, modulus, splitFactor) {
    const quotientPart = Math.floor(operandB / splitFactor);
    const remainderPart = operandB - (quotientPart * splitFactor);

    let productTerm1 = ensurePositiveModulo(operandA * quotientPart, modulus);
    productTerm1 = ensurePositiveModulo(productTerm1 * splitFactor, modulus);
    
    const productTerm2 = ensurePositiveModulo(operandA * remainderPart, modulus);

    return ensurePositiveModulo(productTerm1 + productTerm2, modulus);
}

function computeModularPower(baseValue, exponentValue, modulus, splitFactor) {
    let currentResult = 1;
    let basePower = baseValue;

    const exponentBinaryString = exponentValue.toString(2);
    const binaryLength = exponentBinaryString.length;

    for (let bitIndex = 0; bitIndex < binaryLength; bitIndex++) {
        const currentBit = exponentBinaryString[binaryLength - 1 - bitIndex];
        if (currentBit === '1') {
            currentResult = performModularMultiplication(currentResult, basePower, modulus, splitFactor);
        }
        basePower = performModularMultiplication(basePower, basePower, modulus, splitFactor);
    }
    return currentResult;
}

function calculateFinalResult(rawInputString) {
    const MODULUS_PRIME = 1e9 + 7;
    const SPLIT_THRESHOLD = 1e5;

    const parsedLines = rawInputString.trim().split("\n");
    const firstLineParts = parsedLines[0].split(" ");
    const exponentVal = parseInt(firstLineParts[0], 10);
    const upperBound = parseInt(firstLineParts[1], 10);

    const maxKCeil = Math.ceil(upperBound);
    const powerAccumulator = Array.from({length: maxKCeil}, () => 0);

    let currentIntermediate;
    for (let loopIndex = 1; loopIndex <= upperBound; loopIndex++) {
        currentIntermediate = Math.floor(upperBound / loopIndex);
        loopIndex = Math.floor(upperBound / currentIntermediate);
        powerAccumulator[loopIndex - 1] = computeModularPower(loopIndex, exponentVal, MODULUS_PRIME, SPLIT_THRESHOLD);
    }

    const patternFrequency = Array.from({length: upperBound}, () => 0);
    let cumulativeSum = 0;

    for (let currentBase = upperBound; currentBase >= 1; currentBase--) {
        const currentDivisorLimit = Math.floor(upperBound / currentBase);

        let currentContribution = powerAccumulator[currentDivisorLimit - 1];

        for (let multiplierIndex = 2; multiplierIndex <= currentDivisorLimit; multiplierIndex++) {
            const indexToSubtract = (currentBase * multiplierIndex) - 1;
            currentContribution = ensurePositiveModulo(currentContribution - patternFrequency[indexToSubtract], MODULUS_PRIME);
        }
        
        const termToAdd = performModularMultiplication(currentBase, currentContribution, MODULUS_PRIME, SPLIT_THRESHOLD);
        cumulativeSum = ensurePositiveModulo(cumulativeSum + termToAdd, MODULUS_PRIME);

        patternFrequency[currentBase - 1] = currentContribution;
    }

    console.log(cumulativeSum);
}

(function() {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    calculateFinalResult(fileContent);
})();
