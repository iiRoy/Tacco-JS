'use strict';

const acquireInputData = () => {
    return require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
};

const parseNumericLine = (lineString) => {
    return lineString.split(' ').map(Number);
};

class InputLineManager {
    constructor(lines) {
        this.lines = lines;
        this.currentIndex = 0;
    }

    fetchNextLine() {
        if (this.currentIndex >= this.lines.length) {
            return null;
        }
        return this.lines[this.currentIndex++];
    }
}

const compareColumnScores = (colIdentifierA, colIdentifierB, scoresMap) => {
    const scoreA = scoresMap[colIdentifierA];
    const scoreB = scoresMap[colIdentifierB];

    if (scoreA === scoreB) {
        return Number(colIdentifierA) - Number(colIdentifierB);
    }
    return scoreB - scoreA;
};

const allInputLines = acquireInputData();
const inputLineManager = new InputLineManager(allInputLines);

while (true) {
    const currentDimensionsLine = inputLineManager.fetchNextLine();
    const questionnaireDimensions = parseNumericLine(currentDimensionsLine);

    const numRows = questionnaireDimensions[0];
    const numCols = questionnaireDimensions[1];

    if (numRows === 0 && numCols === 0) {
        break;
    }

    const columnTotalScores = {};
    for (let k = 1; k <= numCols; k++) {
        columnTotalScores[k] = 0;
    }

    for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
        const currentRowString = inputLineManager.fetchNextLine();
        const currentRowScores = parseNumericLine(currentRowString);

        for (let colIdx = 0; colIdx < numCols; colIdx++) {
            const currentColumnKey = colIdx + 1;
            columnTotalScores[currentColumnKey] += currentRowScores[colIdx];
        }
    }

    const columnKeys = Object.keys(columnTotalScores);
    columnKeys.sort((colIdentifierA, colIdentifierB) =>
        compareColumnScores(colIdentifierA, colIdentifierB, columnTotalScores)
    );

    console.log(columnKeys.join(' '));
}
