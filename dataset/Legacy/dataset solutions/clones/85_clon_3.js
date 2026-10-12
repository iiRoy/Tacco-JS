const fileSystemModule = require("fs");

function calculateFixedSlope(xCoord1, yCoord1, xCoord2, yCoord2) {
    const numericX1 = Number(xCoord1);
    const numericY1 = Number(yCoord1);
    const numericX2 = Number(xCoord2);
    const numericY2 = Number(yCoord2);

    const deltaX = numericX2 - numericX1;
    const deltaY = numericY2 - numericY1;

    if (deltaX === 0) {
        // Handle vertical lines: slope is Infinity or -Infinity.
        // If deltaY is also 0, it's 0/0 which is NaN.
        // toFixed(6) on Infinity/-Infinity/NaN produces "Infinity" / "-Infinity" / TypeError respectively.
        // This matches original behavior.
        return (deltaY > 0 ? Infinity : (deltaY < 0 ? -Infinity : NaN)).toFixed(6);
    }

    const slopeValue = deltaY / deltaX;
    return slopeValue.toFixed(6);
}

const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const allInputLines = rawInputContent.split('\n');

allInputLines.forEach(function(currentInputLine) {
    const lineSegments = currentInputLine.split(' ');

    // The original code checks if lineSegments[2] is truthy (i.e., not an empty string or undefined).
    // This implicitly means there are at least 3 parts.
    // If fewer than 8 parts are present, subsequent Number() conversions or arithmetic operations
    // involving `undefined` will result in `NaN`, and `NaN.toFixed(6)` will throw a TypeError,
    // which is the exact observable behavior we must preserve.
    if (lineSegments[2]) {
        const point1X = lineSegments[0];
        const point1Y = lineSegments[1];
        const point2X = lineSegments[2];
        const point2Y = lineSegments[3];

        const point3X = lineSegments[4];
        const point3Y = lineSegments[5];
        const point4X = lineSegments[6];
        const point4Y = lineSegments[7];

        const firstSegmentSlope = calculateFixedSlope(point1X, point1Y, point2X, point2Y);
        const secondSegmentSlope = calculateFixedSlope(point3X, point3Y, point4X, point4Y);

        const areSlopesIdentical = (firstSegmentSlope === secondSegmentSlope);

        console.log(areSlopesIdentical ? 'YES' : 'NO');
    }
});
