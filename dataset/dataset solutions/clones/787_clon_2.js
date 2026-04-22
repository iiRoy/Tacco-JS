var segmentCollection = [];
var lineProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
lineProcessor.on('line', function (inputString) {
    segmentCollection.push(inputString);
});
process.stdin.on('end', function () {
    executeAnalysis(segmentCollection);
});
var SMALL_VALUE = 1e-10;
function determineIntersection(firstSegment, secondSegment) {
    var seg1_P1 = firstSegment[0],
        seg1_P2 = firstSegment[1],
        seg2_P1 = secondSegment[0],
        seg2_P2 = secondSegment[1];
    var paramR, paramS, intersectX, intersectY, determinant;
    determinant = (seg1_P2.x - seg1_P1.x) * (seg2_P2.y - seg2_P1.y) - (seg1_P2.y - seg1_P1.y) * (seg2_P2.x - seg2_P1.x);
    if (determinant === 0.0) {
        return null;
    }
    paramR = ((seg2_P2.y - seg2_P1.y) * (seg2_P1.x - seg1_P1.x) - (seg2_P2.x - seg2_P1.x) * (seg2_P1.y - seg1_P1.y)) / determinant;
    paramS = ((seg1_P2.y - seg1_P1.y) * (seg2_P1.x - seg1_P1.x) - (seg1_P2.x - seg1_P1.x) * (seg2_P1.y - seg1_P1.y)) / determinant;
    intersectX = seg1_P1.x * (1.0 - paramR) + seg1_P2.x * paramR;
    intersectY = seg1_P1.y * (1.0 - paramR) + seg1_P2.y * paramR;
    if (intersectX < -100.0 || intersectX > 100.0 || intersectY < -100.0 || intersectY > 100.0) {
        return null;
    }
    return { x: intersectX, y: intersectY };
}
function analyzeIntersections(geomSegments) {
    var foundCrossings, resultCounter = 1, lineIndex, prevLineIndex, currentIntersection, processedGeometries = [];
    for (lineIndex = 0; lineIndex < geomSegments.length; ++lineIndex) {
        resultCounter++;
        foundCrossings = [];
        for (prevLineIndex = 0; prevLineIndex < processedGeometries.length; ++prevLineIndex) {
            currentIntersection = determineIntersection(geomSegments[lineIndex], processedGeometries[prevLineIndex]);
            if (currentIntersection === null) {
                continue;
            }
            var isDuplicate = foundCrossings.some(function (checkedPoint) {
                return (Math.abs(currentIntersection.x - checkedPoint.x) < SMALL_VALUE &&
                    Math.abs(currentIntersection.y - checkedPoint.y) < SMALL_VALUE);
            });
            if (!isDuplicate) {
                foundCrossings.push(currentIntersection);
            }
        }
        processedGeometries.push(geomSegments[lineIndex]);
        resultCounter += foundCrossings.length;
    }
    return resultCounter;
}
function executeAnalysis(rawInputLines) {
    var numSegmentsToProcess, segmentIterator, coordinateStrings, geometryList;
    while ((numSegmentsToProcess = +rawInputLines.shift()) !== 0.0) {
        geometryList = [];
        for (segmentIterator = 0; segmentIterator < numSegmentsToProcess; ++segmentIterator) {
            coordinateStrings = rawInputLines.shift().split(' ');
            geometryList.push([
                { x: +coordinateStrings[0], y: +coordinateStrings[1] },
                { x: +coordinateStrings[2], y: +coordinateStrings[3] }
            ]);
        }
        console.log(analyzeIntersections(geometryList));
    }
}