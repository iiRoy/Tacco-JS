function calculateTriangleArea(sideA, sideB, sideC) {
    const semiPerimeter = (sideA + sideB + sideC) / 2;
    const termA = semiPerimeter - sideA;
    const termB = semiPerimeter - sideB;
    const termC = semiPerimeter - sideC;
    const areaValue = Math.sqrt(semiPerimeter * termA * termB * termC);
    return areaValue;
}

function calculateDistance(xCoord1, yCoord1, xCoord2, yCoord2) {
    const deltaX = xCoord1 - xCoord2;
    const deltaY = yCoord1 - yCoord2;
    const deltaXSquared = Math.pow(deltaX, 2);
    const deltaYSquared = Math.pow(deltaY, 2);
    return Math.sqrt(deltaXSquared + deltaYSquared);
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineEntries = rawData.trim().split("\n");

const GEOMETRY_TOLERANCE = 0.0005;

for (let entryIndex = 0; entryIndex < lineEntries.length; entryIndex++) {
    const coordsArray = lineEntries[entryIndex].split(" ").map(Number);

    const coordX1 = coordsArray[0];
    const coordY1 = coordsArray[1];
    const coordX2 = coordsArray[2];
    const coordY2 = coordsArray[3];
    const coordX3 = coordsArray[4];
    const coordY3 = coordsArray[5];
    const pointPX = coordsArray[6];
    const pointPY = coordsArray[7];

    const dist12 = calculateDistance(coordX1, coordY1, coordX2, coordY2);
    const dist13 = calculateDistance(coordX1, coordY1, coordX3, coordY3);
    const dist23 = calculateDistance(coordX2, coordY2, coordX3, coordY3);

    const distP1 = calculateDistance(pointPX, pointPY, coordX1, coordY1);
    const distP2 = calculateDistance(pointPX, pointPY, coordX2, coordY2);
    const distP3 = calculateDistance(pointPX, pointPY, coordX3, coordY3);

    const mainTriangleArea = calculateTriangleArea(dist12, dist13, dist23);

    const areaP12 = calculateTriangleArea(dist12, distP1, distP2);
    const areaP13 = calculateTriangleArea(dist13, distP1, distP3);
    const areaP23 = calculateTriangleArea(dist23, distP2, distP3);
    const subTriangleAreasSum = areaP12 + areaP13 + areaP23;

    console.log((Math.abs(mainTriangleArea - subTriangleAreasSum) < GEOMETRY_TOLERANCE) ? "YES" : "NO");
}
