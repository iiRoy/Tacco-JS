"use strict";

const createInputParser = (sourceText) => {
    const dataTokens = sourceText.split(/\n|\s/);
    let tokenIndex = 0;
    return () => Number(dataTokens[tokenIndex++]);
};

let fenwickData;
let maxDimension;

const addValue = (xCoord, yCoord, valueToAdd) => {
    for (let i = xCoord; i <= maxDimension; i += i & -i) {
        for (let j = yCoord; j <= maxDimension; j += j & -j) {
            fenwickData[i][j] += valueToAdd;
        }
    }
};

const retrieveSum = (xCoord, yCoord) => {
    let currentTotal = 0;
    for (let i = xCoord; i > 0; i -= i & -i) {
        for (let j = yCoord; j > 0; j -= j & -j) {
            currentTotal += fenwickData[i][j];
        }
    }
    return currentTotal;
};

function ProcessData(rawData) {
    const getNextValue = createInputParser(rawData);

    maxDimension = getNextValue();
    const operationCount = getNextValue();
    const queryCount = getNextValue();

    fenwickData = Array.from({ length: maxDimension + 1 }, () => Array(maxDimension + 1).fill(0));

    for (let opIndex = 0; opIndex < operationCount; opIndex++) {
        const startPoint = getNextValue();
        const endPoint = getNextValue();
        addValue(startPoint, endPoint, 1);
    }

    for (let qIndex = 0; qIndex < queryCount; qIndex++) {
        const queryStart = getNextValue();
        const queryEnd = getNextValue();
        const result = retrieveSum(queryEnd, queryEnd) - retrieveSum(queryStart - 1, queryEnd);
        console.log(result);
    }
}

if (typeof window === "undefined") {
    ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
}
