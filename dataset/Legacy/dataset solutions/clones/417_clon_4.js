function checkFeasibility(limitValue, dataElements, maxSegments) {
    if (dataElements.length === 0) {
        return true;
    }

    if (dataElements.some(val => val > limitValue)) {
        return false;
    }

    const { segmentCount } = dataElements.reduce((accumulator, currentElement) => {
        if (accumulator.currentSegmentSum + currentElement > limitValue) {
            return { currentSegmentSum: currentElement, segmentCount: accumulator.segmentCount + 1 };
        } else {
            return { currentSegmentSum: accumulator.currentSegmentSum + currentElement, segmentCount: accumulator.segmentCount };
        }
    }, { currentSegmentSum: 0, segmentCount: 1 });

    return segmentCount <= maxSegments;
}

function findOptimalPartitionSum(lowerBound, upperBound, feasibilityChecker, elements, maxParts) {
    let currentLower = lowerBound;
    let currentUpper = upperBound;
    let resultValue = upperBound + 1;

    while (currentLower <= currentUpper) {
        const midpoint = Math.floor((currentLower + currentUpper) / 2);
        if (feasibilityChecker(midpoint, elements, maxParts)) {
            resultValue = midpoint;
            currentUpper = midpoint - 1;
        } else {
            currentLower = midpoint + 1;
        }
    }
    return resultValue;
}

const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split("\n");

while (true) {
    const configLine = inputLines.shift();
    if (configLine === "0 0") break;

    const [maxParts, elementCount] = configLine.split(" ").map(Number);
    const dataElements = inputLines.splice(0, elementCount).map(Number);

    const lowerLimit = 0;
    const upperLimit = 1500000;

    const finalResult = findOptimalPartitionSum(lowerLimit, upperLimit, checkFeasibility, dataElements, maxParts);
    console.log(finalResult);
}
