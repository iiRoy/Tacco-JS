const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawData.trim().split('\n');

function processDataBlocks(remainingLines, outputCollector) {
    if (remainingLines.length === 0) {
        return;
    }

    const currentCountStr = remainingLines.shift();
    const initialCount = Number(currentCountStr);

    if (initialCount === 0) {
        return;
    }

    const primaryValuesStr = remainingLines.shift();
    const primaryValues = primaryValuesStr.split(' ').map(Number);

    const secondaryValuesStr = remainingLines.shift();
    const secondaryValues = secondaryValuesStr.split(' ').map(Number);

    const baseSum = primaryValues.reduce((accumulator, current) => accumulator + current, 0);

    const sortedSecondary = [...secondaryValues].sort((a, b) => b - a);

    let currentCumulativeSum = baseSum;
    let currentN = initialCount;

    const candidateProducts = [baseSum * initialCount];

    for (let k = 0; k < sortedSecondary.length; k++) {
        currentCumulativeSum += sortedSecondary[k];
        currentN--;
        candidateProducts.push(currentCumulativeSum * currentN);
    }

    const peakValue = Math.max(...candidateProducts);

    outputCollector.push(peakValue);

    processDataBlocks(remainingLines, outputCollector);
}

const collectedOutputs = [];
processDataBlocks(lineSegments, collectedOutputs);

collectedOutputs.forEach(result => console.log(result));
