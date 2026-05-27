const EPSILON_VAL = 1 / 8192;

function areApproxEqual(valA, valB) {
    return Math.abs(valA - valB) < EPSILON_VAL;
}

class Vec {
    constructor(xCoord = 0, yCoord = 0) {
        this.x = xCoord;
        this.y = yCoord;
    }

    add(otherVec) {
        return new Vec(this.x + otherVec.x, this.y + otherVec.y);
    }

    subtract(otherVec) {
        return new Vec(this.x - otherVec.x, this.y - otherVec.y);
    }

    scale(scalarFactor) {
        return new Vec(this.x * scalarFactor, this.y * scalarFactor);
    }

    negate() {
        return new Vec(-this.x, -this.y);
    }

    dot(otherVec) {
        return this.x * otherVec.x + this.y * otherVec.y;
    }

    crossZ(otherVec) {
        return this.x * otherVec.y - this.y * otherVec.x;
    }

    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }

    magnitude() {
        return Math.sqrt(this.lengthSquared());
    }

    normalize() {
        const len = this.magnitude();
        if (len > EPSILON_VAL) {
            return this.scale(1 / len);
        }
        return new Vec(0, 0);
    }

    rotate90Deg() {
        return new Vec(-this.y, this.x);
    }

    rotate(angleRad) {
        const cosVal = Math.cos(angleRad);
        const sinVal = Math.sin(angleRad);
        return new Vec(
            this.x * cosVal - this.y * sinVal,
            this.x * sinVal + this.y * cosVal
        );
    }

    isEqual(otherVec) {
        return areApproxEqual(this.x, otherVec.x) && areApproxEqual(this.y, otherVec.y);
    }

    isParallelTo(otherVec) {
        return areApproxEqual(this.crossZ(otherVec), 0);
    }

    isOrthogonalTo(otherVec) {
        return areApproxEqual(this.dot(otherVec), 0);
    }

    projectOnto(targetVec) {
        const targetLenSq = targetVec.lengthSquared();
        if (targetLenSq < EPSILON_VAL) {
            return new Vec(0, 0);
        }
        const scalar = this.dot(targetVec) / targetLenSq;
        return targetVec.scale(scalar);
    }
}

function convertDegreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

class Interval {
    constructor(lowerBound, upperBound) {
        this.minVal = lowerBound;
        this.maxVal = upperBound;
        this.ensureSorted();
    }

    ensureSorted() {
        if (this.minVal > this.maxVal) {
            [this.minVal, this.maxVal] = [this.maxVal, this.minVal];
        }
    }

    overlaps(otherInterval) {
        return otherInterval.minVal <= this.maxVal && this.minVal <= otherInterval.maxVal;
    }
}

class Segment {
    constructor(startPoint, endPoint) {
        this.start = startPoint;
        this.end = endPoint;
    }

    getVector() {
        return this.end.subtract(this.start);
    }

    projectOntoAxis(axisVec) {
        const unitAxis = axisVec.normalize();
        const p1Proj = this.start.dot(unitAxis);
        const p2Proj = this.end.dot(unitAxis);
        return new Interval(p1Proj, p2Proj);
    }

    distanceToLine(point) {
        const segVec = this.getVector();
        if (segVec.lengthSquared() < EPSILON_VAL) {
            return point.subtract(this.start).magnitude();
        }
        const crossProduct = segVec.crossZ(point.subtract(this.start));
        return Math.abs(crossProduct) / segVec.magnitude();
    }

    distanceToPoint(point) {
        const segVec = this.getVector();
        const pToStart = point.subtract(this.start);

        const dotProduct = pToStart.dot(segVec);
        if (dotProduct < 0) {
            return pToStart.magnitude();
        }

        const segLenSq = segVec.lengthSquared();
        if (dotProduct > segLenSq) {
            return point.subtract(this.end).magnitude();
        }

        return this.distanceToLine(point);
    }

    projectPoint(point) {
        const segVec = this.getVector();
        const pToStart = point.subtract(this.start);
        const projectionScalar = pToStart.dot(segVec) / segVec.lengthSquared();
        return this.start.add(segVec.scale(projectionScalar));
    }

    reflectPoint(point) {
        const projectedPoint = this.projectPoint(point);
        const vecToProjected = projectedPoint.subtract(point);
        return point.add(vecToProjected.scale(2));
    }

    findIntersection(otherSegment) {
        const v1 = this.getVector();
        const v2 = otherSegment.getVector();
        const p3_minus_p1 = otherSegment.start.subtract(this.start);

        const determinant = v1.crossZ(v2);

        if (areApproxEqual(determinant, 0)) {
            if (areApproxEqual(p3_minus_p1.crossZ(v1), 0)) {
                const projAxis = v1.normalize();
                const intervalA = this.projectOntoAxis(projAxis);
                const intervalB = otherSegment.projectOntoAxis(projAxis);
                if (intervalA.overlaps(intervalB)) {
                    // Original getCrossPoint is not used for parallel/collinear cases.
                    // It's only called if isSegmentsCollide is true AND not parallel.
                    // So, for parallel/collinear, we return null here.
                    return null;
                }
            }
            return null;
        }

        const t = p3_minus_p1.crossZ(v2) / determinant;
        const u = p3_minus_p1.crossZ(v1) / determinant;

        if (t >= -EPSILON_VAL && t <= 1 + EPSILON_VAL && u >= -EPSILON_VAL && u <= 1 + EPSILON_VAL) {
            return this.start.add(v1.scale(t));
        }

        return null;
    }

    intersects(otherSegment) {
        const v1 = this.getVector();
        const v2 = otherSegment.getVector();
        const p3_minus_p1 = otherSegment.start.subtract(this.start);

        const determinant = v1.crossZ(v2);

        if (areApproxEqual(determinant, 0)) {
            if (areApproxEqual(p3_minus_p1.crossZ(v1), 0)) {
                const projAxis = v1.normalize();
                const intervalA = this.projectOntoAxis(projAxis);
                const intervalB = otherSegment.projectOntoAxis(projAxis);
                return intervalA.overlaps(intervalB);
            }
            return false;
        }

        const t = p3_minus_p1.crossZ(v2) / determinant;
        const u = p3_minus_p1.crossZ(v1) / determinant;

        return t >= -EPSILON_VAL && t <= 1 + EPSILON_VAL && u >= -EPSILON_VAL && u <= 1 + EPSILON_VAL;
    }

    distanceToSegment(otherSegment) {
        if (this.intersects(otherSegment)) {
            return 0;
        }

        const dist1 = this.distanceToPoint(otherSegment.start);
        const dist2 = this.distanceToPoint(otherSegment.end);
        const dist3 = otherSegment.distanceToPoint(this.start);
        const dist4 = otherSegment.distanceToPoint(this.end);

        return Math.min(dist1, dist2, dist3, dist4);
    }
}

class Line {
    constructor(pointOnLine, directionVec) {
        this.origin = pointOnLine;
        this.direction = directionVec.normalize();
    }

    distanceToPoint(point) {
        const vecToPoint = point.subtract(this.origin);
        const crossProduct = this.direction.crossZ(vecToPoint);
        return Math.abs(crossProduct);
    }
}

function clampValue(value, lowerBound, upperBound) {
    return Math.max(lowerBound, Math.min(value, upperBound));
}

const fileSystem = require('fs');
const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const lines = inputData.trim().split('\n');
const polygonVertexCount = parseInt(lines[0], 10);

const polygonVertices = lines.slice(1, polygonVertexCount + 1).map(line => {
    const coords = line.split(' ').map(Number);
    return new Vec(coords[0], coords[1]);
});

const areaSum = polygonVertices.reduce((accumulator, currentVertex, index, array) => {
    const nextVertex = array[(index + 1) % array.length];
    return accumulator + currentVertex.crossZ(nextVertex);
}, 0);

const polygonArea = Math.abs(areaSum) / 2;

console.log(polygonArea.toFixed(1));
