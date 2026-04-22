const GEOMETRIC_TOLERANCE = 1e-10;

function createPoint(xVal, yVal) {
    return { xCoord: xVal, yCoord: yVal };
}

function arePointsCoincident(ptA, ptB) {
    const deltaX = ptA.xCoord - ptB.xCoord;
    const deltaY = ptA.yCoord - ptB.yCoord;
    return (deltaX * deltaX + deltaY * deltaY) < GEOMETRIC_TOLERANCE;
}

const vectorOperations = {
    vectorFromPoints: (p1, p2) => createPoint(p2.xCoord - p1.xCoord, p2.yCoord - p1.yCoord),
    crossProductScalar: (v1, v2) => v1.xCoord * v2.yCoord - v1.yCoord * v2.xCoord,
    scaleVector: (v, factor) => createPoint(v.xCoord * factor, v.yCoord * factor),
    addVectorToPoint: (p, v) => createPoint(p.xCoord + v.xCoord, p.yCoord + v.yCoord)
};

function obtainSegmentIntersection(segmentAlpha, segmentBeta) {
    const alphaStartPt = segmentAlpha[0];
    const alphaEndPt = segmentAlpha[1];
    const betaStartPt = segmentBeta[0];
    const betaEndPt = segmentBeta[1];

    const directionAlpha = vectorOperations.vectorFromPoints(alphaStartPt, alphaEndPt);
    const directionBeta = vectorOperations.vectorFromPoints(betaStartPt, betaEndPt);
    const startToStartVec = vectorOperations.vectorFromPoints(alphaStartPt, betaStartPt);

    const crossDenom = vectorOperations.crossProductScalar(directionAlpha, directionBeta);

    if (Math.abs(crossDenom) < GEOMETRIC_TOLERANCE) {
        return null; // Lines are parallel or collinear
    }

    const alphaParam = vectorOperations.crossProductScalar(startToStartVec, directionBeta) / crossDenom;

    // The original code uses a strict inequality for r (parameterAlpha)
    // meaning the intersection must be strictly between the endpoints of the first segment.
    if (alphaParam < GEOMETRIC_TOLERANCE || (1.0 - alphaParam) < GEOMETRIC_TOLERANCE) {
        return null;
    }

    const intersectionLoc = vectorOperations.addVectorToPoint(alphaStartPt, vectorOperations.scaleVector(directionAlpha, alphaParam));
    return intersectionLoc;
}

function determinePlanarRegions(allInputSegments) {
    // According to Euler's formula for planar graphs (V - E + F = 1 + C)
    // For arrangement of lines, regions R = 1 + L + I, where L is number of lines, I is number of intersection points.
    // However, the original code calculates this iteratively: R_n = R_{n-1} + 1 + k_n
    // where k_n is the number of new intersection points created by line n with previous lines.
    const finalRegionCount = allInputSegments.reduce((currentRegionTotal, currentSegmentEntity, currentSegmentIndex) => {
        let intersectionPointsAddedByCurrentSegment = 0;
        const distinctIntersectionsForThisSegment = [];

        // Iterate through all previously processed segments
        for (let previousSegmentIndex = 0; previousSegmentIndex < currentSegmentIndex; ++previousSegmentIndex) {
            const priorSegmentEntity = allInputSegments[previousSegmentIndex];
            const potentialCrossingPoint = obtainSegmentIntersection(currentSegmentEntity, priorSegmentEntity);

            if (potentialCrossingPoint) {
                // Check if this intersection point is already counted for the current segment
                const alreadyRecorded = distinctIntersectionsForThisSegment.some(existingPnt =>
                    arePointsCoincident(existingPnt, potentialCrossingPoint)
                );

                if (!alreadyRecorded) {
                    distinctIntersectionsForThisSegment.push(potentialCrossingPoint);
                    intersectionPointsAddedByCurrentSegment++;
                }
            }
        }
        // Each new segment adds at least one new region (the segment itself divides an existing region)
        // Plus, each unique intersection point it creates with previous segments adds another new region.
        return currentRegionTotal + 1 + intersectionPointsAddedByCurrentSegment;
    }, 1); // Start with 1 region (the empty plane)

    return finalRegionCount;
}

function processAllInput(rawInputLines) {
    const processedResults = [];
    let linePtr = 0;

    while (linePtr < rawInputLines.length) {
        const currentSegmentQuantity = parseInt(rawInputLines[linePtr++], 10);

        if (currentSegmentQuantity === 0) {
            break; // Sentinel value to end processing
        }

        const testCaseSegments = [];
        for (let m = 0; m < currentSegmentQuantity; ++m) {
            const coordinates = rawInputLines[linePtr++].split(' ').map(Number);
            testCaseSegments.push([
                createPoint(coordinates[0], coordinates[1]),
                createPoint(coordinates[2], coordinates[3])
            ]);
        }
        processedResults.push(determinePlanarRegions(testCaseSegments));
    }
    return processedResults;
}

const inputBuffer = [];
require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
}).on('line', (individualLine) => {
  inputBuffer.push(individualLine);
}).on('close', () => {
  const calculatedOutput = processAllInput(inputBuffer);
  calculatedOutput.forEach(value => console.log(value));
});