"use strict";

function processInput(inputData) {
    const rawLineSegment = inputData.split("\n")[1];
    const numericalTokens = rawLineSegment.split(" ");

    let lowestValue = Infinity;
    let highestValue = -Infinity;

    for (let i = 0; i < numericalTokens.length; i++) {
        const currentNumeric = Number(numericalTokens[i]);
        if (currentNumeric < lowestValue) {
            lowestValue = currentNumeric;
        }
        if (currentNumeric > highestValue) {
            highestValue = currentNumeric;
        }
    }

    console.log(highestValue - lowestValue);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
