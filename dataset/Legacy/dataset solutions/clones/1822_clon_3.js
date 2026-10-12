"use strict";

function solveProblem(inputString) {
    const dataLines = inputString.trim().split("\n");
    const numEntries = Number(dataLines.shift());

    const firstValues = [];
    const secondValues = [];

    for (let i = 0; i < dataLines.length; i++) {
        const parts = dataLines[i].split(" ");
        firstValues.push(Number(parts[0]));
        secondValues.push(Number(parts[1]));
    }

    let computedValA;
    let computedValB;
    let finalResult;

    const isCountOdd = (numEntries % 2 !== 0);

    if (isCountOdd) {
        const middleIndex = Math.floor(numEntries / 2);
        computedValA = firstValues[middleIndex];
        computedValB = secondValues[middleIndex];
        finalResult = computedValB - computedValA + 1;
    } else {
        const lowerMiddleIndex = Math.floor(numEntries / 2) - 1;
        const upperMiddleIndex = Math.floor(numEntries / 2);
        
        const sumA = firstValues[lowerMiddleIndex] + firstValues[upperMiddleIndex];
        const sumB = secondValues[lowerMiddleIndex] + secondValues[upperMiddleIndex];

        computedValA = sumA / 2;
        computedValB = sumB / 2;
        
        finalResult = (computedValB - computedValA) * 2 + 1;
    }

    console.log(finalResult);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
