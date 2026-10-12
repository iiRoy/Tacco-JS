let configParams = {};

let ladderGrid = [];

const computeForwardPath = (currentRow, currentColumn, pathAccumulator) => {
    if (currentRow >= ladderGrid.length) {
        return pathAccumulator;
    }
    const nextColumn = currentColumn + ladderGrid[currentRow][currentColumn];
    return computeForwardPath(currentRow + 1, nextColumn, [...pathAccumulator, nextColumn]);
};

const computeReversePath = (currentRow, currentColumn, pathAccumulator) => {
    if (currentRow < 0) {
        return pathAccumulator;
    }
    const previousColumn = currentColumn - ladderGrid[currentRow][currentColumn];
    return computeReversePath(currentRow - 1, previousColumn, [...pathAccumulator, previousColumn]);
};

let inputLinesBuffer = [];
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
    chunk.trim().split('\n').forEach((line) => {
        inputLinesBuffer.push(line);
    });
});

process.stdin.on('end', () => {
    let solutionOutput = "";
    let currentLineIdx = 0;

    const paramKeys = ["lines", "start", "end", "steps"];
    for (let i = 0; i < paramKeys.length; i++) {
        const currentLineText = inputLinesBuffer[currentLineIdx++];
        if (currentLineText === "0") break;
        configParams[paramKeys[i]] = parseInt(currentLineText);
    }

    ladderGrid = [];
    while (currentLineIdx < inputLinesBuffer.length) {
        const currentLineText = inputLinesBuffer[currentLineIdx++];
        if (currentLineText === "0") break;

        const ladderGridRow = Array(configParams.lines).fill(0);
        for (let colIdx = 0; colIdx < configParams.lines - 1; colIdx++) {
            if (currentLineText.charAt(colIdx) === '1') {
                ladderGridRow[colIdx] = 1;
                ladderGridRow[colIdx + 1] = -1;
            }
        }
        ladderGrid.push(ladderGridRow);
    }

    configParams.start -= 1;
    configParams.end -= 1;

    const startPath = computeForwardPath(0, configParams.start, [configParams.start]);

    if (startPath[startPath.length - 1] === configParams.end) {
        console.log("0");
        return;
    }

    const goalPathRaw = computeReversePath(ladderGrid.length - 1, configParams.end, [configParams.end]);
    const goalPath = goalPathRaw.reverse();

    const stepIndices = Array.from({ length: configParams.steps }, (_, i) => i);

    const foundStepIndex = stepIndices.findIndex((stepIndex) => {
        const currentStartCol = startPath[stepIndex];
        const currentGoalCol = goalPath[stepIndex];

        return (
            Math.abs(currentStartCol - currentGoalCol) === 1 &&
            ladderGrid[stepIndex][currentStartCol] === 0 &&
            ladderGrid[stepIndex][currentGoalCol] === 0
        );
    });

    if (foundStepIndex !== -1) {
        solutionOutput = `${foundStepIndex + 1} ${Math.min(startPath[foundStepIndex], goalPath[foundStepIndex]) + 1}`;
    } else {
        solutionOutput = "1";
    }

    console.log(solutionOutput);
});
