'use strict'
let fileData = require("fs").readFileSync("/dev/stdin", "utf8");

const parseNumericSequence = (lineContent) => {
    return lineContent.split(' ').map(strNum => parseInt(strNum, 10));
};

let lines = fileData.split('\n');
let numericValues = parseNumericSequence(lines[1]);

let segmentCounter = 1;
let establishedTrend = 0;

const sequenceLength = numericValues.length;

for (let index = 1; index < sequenceLength; index++) {
    const valueDifference = numericValues[index - 1] - numericValues[index];
    const currentStepTrend = Math.sign(valueDifference);

    const trendReversalDetected = (currentStepTrend * establishedTrend < 0);

    if (trendReversalDetected) {
        segmentCounter++;
        establishedTrend = 0;
    } else if (establishedTrend === 0) {
        establishedTrend = currentStepTrend;
    }
}

console.log(segmentCounter);
