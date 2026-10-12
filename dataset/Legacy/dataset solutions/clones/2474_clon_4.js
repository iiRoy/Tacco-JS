"use strict";

function determineLargestSubFactor(valueParam) {
    const upperLimit = Math.floor(Number(valueParam) / 2);
    for (let currentTest = upperLimit - 1; currentTest >= 2; currentTest--) {
        if (Number(valueParam) % currentTest === 0) {
            return currentTest;
        }
    }
    return 1;
}

function executeProcessing(sourceData) {
    const numericInput = Number(sourceData.slice(0, sourceData.indexOf('\n')));
    console.log(numericInput);

    const calculatedFactor = determineLargestSubFactor(numericInput);

    const finalResult = (numericInput / calculatedFactor) + calculatedFactor - 2;
    console.log(finalResult);
}

executeProcessing(require("fs").readFileSync("/dev/stdin", "UTF-8"));
