const performModularMultiplication = (firstOperand, secondOperand, currentModulus) => {
    let outcome = 0;
    firstOperand = Number(firstOperand) % currentModulus;
    secondOperand = Number(secondOperand);
    while (secondOperand > 0) {
        if (secondOperand % 2 === 1) {
            outcome = (outcome + firstOperand) % currentModulus;
        }
        firstOperand = (firstOperand * 2) % currentModulus;
        secondOperand = Math.floor(secondOperand / 2);
    }
    return outcome;
};

const computeModularExponentiation = (baseValue, exponentValue, currentModulus) => {
    let finalResult = 1;
    baseValue = Number(baseValue) % currentModulus;
    exponentValue = Number(exponentValue);
    while (exponentValue > 0) {
        if (exponentValue % 2 === 1) {
            finalResult = performModularMultiplication(finalResult, baseValue, currentModulus);
        }
        baseValue = performModularMultiplication(baseValue, baseValue, currentModulus);
        exponentValue = Math.floor(exponentValue / 2);
    }
    return finalResult;
};

const MODULUS_CONSTANT = 998244353;

const processInputAndCalculate = (rawInputText) => {
    const textLines = rawInputText.replace(/^\s+|\s+$/g, '').split(/\r?\n/);
    const numberOfEntries = Number(textLines[0]);
    const measurementDepths = textLines[1].split(/\s+/).map(Number);

    if (measurementDepths[0] !== 0) {
        return "0";
    }

    let highestDepthValue = 0;
    const occurrenceMap = new Map();
    occurrenceMap.set(0, 1);

    for (let entryIndex = 1; entryIndex < numberOfEntries; ++entryIndex) {
        const currentMeasurement = measurementDepths[entryIndex];
        if (currentMeasurement === 0) {
            return "0";
        }
        occurrenceMap.set(currentMeasurement, (occurrenceMap.get(currentMeasurement) || 0) + 1);
        if (currentMeasurement > highestDepthValue) {
            highestDepthValue = currentMeasurement;
        }
    }

    let aggregatedProduct = 1;

    for (let currentLevelIndex = 1; currentLevelIndex <= highestDepthValue; ++currentLevelIndex) {
        const countAtPreviousLevel = occurrenceMap.get(currentLevelIndex - 1);
        const countAtCurrentLevel = occurrenceMap.get(currentLevelIndex);

        if (countAtPreviousLevel === undefined || countAtCurrentLevel === undefined) {
            return "0";
        }

        const powerTerm = computeModularExponentiation(countAtPreviousLevel, countAtCurrentLevel, MODULUS_CONSTANT);
        aggregatedProduct = performModularMultiplication(aggregatedProduct, powerTerm, MODULUS_CONSTANT);
    }

    return String(aggregatedProduct);
};

process.stdout.write(processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8')));