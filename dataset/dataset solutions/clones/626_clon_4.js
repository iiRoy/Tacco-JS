const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = fileContent.split('\n');
const elementCount = Number(dataLines[0]);
const sourceElements = [];
for (let idx = 0; idx < elementCount; idx++) {
    sourceElements.push(Number(dataLines[idx + 1]));
}

const calculateCircularSegmentSum = (baseArray, startIdx, len, arraySize) => {
    let currentSum = 0;
    for (let k = 0; k < len; k++) {
        currentSum += baseArray[(startIdx + k) % arraySize];
    }
    return currentSum;
};

let overallMaximum = 0;

for (let firstSegmentLength = 1; firstSegmentLength <= elementCount - 3; firstSegmentLength++) {
    for (let startPosition = 0; startPosition < elementCount; startPosition++) {
        const currentSegmentSum = calculateCircularSegmentSum(sourceElements, startPosition, firstSegmentLength, elementCount);

        const remainingSegmentStart = startPosition + firstSegmentLength;
        const remainingSegmentLength = elementCount - firstSegmentLength;

        for (let splitPoint = 1; splitPoint < remainingSegmentLength; splitPoint++) {
            const firstSubsegmentSum = calculateCircularSegmentSum(sourceElements, remainingSegmentStart, splitPoint, elementCount);
            const secondSubsegmentSum = calculateCircularSegmentSum(sourceElements, remainingSegmentStart + splitPoint, remainingSegmentLength - splitPoint, elementCount);

            const minimumOfSplits = Math.min(firstSubsegmentSum, secondSubsegmentSum);

            if (currentSegmentSum <= minimumOfSplits) {
                overallMaximum = Math.max(overallMaximum, currentSegmentSum);
            }
        }
    }
}

console.log(overallMaximum);
