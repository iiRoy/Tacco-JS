const readline = require('readline');

let configParams = {};
let gridMatrix = [];

const constructGridRow = (rowString, totalColumns) => {
    const rowSegments = Array.from({ length: totalColumns - 1 }).reduce((acc, _, colIndex) => {
        let currentCharacterValue = parseInt(rowString.charAt(colIndex));
        if (colIndex > 0 && currentCharacterValue === 0 && acc[colIndex - 1] === 1) {
            currentCharacterValue = -1;
        }
        acc.push(currentCharacterValue);
        return acc;
    }, []);

    rowSegments.push((rowSegments[rowSegments.length - 1] === 1) ? -1 : 0);
    return rowSegments;
};

const traverseForward = (initialColumn, initialRow = 0) => {
    const pathSequence = [];

    const recursePath = (currentColumn, currentRow) => {
        if (currentRow >= gridMatrix.length) {
            pathSequence.push(currentColumn);
            return;
        }
        pathSequence.push(currentColumn);
        const nextColumn = currentColumn + gridMatrix[currentRow][currentColumn];
        recursePath(nextColumn, currentRow + 1);
    };

    recursePath(initialColumn, initialRow);
    return pathSequence;
};

const traverseBackward = (finalColumn) => {
    const pathSequence = gridMatrix.reduceRight((acc, currentRowData) => {
        const currentPositionAtPreviousRow = acc[0] - currentRowData[acc[0]];
        return [currentPositionAtPreviousRow, ...acc];
    }, [finalColumn]);

    return pathSequence;
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let lineBuffer = [];
const parameterKeys = ["lines", "start", "end", "steps"];

rl.on('line', (inputLine) => {
    lineBuffer.push(inputLine.trim());
});

rl.on('close', () => {
    let currentLineIndex = 0;

    const initialParams = {};
    parameterKeys.forEach((key, idx) => {
        initialParams[key] = parseInt(lineBuffer[idx]);
    });
    configParams = initialParams;
    currentLineIndex = parameterKeys.length;

    configParams.start -= 1;
    configParams.end -= 1;

    gridMatrix = lineBuffer.slice(currentLineIndex)
        .filter(lineContent => lineContent !== "0")
        .map(lineContent => constructGridRow(lineContent, configParams.lines));

    let outputResult = "";

    const forwardPath = traverseForward(configParams.start);
    if (forwardPath[forwardPath.length - 1] === configParams.end) {
        console.log("0");
        return;
    }

    const backwardPath = traverseBackward(configParams.end);

    const potentialInsertionRow = Array.from({ length: configParams.steps }, (_, idx) => idx)
        .find(rowIndex => {
            const fwdPos = forwardPath[rowIndex];
            const bwdPos = backwardPath[rowIndex];

            return (
                Math.abs(fwdPos - bwdPos) === 1 &&
                gridMatrix[rowIndex][fwdPos] === 0 &&
                gridMatrix[rowIndex][bwdPos] === 0
            );
        });

    if (potentialInsertionRow !== undefined) {
        const fwdPos = forwardPath[potentialInsertionRow];
        const bwdPos = backwardPath[potentialInsertionRow];
        outputResult = `${potentialInsertionRow + 1} ${Math.min(fwdPos, bwdPos) + 1}`;
    } else {
        outputResult = "1";
    }

    console.log(outputResult);
});
