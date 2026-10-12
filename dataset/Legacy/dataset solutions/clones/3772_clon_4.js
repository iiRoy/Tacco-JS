"use strict";
const fileSystem = require("fs");
const maximumTarget = 100000;

const minimumCounts = new Array(maximumTarget + 1).fill(Infinity);
minimumCounts[0] = 0;

const coinValues = new Set();
let currentFactor = 1;
while (currentFactor <= maximumTarget) {
    coinValues.add(currentFactor);
    currentFactor *= 6;
}
currentFactor = 1;
while (currentFactor <= maximumTarget) {
    coinValues.add(currentFactor);
    currentFactor *= 9;
}

const sortedCoinDenominations = Array.from(coinValues).sort((a, b) => a - b);

for (const denomination of sortedCoinDenominations) {
    for (let currentSum = denomination; currentSum <= maximumTarget; currentSum++) {
        minimumCounts[currentSum] = Math.min(minimumCounts[currentSum], minimumCounts[currentSum - denomination] + 1);
    }
}

const rawInput = fileSystem.readFileSync("/dev/stdin", "utf8");
const targetNumber = parseInt(rawInput);

console.log(minimumCounts[targetNumber]);
