const findGreatestCommonDivisor = (firstElement, secondElement) => {
    if (secondElement === 0) {
        return firstElement;
    }
    return findGreatestCommonDivisor(secondElement, firstElement % secondElement);
};

const computeLeastCommonMultiple = (valueA, valueB) => {
    if (valueA === 0 || valueB === 0) return 0;
    return (Math.abs(valueA * valueB) / findGreatestCommonDivisor(valueA, valueB));
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputContent.trim().split('\n');
let linePointer = 0;

while (true) {
    const currentDataSetSize = parseInt(processedInputLines[linePointer++], 10);

    if (currentDataSetSize === 0) {
        break;
    }

    const currentDataSetLines = processedInputLines.slice(linePointer, linePointer + currentDataSetSize);
    linePointer += currentDataSetSize;

    const reducedFractionPairs = currentDataSetLines.map(lineText => {
        const parts = lineText.split(' ');
        const num1 = parseInt(parts[0], 10);
        const num2 = parseInt(parts[1], 10);
        const commonFactor = findGreatestCommonDivisor(num1, num2);
        return [num1 / commonFactor, num2 / commonFactor];
    });

    const aggregatedDenominatorLCM = reducedFractionPairs
        .map(pair => pair[1])
        .reduce((accumulator, currentDenominator) => computeLeastCommonMultiple(accumulator, currentDenominator), 1);

    const normalizedNumeratorValues = reducedFractionPairs.map(pair => {
        return pair[0] * (aggregatedDenominatorLCM / pair[1]);
    });

    const finalResultantLCM = normalizedNumeratorValues
        .reduce((accumulator, currentNormalizedValue) => computeLeastCommonMultiple(accumulator, currentNormalizedValue), 1);

    normalizedNumeratorValues.forEach(valueToDivide => {
        console.log(finalResultantLCM / valueToDivide);
    });
}