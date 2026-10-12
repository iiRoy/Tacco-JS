function checkSegmentValidity(segmentLimitValue, sourceNumbers, maxAllowedDivisions) {
    let isPossible = true;
    let currentDivisionCount = 0;
    let currentAccumulatedSum = 0;

    for (let i = 0; i < sourceNumbers.length; i++) {
        const currentNumber = sourceNumbers[i];
        const sumIncludingCurrent = currentAccumulatedSum + currentNumber;

        if (segmentLimitValue < currentNumber) {
            isPossible = false;
            break;
        }

        if (sumIncludingCurrent === segmentLimitValue) {
            currentAccumulatedSum = 0;
            if (i !== sourceNumbers.length - 1) {
                currentDivisionCount++;
            }
        } else if (sumIncludingCurrent > segmentLimitValue) {
            currentAccumulatedSum = currentNumber;
            currentDivisionCount++;
        } else {
            currentAccumulatedSum = sumIncludingCurrent;
        }

        if (currentDivisionCount === maxAllowedDivisions) {
            isPossible = false;
            break;
        }
    }
    return isPossible;
}

const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
let inputLines = rawInput.trim().split("\n");

const parseConfigLine = (lineContent) => {
    const parts = lineContent.split(" ").map(Number);
    return { maxSegments: parts[0], numElements: parts[1] };
};

const readArrayElements = (linesSource, count) => {
    const elements = [];
    for (let k = 0; k < count; k++) {
        elements.push(Number(linesSource.shift()));
    }
    return elements;
};

while (true) {
    const currentConfigLine = inputLines.shift();
    if (currentConfigLine === "0 0") {
        break;
    }

    const { maxSegments, numElements } = parseConfigLine(currentConfigLine);
    const dataElements = readArrayElements(inputLines, numElements);

    let searchLowerBound = 0;
    let searchUpperBound = 1500000;
    let minimumValidLimit = 0;

    while (searchLowerBound <= searchUpperBound) {
        const midPointValue = Math.floor((searchLowerBound + searchUpperBound) / 2);
        const canFit = checkSegmentValidity(midPointValue, dataElements, maxSegments);

        if (canFit) {
            minimumValidLimit = midPointValue;
            searchUpperBound = midPointValue - 1;
        } else {
            searchLowerBound = midPointValue + 1;
        }
    }
    console.log(minimumValidLimit);
}
