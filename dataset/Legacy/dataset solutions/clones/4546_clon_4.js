"use strict";

function processInput(rawData) {
    const parsedLines = rawData.split('\n').map(Number);

    const itemCount = parsedLines.shift();
    const allInputNumbers = parsedLines;

    const cumulativeTotal = allInputNumbers.reduce((accumulator, currentVal) => accumulator + currentVal, 0);

    if (cumulativeTotal % 10 !== 0) {
        console.log(cumulativeTotal);
        return;
    }

    const numbersToConsiderForRemoval = allInputNumbers.slice(0, itemCount);

    const sortedConsideredValues = [...numbersToConsiderForRemoval].sort((a, b) => a - b);

    const removableValue = sortedConsideredValues.find(val => (cumulativeTotal - val) % 10 !== 0);

    if (removableValue !== undefined) {
        console.log(1, cumulativeTotal - removableValue);
    } else {
        console.log(0);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
