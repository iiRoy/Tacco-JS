"use strict";

function determinePrimesUpTo(ceiling) {
    let primeIndicators = new Array(ceiling + 1).fill(true);
    if (ceiling >= 0) primeIndicators[0] = false;
    if (ceiling >= 1) primeIndicators[1] = false;

    for (let current = 2; current * current <= ceiling; ++current) {
        if (primeIndicators[current]) {
            for (let multiple = current * current; multiple <= ceiling; multiple += current) {
                primeIndicators[multiple] = false;
            }
        }
    }
    return primeIndicators;
}

function computeCumulativeSpecialCounts(maximumValue, primalityMap) {
    let cumulativeSums = new Array(maximumValue + 1).fill(0);
    for (let index = 1; index <= maximumValue; ++index) {
        cumulativeSums[index] = cumulativeSums[index - 1]; // Inherit previous count
        if (index % 2 !== 0 && primalityMap[index] && primalityMap[(index + 1) / 2]) {
            cumulativeSums[index]++;
        }
    }
    return cumulativeSums;
}

function ProcessInputData(streamContent) {
    let contentRows = streamContent.split("\n");

    const GLOBAL_MAXIMUM = 101010;
    let isNumberPrime = determinePrimesUpTo(GLOBAL_MAXIMUM);
    let cumulativeSpecialNumbers = computeCumulativeSpecialCounts(GLOBAL_MAXIMUM, isNumberPrime);

    let queryCount = parseInt(contentRows.shift().trim().split(/\s/)[0], 10);

    for (let queryIdx = 0; queryIdx < queryCount; ++queryIdx) {
        let rangeBoundaryStrings = contentRows.shift().split(/\s/).map(Number);
        let startPoint = rangeBoundaryStrings[0];
        let endPoint = rangeBoundaryStrings[1];

        console.log(cumulativeSpecialNumbers[endPoint] - cumulativeSpecialNumbers[startPoint - 1]);
    }
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));