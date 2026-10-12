"use strict";
const establishInputSource = () => {
    const rawLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    let currentLineIndex = 0;
    const totalLines = rawLines.length;
    const inputMethods = {
        acquireLine: () => {
            if (currentLineIndex >= totalLines) {
                throw "ArrayIndexOutOfBoundsException";
            }
            return rawLines[currentLineIndex++];
        },
        parseLineAsInteger: () => parseInt(inputMethods.acquireLine()),
        splitLineIntoStrings: () => inputMethods.acquireLine().split(" "),
        parseLineAsIntegerArray: () => inputMethods.acquireLine().split(" ").map(Number),
        extractLineCharacters: () => inputMethods.acquireLine().split(""),
        hasMoreInput: () => currentLineIndex < totalLines
    };
    return inputMethods;
};
const inputProcessor = establishInputSource();
const acquireLine = () => inputProcessor.acquireLine();
const parseLineAsInteger = () => inputProcessor.parseLineAsInteger();
const parseLineAsIntegerArray = () => inputProcessor.parseLineAsIntegerArray();
const extractLineCharacters = () => inputProcessor.extractLineCharacters();
const hasMoreInput = () => inputProcessor.hasMoreInput();
const displayResult = (...args) => console.log(...args);
const findMaxIndexForTime = (timeArray, availableTime) => {
    let lowBound = 0;
    let highBound = timeArray.length - 1;
    let bestIndex = 0;
    while (lowBound <= highBound) {
        const midPoint = Math.floor((lowBound + highBound) / 2);
        if (timeArray[midPoint] <= availableTime) {
            bestIndex = midPoint;
            lowBound = midPoint + 1;
        } else {
            highBound = midPoint - 1;
        }
    }
    return bestIndex;
};
const executeCalculation = () => {
    const [countA, countB, timeLimit] = parseLineAsIntegerArray();
    const booksA = parseLineAsIntegerArray();
    const booksB = parseLineAsIntegerArray();
    const cumulativeSumsA = booksA.reduce((accumulator, currentBookTime) => {
        accumulator.push(accumulator[accumulator.length - 1] + currentBookTime);
        return accumulator;
    }, [0]);
    const cumulativeSumsB = booksB.reduce((accumulator, currentBookTime) => {
        accumulator.push(accumulator[accumulator.length - 1] + currentBookTime);
        return accumulator;
    }, [0]);
    let maximumCombinedBooks = 0;
    for (let i = 0; i <= countA; i++) {
        const timeSpentA = cumulativeSumsA[i];
        if (timeSpentA > timeLimit) {
            break;
        }
        const remainingTime = timeLimit - timeSpentA;
        const j = findMaxIndexForTime(cumulativeSumsB, remainingTime);
        maximumCombinedBooks = Math.max(maximumCombinedBooks, i + j);
    }
    displayResult(maximumCombinedBooks);
};
executeCalculation();
