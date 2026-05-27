"use strict";
function ProcessInput(rawData) {
    let inputParser = new DataStreamReader(rawData);
    let countA = inputParser.getInteger();
    let countB = inputParser.getInteger();
    const GRID_DIMENSION = 100;
    const HALF_GRID_DIMENSION = GRID_DIMENSION / 2;
    let gridMatrix = new Array(GRID_DIMENSION);
    for (let rowIndex = 0; rowIndex < HALF_GRID_DIMENSION; rowIndex++) {
        gridMatrix[rowIndex] = new Array(GRID_DIMENSION).fill('#');
    }
    for (let rowIndex = HALF_GRID_DIMENSION; rowIndex < GRID_DIMENSION; rowIndex++) {
        gridMatrix[rowIndex] = new Array(GRID_DIMENSION).fill('.');
    }
    let currentColumnA = 1;
    let currentRowA = 1;
    const COLUMN_STEP = 2;
    const ROW_ADVANCE = 3;
    let remainingA = countA;
    while (remainingA > 1) {
        remainingA--;
        gridMatrix[currentRowA][currentColumnA] = '.';
        currentColumnA += COLUMN_STEP;
        if (currentColumnA > GRID_DIMENSION) {
            gridMatrix = 1;
            currentRowA += ROW_ADVANCE;
        }
    }
    let currentColumnB = 1;
    let currentRowB = HALF_GRID_DIMENSION + 1;
    let remainingB = countB;
    while (remainingB > 1) {
        remainingB--;
        gridMatrix[currentRowB][currentColumnB] = '#';
        currentColumnB += COLUMN_STEP;
        if (currentColumnB > GRID_DIMENSION) {
            gridMatrix = 1;
            currentRowB += ROW_ADVANCE;
        }
    }
    console.log(`${GRID_DIMENSION} ${GRID_DIMENSION}`);
    for (let outputRowIndex = 0; outputRowIndex < GRID_DIMENSION; outputRowIndex++) {
        let rowContent = gridMatrix[outputRowIndex].join('');
        console.log(rowContent);
    }
}
class DataStreamReader {
    constructor(sourceText) {
        if (typeof sourceText === 'undefined') {
            throw new Error('Argument (stdin) cannot be omitted!');
        }
        this.currentIndex = 0;
        const TOKEN_SPLITTER = /\n|\s/;
        this.parsedTokens = sourceText.split(TOKEN_SPLITTER);
    }
    getInteger() {
        return Number(this.parsedTokens[this.currentIndex++]);
    }
    getIntegerArray(numElements) {
        if (typeof numElements === 'undefined') {
            throw new Error('Argument (1 or more) cannot be omitted!');
        }
        let resultCollection = new Array(numElements);
        for (let elementPos = 0; elementPos < numElements; elementPos++) {
            resultCollection[elementPos] = this.getInteger();
        }
        return resultCollection;
    }
    getString() {
        return this.parsedTokens[this.currentIndex++];
    }
    getStringArray(numElements) {
        if (typeof numElements === 'undefined') {
            throw new Error('Argument (1 or more) cannot be omitted!');
        }
        let resultCollection = new Array(numElements);
        for (let elementPos = 0; elementPos < numElements; elementPos++) {
            resultCollection[elementPos] = this.getString();
        }
        return resultCollection;
    }
}
if (typeof window === "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
