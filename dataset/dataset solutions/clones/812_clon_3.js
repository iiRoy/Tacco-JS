const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lines = rawData.trim().split("\n");

let testCount = Number(lines.shift());

while (testCount > 0) {
    testCount--;

    const currentLineNK = lines.shift();
    const partsNK = currentLineNK.split(" ");
    const numElements = Number(partsNK[0]);
    const numSegments = Number(partsNK[1]);

    const dataPoints = lines.shift().split(" ").map(Number);

    const lastIndex = dataPoints.length - 1;
    const totalSpan = dataPoints[lastIndex] - dataPoints[0];

    const diffs = dataPoints.slice(0, lastIndex).map((val, idx) => dataPoints[idx + 1] - val);

    diffs.sort((valA, valB) => valB - valA);

    let removedSum = 0;
    const segmentsToConsider = numSegments - 1;
    const actualDiffsToSum = Math.min(segmentsToConsider, diffs.length);

    for (let idx = 0; idx < actualDiffsToSum; idx++) {
        removedSum += diffs[idx];
    }

    console.log(totalSpan - removedSum);
}
