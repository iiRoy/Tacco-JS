"use strict";

const fetchRawInputData = () => {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
};

const initializeInputHandler = () => {
    const rawLines = fetchRawInputData();
    let currentLineIndex = 0;
    const totalLines = rawLines.length;

    const checkHasMoreLines = function() {
        return currentLineIndex < totalLines;
    };

    const retrieveNextLine = function() {
        if (!this.checkHasMoreLines()) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return rawLines[currentLineIndex++];
    };

    const inputProcessor = {
        lineList: rawLines,
        maxLines: totalLines,
        checkHasMoreLines: checkHasMoreLines,
        retrieveNextLine: retrieveNextLine
    };

    inputProcessor.readNextInt = function() {
        return parseInt(this.retrieveNextLine());
    };

    inputProcessor.readNextStringArray = function() {
        return this.retrieveNextLine().split(" ");
    };

    inputProcessor.readNextIntArray = function() {
        const stringArrayElements = this.retrieveNextLine().split(" ");
        return stringArrayElements.map(element => parseInt(element));
    };

    inputProcessor.readNextCharArray = function() {
        return this.retrieveNextLine().split("");
    };

    return inputProcessor;
};

const inputSource = initializeInputHandler();

const getNextLine = () => inputSource.retrieveNextLine();
const getNextInteger = () => inputSource.readNextInt();
const getStringArray = () => inputSource.readNextStringArray();
const getIntegerArray = () => inputSource.readNextIntArray();
const getCharacterArray = () => inputSource.readNextCharArray();
const checkAvailability = () => inputSource.checkHasMoreLines();

const displayResult = (...outputArgs) => console.log(...outputArgs);

const processApplicationLogic = () => {
    const inputNumbers = getIntegerArray();
    const valN = inputNumbers[0];
    const valM = inputNumbers[1];

    let finalAnswer;
    const doubleN = 2 * valN;

    if (valM <= doubleN) {
        const halfM = valM / 2;
        finalAnswer = Math.floor(halfM);
    } else {
        const sumOfDoubleNAndM = doubleN + valM;
        const quarterSum = sumOfDoubleNAndM / 4;
        finalAnswer = Math.floor(quarterSum);
    }
    displayResult(finalAnswer);
};

processApplicationLogic();
