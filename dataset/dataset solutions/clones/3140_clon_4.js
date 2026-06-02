"use strict";

function ProcessInput(rawInputData) {
    const outputBuffer = [];
    const inputLines = rawInputData.trim().split("\n");
    let lineCursor = 0;

    const retrieveNextLine = () => inputLines[lineCursor++];
    const appendToOutput = (content) => outputBuffer.push(content);
    const parseLineToNumericArray = (lineContent) => lineContent.split(" ").map(Number);

    const initialParameters = parseLineToNumericArray(retrieveNextLine());
    const iterationCount = initialParameters[0];
    const dimensionSize = initialParameters[1];
    const baseOffset = initialParameters[2];

    const coefficientVector = parseLineToNumericArray(retrieveNextLine());

    const positiveResultCount = Array.from({ length: iterationCount }).reduce((currentPositiveTotal, _, index) => {
        const currentDataVector = parseLineToNumericArray(retrieveNextLine());

        const calculatedSum = currentDataVector.reduce((accumulator, value, idx) => {
            return accumulator + value * coefficientVector[idx];
        }, baseOffset);

        return currentPositiveTotal + (calculatedSum > 0 ? 1 : 0);
    }, 0);

    appendToOutput(positiveResultCount);

    const finalOutputString = outputBuffer.join("\n");
    console.log(finalOutputString);
    return finalOutputString;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
