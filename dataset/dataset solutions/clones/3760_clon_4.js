function aggregateTopValues(valueStream, limit) {
    if (limit === 0) return 0;

    let topAccumulator = []; // Stores 'limit' largest values, sorted ascending.

    valueStream.forEach(currentValue => {
        if (topAccumulator.length < limit) {
            // If not yet full, find position and insert
            let insertPos = 0;
            while (insertPos < topAccumulator.length && topAccumulator[insertPos] < currentValue) {
                insertPos++;
            }
            topAccumulator.splice(insertPos, 0, currentValue);
        } else if (currentValue > topAccumulator[0]) {
            // If current value is larger than the smallest in the accumulator
            // Remove the smallest element
            topAccumulator.splice(0, 1);
            // Find insertion point for the new value
            let insertPos = 0;
            while (insertPos < topAccumulator.length && topAccumulator[insertPos] < currentValue) {
                insertPos++;
            }
            // Insert the new value at the correct position
            topAccumulator.splice(insertPos, 0, currentValue);
        }
    });

    return topAccumulator.reduce((totalSum, element) => totalSum + element, 0);
}

function processData(dataSource) {
    const dataSegments = dataSource.split('\n');
    const initialParameters = dataSegments[0].split(' ').map(Number);
    const itemQuantity = initialParameters[0];
    const selectionCount = initialParameters[1];

    const dataItems = dataSegments.slice(1, itemQuantity + 1).map(lineContent => {
        const valueComponents = lineContent.split(' ').map(Number);
        return { coordA: valueComponents[0], coordB: valueComponents[1], coordC: valueComponents[2] };
    });

    const coefficientSets = [
        { cA: 1, cB: 1, cC: 1 },
        { cA: 1, cB: 1, cC: -1 },
        { cA: 1, cB: -1, cC: 1 },
        { cA: 1, cB: -1, cC: -1 },
        { cA: -1, cB: 1, cC: 1 },
        { cA: -1, cB: 1, cC: -1 },
        { cA: -1, cB: -1, cC: 1 },
        { cA: -1, cB: -1, cC: -1 }
    ];

    const resultCollection = coefficientSets.map(coefficients => {
        const intermediateValues = dataItems.map(item => {
            return item.coordA * coefficients.cA + item.coordB * coefficients.cB + item.coordC * coefficients.cC;
        });
        return aggregateTopValues(intermediateValues, selectionCount);
    });

    const finalOutcome = Math.max(...resultCollection);

    return String(finalOutcome);
}

const obtainModule = require;
const fileSystem = obtainModule('fs');
const inputPath = '/dev/stdin';
const encodingFormat = 'utf8';

const rawInput = fileSystem.readFileSync(inputPath, encodingFormat);
const outputChannel = console;

outputChannel.log(processData(rawInput));