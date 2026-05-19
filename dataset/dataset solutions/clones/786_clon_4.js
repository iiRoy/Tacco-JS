const fileSystem = require('fs');

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const rawInputLines = rawInputData.split('\n').map(s => s.trim()).filter(Boolean);

const PROXIMITY_THRESHOLD = 1e-10;

function locateIntersection(seg1, seg2) {
    const seg1P1 = seg1[0];
    const seg1P2 = seg1[1];
    const seg2P1 = seg2[0];
    const seg2P2 = seg2[1];

    const deltaX1 = seg1P2[0] - seg1P1[0];
    const deltaY1 = seg1P2[1] - seg1P1[1];
    const deltaX2 = seg2P2[0] - seg2P1[0];
    const deltaY2 = seg2P2[1] - seg2P1[1];

    const crossProductDenominator = deltaX1 * deltaY2 - deltaY1 * deltaX2;

    if (Math.abs(crossProductDenominator) < PROXIMITY_THRESHOLD) {
        return null;
    }

    const paramR = ((seg2P1[1] - seg1P1[1]) * deltaX2 - (seg2P1[0] - seg1P1[0]) * deltaY2) / crossProductDenominator;
    const paramS = ((seg2P1[1] - seg1P1[1]) * deltaX1 - (seg2P1[0] - seg1P1[0]) * deltaY1) / crossProductDenominator;

    const intersectX = seg1P1[0] + paramR * deltaX1;
    const intersectY = seg1P1[1] + paramR * deltaY1;

    const MIN_COORD_BOUND = -100;
    const MAX_COORD_BOUND = 100;

    if (intersectX < MIN_COORD_BOUND || intersectX > MAX_COORD_BOUND ||
        intersectY < MIN_COORD_BOUND || intersectY > MAX_COORD_BOUND) {
        return null;
    }

    return [intersectX, intersectY];
}

function processSegments(segments) {
    let totalFeatures = 1 + segments.length;

    const allCandidateIntersections = segments.flatMap((currentSegment, idx) =>
        segments.slice(0, idx)
            .map(previousSegment => locateIntersection(currentSegment, previousSegment))
            .filter(Boolean)
    );

    const distinctIntersections = allCandidateIntersections.reduce((uniquePointsAccumulator, currentPoint) => {
        const isCloseToExisting = uniquePointsAccumulator.some(existingPoint =>
            Math.hypot(currentPoint[0] - existingPoint[0], currentPoint[1] - existingPoint[1]) < PROXIMITY_THRESHOLD
        );

        if (!isCloseToExisting) {
            uniquePointsAccumulator.push(currentPoint);
        }
        return uniquePointsAccumulator;
    }, []);

    totalFeatures += distinctIntersections.length;

    return totalFeatures;
}

function coordinateProcessor(inputLines) {
    let currentLineCursor = 0;
    const outputResults = [];

    while (true) {
        const segmentCount = Number(inputLines[currentLineCursor++]);

        if (segmentCount === 0) {
            break;
        }

        const currentSetOfSegments = [];
        for (let i = 0; i < segmentCount; i++) {
            const coordinateStrings = inputLines[currentLineCursor++].split(' ').map(Number);
            currentSetOfSegments.push([
                [coordinateStrings[0], coordinateStrings[1]],
                [coordinateStrings[2], coordinateStrings[3]]
            ]);
        }
        outputResults.push(processSegments(currentSetOfSegments));
    }

    outputResults.forEach(result => console.log(result));
}

coordinateProcessor(rawInputLines);
