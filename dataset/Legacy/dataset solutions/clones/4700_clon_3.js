"use strict"
const initializeInputReader = () => {
    const inputFilePath = "/dev/stdin";
    const rawData = require("fs").readFileSync(inputFilePath, "utf8").trim().split("\n");
    const readerInstance = {};
    readerInstance.dataLines = rawData;
    readerInstance.currentLineIndex = 0;
    readerInstance.totalLines = rawData.length;
    const checkNextAvailability = function () {
        return this.currentLineIndex < this.totalLines;
    };
    readerInstance.canReadNext = checkNextAvailability;
    const retrieveNextLine = function () {
        if (!this.canReadNext()) {
            throw "ArrayIndexOutOfBoundsException";
        }
        const lineToReturn = this.dataLines[this.currentLineIndex];
        this.currentLineIndex++;
        return lineToReturn;
    };
    readerInstance.readNextLine = retrieveNextLine;
    return readerInstance;
};
const inputReader = initializeInputReader();
const getNextLine = () => inputReader.readNextLine();
const parseStringToInt = (str) => parseInt(str, 10);
const getNextInt = () => parseStringToInt(inputReader.readNextLine());
const getNextStringArray = () => inputReader.readNextLine().split(" ");
const getNextIntArray = () => {
    const stringElements = inputReader.readNextLine().split(" ");
    return stringElements.map(elementString => parseStringToInt(elementString));
};
const getNextCharArray = () => inputReader.readNextLine().split("");
const hasMoreLines = () => inputReader.canReadNext();
const printOutput = (...outputArgs) => console.log(...outputArgs);
const calculateFinalAnswer = (nValue, mValue) => {
    const doubleN = 2 * nValue;
    let result;
    if (mValue <= doubleN) {
        result = Math.floor(mValue / 2);
    } else {
        const sumOfTwoNAndM = doubleN + mValue;
        result = Math.floor(sumOfTwoNAndM / 4);
    }
    return result;
};
const executeMainLogic = () => {
    const dimensions = getNextIntArray();
    const valN = dimensions[0];
    const valM = dimensions[1];
    const calculatedResult = calculateFinalAnswer(valN, valM);
    printOutput(calculatedResult);
};
executeMainLogic();
