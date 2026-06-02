"use strict";

const getRawInputLines = () => {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
};

const createInputReader = () => {
    const lineBuffer = getRawInputLines();
    let currentLineIndex = 0;
    const totalLines = lineBuffer.length;

    const checkBoundsAndGetLine = () => {
        if (currentLineIndex >= totalLines) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return lineBuffer[currentLineIndex++];
    };

    return {
        hasMoreLines: () => currentLineIndex < totalLines,
        readNextLine: checkBoundsAndGetLine
    };
};

const globalInputReader = createInputReader();

const InputParser = {
    readNextLine: () => globalInputReader.readNextLine(),
    readNextInt: () => parseInt(globalInputReader.readNextLine()),
    readNextStringArray: () => globalInputReader.readNextLine().split(" "),
    readNextIntArray: () => globalInputReader.readNextLine().split(" ").map(val => parseInt(val)),
    readNextCharArr: () => globalInputReader.readNextLine().split(""),
    hasMoreLines: () => globalInputReader.hasMoreLines()
};

const printResult = (...args) => console.log(...args);

const calculateMultiplier = (targetVal, divisor) => {
    let currentMultiplier = 1;
    while (currentMultiplier * divisor < targetVal) {
        currentMultiplier++;
    }
    return currentMultiplier;
};

const executeMainProgram = () => {
    const numElements = InputParser.readNextInt();
    const resultArray = new Array(numElements).fill(0);
    const arrayA = [];
    const arrayB = [];

    while (InputParser.hasMoreLines()) {
        const currentPair = InputParser.readNextIntArray();
        arrayA.push(currentPair[0]);
        arrayB.push(currentPair[1]);
    }

    let cumulativeAdjustment = 0;
    const loopStartIndex = numElements - 1;

    for (let i = loopStartIndex; i >= 0; --i) {
        const currentA = arrayA[i];
        const currentB = arrayB[i];
        const requiredMinimum = currentA + cumulativeAdjustment;

        const effectiveMultiplier = calculateMultiplier(requiredMinimum, currentB);

        const calculatedAdjustment = (effectiveMultiplier * currentB) - requiredMinimum;
        resultArray[i] = calculatedAdjustment;
        cumulativeAdjustment += calculatedAdjustment;
    }

    let finalSum = 0;
    resultArray.forEach(val => {
        finalSum += val;
    });

    printResult(finalSum);
};

executeMainProgram();
