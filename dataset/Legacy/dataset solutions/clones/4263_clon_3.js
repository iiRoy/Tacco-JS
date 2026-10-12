let inputLines = [];
const inputReaderModule = require('readline');

const lineInterface = inputReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineInterface.on('line', function (currentInputLine) {
    inputLines.push(currentInputLine);
});

lineInterface.on('close', function () {
    const modulusValue = Number(inputLines[0]);
    const MAX_DISTANCE = Infinity;

    let distGraph = [];
    for (let rowIdx = 0; rowIdx < modulusValue; rowIdx++) {
        let currentRow = [];
        for (let colIdx = 0; colIdx < modulusValue; colIdx++) {
            currentRow.push(MAX_DISTANCE);
        }
        distGraph.push(currentRow);
    }

    for (let idx = 0; idx < modulusValue; idx++) {
        distGraph[idx][idx] = 0;
    }

    for (let idx = 0; idx < modulusValue; idx++) {
        const nextNodeIndex = (idx + 1) % modulusValue;
        const tenTimesNodeIndex = (idx * 10) % modulusValue;

        distGraph[idx][nextNodeIndex] = 1;
        distGraph[idx][tenTimesNodeIndex] = 0;
    }

    const initialPosition = 1;
    const finalPosition = 0;

    for (let i = 0; i < modulusValue; i++) {
        for (let j = 0; j < modulusValue; j++) {
            for (let k = 0; k < modulusValue; k++) {
                const pathThroughIntermediate = distGraph[j][i] + distGraph[i][k];
                distGraph[j][k] = Math.min(distGraph[j][k], pathThroughIntermediate);
            }
        }
    }
    console.log(distGraph[initialPosition][finalPosition] + 1);
});
