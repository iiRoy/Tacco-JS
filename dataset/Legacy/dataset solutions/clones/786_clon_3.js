const inputBuffer = [];
const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

inputReader.on('line', (currentLineStr) => {
    inputBuffer.push(currentLineStr);
});

process.stdin.on('end', () => {
    processInputAndSolve(inputBuffer);
});

const TOLERANCE_THRESHOLD = 1e-10;

const calculateDeterminant = (vec1X, vec1Y, vec2X, vec2Y) => {
    return vec1X * vec2Y - vec1Y * vec2X;
};

function calculateIntersectionPoint(segmentA, segmentB) {
    const pointA1 = segmentA[0];
    const pointA2 = segmentA[1];
    const pointB1 = segmentB[0];
    const pointB2 = segmentB[1];

    const vecAX = pointA2.x - pointA1.x;
    const vecAY = pointA2.y - pointA1.y;

    const vecBX = pointB2.x - pointB1.x;
    const vecBY = pointB2.y - pointB1.y;

    const crossProductDenominator = calculateDeterminant(vecAX, vecAY, vecBX, vecBY);

    if (Math.abs(crossProductDenominator) < TOLERANCE_THRESHOLD) {
        return null;
    }

    const vecA1B1X = pointB1.x - pointA1.x;
    const vecA1B1Y = pointB1.y - pointA1.y;

    const paramR = calculateDeterminant(vecA1B1X, vecA1B1Y, vecBX, vecBY) / crossProductDenominator;
    const paramS = calculateDeterminant(vecA1B1X, vecA1B1Y, vecAX, vecAY) / crossProductDenominator;

    const intersectX = pointA1.x + paramR * vecAX;
    const intersectY = pointA1.y + paramR * vecAY;

    const MIN_COORD_BOUND = -100;
    const MAX_COORD_BOUND = 100;
    if (intersectX < MIN_COORD_BOUND || intersectX > MAX_COORD_BOUND || intersectY < MIN_COORD_BOUND || intersectY > MAX_COORD_BOUND) {
        return null;
    }

    return { x: intersectX, y: intersectY };
}

const arePointsApproximatelyEqual = (p1, p2, toleranceSq) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return (dx * dx + dy * dy) < toleranceSq;
};

function computeRegionsCount(parsedSegments) {
    let regionCount = 1;
    const toleranceSquared = TOLERANCE_THRESHOLD * TOLERANCE_THRESHOLD;

    for (let idxA = 0; idxA < parsedSegments.length; idxA++) {
        regionCount++;
        const uniqueIntersectionPoints = [];

        for (let idxB = 0; idxB < idxA; idxB++) {
            const currentIntersection = calculateIntersectionPoint(parsedSegments[idxA], parsedSegments[idxB]);
            if (currentIntersection === null) {
                continue;
            }

            let isDuplicate = false;
            for (const existingPoint of uniqueIntersectionPoints) {
                if (arePointsApproximatelyEqual(currentIntersection, existingPoint, toleranceSquared)) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                uniqueIntersectionPoints.push(currentIntersection);
            }
        }
        regionCount += uniqueIntersectionPoints.length;
    }
    return regionCount;
}

const parseSegmentString = (segmentString) => {
    const parts = segmentString.split(' ');
    return [
        { x: Number(parts[0]), y: Number(parts[1]) },
        { x: Number(parts[2]), y: Number(parts[3]) }
    ];
};

function processInputAndSolve(inputBuffer) {
    let numSegmentsInCase;
    while ((numSegmentsInCase = Number(inputBuffer.shift())) !== 0) {
        const currentCaseSegments = [];
        for (let i = 0; i < numSegmentsInCase; i++) {
            const segmentDataString = inputBuffer.shift();
            currentCaseSegments.push(parseSegmentString(segmentDataString));
        }
        console.log(computeRegionsCount(currentCaseSegments));
    }
}
