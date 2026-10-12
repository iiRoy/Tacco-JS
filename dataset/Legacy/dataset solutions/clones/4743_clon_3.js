"use strict";

const processInput = (rawData) => {
    const cleanedInputString = rawData.trim();
    const inputLines = cleanedInputString.split("\n");
    const primaryLine = inputLines[0];
    const lineSegments = primaryLine.split(" ");
    const numericString = lineSegments[0];
    const inputNumber = parseInt(numericString, 10);

    const divisorForQuotient = 11;
    const divisorForRemainderCeil = 5;

    const intermediateDivision = inputNumber / divisorForQuotient;
    const integerQuotient = Math.floor(intermediateDivision);
    const calculatedRemainder = inputNumber % divisorForQuotient;

    const firstTermContribution = integerQuotient * 2;
    const remainderDivisionResult = calculatedRemainder / divisorForRemainderCeil;
    const secondTermContribution = Math.ceil(remainderDivisionResult);

    const finalCalculatedValue = firstTermContribution + secondTermContribution;

    console.log(finalCalculatedValue);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
