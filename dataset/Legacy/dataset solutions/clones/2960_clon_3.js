"use strict";

const fileSystem = require("fs");

class InputReader {
    constructor() {
        const rawData = fileSystem.readFileSync("/dev/stdin", "utf8").trim().split("\n");
        this.dataLines = rawData;
        this.currentLineIndex = 0;
        this.totalLines = rawData.length;
    }

    hasMoreLines() {
        return this.currentLineIndex < this.totalLines;
    }

    getNextLine() {
        const outOfBoundsError = "ArrayIndexOutOfBoundsException";
        if (!this.hasMoreLines()) {
            throw outOfBoundsError;
        } else {
            const lineContent = this.dataLines[this.currentLineIndex];
            this.currentLineIndex++;
            return lineContent;
        }
    }
}

const inputReaderInstance = new InputReader();

const readNextLine = () => inputReaderInstance.getNextLine();
const readNextInt = () => {
    const lineValue = readNextLine();
    return parseInt(lineValue, 10);
};
const readNextStringArray = () => readNextLine().split(" ");
const readNextIntArray = () => {
    const parseInteger = (str) => parseInt(str, 10);
    return readNextLine().split(" ").map(parseInteger);
};
const readNextCharArray = () => readNextLine().split("");
const canReadMore = () => inputReaderInstance.hasMoreLines();

const printOutput = (...args) => console.log(...args);

const calculateDoublingSteps = (initialValue, targetThreshold) => {
    let currentN = initialValue;
    let doublingCount = 0;

    while (currentN > targetThreshold) {
        const doubledValue = currentN * 2;
        currentN = doubledValue;
        doublingCount++;
    }
    return doublingCount;
};

const executeMainLogic = () => {
    const [initialN, targetK] = readNextIntArray();
    let finalProbabilitySum = 0;

    const probabilityFactor = 1 / initialN;

    for (let currentValue = 1; currentValue <= initialN; currentValue++) {
        const stepsRequired = calculateDoublingSteps(currentValue, targetK);

        const baseProbability = 0.5;
        const powerTerm = Math.pow(baseProbability, stepsRequired);
        const termContribution = probabilityFactor * powerTerm;
        finalProbabilitySum += termContribution;
    }
    console.log(finalProbabilitySum);
};

executeMainLogic();
