let primaryInput = require("fs").readFileSync("/dev/stdin", "utf8");
let inputTokens = primaryInput.split(/\s+/).filter(Boolean);
let tokenIndex = 0;

function extractNextNumeric() {
    return Number(inputTokens[tokenIndex++]);
}

function extractNextList(count) {
    let tempArr = [];
    for (let j = 0; j < count; j++) {
        tempArr.push(Number(inputTokens[tokenIndex++]));
    }
    return tempArr;
}

let numElements = extractNextNumeric();
let rangeOffset = extractNextNumeric();
let valueArray = extractNextList(numElements);

const maxCoordinateValue = 300000;
let scoreChanges = Array(maxCoordinateValue + 2).fill(0); // For indices 0 to maxCoordinateValue + 1

for (let currentVal of valueArray) {
    let lowerBoundary = Math.max(0, currentVal - rangeOffset);
    let upperBoundary = Math.min(maxCoordinateValue, currentVal + rangeOffset);
    scoreChanges[lowerBoundary]++;
    scoreChanges[upperBoundary + 1]--;
}

// Compute prefix sums to get actual overlap counts at each point
for (let pIdx = 1; pIdx <= maxCoordinateValue + 1; pIdx++) {
    scoreChanges[pIdx] += scoreChanges[pIdx - 1];
}

let maximumOverlapFound = 0;

// Query points 1 through numElements (inclusive) as per original logic
for (let pIdx = 1; pIdx <= numElements; pIdx++) {
    maximumOverlapFound = Math.max(maximumOverlapFound, scoreChanges[pIdx]);
}

console.log(String(maximumOverlapFound));