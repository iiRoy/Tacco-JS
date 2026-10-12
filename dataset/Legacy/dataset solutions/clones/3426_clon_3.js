const fileSystemModule = require("fs");
const inputDataString = fileSystemModule.readFileSync("/dev/stdin", "utf8");

const targetNumber = 753;
const differencesCollection = [];

function calculateAbsoluteDifferenceForSegment(segmentValue) {
    const numericSegment = parseInt(segmentValue, 10);
    return Math.abs(targetNumber - numericSegment);
}

const maximumStartingIndex = inputDataString.length - 3;

for (let currentSliceStart = 0; currentSliceStart <= maximumStartingIndex; currentSliceStart++) {
    const threeCharSegment = inputDataString.slice(currentSliceStart, currentSliceStart + 3);
    const currentDifference = calculateAbsoluteDifferenceForSegment(threeCharSegment);
    differencesCollection.push(currentDifference);
}

Math.min(...differencesCollection);
