var inputLinesBuffer = [];
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
inputReader.on('line', function (currentLine) {
  inputLinesBuffer.push(currentLine);
});
process.stdin.on('end', function () {
  processInputData(inputLinesBuffer);
});

const EPSILON_VAL = 1e-10;

function determineIntersection(segOne, segTwo) {
    const [[x1a, y1a], [x1b, y1b]] = segOne;
    const [[x2a, y2a], [x2b, y2b]] = segTwo;

    // Represent line 1 as A1x + B1y = C1
    const coeffA1 = y1b - y1a;
    const coeffB1 = x1a - x1b;
    const constC1 = coeffA1 * x1a + coeffB1 * y1a;

    // Represent line 2 as A2x + B2y = C2
    const coeffA2 = y2b - y2a;
    const coeffB2 = x2a - x2b;
    const constC2 = coeffA2 * x2a + coeffB2 * y2a;

    // Calculate the determinant of the coefficient matrix
    const systemDeterminant = coeffA1 * coeffB2 - coeffA2 * coeffB1;

    // If determinant is close to zero, lines are parallel or collinear
    if (Math.abs(systemDeterminant) < EPSILON_VAL) {
        return null;
    }

    // Solve for intersection point (x, y) using Cramer's rule
    const intersectX = (constC1 * coeffB2 - constC2 * coeffB1) / systemDeterminant;
    const intersectY = (coeffA1 * constC2 - coeffA2 * constC1) / systemDeterminant;

    // Check if the intersection point lies strictly between the endpoints of the FIRST segment.
    // This replicates the original code's specific behavior (r < EPS || 1-r < EPS returns null).
    
    const deltaX1 = x1b - x1a;
    const deltaY1 = y1b - y1a;
    const segmentOneLengthSq = deltaX1 * deltaX1 + deltaY1 * deltaY1;

    let parameterT;
    if (Math.abs(segmentOneLengthSq) < EPSILON_VAL) {
        // Segment one is effectively a point, not a line.
        // Original code would return null if 'temp' (determinant of direction vectors) is near zero.
        // If segment one is a point, deltaX1 and deltaY1 are zero, making original 'temp' zero.
        return null;
    }

    // Calculate parameter 't' for the first segment using projection
    // t = ((P - A) . (B - A)) / |B - A|^2
    parameterT = ((intersectX - x1a) * deltaX1 + (intersectY - y1a) * deltaY1) / segmentOneLengthSq;

    // If 't' is too close to 0 or 1, the intersection is at an endpoint of the first segment.
    // The original code explicitly excludes these points.
    if (parameterT < EPSILON_VAL || (1 - parameterT) < EPSILON_VAL) {
        return null;
    }

    return { x: intersectX, y: intersectY };
}

function calculateRegions(lineSegments) {
    // The total number of regions starts at 1 (the entire plane).
    // Each new line segment adds at least one new region.
    // Each unique intersection point found for the current segment with previous segments
    // further divides a region, adding one more region.
    // This functional approach using reduce accumulates the total regions.

    return lineSegments.reduce((accumulatedRegions, currentSegment, currentSegmentIndex, allSegments) => {
        // Each new segment inherently adds one region to the total.
        let regionsFromCurrentSegment = 1;

        // A Set is used to store unique intersection points for the current segment.
        // Points are stringified to leverage Set's uniqueness property for objects.
        const uniqueIntersectionKeys = new Set();

        // Iterate through all segments that appeared before the current one.
        for (let priorSegmentIndex = 0; priorSegmentIndex < currentSegmentIndex; priorSegmentIndex++) {
            const priorSegment = allSegments[priorSegmentIndex];
            const intersectionResult = determineIntersection(currentSegment, priorSegment);

            if (intersectionResult !== null) {
                // Stringify the point coordinates to a fixed precision for consistent Set keys.
                uniqueIntersectionKeys.add(`${intersectionResult.x.toFixed(10)},${intersectionResult.y.toFixed(10)}`);
            }
        }

        // The number of unique intersection points found for the current segment
        // with previous segments directly corresponds to additional regions created.
        regionsFromCurrentSegment += uniqueIntersectionKeys.size;

        return accumulatedRegions + regionsFromCurrentSegment;
    }, 1); // Initial value for accumulatedRegions: 1 (the plane itself)
}

function processInputData(allInputLines) {
    let inputPointer = 0;
    const outputResults = [];

    while (true) {
        const segmentCount = Number.parseInt(allInputLines[inputPointer++], 10);
        if (segmentCount === 0) {
            break; // Termination condition
        }

        const currentSetOfSegments = [];
        for (let k = 0; k < segmentCount; k++) {
            const coordinateStrings = allInputLines[inputPointer++].split(' ');
            // Parse coordinates and store points as arrays [x, y]
            currentSetOfSegments.push([
                [Number.parseFloat(coordinateStrings[0]), Number.parseFloat(coordinateStrings[1])],
                [Number.parseFloat(coordinateStrings[2]), Number.parseFloat(coordinateStrings[3])]
            ]);
        }
        outputResults.push(calculateRegions(currentSetOfSegments));
    }
    outputResults.forEach(res => console.log(res));
}
