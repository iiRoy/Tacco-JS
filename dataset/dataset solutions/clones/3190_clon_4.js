'use strict';

function processInputAndCalculate(sourceText) {
    const processedLines = sourceText.trim().split('\n');

    const totalItems = Number(processedLines[0].split(' ')[0]);
    const entityMeasures = processedLines[1].split(' ').map(Number).sort((valA, valB) => valA - valB);

    const computeGreatestCommonDivisor = (firstOperand, secondOperand) => {
        while (secondOperand !== 0) {
            const remainder = firstOperand % secondOperand;
            firstOperand = secondOperand;
            secondOperand = remainder;
        }
        return firstOperand;
    };

    let smallestFactor;

    if (totalItems < 2) {
        smallestFactor = Number.MAX_SAFE_INTEGER;
    } else {
        const pairStartIndices = Array.from({ length: totalItems - 1 }, (_, k) => k);

        smallestFactor = pairStartIndices.reduce((currentMinimum, currentIndex) => {
            const currentEntity = entityMeasures[currentIndex];
            const nextEntity = entityMeasures[currentIndex + 1];
            const pairDivisor = computeGreatestCommonDivisor(currentEntity, nextEntity);
            return Math.min(currentMinimum, pairDivisor);
        }, Number.MAX_SAFE_INTEGER);
    }

    console.log(smallestFactor);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
