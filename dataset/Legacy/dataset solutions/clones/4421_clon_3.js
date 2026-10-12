"use strict"
const makeInputReader = () => {
    const fileContentBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
    const trimmedContent = fileContentBuffer.trim();
    const rawDataLines = trimmedContent.split("\n");

    const readerInstance = {
        "dataLines": rawDataLines,
        "currentLineIdx": 0,
        "totalLines": rawDataLines.length,
    };

    const checkNextAvailability = function () {
        return this.currentLineIdx < this.totalLines;
    };

    const retrieveNextLine = function () {
        if (!this.canReadNext()) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return this.dataLines[this.currentLineIdx++];
    };

    readerInstance.canReadNext = checkNextAvailability;
    readerInstance.fetchNextLine = retrieveNextLine;

    return readerInstance;
};

const inputSource = makeInputReader();

const readNextString = () => inputSource.fetchNextLine();
const readNextInt = () => parseInt(inputSource.fetchNextLine());

const parseStringToInt = (element) => parseInt(element);

const readNextStringArray = () => inputSource.fetchNextLine().split(" ");
const readNextIntArray = () => inputSource.fetchNextLine().split(" ").map(parseStringToInt);
const readNextCharArray = () => inputSource.fetchNextLine().split("");
const hasMoreInput = () => inputSource.canReadNext();

const printOutput = (...outputArgs) => console.log(...outputArgs);

function calculateGreatestCommonDivisor(numA, numB) {
    if (numA < numB) {
        let temp = numA;
        numA = numB;
        numB = temp;
    }
    let remainderVal;
    while (numB !== 0n) {
        remainderVal = numA % numB;
        numA = numB;
        numB = remainderVal;
    }
    return numA;
}

function calculateLeastCommonMultiple(numA, numB) {
    return (numA * numB) / calculateGreatestCommonDivisor(numA, numB);
}

const executeMainLogic = () => {
    const firstLineContent = readNextString();
    const initialValueStr = readNextString();
    let currentLcmResult = BigInt(initialValueStr);

    while (hasMoreInput()) {
        const nextNumberForLcm = BigInt(readNextInt());
        currentLcmResult = calculateLeastCommonMultiple(currentLcmResult, nextNumberForLcm);
    }
    console.log(currentLcmResult.toString());
};

executeMainLogic();
