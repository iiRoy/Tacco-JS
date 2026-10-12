function determineSegmentCount(limitValue, elementsArray) {
    const initialState = { currentSum: 0, segments: 1, possible: true };

    const finalState = elementsArray.reduce((accumulator, currentElement) => {
        if (!accumulator.possible) {
            return accumulator;
        }

        if (currentElement > limitValue) {
            return { ...accumulator, possible: false };
        }

        if (accumulator.currentSum + currentElement > limitValue) {
            return {
                currentSum: currentElement,
                segments: accumulator.segments + 1,
                possible: true
            };
        } else {
            return {
                currentSum: accumulator.currentSum + currentElement,
                segments: accumulator.segments,
                possible: true
            };
        }
    }, initialState);

    if (!finalState.possible) {
        return Infinity;
    }
    return finalState.segments;
}

function checkFeasibility(candidateMaxSum, dataElements, maxAllowedSegments) {
    const segmentsRequired = determineSegmentCount(candidateMaxSum, dataElements);
    return segmentsRequired <= maxAllowedSegments;
}

function findMinimumMaxSum(lowBound, highBound, dataArray, maxSegments, predicateFunction) {
    let currentLow = lowBound;
    let currentHigh = highBound;
    let result = highBound;

    while (currentLow <= currentHigh) {
        const midPoint = Math.floor((currentLow + currentHigh) / 2);
        if (predicateFunction(midPoint, dataArray, maxSegments)) {
            result = midPoint;
            currentHigh = midPoint - 1;
        } else {
            currentLow = midPoint + 1;
        }
    }
    return result;
}

function* generateInputLines(inputString) {
    const lines = inputString.trim().split("\n");
    let lineIndex = 0;
    while (lineIndex < lines.length) {
        yield lines[lineIndex++];
    }
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLineIterator = generateInputLines(rawInputData);

while (true) {
    const segmentConfigurationLine = inputLineIterator.next().value;

    if (segmentConfigurationLine === "0 0") {
        break;
    }

    const [maxSegmentsAllowed, elementCount] = segmentConfigurationLine.split(" ").map(Number);

    const numericElements = [];
    for (let i = 0; i < elementCount; i++) {
        numericElements.push(Number(inputLineIterator.next().value));
    }

    const lowerBound = 0;
    const upperBound = 1500000;

    const finalAnswer = findMinimumMaxSum(lowerBound, upperBound, numericElements, maxSegmentsAllowed, checkFeasibility);

    console.log(finalAnswer);
}
