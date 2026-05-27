var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineData = (rawData.trim()).split("\n");

const MIN_TRACKED_VALUE = 2;
const MAX_TRACKED_VALUE = 100001;
const INITIAL_OCCURRENCE_COUNT = 1;

var numRanges = parseInt(lineData.shift(), 10);
var countMap = {};

for (let currentVal = MIN_TRACKED_VALUE; currentVal <= MAX_TRACKED_VALUE; currentVal++) {
    countMap[currentVal] = INITIAL_OCCURRENCE_COUNT;
}

for (let rangeIdx = 0; rangeIdx < numRanges; rangeIdx++) {
    const rangeLine = lineData.shift();
    const rangeBounds = rangeLine.split(" ").map(Number);
    const lowerBound = rangeBounds[0];
    const upperBound = rangeBounds[1];

    for (let currentNum = lowerBound; currentNum <= upperBound; currentNum++) {
        if (currentNum >= MIN_TRACKED_VALUE && currentNum <= MAX_TRACKED_VALUE) {
            countMap[currentNum]++;
        }
    }
}

let resultValue = 1;
for (let checkNum = MIN_TRACKED_VALUE; checkNum <= MAX_TRACKED_VALUE; checkNum++) {
    const currentCount = countMap[checkNum];
    if (currentCount >= checkNum) {
        resultValue = checkNum;
    }
}

console.log(resultValue - 1);
