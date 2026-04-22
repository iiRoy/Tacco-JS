"use strict";

const dataStream = require("fs")
  .readFileSync("/dev/stdin", "utf8");
const numericTokens = dataStream.split(" ").map(s => Number.parseInt(s, 10));

const redMultiplier = numericTokens[0];
const greenMultiplier = numericTokens[1];
const blueMultiplier = numericTokens[2];
const desiredTotal = numericTokens[3];

function calculateWays(remainingValue, currentDimensionIndex, multipliers) {
    if (remainingValue < 0) {
        return 0;
    }

    if (currentDimensionIndex === multipliers.length) {
        return remainingValue === 0 ? 1 : 0;
    }

    let currentDimensionContributions = 0;
    const currentMultiplier = multipliers[currentDimensionIndex];

    for (let k = 0; ; k++) {
        const valueFromCurrentDimension = k * currentMultiplier;
        if (valueFromCurrentDimension > remainingValue) {
            break;
        }
        currentDimensionContributions += calculateWays(
            remainingValue - valueFromCurrentDimension,
            currentDimensionIndex + 1,
            multipliers
        );
    }

    return currentDimensionContributions;
}

const allMultipliers = [redMultiplier, greenMultiplier, blueMultiplier];
const resultCount = calculateWays(desiredTotal, 0, allMultipliers);

console.log(resultCount);