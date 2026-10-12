const fileSystemModule = require("fs");

function computeCircumcenterAndRadius(
    coordX1, coordY1,
    coordX2, coordY2,
    coordX3, coordY3
) {
    const p1x = coordX1;
    const p1y = coordY1;
    const p2x = coordX2;
    const p2y = coordY2;
    const p3x = coordX3;
    const p3y = coordY3;

    const p1xSquared = p1x * p1x;
    const p1ySquared = p1y * p1y;
    const p2xSquared = p2x * p2x;
    const p2ySquared = p2y * p2y;
    const p3xSquared = p3x * p3x;
    const p3ySquared = p3y * p3y;

    const commonDenominator = 2 * (
        (p1y - p3y) * (p1x - p2x) -
        (p1y - p2y) * (p1x - p3x)
    );

    const numeratorXFactor1 = (p1y - p3y);
    const numeratorXSum1 = (p1ySquared - p2ySquared + p1xSquared - p2xSquared);
    const numeratorXFactor2 = (p1y - p2y);
    const numeratorXSum2 = (p1ySquared - p3ySquared + p1xSquared - p3xSquared);
    const circumcenterXNumerator = (numeratorXFactor1 * numeratorXSum1) - (numeratorXFactor2 * numeratorXSum2);

    const numeratorYFactor1 = (p1x - p3x);
    const numeratorYSum1 = (p1xSquared - p2xSquared + p1ySquared - p2ySquared);
    const numeratorYFactor2 = (p1x - p2x);
    const numeratorYSum2 = (p1xSquared - p3xSquared + p1ySquared - p3ySquared);
    const circumcenterYNumerator = (numeratorYFactor1 * numeratorYSum1) - (numeratorYFactor2 * numeratorYSum2);

    const circumcenterX = circumcenterXNumerator / commonDenominator;
    const circumcenterY = circumcenterYNumerator / commonDenominator;

    const radiusSquared = (p1x - circumcenterX) * (p1x - circumcenterX) +
                          (p1y - circumcenterY) * (p1y - circumcenterY);
    const circumradius = Math.sqrt(radiusSquared);

    return {
        centerCoordX: circumcenterX,
        centerCoordY: circumcenterY,
        radiusValue: circumradius
    };
}

const inputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const inputLines = inputBuffer.trim().split('\n');

inputLines.forEach(function(currentInputLine) {
    const lineSegments = currentInputLine.split(' ');

    if (lineSegments.length !== 6) {
        return;
    }

    const point1X = parseFloat(lineSegments[0]);
    const point1Y = parseFloat(lineSegments[1]);
    const point2X = parseFloat(lineSegments[2]);
    const point2Y = parseFloat(lineSegments[3]);
    const point3X = parseFloat(lineSegments[4]);
    const point3Y = parseFloat(lineSegments[5]);

    const calculationResult = computeCircumcenterAndRadius(
        point1X, point1Y,
        point2X, point2Y,
        point3X, point3Y
    );

    console.log(
        calculationResult.centerCoordX.toFixed(3),
        calculationResult.centerCoordY.toFixed(3),
        calculationResult.radiusValue.toFixed(3)
    );
});
