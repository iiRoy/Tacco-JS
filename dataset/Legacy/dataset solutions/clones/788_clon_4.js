var inputDataBuffer = [];
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
inputReader.on('line', function (currentInputLine) {
  inputDataBuffer.push(currentInputLine);
});
process.stdin.on('end', function () {
  processInputSets(inputDataBuffer);
});
var GEOMETRY_TOLERANCE = 1e-10;

function determineSegmentIntersection(segment1, segment2) {
    const [[x1, y1], [x2, y2]] = segment1;
    const [[x3, y3], [x4, y4]] = segment2;

    const deltaX1 = x2 - x1;
    const deltaY1 = y2 - y1;
    const deltaX2 = x4 - x3;
    const deltaY2 = y4 - y3;

    const crossProductDenominator = (-deltaX2 * deltaY1 + deltaX1 * deltaY2);

    if (Math.abs(crossProductDenominator) < GEOMETRY_TOLERANCE) {
        return null;
    }

    const paramT = (deltaX2 * (y1 - y3) - deltaY2 * (x1 - x3)) / crossProductDenominator;

    if (paramT < GEOMETRY_TOLERANCE || paramT > (1 - GEOMETRY_TOLERANCE)) {
        return null;
    }

    const intersectX = x1 + (paramT * deltaX1);
    const intersectY = y1 + (paramT * deltaY1);

    return [intersectX, intersectY];
}

function computePlanarRegions(segmentCollection) {
    const numberOfSegments = segmentCollection.length;
    if (numberOfSegments === 0) {
        return 1;
    }

    const allFoundIntersections = segmentCollection.flatMap((segA, idxA) =>
        segmentCollection.slice(idxA + 1).map(segB =>
            determineSegmentIntersection(segA, segB)
        )
    ).filter(point => point !== null);

    const distinctIntersectionPoints = allFoundIntersections.reduce((accumulator, currentPoint) => {
        const isAlreadyPresent = accumulator.some(existingPoint =>
            Math.pow(currentPoint[0] - existingPoint[0], 2) + Math.pow(currentPoint[1] - existingPoint[1], 2) < GEOMETRY_TOLERANCE
        );
        return isAlreadyPresent ? accumulator : [...accumulator, currentPoint];
    }, []);

    return 1 + numberOfSegments + distinctIntersectionPoints.length;
}

function processInputSets(allInputLines) {
    const recursiveProcessor = (remainingLines, currentResults) => {
        if (remainingLines.length === 0) {
            return currentResults;
        }

        const segmentCountStr = remainingLines[0];
        const segmentCount = Number(segmentCountStr);

        if (segmentCount === 0) {
            return currentResults;
        }

        const segmentDefinitionLines = remainingLines.slice(1, 1 + segmentCount);
        const nextRemainingLines = remainingLines.slice(1 + segmentCount);

        const parsedSegments = segmentDefinitionLines.map(lineString => {
            const coordinateParts = lineString.split(' ');
            return [
                [Number(coordinateParts[0]), Number(coordinateParts[1])],
                [Number(coordinateParts[2]), Number(coordinateParts[3])]
            ];
        });

        const calculatedRegions = computePlanarRegions(parsedSegments);
        return recursiveProcessor(nextRemainingLines, [...currentResults, calculatedRegions]);
    };

    const finalOutputValues = recursiveProcessor(allInputLines, []);
    finalOutputValues.forEach(value => console.log(value));
}
