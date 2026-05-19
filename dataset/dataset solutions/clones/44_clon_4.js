function createPoint(xCoord, yCoord) {
    return { x: parseFloat(xCoord), y: parseFloat(yCoord) };
}

function calculateDistance(ptA, ptB) {
    const deltaX = ptA.x - ptB.x;
    const deltaY = ptA.y - ptB.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function findMidpoint(ptA, ptB) {
    return createPoint((ptA.x + ptB.x) / 2, (ptA.y + ptB.y) / 2);
}

function calculateSegmentSlope(ptA, ptB) {
    const deltaX = ptB.x - ptA.x;
    const deltaY = ptB.y - ptA.y;
    if (deltaX === 0) return Infinity;
    if (deltaY === 0) return 0;
    return deltaY / deltaX;
}

function getPerpendicularSlope(originalSegmentSlope) {
    if (originalSegmentSlope === Infinity) return 0;
    if (originalSegmentSlope === 0) return Infinity;
    return -1 / originalSegmentSlope;
}

function deriveLineEquation(pointOnLine, lineSlope) {
    if (lineSlope === Infinity) {
        return { type: 'vertical', xVal: pointOnLine.x };
    }
    if (lineSlope === 0) {
        return { type: 'horizontal', yVal: pointOnLine.y };
    }
    const yIntercept = pointOnLine.y - lineSlope * pointOnLine.x;
    return { type: 'slope-intercept', slopeVal: lineSlope, interceptVal: yIntercept };
}

function findLineIntersection(firstLine, secondLine) {
    let intersectionX, intersectionY;

    if (firstLine.type === 'vertical') {
        intersectionX = firstLine.xVal;
        if (secondLine.type === 'vertical') {
            return createPoint(NaN, NaN);
        } else if (secondLine.type === 'horizontal') {
            intersectionY = secondLine.yVal;
        } else {
            intersectionY = secondLine.slopeVal * intersectionX + secondLine.interceptVal;
        }
        return createPoint(intersectionX, intersectionY);
    }
    if (secondLine.type === 'vertical') {
        intersectionX = secondLine.xVal;
        if (firstLine.type === 'horizontal') {
            intersectionY = firstLine.yVal;
        } else {
            intersectionY = firstLine.slopeVal * intersectionX + firstLine.interceptVal;
        }
        return createPoint(intersectionX, intersectionY);
    }

    if (firstLine.type === 'horizontal') {
        intersectionY = firstLine.yVal;
        if (secondLine.type === 'horizontal') {
            return createPoint(NaN, NaN);
        } else {
            if (secondLine.slopeVal === 0) return createPoint(NaN, NaN);
            intersectionX = (intersectionY - secondLine.interceptVal) / secondLine.slopeVal;
        }
        return createPoint(intersectionX, intersectionY);
    }
    if (secondLine.type === 'horizontal') {
        intersectionY = secondLine.yVal;
        if (firstLine.slopeVal === 0) return createPoint(NaN, NaN);
        intersectionX = (intersectionY - firstLine.interceptVal) / firstLine.slopeVal;
        return createPoint(intersectionX, intersectionY);
    }

    const slopeA = firstLine.slopeVal;
    const interceptA = firstLine.interceptVal;
    const slopeB = secondLine.slopeVal;
    const interceptB = secondLine.interceptVal;

    if (slopeA === slopeB) {
        return createPoint(NaN, NaN);
    }

    intersectionX = (interceptB - interceptA) / (slopeA - slopeB);
    intersectionY = slopeA * intersectionX + interceptA;
    return createPoint(intersectionX, intersectionY);
}

function computeTriangleProperties(vertexA, vertexB, vertexC) {
    const midAB = findMidpoint(vertexA, vertexB);
    const slopeAB = calculateSegmentSlope(vertexA, vertexB);
    const perpSlopeAB = getPerpendicularSlope(slopeAB);
    const bisectorAB = deriveLineEquation(midAB, perpSlopeAB);

    const midBC = findMidpoint(vertexB, vertexC);
    const slopeBC = calculateSegmentSlope(vertexB, vertexC);
    const perpSlopeBC = getPerpendicularSlope(slopeBC);
    const bisectorBC = deriveLineEquation(midBC, perpSlopeBC);

    const circumcenterPoint = findLineIntersection(bisectorAB, bisectorBC);

    const circumradiusValue = calculateDistance(circumcenterPoint, vertexA);

    return { centerCoords: circumcenterPoint, radiusLength: circumradiusValue };
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
const inputLines = fileContent.split('\n');

for (const currentInputLine of inputLines) {
    const numericParts = currentInputLine.split(' ');
    if (numericParts.length === 6) {
        const pointOne = createPoint(numericParts[0], numericParts[1]);
        const pointTwo = createPoint(numericParts[2], numericParts[3]);
        const pointThree = createPoint(numericParts[4], numericParts[5]);

        const triangleResult = computeTriangleProperties(pointOne, pointTwo, pointThree);

        console.log(
            triangleResult.centerCoords.x.toFixed(3),
            triangleResult.centerCoords.y.toFixed(3),
            triangleResult.radiusLength.toFixed(3)
        );
        break;
    }
}
