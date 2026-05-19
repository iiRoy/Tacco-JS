function evaluateSplitFeasibility(targetSegmentSum, sourceElements, maxAllowedSegments) {
    let currentSegmentAccumulator = 0;
    let segmentsFormedCount = 0;

    for (let elementIndex = 0; elementIndex < sourceElements.length; elementIndex++) {
        const currentElementValue = sourceElements[elementIndex];

        if (targetSegmentSum < currentElementValue) {
            return false;
        }

        const potentialNewSegmentSum = currentSegmentAccumulator + currentElementValue;

        if (potentialNewSegmentSum === targetSegmentSum) {
            currentSegmentAccumulator = 0;
            segmentsFormedCount++;
        } else if (potentialNewSegmentSum > targetSegmentSum) {
            currentSegmentAccumulator = currentElementValue;
            segmentsFormedCount++;
        } else {
            currentSegmentAccumulator = potentialNewSegmentSum;
        }

        if (segmentsFormedCount === maxAllowedSegments) {
            return false;
        }
    }

    return true;
}

const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let inputLines = rawInputData.trim().split("\n");

while (true) {
    let currentMnLine = inputLines.shift();
    if (currentMnLine === "0 0") {
        break;
    }

    const parsedMnValues = currentMnLine.split(" ").map(Number);
    const maxAllowedSegments = parsedMnValues[0];
    const numberOfElements = parsedMnValues[1];

    const elementsDataArray = Array.from({ length: numberOfElements }, () => parseInt(inputLines.shift(), 10));

    let lowerBound = 0;
    let upperBound = 1500000;
    let optimalResult = upperBound + 1;

    while (lowerBound <= upperBound) {
        const midValue = Math.floor((lowerBound + upperBound) / 2);

        if (evaluateSplitFeasibility(midValue, elementsDataArray, maxAllowedSegments)) {
            optimalResult = midValue;
            upperBound = midValue - 1;
        } else {
            lowerBound = midValue + 1;
        }
    }
    console.log(optimalResult);
}
