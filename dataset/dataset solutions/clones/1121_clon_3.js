class Vec2D {
    constructor(xCoord = 0, yCoord = 0) {
        this.x = xCoord;
        this.y = yCoord;
    }

    static add(vecA, vecB) {
        return new Vec2D(vecA.x + vecB.x, vecA.y + vecB.y);
    }

    static subtract(vecA, vecB) {
        return new Vec2D(vecA.x - vecB.x, vecA.y - vecB.y);
    }

    static multiplyScalar(inputVec, scalarVal) {
        return new Vec2D(inputVec.x * scalarVal, inputVec.y * scalarVal);
    }

    static divideScalar(inputVec, scalarVal) {
        return new Vec2D(inputVec.x / scalarVal, inputVec.y / scalarVal);
    }

    static dotProduct(vecA, vecB) {
        return vecA.x * vecB.x + vecA.y * vecB.y;
    }

    static crossProduct(vecA, vecB) {
        return vecA.x * vecB.y - vecA.y * vecB.x;
    }

    static negate(inputVec) {
        return new Vec2D(-inputVec.x, -inputVec.y);
    }

    get lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }

    get length() {
        return Math.sqrt(this.lengthSquared);
    }

    get unit() {
        const len = this.length;
        if (len > 0) {
            return Vec2D.divideScalar(this, len);
        }
        return new Vec2D(this.x, this.y);
    }

    rotate90() {
        return new Vec2D(-this.y, this.x);
    }
}

function degToRad(degreeVal) {
    const PI_VAL = 3.14159265358979323846;
    return degreeVal * PI_VAL / 180;
}

function rotateVec(inputVec, angleDegree) {
    const radianAngle = degToRad(angleDegree);
    const sinVal = Math.sin(radianAngle);
    const cosVal = Math.cos(radianAngle);

    return new Vec2D(
        inputVec.x * cosVal - inputVec.y * sinVal,
        inputVec.x * sinVal + inputVec.y * cosVal
    );
}

function areVecsEqual(vecA, vecB) {
    return floatEq(vecA.x - vecB.x, 0) && floatEq(vecA.y - vecB.y, 0);
}

function floatEq(valA, valB) {
    const EPSILON_THRESHOLD = 1 / 8192;
    return Math.abs(valA - valB) < EPSILON_THRESHOLD;
}

function areVecsParallel(vecA, vecB) {
    const normalA = vecA.rotate90();
    return floatEq(0, Vec2D.dotProduct(normalA, vecB));
}

function areVecsOrthogonal(vecA, vecB) {
    return floatEq(0, Vec2D.dotProduct(vecA, vecB));
}

class Seg2D {
    constructor(pt1, pt2) {
        this.point1 = pt1;
        this.point2 = pt2;
    }
}

class GeoLine {
    constructor(baseVec, directionVec) {
        this.base = baseVec;
        this.direction = directionVec;
    }
}

function isOneSide(axisLine, targetSegment) {
    const diff1 = Vec2D.subtract(targetSegment.point1, axisLine.base);
    const diff2 = Vec2D.subtract(targetSegment.point2, axisLine.base);

    const normalVec = axisLine.direction.rotate90();

    return Vec2D.dotProduct(normalVec, diff1) * Vec2D.dotProduct(normalVec, diff2) > 0;
}

function isOverlapping(minA, maxA, minB, maxB) {
    return minB <= maxA && minA <= maxB;
}

function doSegsCollide(segmentA, segmentB) {
    const axisA = new GeoLine(segmentA.point1, Vec2D.subtract(segmentA.point2, segmentA.point1));
    const axisB = new GeoLine(segmentB.point1, Vec2D.subtract(segmentB.point2, segmentB.point1));

    if (isOneSide(axisA, segmentB)) {
        return false;
    }

    if (isOneSide(axisB, segmentA)) {
        return false;
    }

    if (areVecsParallel(axisA.direction, axisB.direction)) {
        const rangeA = projectSeg(segmentA, axisA.direction);
        const rangeB = projectSeg(segmentB, axisA.direction);

        return areRangesOverlapping(rangeA, rangeB);
    } else {
        return true;
    }
}

class ValRange {
    constructor(minVal, maxVal) {
        this.min = minVal;
        this.max = maxVal;
    }

    sort() {
        if (this.min > this.max) {
            [this.min, this.max] = [this.max, this.min];
        }
        return this;
    }
}

function getCombinedRange(range1, range2) {
    return new ValRange(Math.min(range1.min, range2.min), Math.max(range1.max, range2.max));
}

function projectSeg(targetSegment, ontoVec) {
    const ontoUnitVec = ontoVec.unit;

    let projectionRange = new ValRange(
        Vec2D.dotProduct(ontoUnitVec, targetSegment.point1),
        Vec2D.dotProduct(ontoUnitVec, targetSegment.point2)
    );

    return projectionRange.sort();
}

function areRangesOverlapping(range1, range2) {
    return isOverlapping(range1.min, range1.max, range2.min, range2.max);
}

function projectVec(projectedVec, ontoVec) {
    const ontoNormSq = ontoVec.lengthSquared;
    if (ontoNormSq > 0) {
        const dotProduct = Vec2D.dotProduct(projectedVec, ontoVec);
        return Vec2D.multiplyScalar(ontoVec, dotProduct / ontoNormSq);
    }
    return new Vec2D(ontoVec.x, ontoVec.y);
}

class Pt2D {
    constructor(xCoord = 0, yCoord = 0) {
        this.x = xCoord;
        this.y = yCoord;
    }

    static add(pt1, pt2) {
        return new Pt2D(pt1.x + pt2.x, pt1.y + pt2.y);
    }

    static subtract(pt1, pt2) {
        return new Pt2D(pt1.x - pt2.x, pt1.y - pt2.y);
    }

    static multiplyScalar(inputPt, scalarVal) {
        return new Pt2D(inputPt.x * scalarVal, inputPt.y * scalarVal);
    }

    get lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }

    get length() {
        return Math.sqrt(this.lengthSquared);
    }
}

function projectPtOnSeg(targetSegment, targetPoint) {
    const segVec = Vec2D.subtract(targetSegment.point2, targetSegment.point1);
    const ptToSegStartVec = Vec2D.subtract(targetPoint, targetSegment.point1);
    const projectionRate = Vec2D.dotProduct(ptToSegStartVec, segVec) / segVec.lengthSquared;
    const projectedVec = Vec2D.multiplyScalar(segVec, projectionRate);
    return Pt2D.add(targetSegment.point1, projectedVec);
}

function reflectPtOverSeg(targetSegment, targetPoint) {
    const projectionPt = projectPtOnSeg(targetSegment, targetPoint);
    const vecFromPtToProj = Pt2D.subtract(projectionPt, targetPoint);
    const doubledVec = Pt2D.multiplyScalar(vecFromPtToProj, 2);
    return Pt2D.add(doubledVec, targetPoint);
}

function getIntersectionPt(segmentA, segmentB) {
    const baseVec = Vec2D.subtract(segmentB.point2, segmentB.point1);
    const diff1Vec = Vec2D.subtract(segmentA.point1, segmentB.point1);
    const diff2Vec = Vec2D.subtract(segmentA.point2, segmentB.point1);

    const cross1 = Math.abs(Vec2D.crossProduct(baseVec, diff1Vec));
    const cross2 = Math.abs(Vec2D.crossProduct(baseVec, diff2Vec));

    const ratio = cross1 / (cross1 + cross2);

    const intersectX = segmentA.point1.x + (segmentA.point2.x - segmentA.point1.x) * ratio;
    const intersectY = segmentA.point1.y + (segmentA.point2.y - segmentA.point1.y) * ratio;
    return new Pt2D(intersectX, intersectY);
}

function clampVal(value, minVal, maxVal) {
    return Math.max(minVal, Math.min(value, maxVal));
}

function distLinePt(lineSeg, targetPoint) {
    const segVec = Vec2D.subtract(lineSeg.point2, lineSeg.point1);
    const ptToSegStartVec = Vec2D.subtract(targetPoint, lineSeg.point1);
    const segLength = segVec.length;
    return Math.abs(Vec2D.crossProduct(segVec, ptToSegStartVec) / segLength);
}

function distSegPt(targetSegment, targetPoint) {
    const segVec = Vec2D.subtract(targetSegment.point2, targetSegment.point1);
    const ptToP1Vec = Vec2D.subtract(targetPoint, targetSegment.point1);

    const dotP1 = Vec2D.dotProduct(segVec, ptToP1Vec);
    if (dotP1 < 0) {
        return ptToP1Vec.length;
    }

    const segReverseVec = Vec2D.subtract(targetSegment.point1, targetSegment.point2);
    const ptToP2Vec = Vec2D.subtract(targetPoint, targetSegment.point2);

    const dotP2 = Vec2D.dotProduct(segReverseVec, ptToP2Vec);
    if (dotP2 < 0) {
        return ptToP2Vec.length;
    }

    return distLinePt(targetSegment, targetPoint);
}

function distSegSeg(segmentA, segmentB) {
    if (doSegsCollide(segmentA, segmentB)) {
        return 0;
    }

    const d1 = distSegPt(segmentA, segmentB.point1);
    const d2 = distSegPt(segmentA, segmentB.point2);
    const d3 = distSegPt(segmentB, segmentA.point1);
    const d4 = distSegPt(segmentB, segmentA.point2);

    return Math.min(d1, d2, d3, d4);
}

const fileInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileInput.trim().split("\n");
const numPoints = parseInt(inputLines.shift(), 10);
const polygonPoints = [];

for (let i = 0; i < numPoints; ++i) {
    const coords = inputLines[i].split(" ").map(Number);
    polygonPoints.push(new Pt2D(coords[0], coords[1]));
}

let totalAreaSum = Vec2D.crossProduct(polygonPoints[numPoints - 1], polygonPoints[0]);
for (let i = 0; i < numPoints - 1; ++i) {
    totalAreaSum += Vec2D.crossProduct(polygonPoints[i], polygonPoints[i + 1]);
}
totalAreaSum = Math.abs(totalAreaSum) / 2;
console.log(totalAreaSum.toFixed(1));
