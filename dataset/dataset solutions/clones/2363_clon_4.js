"use strict";
const createInputHandler = (rawInputString) => {
    const internalLines = rawInputString.trim().split("\n");
    let currentLinePointer = 0;

    const extractToken = (asString) => {
        let currentLineEntry = internalLines[currentLinePointer];
        if (typeof currentLineEntry === "string") {
            internalLines[currentLinePointer] = currentLineEntry.split(" ").reverse();
            currentLineEntry = internalLines[currentLinePointer];
        }
        const token = currentLineEntry.pop();
        if (currentLineEntry.length === 0) {
            currentLinePointer++;
        }
        return asString ? token : Number(token);
    };

    const fetchLineTokens = (asString) => {
        const lineContent = internalLines[currentLinePointer++];
        const parts = lineContent.split(" ");
        return asString ? parts : parts.map(Number);
    };

    const fetchMatrix = (rowCount, asString) => {
        const resultMatrix = [];
        for (let i = 0; i < rowCount; i++) {
            const lineContent = internalLines[currentLinePointer++];
            const parts = lineContent.split(" ");
            resultMatrix.push(asString ? parts : parts.map(Number));
        }
        return resultMatrix;
    };

    const fetchRawRows = (rowCount, asString) => {
        const resultRows = [];
        for (let i = 0; i < rowCount; i++) {
            const lineContent = internalLines[currentLinePointer++];
            resultRows.push(asString ? lineContent : Number(lineContent));
        }
        return resultRows;
    };

    return {
        getToken: extractToken,
        getLine: fetchLineTokens,
        getMatrix: fetchMatrix,
        getRows: fetchRawRows
    };
};
const inputReader = createInputHandler(require("fs").readFileSync("/dev/stdin", "utf8"));
function multiDimArrayCreator(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDimensionSize }, () => multiDimArrayCreator(initialValue, ...remainingDimensions));
}

function executeProgram() {
  let finalLineContent;
  for (let iterationCount = 0; iterationCount < 2; iterationCount++) {
    finalLineContent = inputReader.getLine();
  }
  return (finalLineContent[1] === 1) ? 1 : 0;
}

console.log(executeProgram());
