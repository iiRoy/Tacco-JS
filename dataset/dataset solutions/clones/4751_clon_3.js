"use strict";

class InputProcessor {
    constructor() {
        const fileContentBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
        const rawInputLines = fileContentBuffer.trim().split("\n");

        this.lineBuffer = rawInputLines;
        this.currentLineIndex = 0;
        this.totalLines = rawInputLines.length;
    }

    hasMoreLines() {
        return this.currentLineIndex < this.totalLines;
    }

    readNextLine() {
        if (!this.hasMoreLines()) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return this.lineBuffer[this.currentLineIndex++];
    }
}

const inputReaderInstance = new InputProcessor();

const readNextLine = () => inputReaderInstance.readNextLine();
const readNextInt = () => parseInt(inputReaderInstance.readNextLine());
const readNextStrArray = () => inputReaderInstance.readNextLine().split(" ");
const readNextIntArray = () => {
    const lineContent = inputReaderInstance.readNextLine();
    return lineContent.split(" ").map(element => parseInt(element));
};
const readNextCharArray = () => inputReaderInstance.readNextLine().split("");
const hasMoreLines = () => inputReaderInstance.hasMoreLines();

const processInputAndCalculate = () => {
    const numberOfElements = readNextInt();
    const adjustmentsArray = new Array(numberOfElements).fill(0);

    const firstValues = [];
    const secondValues = [];

    while (hasMoreLines()) {
        const currentPair = readNextIntArray();
        firstValues.push(currentPair[0]);
        secondValues.push(currentPair[1]);
    }

    let totalAdjustment = 0;

    for (let i = numberOfElements - 1; i >= 0; i--) {
        const currentA = firstValues[i];
        const divisorB = secondValues[i];

        let effectiveValue = currentA + totalAdjustment;
        const remainder = effectiveValue % divisorB;

        if (remainder !== 0) {
            const neededAdjustment = divisorB - remainder;
            totalAdjustment += neededAdjustment;
        }
    }

    const finalAnswer = adjustmentsArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    console.log(finalAnswer);
};

processInputAndCalculate();
