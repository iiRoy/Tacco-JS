let simulationConfig = {};

let connectionMatrix = [];

const computePath = (initialColumn, startRow = 0) => {
    const pathAccumulator = Array.from({ length: connectionMatrix.length - startRow }, (_, idx) => idx + startRow)
        .reduce((accumulator, currentRowIdx) => {
            const nextColumn = accumulator.currentColumn + connectionMatrix[currentRowIdx][accumulator.currentColumn];
            accumulator.pathSegments.push(nextColumn);
            accumulator.currentColumn = nextColumn;
            return accumulator;
        }, { currentColumn: initialColumn, pathSegments: [initialColumn] });
    return pathAccumulator.pathSegments;
};

const computeReversePath = (finalColumn) => {
    const pathAccumulator = Array.from({ length: connectionMatrix.length }, (_, idx) => connectionMatrix.length - 1 - idx)
        .reduce((accumulator, currentRowIdx) => {
            const nextColumn = accumulator.currentColumn + connectionMatrix[currentRowIdx][accumulator.currentColumn];
            accumulator.pathSegments.unshift(nextColumn);
            accumulator.currentColumn = nextColumn;
            return accumulator;
        }, { currentColumn: finalColumn, pathSegments: [finalColumn] });
    return pathAccumulator.pathSegments;
};

let inputBuffer = [];
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
    chunk.trim().split('\n').forEach((lineSegment) => {
        inputBuffer.push(lineSegment);
    });
});

process.stdin.on('end', () => {
    let finalOutcome = "";

    let currentInputLineIndex = 0;
    const parameterKeys = ["lineCount", "startColumn", "endColumn", "stepCount"];

    for (let pIdx = 0; pIdx < parameterKeys.length; pIdx++) {
        simulationConfig[parameterKeys[pIdx]] = parseInt(inputBuffer[currentInputLineIndex++]);
    }

    while (inputBuffer[currentInputLineIndex] !== "0") {
        const currentDataLine = inputBuffer[currentInputLineIndex++];
        let rowConnections = Array(simulationConfig.lineCount).fill(0);

        for (let colIdx = 0; colIdx < simulationConfig.lineCount - 1; colIdx++) {
            if (currentDataLine.charAt(colIdx) === '1') {
                rowConnections[colIdx] = 1;
                rowConnections[colIdx + 1] = -1;
            }
        }
        connectionMatrix.push(rowConnections);
    }

    simulationConfig.startColumn -= 1;
    simulationConfig.endColumn -= 1;

    const forwardPath = computePath(simulationConfig.startColumn);

    if (forwardPath[forwardPath.length - 1] === simulationConfig.endColumn) {
        console.log("0");
        return;
    }

    const backwardPath = computeReversePath(simulationConfig.endColumn);

    const switchPointRowIndex = Array.from({ length: simulationConfig.stepCount }, (_, idx) => idx)
        .findIndex(rowIndex => {
            const currentForwardColumn = forwardPath[rowIndex];
            const currentBackwardColumn = backwardPath[rowIndex];

            return Math.abs(currentForwardColumn - currentBackwardColumn) === 1 &&
                   connectionMatrix[rowIndex][currentForwardColumn] === 0 &&
                   connectionMatrix[rowIndex][currentBackwardColumn] === 0;
        });

    if (switchPointRowIndex !== -1) {
        const outputRow = switchPointRowIndex + 1;
        const outputColumn = Math.min(forwardPath[switchPointRowIndex], backwardPath[switchPointRowIndex]) + 1;
        finalOutcome = `${outputRow} ${outputColumn}`;
    } else {
        finalOutcome = "1";
    }

    console.log(finalOutcome);
});
