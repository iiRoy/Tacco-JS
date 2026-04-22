function processPointData(rawDataString) {
    const lines = rawDataString.split("\n").filter(l => l.trim() !== '');
    const numCoordinates = parseInt(lines[0], 10);
    const pointSet = [];

    for (let currentLineIndex = 1; currentLineIndex <= numCoordinates; currentLineIndex++) {
        const parts = lines[currentLineIndex].split(" ");
        pointSet.push({ x: parseInt(parts[0], 10), y: parseInt(parts[1], 10) });
    }

    const perimeterBoundary = calculateMonotoneHull(pointSet);

    let maximumSeparation = 0;

    for (let idxA = 0; idxA < perimeterBoundary.length; idxA++) {
        for (let idxB = idxA + 1; idxB < perimeterBoundary.length; idxB++) {
            const currentSeparation = measureGridDistance(perimeterBoundary[idxA], perimeterBoundary[idxB]);
            if (currentSeparation > maximumSeparation) {
                maximumSeparation = currentSeparation;
            }
        }
    }

    console.log(maximumSeparation);
}

function evaluateTurn(pointOne, pointTwo, pointThree) {
    return (pointTwo.x - pointOne.x) * (pointThree.y - pointOne.y) - (pointTwo.y - pointOne.y) * (pointThree.x - pointOne.x);
}

function calculateMonotoneHull(inputPoints) {
    const totalCount = inputPoints.length;
    if (totalCount <= 2) return [...inputPoints];

    inputPoints.sort((a, b) => {
        if (a.x !== b.x) return a.x - b.x;
        return a.y - b.y;
    });

    const lowerHullSegment = [];
    const upperHullSegment = [];

    for (let k = 0; k < totalCount; k++) {
        while (lowerHullSegment.length >= 2 && evaluateTurn(lowerHullSegment[lowerHullSegment.length - 2], lowerHullSegment[lowerHullSegment.length - 1], inputPoints[k]) <= 0) {
            lowerHullSegment.pop();
        }
        lowerHullSegment.push(inputPoints[k]);
    }

    for (let k = totalCount - 1; k >= 0; k--) {
        while (upperHullSegment.length >= 2 && evaluateTurn(upperHullSegment[upperHullSegment.length - 2], upperHullSegment[upperHullSegment.length - 1], inputPoints[k]) <= 0) {
            upperHullSegment.pop();
        }
        upperHullSegment.push(inputPoints[k]);
    }

    return lowerHullSegment.concat(upperHullSegment);
}

function measureGridDistance(ptA, ptB) {
    return Math.abs(ptA.x - ptB.x) + Math.abs(ptA.y - ptB.y);
}

processPointData(require("fs").readFileSync("/dev/stdin", "utf8"));