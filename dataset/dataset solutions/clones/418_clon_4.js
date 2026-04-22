const evaluateSplit = (limitValue, dataElements, maxDivisions) => {
    if (dataElements.some(element => element > limitValue)) {
        return false;
    }

    const processElements = (index, currentSegmentSum, segmentsFormed) => {
        if (index === dataElements.length) {
            return true;
        }

        const currentElement = dataElements[index];

        if (currentSegmentSum + currentElement <= limitValue) {
            return processElements(index + 1, currentSegmentSum + currentElement, segmentsFormed);
        } else {
            const nextSegmentsFormed = segmentsFormed + 1;
            if (nextSegmentsFormed > maxDivisions) {
                return false;
            }
            return processElements(index + 1, currentElement, nextSegmentsFormed);
        }
    };

    return processElements(0, 0, 1);
};

const acquiredInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const rawLines = acquiredInput.trim().split("\n");

let currentLineIndex = 0;

while (true) {
    const specificationLine = rawLines[currentLineIndex++];
    if (specificationLine === "0 0") break;

    const [targetDivisions, totalElements] = specificationLine.split(" ").map(Number);

    const valueSequence = [];
    for (let i = 0; i < totalElements; i++) {
        valueSequence.push(Number(rawLines[currentLineIndex++]));
    }

    let searchLowerBound = 0;
    let searchUpperBound = 1500000;

    if (valueSequence.length > 0) {
        searchLowerBound = Math.max(...valueSequence);
    } else {
        searchLowerBound = 0;
        searchUpperBound = 0;
    }

    let optimalSum = searchUpperBound;

    while (searchLowerBound <= searchUpperBound) {
        const midPoint = Math.floor((searchLowerBound + searchUpperBound) / 2);

        if (evaluateSplit(midPoint, valueSequence, targetDivisions)) {
            optimalSum = midPoint;
            searchUpperBound = midPoint - 1;
        } else {
            searchLowerBound = midPoint + 1;
        }
    }
    console.log(optimalSum);
}