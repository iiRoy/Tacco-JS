const GEOM_CONSTS = Object.freeze({
    ROT_CCW: 1,
    ROT_CW: -1,
    COLLINEAR_BACK: 2,
    COLLINEAR_FRONT: -2,
    COLLINEAR_ON_SEGMENT: 0,
    PRECISION_EPSILON: 1e-9 // A small number for float comparisons
});

/**
 * Helper for floating point comparisons.
 * @param {number} valA - First value.
 * @param {number} valB - Second value.
 * @param {number} [epsilon] - Custom epsilon for comparison.
 * @returns {boolean} True if values are approximately equal.
 */
function areFloatsApproxEqual(valA, valB, epsilon = GEOM_CONSTS.PRECISION_EPSILON) {
    return Math.abs(valA - valB) < epsilon;
}

/**
 * Safe division, returns 0 if divisor is zero.
 * @param {number} numerator - The numerator.
 * @param {number} denominator - The denominator.
 * @returns {number} Result of division, or 0 if denominator is zero.
 */
function safeDivision(numerator, denominator) {
    if (areFloatsApproxEqual(denominator, 0)) {
        return 0; // Or throw an error, depending on desired behavior
    }
    return numerator / denominator;
}

/**
 * Converts degrees to radians.
 * @param {number} degrees - Angle in degrees.
 * @returns {number} Angle in radians.
 */
function convertDegreesToRadians(degrees) {
    return degrees * (Math.PI / 180.0);
}

/**
 * Two-dimensional vector utility.
 */
class Vec2 {
    /**
     * Creates a new 2D vector.
     * @param {number} [horiz=0] - The horizontal component.
     * @param {number} [vert=0] - The vertical component.
     */
    constructor(horiz = 0, vert = 0) {
        if (typeof horiz !== 'number' || typeof vert !== 'number') {
            throw new Error("Vec2 components must be numbers.");
        }
        this.horiz = horiz;
        this.vert = vert;
    }

    /**
     * Creates a Vec2 instance from an array.
     * @param {number[]} coords - An array [x, y].
     * @returns {Vec2} A new Vec2 instance.
     */
    static fromArray(coords) {
        if (!Array.isArray(coords) || coords.length !== 2) {
            throw new Error("Input must be an array of two numbers.");
        }
        return new Vec2(coords[0], coords[1]);
    }

    /**
     * Returns a new vector that is the sum of this vector and another.
     * @param {Vec2} otherVec - The vector to add.
     * @returns {Vec2} A new vector representing the sum.
     */
    add(otherVec) {
        return new Vec2(this.horiz + otherVec.horiz, this.vert + otherVec.vert);
    }

    /**
     * Returns a new vector that is the difference between this vector and another.
     * @param {Vec2} otherVec - The vector to subtract.
     * @returns {Vec2} A new vector representing the difference.
     */
    subtract(otherVec) {
        return new Vec2(this.horiz - otherVec.horiz, this.vert - otherVec.vert);
    }

    /**
     * Returns a new vector scaled by a scalar value.
     * @param {number} scalarVal - The scalar to multiply by.
     * @returns {Vec2} A new scaled vector.
     */
    scale(scalarVal) {
        return new Vec2(this.horiz * scalarVal, this.vert * scalarVal);
    }

    /**
     * Calculates the dot product with another vector.
     * @param {Vec2} otherVec - The other vector.
     * @returns {number} The dot product.
     */
    dot(otherVec) {
        return (this.horiz * otherVec.horiz) + (this.vert * otherVec.vert);
    }

    /**
     * Calculates the 2D cross product (scalar result) with another vector.
     * @param {Vec2} otherVec - The other vector.
     * @returns {number} The scalar cross product.
     */
    cross(otherVec) {
        return (this.horiz * otherVec.vert) - (this.vert * otherVec.horiz);
    }

    /**
     * Gets the squared magnitude (length) of the vector.
     * @returns {number} The squared magnitude.
     */
    get magnitudeSquared() {
        return this.dot(this);
    }

    /**
     * Gets the magnitude (length) of the vector.
     * @returns {number} The magnitude.
     */
    get magnitude() {
        return Math.sqrt(this.magnitudeSquared);
    }

    /**
     * Returns a new normalized (unit) vector.
     * @returns {Vec2} A new unit vector.
     */
    normalize() {
        const mag = this.magnitude;
        if (mag === 0) {
            return new Vec2(0, 0); // Or throw error, or return original
        }
        return this.scale(1 / mag);
    }

    /**
     * Checks if this vector is approximately equal to another.
     * @param {Vec2} otherVec - The other vector.
     * @returns {boolean} True if vectors are approximately equal.
     */
    isApproxEqual(otherVec) {
        return areFloatsApproxEqual(this.horiz, otherVec.horiz) && areFloatsApproxEqual(this.vert, otherVec.vert);
    }

    /**
     * Returns a string representation of the vector.
     * @returns {string} String in format "(x, y)".
     */
    toString() {
        return `(${this.horiz.toFixed(3)}, ${this.vert.toFixed(3)})`;
    }
}

/**
 * Creates a new vector rotated by 90 degrees counter-clockwise.
 * @param {Vec2} originalVec - The vector to rotate.
 * @returns {Vec2} A new rotated vector.
 */
function rotateVec90CCW(originalVec) {
    return new Vec2(-originalVec.vert, originalVec.horiz);
}

/**
 * Rotates a vector by a specified angle in radians.
 * @param {Vec2} inputVec - The vector to rotate.
 * @param {number} angleRad - The angle in radians.
 * @returns {Vec2} A new rotated vector.
 */
function getRotatedVectorRad(inputVec, angleRad) {
    const sinVal = Math.sin(angleRad);
    const cosVal = Math.cos(angleRad);
    return new Vec2(
        (inputVec.horiz * cosVal) - (inputVec.vert * sinVal),
        (inputVec.horiz * sinVal) + (inputVec.vert * cosVal)
    );
}

/**
 * Rotates a vector by a specified angle in degrees.
 * @param {Vec2} inputVec - The vector to rotate.
 * @param {number} angleDeg - The angle in degrees.
 * @returns {Vec2} A new rotated vector.
 */
function getRotatedVectorDeg(inputVec, angleDeg) {
    const rad = convertDegreesToRadians(angleDeg);
    return getRotatedVectorRad(inputVec, rad);
}

/**
 * Checks if two vectors are approximately parallel.
 * @param {Vec2} vecA - First vector.
 * @param {Vec2} vecB - Second vector.
 * @returns {boolean} True if parallel.
 */
function areVectorsParallel(vecA, vecB) {
    // Vectors are parallel if their cross product is zero.
    return areFloatsApproxEqual(vecA.cross(vecB), 0);
}

/**
 * Checks if two vectors are approximately perpendicular (orthogonal).
 * @param {Vec2} vecA - First vector.
 * @param {Vec2} vecB - Second vector.
 * @returns {boolean} True if perpendicular.
 */
function areVectorsOrthogonal(vecA, vecB) {
    // Vectors are orthogonal if their dot product is zero.
    return areFloatsApproxEqual(vecA.dot(vecB), 0);
}

/**
 * Represents a 2D line segment.
 */
class Segment2D {
    /**
     * Creates a new line segment.
     * @param {Vec2} startPoint - The starting point of the segment.
     * @param {Vec2} endPoint - The ending point of the segment.
     */
    constructor(startPoint, endPoint) {
        if (!(startPoint instanceof Vec2) || !(endPoint instanceof Vec2)) {
            throw new Error("Segment2D points must be Vec2 instances.");
        }
        this.start = startPoint;
        this.end = endPoint;
    }

    /**
     * Returns a vector representing the direction and length of the segment.
     * @returns {Vec2} The vector from start to end.
     */
    toVector() {
        return this.end.subtract(this.start);
    }
}

/**
 * Represents an infinite 2D line.
 */
class LineData {
    /**
     * Creates a new line.
     * @param {Vec2} basePoint - A point on the line.
     * @param {Vec2} directionVec - The direction vector of the line.
     */
    constructor(basePoint, directionVec) {
        if (!(basePoint instanceof Vec2) || !(directionVec instanceof Vec2)) {
            throw new Error("LineData basePoint and directionVec must be Vec2 instances.");
        }
        if (directionVec.magnitudeSquared === 0) {
            throw new Error("LineData direction vector cannot be zero.");
        }
        this.base = basePoint;
        this.direction = directionVec.normalize(); // Ensure direction is normalized
    }

    /**
     * Checks if the line data is valid (e.g., direction vector is not zero).
     * @returns {boolean} True if valid.
     */
    isValid() {
        return this.direction.magnitudeSquared > 0;
    }
}

/**
 * Checks if a segment lies entirely on one side of an axis defined by a line.
 * @param {LineData} axisLine - The line defining the axis.
 * @param {Segment2D} targetSegment - The segment to check.
 * @returns {boolean} True if the segment is on one side, false otherwise.
 */
function isOnOneSideOfLine(axisLine, targetSegment) {
    if (!axisLine.isValid()) return false; // Guard against invalid axis line

    const normal = rotateVec90CCW(axisLine.direction);

    const vecA = targetSegment.start.subtract(axisLine.base);
    const vecB = targetSegment.end.subtract(axisLine.base);

    const dotA = normal.dot(vecA);
    const dotB = normal.dot(vecB);

    // If both points have the same sign dot product with the normal, they are on the same side.
    return (dotA * dotB) > GEOM_CONSTS.PRECISION_EPSILON;
}

/**
 * Represents a numerical range [min, max].
 */
class ValueRange {
    /**
     * Creates a new range. Ensures min <= max.
     * @param {number} minVal - The minimum value.
     * @param {number} maxVal - The maximum value.
     */
    constructor(minVal, maxVal) {
        if (typeof minVal !== 'number' || typeof maxVal !== 'number') {
            throw new Error("ValueRange components must be numbers.");
        }
        this.min = Math.min(minVal, maxVal);
        this.max = Math.max(minVal, maxVal);
    }

    /**
     * Checks if the range is empty (min === max).
     * @returns {boolean} True if empty.
     */
    isEmpty() {
        return areFloatsApproxEqual(this.min, this.max);
    }

    /**
     * Returns a new range that is the union of two ranges.
     * @param {ValueRange} range1 - First range.
     * @param {ValueRange} range2 - Second range.
     * @returns {ValueRange} A new range representing the union.
     */
    static union(range1, range2) {
        return new ValueRange(Math.min(range1.min, range2.min), Math.max(range1.max, range2.max));
    }

    /**
     * Checks if two ranges overlap.
     * @param {ValueRange} otherRange - The other range.
     * @returns {boolean} True if they overlap.
     */
    overlapsWith(otherRange) {
        return this.min <= otherRange.max && this.max >= otherRange.min;
    }
}

/**
 * Projects a segment onto a given vector direction and returns the projected range.
 * @param {Segment2D} targetSegment - The segment to project.
 * @param {Vec2} projectionDirection - The vector defining the projection axis.
 * @returns {ValueRange} The range of scalar projections.
 */
function projectSegmentOntoVector(targetSegment, projectionDirection) {
    if (projectionDirection.magnitudeSquared === 0) {
        throw new Error("Projection direction vector cannot be zero.");
    }
    const unitDir = projectionDirection.normalize();

    const projMin = unitDir.dot(targetSegment.start);
    const projMax = unitDir.dot(targetSegment.end);

    return new ValueRange(projMin, projMax);
}

/**
 * Determines if two line segments intersect.
 * Uses the Separating Axis Theorem (SAT) for 2D line segments.
 * @param {Segment2D} segA - The first line segment.
 * @param {Segment2D} segB - The second line segment.
 * @returns {boolean} True if the segments collide (intersect or overlap).
 */
function doSegmentsIntersect(segA, segB) {
    const dirA = segA.toVector();
    const dirB = segB.toVector();

    // Axis 1: Perpendicular to segA
    const axisLineA = new LineData(segA.start, dirA);
    if (isOnOneSideOfLine(axisLineA, segB)) {
        return false;
    }

    // Axis 2: Perpendicular to segB
    const axisLineB = new LineData(segB.start, dirB);
    if (isOnOneSideOfLine(axisLineB, segA)) {
        return false;
    }

    // If directions are parallel, check for overlap on the same line.
    if (areVectorsParallel(dirA, dirB)) {
        // Project both segments onto the direction vector of segA.
        const rangeA = projectSegmentOntoVector(segA, dirA);
        const rangeB = projectSegmentOntoVector(segB, dirA);
        return rangeA.overlapsWith(rangeB);
    }

    // If not separated by either segment's perpendicular axis and not parallel, they must intersect.
    return true;
}

/**
 * Represents a point in Cartesian coordinates.
 * This class is conceptually similar to Vec2 but emphasizes its role as a point.
 */
class PointCartesian {
    /**
     * Creates a new 2D point.
     * @param {number} xCoord - The X coordinate.
     * @param {number} yCoord - The Y coordinate.
     */
    constructor(xCoord, yCoord) {
        if (typeof xCoord !== 'number' || typeof yCoord !== 'number') {
            throw new Error("PointCartesian coordinates must be numbers.");
        }
        this.x = xCoord;
        this.y = yCoord;
    }

    /**
     * Converts the point to a Vec2 instance.
     * @returns {Vec2} A new Vec2 representing the point's coordinates.
     */
    toVec2() {
        return new Vec2(this.x, this.y);
    }

    /**
     * Adds another point's coordinates to this one, returning a new point.
     * @param {PointCartesian} otherPoint - The point to add.
     * @returns {PointCartesian} A new point.
     */
    add(otherPoint) {
        return new PointCartesian(this.x + otherPoint.x, this.y + otherPoint.y);
    }

    /**
     * Subtracts another point's coordinates from this one, returning a new point.
     * @param {PointCartesian} otherPoint - The point to subtract.
     * @returns {PointCartesian} A new point.
     */
    subtract(otherPoint) {
        return new PointCartesian(this.x - otherPoint.x, this.y - otherPoint.y);
    }

    /**
     * Multiplies the point's coordinates by a scalar, returning a new point.
     * @param {number} scalar - The scalar value.
     * @returns {PointCartesian} A new point.
     */
    scale(scalar) {
        return new PointCartesian(this.x * scalar, this.y * scalar);
    }
}

/**
 * Finds the closest point on a line segment to a given point (projection).
 * @param {Segment2D} targetSegment - The line segment.
 * @param {PointCartesian} queryPoint - The point to project.
 * @returns {PointCartesian} The projected point on the segment.
 */
function getProjectedPointOnSegment(targetSegment, queryPoint) {
    const segVec = targetSegment.toVector();
    const pointToStartVec = queryPoint.toVec2().subtract(targetSegment.start.toVec2());

    const segVecSqMag = segVec.magnitudeSquared;
    if (segVecSqMag === 0) { // Segment is a point
        return targetSegment.start;
    }

    // Calculate projection factor (t)
    const t = safeDivision(pointToStartVec.dot(segVec), segVecSqMag);

    // Clamp t to [0, 1] to ensure the projected point is on the segment
    const clampedT = Math.max(0, Math.min(1, t));

    const projectedVec = targetSegment.start.toVec2().add(segVec.scale(clampedT));
    return new PointCartesian(projectedVec.horiz, projectedVec.vert);
}

/**
 * Calculates the reflection of a point across a line segment.
 * @param {Segment2D} reflectionAxis - The segment acting as the reflection axis.
 * @param {PointCartesian} incidentPoint - The point to reflect.
 * @returns {PointCartesian} The reflected point.
 */
function getReflectedPoint(reflectionAxis, incidentPoint) {
    const projected = getProjectedPointOnSegment(reflectionAxis, incidentPoint);
    // Vector from incidentPoint to its projection
    const vecToProjection = projected.toVec2().subtract(incidentPoint.toVec2());
    // Doubling this vector gives the displacement from incidentPoint to reflected point
    const displacement = vecToProjection.scale(2);
    return incidentPoint.add(new PointCartesian(displacement.horiz, displacement.vert));
}

/**
 * Calculates the intersection point of two line segments.
 * Returns null if segments are parallel or do not intersect within their bounds.
 * @param {Segment2D} seg1 - The first line segment.
 * @param {Segment2D} seg2 - The second line segment.
 * @returns {PointCartesian | null} The intersection point, or null if no intersection.
 */
function findSegmentIntersection(seg1, seg2) {
    const p1 = seg1.start.toVec2();
    const q1 = seg1.end.toVec2();
    const p2 = seg2.start.toVec2();
    const q2 = seg2.end.toVec2();

    const d1 = q1.subtract(p1); // Direction vector for seg1
    const d2 = q2.subtract(p2); // Direction vector for seg2

    const crossProduct_d1_d2 = d1.cross(d2);

    // Check if segments are parallel (or collinear)
    if (areFloatsApproxEqual(crossProduct_d1_d2, 0)) {
        return null; // For simplicity, return null for parallel/collinear non-intersecting
    }

    const t = p2.subtract(p1).cross(d2) / crossProduct_d1_d2;
    const u = p2.subtract(p1).cross(d1) / crossProduct_d1_d2;

    // Check if intersection point lies within both segments
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        const intersectVec = p1.add(d1.scale(t));
        return new PointCartesian(intersectVec.horiz, intersectVec.vert);
    }

    return null; // No intersection within segment bounds
}

/**
 * Clamps a numerical value within a specified range.
 * @param {number} value - The value to clamp.
 * @param {number} minVal - The minimum allowed value.
 * @param {number} maxVal - The maximum allowed value.
 * @returns {number} The clamped value.
 */
function clampValue(value, minVal, maxVal) {
    return Math.max(minVal, Math.min(value, maxVal));
}

/**
 * Calculates the shortest distance from a point to an infinite line.
 * @param {Segment2D} lineSegment - A segment defining the line (used for its endpoints).
 * @param {PointCartesian} queryPoint - The point to measure distance from.
 * @returns {number} The distance.
 */
function getDistancePointToLine(lineSegment, queryPoint) {
    const lineVec = lineSegment.toVector();
    if (lineVec.magnitudeSquared === 0) { // Line is a point
        return queryPoint.toVec2().subtract(lineSegment.start.toVec2()).magnitude;
    }
    const pointToStartVec = queryPoint.toVec2().subtract(lineSegment.start.toVec2());
    // Area of parallelogram / base length = height (distance)
    return Math.abs(lineVec.cross(pointToStartVec)) / lineVec.magnitude;
}

/**
 * Calculates the shortest distance from a point to a line segment.
 * @param {Segment2D} targetSegment - The line segment.
 * @param {PointCartesian} queryPoint - The point.
 * @returns {number} The shortest distance.
 */
function getDistancePointToSegment(targetSegment, queryPoint) {
    const segVec = targetSegment.toVector();
    const pointToStartVec = queryPoint.toVec2().subtract(targetSegment.start.toVec2());
    const pointToEndVec = queryPoint.toVec2().subtract(targetSegment.end.toVec2());

    // Check if projection falls outside the segment (closer to an endpoint)
    if (pointToStartVec.dot(segVec) < 0) {
        return pointToStartVec.magnitude; // Closer to start point
    }
    if (pointToEndVec.dot(segVec) > 0) { // Note: dot(B-A, P-B) > 0 implies P is past B
        return pointToEndVec.magnitude; // Closer to end point
    }

    // Projection falls within the segment, so distance is to the infinite line
    return getDistancePointToLine(targetSegment, queryPoint);
}

/**
 * Calculates the shortest distance between two line segments.
 * @param {Segment2D} segmentOne - The first segment.
 * @param {Segment2D} segmentTwo - The second segment.
 * @returns {number} The shortest distance.
 */
function getMinimumSegmentSeparation(segmentOne, segmentTwo) {
    // If segments intersect, the distance is 0.
    if (doSegmentsIntersect(segmentOne, segmentTwo)) {
        return 0;
    }

    // Otherwise, the distance is the minimum of point-to-segment distances.
    const dist1 = getDistancePointToSegment(segmentOne, segmentTwo.start);
    const dist2 = getDistancePointToSegment(segmentOne, segmentTwo.end);
    const dist3 = getDistancePointToSegment(segmentTwo, segmentOne.start);
    const dist4 = getDistancePointToSegment(segmentTwo, segmentOne.end);

    return Math.min(dist1, dist2, dist3, dist4);
}

/**
 * Determines the orientation of three ordered points (p1, p2, p3).
 * @param {PointCartesian} p1 - First point.
 * @param {PointCartesian} p2 - Second point.
 * @param {PointCartesian} p3 - Third point.
 * @returns {number} One of GEOM_CONSTS.ROT_CCW, GEOM_CONSTS.ROT_CW, GEOM_CONSTS.COLLINEAR_BACK, GEOM_CONSTS.COLLINEAR_FRONT, GEOM_CONSTS.COLLINEAR_ON_SEGMENT.
 */
function calculatePointOrientation(p1, p2, p3) {
    const vecA = p2.toVec2().subtract(p1.toVec2());
    const vecB = p3.toVec2().subtract(p1.toVec2());
    const crossProd = vecA.cross(vecB);

    if (crossProd > GEOM_CONSTS.PRECISION_EPSILON) {
        return GEOM_CONSTS.ROT_CCW;
    }
    if (crossProd < -GEOM_CONSTS.PRECISION_EPSILON) {
        return GEOM_CONSTS.ROT_CW;
    }

    // Collinear case
    if (vecA.dot(vecB) < -GEOM_CONSTS.PRECISION_EPSILON) {
        return GEOM_CONSTS.COLLINEAR_BACK; // p3 is behind p1-p2
    }
    if (vecA.magnitudeSquared < vecB.magnitudeSquared - GEOM_CONSTS.PRECISION_EPSILON) {
        return GEOM_CONSTS.COLLINEAR_FRONT; // p3 is further than p2 from p1
    }
    return GEOM_CONSTS.COLLINEAR_ON_SEGMENT; // p3 is on segment p1-p2
}

/**
 * Computes the convex hull of a set of points using the Monotone Chain (Andrew's) algorithm.
 * @param {PointCartesian[]} inputPoints - An array of PointCartesian objects.
 * @returns {PointCartesian[]} An array of points representing the convex hull in counter-clockwise order.
 */
function buildConvexHull(inputPoints) {
    if (inputPoints.length < 3) {
        return [...inputPoints]; // Return a copy if too few points
    }

    // Sort points lexicographically (by x, then by y)
    inputPoints.sort((ptA, ptB) => {
        if (!areFloatsApproxEqual(ptA.x, ptB.x)) {
            return ptA.x - ptB.x;
        }
        return ptA.y - ptB.y;
    });

    const upperHull = [];
    const lowerHull = [];

    // Build upper hull
    for (let i = 0; i < inputPoints.length; ++i) {
        while (upperHull.length >= 2 &&
            calculatePointOrientation(upperHull[upperHull.length - 2], upperHull[upperHull.length - 1], inputPoints[i]) !== GEOM_CONSTS.ROT_CCW) {
            upperHull.pop();
        }
        upperHull.push(inputPoints[i]);
    }

    // Build lower hull
    for (let i = inputPoints.length - 1; i >= 0; --i) {
        while (lowerHull.length >= 2 &&
            calculatePointOrientation(lowerHull[lowerHull.length - 2], lowerHull[lowerHull.length - 1], inputPoints[i]) !== GEOM_CONSTS.ROT_CCW) {
            lowerHull.pop();
        }
        lowerHull.push(inputPoints[i]);
    }

    // Combine hulls, removing duplicate start/end points
    // The last point of the upper hull is the same as the first of the lower hull (max x)
    // The last point of the lower hull is the same as the first of the upper hull (min x)
    lowerHull.pop(); // Remove duplicate max x point
    upperHull.pop(); // Remove duplicate min x point

    return upperHull.concat(lowerHull);
}

/**
 * Calculates the diameter (longest distance between any two points) of a convex polygon.
 * Uses the rotating calipers algorithm.
 * @param {PointCartesian[]} convexHullPoints - An array of points forming a convex polygon (ordered).
 * @returns {number} The squared diameter of the convex polygon.
 */
function getConvexPolygonDiameter(convexHullPoints) {
    const numPoints = convexHullPoints.length;
    if (numPoints < 2) {
        return 0;
    }
    if (numPoints === 2) {
        return convexHullPoints[0].toVec2().subtract(convexHullPoints[1].toVec2()).magnitudeSquared;
    }

    // Find antipodal pair with min/max Y (or X) coordinate as starting calipers
    let idxI = 0; // Point with minimum Y
    let idxJ = 0; // Point with maximum Y
    for (let k = 1; k < numPoints; k++) {
        if (convexHullPoints[k].y < convexHullPoints[idxI].y) {
            idxI = k;
        }
        if (convexHullPoints[k].y > convexHullPoints[idxJ].y) {
            idxJ = k;
        }
    }

    let maxSquaredDistance = convexHullPoints[idxI].toVec2().subtract(convexHullPoints[idxJ].toVec2()).magnitudeSquared;
    let currentI = idxI;
    let currentJ = idxJ;

    // Rotate calipers
    do {
        const vecI_next = convexHullPoints[(currentI + 1) % numPoints].toVec2().subtract(convexHullPoints[currentI].toVec2());
        const vecJ_next = convexHullPoints[(currentJ + 1) % numPoints].toVec2().subtract(convexHullPoints[currentJ].toVec2());

        // Compare angles to decide which caliper to advance
        // The cross product (vecA.cross(vecB)) gives sin(angle) * |vecA| * |vecB|.
        // If > 0, vecB is CCW from vecA. If < 0, CW. If == 0, collinear.
        // We want to align the normal of one edge with the other edge.
        // This is equivalent to comparing angles by checking which cross product is "larger" (more CCW rotation).
        if (vecI_next.cross(vecJ_next) >= 0) { // If edge I is "more CCW" than edge J, advance J
            currentJ = (currentJ + 1) % numPoints;
        } else { // Otherwise advance I
            currentI = (currentI + 1) % numPoints;
        }

        const currentDistSq = convexHullPoints[currentI].toVec2().subtract(convexHullPoints[currentJ].toVec2()).magnitudeSquared;
        if (currentDistSq > maxSquaredDistance) {
            maxSquaredDistance = currentDistSq;
        }
    } while (currentI !== idxI || currentJ !== idxJ); // Loop until calipers return to start

    return maxSquaredDistance;
}