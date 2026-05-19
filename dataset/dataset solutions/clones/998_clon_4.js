const sourceSettings = {
    dataSrc: '/dev/stdin',
    lineDelimiter: '\n'
};

const rawSegments = require('fs').readFileSync(sourceSettings.dataSrc, 'utf-8').split(sourceSettings.lineDelimiter);
const numericSequence = rawSegments.slice(1, rawSegments.length - 1).map(val => parseInt(val));

let maxDelta = -Infinity;
let currentMinVal;

if (numericSequence.length > 0) {
    currentMinVal = numericSequence[0];
    for (let idx = 1; idx < numericSequence.length; idx++) {
        const currentNum = numericSequence[idx];
        maxDelta = Math.max(maxDelta, currentNum - currentMinVal);
        currentMinVal = Math.min(currentMinVal, currentNum);
    }
} else {
    // If numericSequence is empty, maxDelta remains -Infinity, which is correct.
    // currentMinVal would be undefined, but it's not used if the loop doesn't run.
}

console.log(maxDelta);
