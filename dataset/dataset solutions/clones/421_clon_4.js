const obtainFeed = () => require('fs').readFileSync('/dev/stdin', 'utf8');

const calculateProbes = (dataPoints, desiredValue, lowerBound, upperBound, currentTally) => {
    currentTally++;

    if (lowerBound >= upperBound) {
        return currentTally;
    }

    let centerPoint = Math.floor((lowerBound + upperBound) / 2);

    if (dataPoints[centerPoint] === desiredValue) {
        return currentTally;
    }

    if (desiredValue < dataPoints[centerPoint]) {
        return calculateProbes(dataPoints, desiredValue, lowerBound, centerPoint, currentTally);
    } else {
        return calculateProbes(dataPoints, desiredValue, centerPoint + 1, upperBound, currentTally);
    }
};

const determineSearchCount = (collection, item) => {
    if (!collection || collection.length === 0) {
        return 1;
    }
    return calculateProbes(collection, item, 0, collection.length, 0);
};

const processSegmentsRecursively = (sourceLines, positionIndex) => {
    if (positionIndex >= sourceLines.length) {
        return;
    }

    let segmentSize = parseInt(sourceLines[positionIndex], 10);
    positionIndex++;

    if (segmentSize === 0) {
        return;
    }

    let currentSegment = sourceLines.slice(positionIndex, positionIndex + segmentSize).map(Number);
    positionIndex += segmentSize;

    let targetObjective = parseInt(sourceLines[positionIndex], 10);
    positionIndex++;

    console.log(determineSearchCount(currentSegment, targetObjective));

    processSegmentsRecursively(sourceLines, positionIndex);
};

const rawInputContent = obtainFeed();
const cleanedInputLines = rawInputContent.trim().split('\n');
processSegmentsRecursively(cleanedInputLines, 0);