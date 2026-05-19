"use strict";
const createInputProcessor = () => {
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8").trim();
    const processedLines = rawInputData.split("\n");
    const inputSource = {
        "lineBuffer": processedLines,
        "currentPosition": 0,
        "totalLinesCount": processedLines.length,
        "hasMoreData": function () {
            return this.currentPosition < this.totalLinesCount;
        },
        "retrieveNextLine": function () {
            if (!this.hasMoreData()) {
                throw new Error("InputProcessor: Array Index Out Of Bounds");
            } else {
                return this.lineBuffer[this.currentPosition++];
            }
        }
    };
    return inputSource;
};
const globalInputReader = createInputProcessor();
const getNextInputLine = () => globalInputReader.retrieveNextLine();
const parseNextInteger = () => parseInt(globalInputReader.retrieveNextLine());
const getNextStringArray = () => globalInputReader.retrieveNextLine().split(" ");
const getNextIntegerArray = () => globalInputReader.retrieveNextLine().split(" ").map(val => parseInt(val));
const getNextCharacterArray = () => globalInputReader.retrieveNextLine().split("");
const checkHasMoreInput = () => globalInputReader.hasMoreData();
const displayResult = (...outputArgs) => console.log(...outputArgs);
const executeProcessingLogic = () => {
    let numElements = parseNextInteger();
    let firstValues = [];
    let secondValues = [];
    const readAllPairs = () => {
        while (checkHasMoreInput()) {
            let currentPair = getNextIntegerArray();
            firstValues.push(currentPair[0]);
            secondValues.push(currentPair[1]);
        }
    };
    readAllPairs();
    let totalCount = 0;
    for (let loopIndex = numElements - 1; loopIndex >= 0; loopIndex--) {
        let currentDivisor = secondValues[loopIndex];
        let currentSum = firstValues[loopIndex] + totalCount;
        if (currentSum % currentDivisor === 0) {
            continue;
        } else {
            totalCount += currentDivisor - (currentSum % currentDivisor);
        }
    }
    displayResult(totalCount);
};
executeProcessingLogic();
