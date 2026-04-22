const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const contentLines = fileContent.trim().split('\n');

const elementCount = Number(contentLines[0]);
const setAlpha = contentLines[1].split(/\s+/).filter(Boolean).map(Number);
const setBeta = contentLines[2].split(/\s+/).filter(Boolean).map(Number);
const setGamma = contentLines[3].split(/\s+/).filter(Boolean).map(Number);

setAlpha.sort((valA, valB) => valA - valB);
setBeta.sort((valA, valB) => valA - valB);
setGamma.sort((valA, valB) => valA - valB);

const findBoundaryLow = (collection, targetValue) => { // Finds the index of the first element `x` such that `x >= targetValue`. This effectively counts elements strictly less than `targetValue`.
    let leftPointer = 0;
    let rightPointer = collection.length;
    while (leftPointer < rightPointer) {
        const midPoint = Math.floor((leftPointer + rightPointer) / 2);
        if (collection[midPoint] < targetValue) {
            leftPointer = midPoint + 1;
        } else {
            rightPointer = midPoint;
        }
    }
    return leftPointer;
};

const findBoundaryHigh = (collection, targetValue) => { // Finds the index of the first element `x` such that `x > targetValue`. This effectively counts elements less than or equal to `targetValue`.
    let leftPointer = 0;
    let rightPointer = collection.length;
    while (leftPointer < rightPointer) {
        const midPoint = Math.floor((leftPointer + rightPointer) / 2);
        if (collection[midPoint] <= targetValue) {
            leftPointer = midPoint + 1;
        } else {
            rightPointer = midPoint;
        }
    }
    return leftPointer;
};

let cumulativeResult = 0;

for (const currentBetaValue of setBeta) {
    // Original `countA`: number of elements in `listA` that are strictly less than `b`.
    // `findBoundaryLow(setAlpha, currentBetaValue)` returns the count of such elements.
    const alphaMatchCount = findBoundaryLow(setAlpha, currentBetaValue);

    // Original `countC`: number of elements in `listC` that are less than or equal to `b`.
    // `findBoundaryHigh(setGamma, currentBetaValue)` returns the count of such elements.
    const gammaMatchCount = findBoundaryHigh(setGamma, currentBetaValue);

    cumulativeResult += alphaMatchCount * (elementCount - gammaMatchCount);
}

console.log(cumulativeResult);