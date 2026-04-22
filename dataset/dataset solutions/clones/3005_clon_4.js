"use strict";

function createNumericTokenDispenser(inputString) {
    let allTokens = inputString.split(/\s+/).filter(Boolean);
    let currentPosition = 0;

    return {
        fetchNextNumber: function() {
            if (currentPosition >= allTokens.length) {
                throw new Error("No more numeric tokens available.");
            }
            return parseInt(allTokens[currentPosition++], 10);
        }
    };
}

function analyzeNumericSeries(rawInput) {
    let dataProvider = createNumericTokenDispenser(rawInput);

    let seriesLength = dataProvider.fetchNextNumber();
    
    let firstSet = [];
    for (let i = 0; i < seriesLength; i++) {
        firstSet.push(dataProvider.fetchNextNumber());
    }

    let secondSet = [];
    for (let i = 0; i < seriesLength; i++) {
        secondSet.push(dataProvider.fetchNextNumber());
    }

    function calculatePositiveDifferencesRecursively(index, accumulatedSum) {
        if (index >= seriesLength) {
            return accumulatedSum;
        }
        let termOne = firstSet[index];
        let termTwo = secondSet[index];
        let currentDifference = termOne - termTwo;
        let contribution = (currentDifference > 0) ? currentDifference : 0;
        return calculatePositiveDifferencesRecursively(index + 1, accumulatedSum + contribution);
    }

    let totalPositiveContribution = calculatePositiveDifferencesRecursively(0, 0);

    console.log(totalPositiveContribution);
}

if (typeof globalThis.window === "undefined") {
    analyzeNumericSeries(require("node:fs").readFileSync("/dev/stdin", "utf8"));
}