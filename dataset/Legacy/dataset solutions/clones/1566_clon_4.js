const readline = require('readline');

const inputReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let collectedLines = [];
inputReader.on('line', (currentLine) => {
    collectedLines.push(currentLine);
});

inputReader.on('close', () => {
    processAllInput(collectedLines);
});

function processAllInput(sourceLines) {
    const mutableLines = [...sourceLines];

    const [matrixHeight, matrixWidth] = mutableLines.shift().split(/\s/).map(Number);
    const relevantRanges = mutableLines.slice(0, matrixHeight).map(lineContent =>
        lineContent.split(/\s/).map(numericValue => Number(numericValue) - 1)
    );

    console.log(matrixHeight, matrixWidth, relevantRanges);

    const MAX_THRESHOLD = 5e5;
    const INITIAL_LEFT_MARKER = 1e6;

    const finalColumnAccumulation = relevantRanges.reduce((currentColumnState, currentRangePair, rowIndex) => {
        let rowIterationLeftTracker = INITIAL_LEFT_MARKER;

        const [nextColumnState, finalRowIterationLeftTracker] = Array.from({ length: matrixWidth }, (_, columnIndex) => columnIndex)
            .reduce(([accumulatorColumnState, accumulatorLeftTracker], columnIndex) => {
                let updatedColumnState = [...accumulatorColumnState];
                let updatedLeftTracker = accumulatorLeftTracker;

                if (accumulatorColumnState[columnIndex] > MAX_THRESHOLD && accumulatorLeftTracker > MAX_THRESHOLD) {
                    return [updatedColumnState, updatedLeftTracker];
                }

                const [rangeStartBound, rangeEndBound] = currentRangePair;

                if (columnIndex < rangeStartBound || columnIndex > rangeEndBound) {
                    updatedColumnState[columnIndex]++;
                    updatedLeftTracker = Math.min(accumulatorLeftTracker, updatedColumnState[columnIndex]);
                } else if (accumulatorLeftTracker > MAX_THRESHOLD) {
                    updatedColumnState[columnIndex] = INITIAL_LEFT_MARKER;
                } else {
                    updatedLeftTracker++;
                    updatedColumnState[columnIndex] = updatedLeftTracker;
                }
                return [updatedColumnState, updatedLeftTracker];
            }, [currentColumnState, rowIterationLeftTracker]);

        console.log(nextColumnState);

        if (nextColumnState.some(value => value < MAX_THRESHOLD)) {
            console.log(nextColumnState.reduce((minimumFound, currentValue) => Math.min(minimumFound, currentValue), MAX_THRESHOLD));
        } else {
            console.log(-1);
        }

        return nextColumnState;
    }, new Array(matrixWidth).fill(0));
}
