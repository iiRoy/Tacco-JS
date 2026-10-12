'use strict';

function processInputAndDetermineOutcome(sourceContent) {
    const processedLines = sourceContent.trim().split('\n');

    const [firstDimension, secondDimension] = processedLines[0].split(' ').map(Number);

    const numericValues = processedLines[1].split(' ').map(Number).sort((aVal, bVal) => bVal - aVal);

    let cumulativeTotal = 0;
    for (const item of numericValues) {
        cumulativeTotal += item;
    }

    const thresholdDivisor = 4 * secondDimension;
    const comparisonValue = cumulativeTotal / thresholdDivisor;

    const conditionMetForAny = numericValues.slice(0, secondDimension).some(
        (currentValue) => currentValue < comparisonValue
    );

    const finalVerdict = conditionMetForAny ? "No" : "Yes";

    console.log(finalVerdict);
}

processInputAndDetermineOutcome(require('fs').readFileSync('/dev/stdin', 'utf8'));
