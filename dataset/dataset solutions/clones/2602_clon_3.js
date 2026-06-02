"use strict";

const createInputReader = () => {
    const fileSystemModule = require("fs");
    const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    const trimmedContent = rawInputContent.trim();
    const lineArray = trimmedContent.split("\n");

    const outOfBoundsErrorString = "ArrayIndexOutOfBoundsException";

    const readerState = {
        lineList: lineArray,
        currentIndex: 0,
        maximumIndex: lineArray.length,
    };

    const checkHasMore = function() {
        return this.currentIndex < this.maximumIndex;
    };

    const retrieveNextLine = function() {
        if (!this.checkHasMore()) {
            throw outOfBoundsErrorString;
        }
        const currentLineValue = this.lineList[this.currentIndex];
        this.currentIndex++;
        return currentLineValue;
    };

    readerState.checkHasMore = checkHasMore;
    readerState.retrieveNextLine = retrieveNextLine;

    return readerState;
};

const globalInputReader = createInputReader();

const readNextLine = () => globalInputReader.retrieveNextLine();
const readNextInteger = () => parseInt(globalInputReader.retrieveNextLine());

const parseIntegerElement = (elementString) => parseInt(elementString);

const readNextStringArray = () => globalInputReader.retrieveNextLine().split(" ");
const readNextIntegerArray = () => globalInputReader.retrieveNextLine().split(" ").map(parseIntegerElement);
const readNextCharacterArray = () => globalInputReader.retrieveNextLine().split("");
const checkMoreInput = () => globalInputReader.checkHasMore();

const printResult = (...outputArguments) => console.log(...outputArguments);

const executeProgram = () => {
    const inputNumber = readNextInteger();
    let accumulatedSum = 0;

    const loopStartValue = 1;
    const loopConditionLimit = inputNumber; // Loop runs while currentVal < inputNumber

    for (let currentVal = loopStartValue; currentVal < loopConditionLimit; currentVal++) {
        accumulatedSum += currentVal;
    }

    const finalCalculatedValue = accumulatedSum;
    printResult(finalCalculatedValue);
};

executeProgram();
