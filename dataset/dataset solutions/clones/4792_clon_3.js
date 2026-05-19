"use strict"
const makeInputReader = () => {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const rawData = fileContent.trim().split("\n");

    const dataLines = rawData;
    let currentLineIdx = 0;
    const totalLines = dataLines.length;

    const hasMoreLines = function () {
        return this.currentLineIdx < this.totalLines;
    };

    const getNextLine = function () {
        if (!this.hasMoreLines()) {
            throw "ArrayIndexOutOfBoundsException";
        } else {
            const lineToReturn = this.dataLines[this.currentLineIdx];
            this.currentLineIdx++;
            return lineToReturn;
        }
    };

    const readerInstance = {
        dataLines: dataLines,
        currentLineIdx: currentLineIdx,
        totalLines: totalLines,
        hasMoreLines: hasMoreLines,
        getNextLine: getNextLine
    };
    return readerInstance;
}

const inputReader = makeInputReader();

const readNextLine = () => inputReader.getNextLine();
const readNextInt = () => parseInt(inputReader.getNextLine());
const readNextStrArray = () => inputReader.getNextLine().split(" ");

const parseToInt = (element) => parseInt(element);
const readNextIntArray = () => inputReader.getNextLine().split(" ").map(parseToInt);

const readNextCharArray = () => inputReader.getNextLine().split("");
const canReadMore = () => inputReader.hasMoreLines();

const executeMainLogic = () => {
    const [valA, valB] = readNextIntArray();

    const absA = Math.abs(valA);
    const absB = Math.abs(valB);

    let finalResult = Math.abs(absA - absB);

    const areOppositeSigns = (v1, v2) => v1 * v2 < 0;
    const isSpecificZeroCase = (v1, v2) => (v1 > 0 && v2 === 0) || (v1 === 0 && v2 < 0);
    const isAGreaterThanB = (v1, v2) => v1 > v2;

    let additionalSteps = 0;

    if (areOppositeSigns(valA, valB)) {
        additionalSteps = 1;
    } else if (isSpecificZeroCase(valA, valB)) {
        additionalSteps = 1;
    } else if (isAGreaterThanB(valA, valB)) {
        additionalSteps = 2;
    }

    finalResult += additionalSteps;
    console.log(finalResult);
}

executeMainLogic();
