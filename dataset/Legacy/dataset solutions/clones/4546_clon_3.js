"use strict"

function processInputData(rawData) {
    const inputLines = rawData.split('\n');
    const numericValues = inputLines.map(lineStr => Number(lineStr));

    const elementCount = numericValues[0];
    const orderedElements = numericValues.slice(1).sort((valA, valB) => valA - valB);

    let currentTotal = 0;
    for (let k = 0; k < orderedElements.length; k++) {
        currentTotal += orderedElements[k];
    }

    const isTotalDivisibleByTen = (currentTotal % 10 === 0);

    if (!isTotalDivisibleByTen) {
        console.log(currentTotal);
        return;
    }

    for (let elementIndex = 0; elementIndex < elementCount; elementIndex++) {
        const currentElement = orderedElements[elementIndex];
        const sumAfterRemoval = currentTotal - currentElement;
        const isRemainingSumDivisibleByTen = (sumAfterRemoval % 10 === 0);

        if (!isRemainingSumDivisibleByTen) {
            console.log(1, sumAfterRemoval);
            return;
        }
    }

    console.log(0);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
