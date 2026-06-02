"use strict";

function processInputAndCalculate(inputContent) {
    let dataTokens = inputContent.split(/\s+/).filter(Boolean);
    let tokenCursor = 0;

    const retrieveNextInteger = () => {
        return parseInt(dataTokens[tokenCursor++], 10);
    };

    let elementCount = retrieveNextInteger();
    let sourceValues = [];
    for (let k = 0; k < elementCount; k++) {
        sourceValues.push(retrieveNextInteger());
    }

    let adjustedValues = [];
    for (let k = 0; k < elementCount; k++) {
        adjustedValues.push(sourceValues[k] - k - 1);
    }

    adjustedValues.sort((val1, val2) => val1 - val2);

    let medianCandidate = adjustedValues[Math.floor(elementCount / 2)];

    let cumulativeAbsoluteDifference = 0;
    for (let k = 0; k < elementCount; k++) {
        cumulativeAbsoluteDifference += Math.abs((sourceValues[k] - k - 1) - medianCandidate);
    }

    console.log(cumulativeAbsoluteDifference);
}

if (typeof window === "undefined") {
    processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
}
