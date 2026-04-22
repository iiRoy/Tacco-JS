const { createInterface } = require('readline');

const processInputData = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let collectedNumericalLines = [];

processInputData.on('line', (dataLine) => {
    const parsedValue = Number(dataLine.trim());
    if (!isNaN(parsedValue)) {
        collectedNumericalLines.push(parsedValue);
    }
});

processInputData.on('close', () => {
    let positionTracker = 0;
    while (positionTracker < collectedNumericalLines.length) {
        const currentNumericalValue = collectedNumericalLines[positionTracker++];
        if (currentNumericalValue === 0) {
            break;
        }
        if (currentNumericalValue === 1) {
            console.log("");
            continue;
        }

        const calculatedResults = computeModuloRelationships(currentNumericalValue);
        calculatedResults.forEach(outputValue => console.log(outputValue));
    }
});

function computeModuloRelationships(moduloLimit) {
    const distinctResidues = new Set();
    for (let index = 1; index < moduloLimit; index++) {
        distinctResidues.add((index * index) % moduloLimit);
    }
    const sortedResidueList = Array.from(distinctResidues).sort((a, b) => a - b);

    const effectiveHalfRange = Math.floor((moduloLimit - 1) / 2);

    const allCalculatedDistances = sortedResidueList.flatMap((valueA, indexA) =>
        sortedResidueList.slice(indexA + 1).map(valueB => {
            const rawDifference = Math.abs(valueA - valueB);
            return Math.min(rawDifference, moduloLimit - rawDifference);
        })
    );

    const distanceTally = allCalculatedDistances.reduce((accumulatorMap, currentDistance) => {
        if (currentDistance > 0 && currentDistance <= effectiveHalfRange) {
            accumulatorMap.set(currentDistance, (accumulatorMap.get(currentDistance) || 0) + 1);
        }
        return accumulatorMap;
    }, new Map());

    const finalOutputCollection = [];
    for (let rangeKey = 1; rangeKey <= effectiveHalfRange; rangeKey++) {
        finalOutputCollection.push((distanceTally.get(rangeKey) || 0) * 2);
    }
    return finalOutputCollection;
}