"use strict";

const locateBoundary = (sourceCollection, queryValue, initialLeft, initialRight) => {
    if (initialLeft >= initialRight) {
        return initialLeft;
    }

    const pivotIndex = Math.floor((initialLeft + initialRight) / 2);

    if (sourceCollection[pivotIndex] < queryValue) {
        return locateBoundary(sourceCollection, queryValue, pivotIndex + 1, initialRight);
    } else {
        return locateBoundary(sourceCollection, queryValue, initialLeft, pivotIndex);
    }
};

const processInput = (rawInputContent) => {
    const inputLines = rawInputContent.split("\n");
    const numItems = parseInt(inputLines[0]);

    const [sortedUpper, sortedMiddle, sortedLower] = inputLines.slice(1, 4).map(line =>
        line.split(" ").map(Number).sort((a, b) => a - b)
    );

    console.log(sortedUpper);
    console.log(sortedLower);
    console.log("    ");

    const finalSum = sortedMiddle.reduce((accumulator, currentMiddleValue) => {
        const upperCount = locateBoundary(sortedUpper, currentMiddleValue, 0, sortedUpper.length);
        const lowerBoundaryPosition = locateBoundary(sortedLower, currentMiddleValue, 0, sortedLower.length);
        const lowerCount = sortedLower.length - lowerBoundaryPosition;

        console.log(lowerBoundaryPosition);
        console.log(currentMiddleValue + "以下が" + upperCount + "個");
        console.log(currentMiddleValue + "以上が" + lowerCount + "個");
        console.log("-----------");

        return accumulator + (upperCount * lowerCount);
    }, 0);

    console.log(finalSum);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
