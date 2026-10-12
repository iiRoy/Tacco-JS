const readline = require('readline');

const processInputData = (inputLines) => {
    const arraySize = parseInt(inputLines[0], 10);
    const initialElements = inputLines[1].split(' ').map(Number);

    const indexedOriginalValues = initialElements.map((valueAtOriginalIndex, originalPosition) => ({ value: valueAtOriginalIndex, sourcePosition: originalPosition }));

    const sortedIndexedValues = [...indexedOriginalValues].sort((itemA, itemB) => {
        if (itemA.value !== itemB.value) {
            return itemA.value - itemB.value;
        }
        return itemA.sourcePosition - itemB.sourcePosition;
    });

    const destinationMapping = Array(arraySize);
    for (let currentSourcePosition = 0; currentSourcePosition < arraySize; currentSourcePosition++) {
        const finalPosition = sortedIndexedValues.findIndex(item => item.sourcePosition === currentSourcePosition);
        destinationMapping[currentSourcePosition] = finalPosition;
    }

    let totalCostAccumulator = 0;
    const visitedFlags = Array(arraySize).fill(false);

    for (let cycleStartPoint = 0; cycleStartPoint < arraySize; cycleStartPoint++) {
        if (!visitedFlags[cycleStartPoint]) {
            let currentTraversalPoint = cycleStartPoint;
            const cycleElementValues = [];
            let cyclePathLength = 0;
            let minimumCycleElement = Infinity;

            while (!visitedFlags[currentTraversalPoint]) {
                visitedFlags[currentTraversalPoint] = true;
                const valueAtCurrentPoint = initialElements[currentTraversalPoint];
                cycleElementValues.push(valueAtCurrentPoint);
                minimumCycleElement = Math.min(minimumCycleElement, valueAtCurrentPoint);
                currentTraversalPoint = destinationMapping[currentTraversalPoint];
                cyclePathLength++;
            }

            if (cyclePathLength > 1) {
                const sumOfCycleElements = cycleElementValues.reduce((sum, val) => sum + val, 0);
                totalCostAccumulator += sumOfCycleElements + (cyclePathLength - 2) * minimumCycleElement;
            }
        }
    }

    console.log(totalCostAccumulator);
};

const inputReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const linesCollected = [];
inputReader.on('line', (dataLine) => {
    linesCollected.push(dataLine);
});

inputReader.on('close', () => {
    processInputData(linesCollected);
});