"use strict";

const obtainPopCount = (numericVal) => {
    let tally = 0;
    let tempVal = numericVal;
    while (tempVal > 0) {
        tempVal &= (tempVal - 1);
        tally++;
    }
    return tally;
};

const processInputData = (rawInput) => {
    const parsedLines = rawInput.trim().split("\n");

    const extractNumeric = (str) => Number(str);
    const extractNumericArray = (str) => str.split(" ").map(extractNumeric);

    const outcomes = [];
    let lineCursor = 0;
    const totalCases = extractNumeric(parsedLines[lineCursor++]);

    for (let c = 0; c < totalCases; c++) {
        const vertexQuantity = extractNumeric(parsedLines[lineCursor++]);
        const valuesArray = extractNumericArray(parsedLines[lineCursor++]);
        const instructionSequence = parsedLines[lineCursor++];

        const finalAccumulator = instructionSequence.split("").reduce((accum, instructionChar, idx) => {
            const currentItem = valuesArray[idx];
            const xorResult = accum ^ currentItem;

            const xorPopCount = obtainPopCount(xorResult);
            const currentPopCount = obtainPopCount(accum);

            const shouldUpdate = 
                (instructionChar === '0' && xorPopCount <= currentPopCount) ||
                (instructionChar === '1' && xorPopCount > currentPopCount);
            
            return shouldUpdate ? xorResult : accum;
        }, 0);

        outcomes.push(finalAccumulator ? "1" : "0");
    }

    return outcomes.join("\n");
};

const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
const outputResult = processInputData(inputSource);
console.log(outputResult);