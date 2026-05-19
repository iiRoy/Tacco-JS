const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

function parseLineToNumbers(lineString) {
    return lineString.split(" ").map(Number);
}

function checkOneDimOverlap(segmentA_start, segmentA_end, segmentB_start, segmentB_end) {
    const isOverlapping = (segmentB_end >= segmentA_start) && (segmentB_start <= segmentA_end);
    return isOverlapping;
}

const inputLines = rawData.trim().split("\n");

inputLines.forEach(function(currentLineStr) {
    const numericCoordinates = parseLineToNumbers(currentLineStr);

    const rectA_x1 = numericCoordinates[0];
    const rectA_y1 = numericCoordinates[1];
    const rectA_x2 = numericCoordinates[2];
    const rectA_y2 = numericCoordinates[3];
    const rectB_x1 = numericCoordinates[4];
    const rectB_y1 = numericCoordinates[5];
    const rectB_x2 = numericCoordinates[6];
    const rectB_y2 = numericCoordinates[7];

    let overlappingDimensionsCount = 0;

    const hasXAxisOverlap = checkOneDimOverlap(rectA_x1, rectA_x2, rectB_x1, rectB_x2);
    if (hasXAxisOverlap) {
        overlappingDimensionsCount++;
    }

    const hasYAxisOverlap = checkOneDimOverlap(rectA_y1, rectA_y2, rectB_y1, rectB_y2);
    if (hasYAxisOverlap) {
        overlappingDimensionsCount++;
    }

    const finalOutput = (overlappingDimensionsCount === 2) ? "YES" : "NO";
    console.log(finalOutput);
});
