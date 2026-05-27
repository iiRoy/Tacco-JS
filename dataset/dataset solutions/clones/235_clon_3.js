const fileSystemModule = require("fs");

const FLOATING_POINT_EPSILON = 1e-10;

function determinePerpendicularityStatus(inputCoordinateStrings) {
    const x1Value = parseFloat(inputCoordinateStrings[0]);
    const y1Value = parseFloat(inputCoordinateStrings[1]);
    const x2Value = parseFloat(inputCoordinateStrings[2]);
    const y2Value = parseFloat(inputCoordinateStrings[3]);
    const x3Value = parseFloat(inputCoordinateStrings[4]);
    const y3Value = parseFloat(inputCoordinateStrings[5]);
    const x4Value = parseFloat(inputCoordinateStrings[6]);
    const y4Value = parseFloat(inputCoordinateStrings[7]);

    const vectorOneComponentX = x2Value - x1Value;
    const vectorOneComponentY = y2Value - y1Value;

    const vectorTwoComponentX = x4Value - x3Value;
    const vectorTwoComponentY = y4Value - y3Value;

    const computedDotProduct = (vectorOneComponentX * vectorTwoComponentX) + (vectorOneComponentY * vectorTwoComponentY);

    const absoluteDotProductValue = Math.abs(computedDotProduct);

    const isApproximatelyZero = absoluteDotProductValue < FLOATING_POINT_EPSILON;

    return isApproximatelyZero ? 'NO' : 'YES';
}

const rawInputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const trimmedInputContent = rawInputBuffer.trim();
const inputLines = trimmedInputContent.split('\n');

inputLines.forEach(function(currentInputLine) {
    const lineSegmentsData = currentInputLine.split(' ');
    const outputResult = determinePerpendicularityStatus(lineSegmentsData);
    console.log(outputResult);
});
