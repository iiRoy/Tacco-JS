"use strict";

const parseLineOfNumbers = (lineContent) => {
    return lineContent.split(" ").map(s => parseInt(s, 10));
};

const checkModuloCondition = (factorA, divisorB, targetC) => {
    for (let currentMultiplier = 0; currentMultiplier < divisorB; currentMultiplier++) {
        const calculatedRemainder = (factorA * currentMultiplier) % divisorB;
        if (calculatedRemainder === targetC) {
            return true;
        }
    }
    return false;
};

const processInput = (inputString) => {
    const trimmedLines = inputString.trim().split("\n");
    const firstLineData = parseLineOfNumbers(trimmedLines[0]);

    const valA = firstLineData[0];
    const valB = firstLineData[1];
    const valC = firstLineData[2];

    const conditionMet = checkModuloCondition(valA, valB, valC);
    const resultStatus = conditionMet ? "YES" : "NO";

    console.log(resultStatus);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
