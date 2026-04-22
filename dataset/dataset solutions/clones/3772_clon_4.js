"use strict";
const filesystemData = require("fs").readFileSync("/dev/stdin", "utf8");
const desiredSum = parseInt(filesystemData.trim(), 10);

const upperBound = 100000;
const valueMemo = new Map();

const availableUnits = new Set();
let factorOne = 1;
while (factorOne <= upperBound) {
    availableUnits.add(factorOne);
    factorOne *= 6;
}
let factorTwo = 1;
while (factorTwo <= upperBound) {
    availableUnits.add(factorTwo);
    factorTwo *= 9;
}
const sortedUnits = Array.from(availableUnits).sort((a, b) => a - b);

function determineMinimumCount(targetValue) {
    if (targetValue === 0) {
        return 0;
    }
    if (valueMemo.has(targetValue)) {
        return valueMemo.get(targetValue);
    }

    let smallestCount = Number.POSITIVE_INFINITY;

    for (const unit of sortedUnits) {
        if (unit <= targetValue) {
            const remainingAmount = targetValue - unit;
            const countForRemaining = determineMinimumCount(remainingAmount);
            if (countForRemaining !== Number.POSITIVE_INFINITY) {
                smallestCount = Math.min(smallestCount, countForRemaining + 1);
            }
        } else {
            break;
        }
    }

    valueMemo.set(targetValue, smallestCount);
    return smallestCount;
}

const resultCount = determineMinimumCount(desiredSum);
console.log(resultCount);