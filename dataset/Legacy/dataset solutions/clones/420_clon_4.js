function determineFeasibility(limitValue, dataSegments, maxDivisions) {
    let isPossible = true;
    let divisionCount = 1;
    let currentSegmentTotal = 0;

    for (const segmentItem of dataSegments) {
        if (segmentItem > limitValue) {
            isPossible = false;
            break;
        }

        if (currentSegmentTotal + segmentItem <= limitValue) {
            currentSegmentTotal += segmentItem;
        } else {
            divisionCount++;
            currentSegmentTotal = segmentItem;
        }

        if (divisionCount > maxDivisions) {
            isPossible = false;
            break;
        }
    }
    return isPossible;
}

const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split("\n");

let linePointer = 0;

function getNextLine() {
    return inputLines[linePointer++];
}

while (true) {
    const dimensionsLine = getNextLine();
    if (dimensionsLine === "0 0") {
        break;
    }

    const dimensions = dimensionsLine.split(" ").map(Number);
    const maxAllowedDivisions = dimensions[0];
    let numberOfElements = dimensions[1];

    const elementValues = [];
    for (let i = 0; i < numberOfElements; i++) {
        elementValues.push(Number(getNextLine()));
    }

    let lowerBound = 0;
    let upperBound = 1500000;
    let finalResult = 0;

    while (lowerBound <= upperBound) {
        const midPoint = Math.floor((lowerBound + upperBound) / 2);
        const checkResult = determineFeasibility(midPoint, elementValues, maxAllowedDivisions);

        if (checkResult) {
            finalResult = midPoint;
            upperBound = midPoint - 1;
        } else {
            lowerBound = midPoint + 1;
        }
    }
    console.log(finalResult);
}
