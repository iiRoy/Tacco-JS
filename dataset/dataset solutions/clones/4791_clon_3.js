"use strict";
const fileSystem = require("fs");
const initializeInputReader = () => {
    const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    const processedInputLines = rawInputContent.trim().split("\n");
    const hasMoreLines = function() {
        return this.currentLineIndex < this.totalLines;
    };
    const getNextLine = function() {
        if (!this.hasMoreLines()) {
            throw "ArrayIndexOutOfBoundsException";
        }
        const lineToReturn = this.dataLines[this.currentLineIndex];
        this.currentLineIndex++;
        return lineToReturn;
    };
    const readerInstance = {
        "dataLines": processedInputLines,
        "currentLineIndex": 0,
        "totalLines": processedInputLines.length,
        "hasMoreLines": hasMoreLines,
        "getNextLine": getNextLine
    };
    return readerInstance;
};
const inputReader = initializeInputReader();
const readNextLine = () => inputReader.getNextLine();
const readNextInt = () => parseInt(inputReader.getNextLine(), 10);
const readNextStringArray = () => inputReader.getNextLine().split(" ");
const readNextIntArray = () => {
    const stringElements = inputReader.getNextLine().split(" ");
    return stringElements.map(element => parseInt(element, 10));
};
const readNextCharArray = () => inputReader.getNextLine().split("");
const canReadMore = () => inputReader.hasMoreLines();
const printOutput = (...args) => console.log(...args);
const executeMainLogic = () => {
    const [valX, valY] = readNextIntArray();
    const absoluteX = Math.abs(valX);
    const absoluteY = Math.abs(valY);
    let resultValue = Math.abs(absoluteX - absoluteY);
    let shouldIncrementByOne = false;
    let shouldIncrementByTwo = false;
    if (valX * valY < 0) {
        shouldIncrementByOne = true;
    } else if ((valX > 0 && valY === 0) || (valX === 0 && valY < 0)) {
        shouldIncrementByOne = true;
    } else if (valX < valY) {
        shouldIncrementByTwo = true;
    }
    if (shouldIncrementByOne) {
        resultValue += 1;
    } else if (shouldIncrementByTwo) {
        resultValue += 2;
    }
    printOutput(resultValue);
};
executeMainLogic();
