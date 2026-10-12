"use strict";

const determineChainLength = (currentVal, upperBound) => {
    if (currentVal > upperBound) {
        return 0;
    }
    return 1 + determineChainLength(currentVal * 2, upperBound);
};

const processInput = (inputString) => {
    const dataLines = inputString.trim().split("\n");
    const numericParts = dataLines[0].split(" ");
    const startVal = parseInt(numericParts[0], 10);
    const upperBound = parseInt(numericParts[1], 10);

    let resultCount;

    if (startVal > upperBound) {
        resultCount = 1;
    } else {
        resultCount = determineChainLength(startVal, upperBound);
    }

    console.log(resultCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
