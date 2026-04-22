const ROTATION_CCW = 1;
const ROTATION_CW = -1;
const ALIGN_BACK = 2;
const ALIGN_FRONT = -2;
const ALIGN_ON_SEGMENT = 0;

// Smallest number for float comparisons
const FLOAT_TOLERANCE = 1e-9; // Changed from 1/8192

/**
 * Represents a 2D vector or point.
 */
class Vec2 {
    constructor(h_comp = 0, v_comp = 0) {
        this.h_comp = h_comp;
        this.v_comp = v_comp;
    }

    // Static factory method for convenience
    static fromComponents(xVal, yVal) {
        return new Vec2(xVal, yVal);
    }
}

/**
 * Calculates the perpendicular vector (rotated 90 degrees counter-clockwise).
 * @param {Vec2} inputVec The original vector.
 * @returns {Vec2} A new vector rotated 90 degrees CCW.
 */
function getPerpendicularVector(inputVec) {
    // Original: r.x = -v.y; r.y = v.x;
    return new Vec2(-inputVec.v_comp, inputVec.h_comp);
}

/**
 * Converts an angle from degrees to radians.
 * @param {number} angleInDegrees The angle in degrees.
 * @returns {number} The angle in radians.
 */
function convertDegreesToRadians(angleInDegrees) {
    // Using Math.PI for precision
    return angleInDegrees * (Math.PI / 180.0);
}

/**
 * Internal helper for vector rotation by radians.
 * @param {Vec2} originalVector The vector to rotate.
 * @param {number} angleInRadians The angle in radians.
 * @returns {Vec2} The rotated vector.
 */
function performVectorRotation(originalVector, angleInRadians) {
    const sineVal = Math.sin(angleInRadians);
    const cosineVal = Math.cos(angleInRadians);

    // Calculate new components
    const newX = (originalVector.h_comp * cosineVal) - (originalVector.v_comp * sineVal);
    const newY = (originalVector.h_comp * sineVal) + (originalVector.v_comp * cosineVal);

    return new Vec2(newX, newY);
}

/**
 * Rotates a vector by a specified angle in degrees.
 * @param {Vec2} targetVector The vector to be rotated.
 * @param {number} angleDegrees The rotation angle in degrees.
 * @returns {Vec2} A new rotated vector.
 */
function rotateVectorByDegrees(targetVector, angleDegrees) {
    const angleRadians = convertDegreesToRadians(angleDegrees);
    return performVectorRotation(targetVector, angleRadians);
}

/**
 * Rotates a vector by a specified angle in radians.
 * @param {Vec2} targetVector The vector to be rotated.
 * @param {number} angleRadians The rotation angle in radians.
 * @returns {Vec2} A new rotated vector.
 */
function rotateVectorByRadians(targetVector, angleRadians) {
    return performVectorRotation(targetVector, angleRadians);
}

/**
 * Checks if two vectors are approximately equal.
 * @param {Vec2} vecA First vector.
 * @param {Vec2} vecB Second vector.
 * @returns {boolean} True if vectors are approximately equal, false otherwise.
 */
function areVectorsIdentical(vecA, vecB) {
    return areApproxEqual(vecA.h_comp, vecB.h_comp) && areApproxEqual(vecA.v_comp, vecB.v_comp);
}

/**
 * Normalizes a vector to unit length.
 * @param {Vec2} inputVector The vector to normalize.
 * @returns {Vec2} The unit vector, or the original if length is zero.
 */
function getNormalizedVector(inputVector) {
    const magnitude = getVectorMagnitude(inputVector);
    if (magnitude > FLOAT_TOLERANCE) { // Check against tolerance instead of strict 0
        return scaleVector(inputVector, 1 / magnitude);
    }
    // If magnitude is zero, return a zero vector or original vector.
    // Original returns 'vec', so let's stick to that.
    return new Vec2(0,0); // Returning a new zero vector for safety.
}

/**
 * Calculates the magnitude (length) of a 2D vector.
 * @param {Vec2} inputVector The vector.
 * @returns {number} The magnitude of the vector.
 */
function getVectorMagnitude(inputVector) {
    // Using Math.hypot for potentially better precision and readability
    return Math.hypot(inputVector.h_comp, inputVector.v_comp);
}

/**
 * Calculates the squared magnitude (norm) of a 2D vector.
 * @param {Vec2} inputVector The vector.
 * @returns {number} The squared magnitude.
 */
function getSquaredMagnitude(inputVector) {
    return (inputVector.h_comp * inputVector.h_comp) + (inputVector.v_comp * inputVector.v_comp);
}

/**
 * Divides (scales) a vector by a scalar value.
 * @param {Vec2} inputVector The vector to scale.
 * @param {number} scalarValue The scalar to divide by.
 * @returns {Vec2} The scaled vector.
 */
function scaleVector(inputVector, scalarValue) {
    // Guard against division by zero
    if (scalarValue === 0) {
        console.warn("Attempted to scale vector by zero. Returning zero vector.");
        return new Vec2(0, 0);
    }
    return new Vec2(inputVector.h_comp / scalarValue, inputVector.v_comp / scalarValue);
}

/**
 * Checks if two floating-point numbers are approximately equal.
 * @param {number} val1 First number.
 * @param {number} val2 Second number.
 * @returns {boolean} True if numbers are approximately equal.
 */
function areApproxEqual(val1, val2) {
    return Math.abs(val1 - val2) < FLOAT_TOLERANCE;
}

/**
 * Checks if two vectors are parallel.
 * @param {Vec2} vectorAlpha First vector.
 * @param {Vec2} vectorBeta Second vector.
 * @returns {boolean} True if vectors are parallel.
 */
function areVectorsParallel(vectorAlpha, vectorBeta) {
    // If two vectors are parallel, the dot product of one and the perpendicular of the other is zero.
    const normalVecAlpha = getPerpendicularVector(vectorAlpha);
    return areApproxEqual(0, calculateDotProduct(normalVecAlpha, vectorBeta));
}

/**
 * Checks if two vectors are perpendicular (orthogonal).
 * @param {Vec2} vectorAlpha First vector.
 * @param {Vec2} vectorBeta Second vector.
 * @returns {boolean} True if vectors are perpendicular.
 */
function areVectorsPerpendicular(vectorAlpha, vectorBeta) {
    return areApproxEqual(0, calculateDotProduct(vectorAlpha, vectorBeta));
}

/**
 * Subtracts one vector from another.
 * @param {Vec2} minuendVec The vector to subtract from.
 * @param {Vec2} subtrahendVec The vector to subtract.
 * @returns {Vec2} The resulting vector.
 */
function subtractVec(minuendVec, subtrahendVec) {
    return new Vec2(minuendVec.h_comp - subtrahendVec.h_comp, minuendVec.v_comp - subtrahendVec.v_comp);
}

/**
 * Calculates the dot product of two vectors.
 * @param {Vec2} vecA First vector.
 * @param {Vec2} vecB Second vector.
 * @returns {number} The dot product.
 */
function calculateDotProduct(vecA, vecB) {
    return (vecA.h_comp * vecB.h_comp) + (vecA.v_comp * vecB.v_comp);
}

/**
 * Calculates the 2D cross product (Z-component of 3D cross product).
 * @param {Vec2} vecA First vector.
 * @param {Vec2} vecB Second vector.
 * @returns {number} The scalar cross product.
 */
function calculateCrossProduct2D(vecA, vecB) {
    return (vecA.h_comp * vecB.v_comp) - (vecA.v_comp * vecB.h_comp);
}

/**
 * Represents a 2D line segment.
 */
class Segment2D {
    constructor(startPt, endPt) {
        this.startPt = startPt;
        this.endPt = endPt;
    }
}

/**
 * Represents a 2D ray (line with an origin and direction).
 */
class Ray2D {
    constructor(origin, directionVec) {
        this.origin = origin;
        this.directionVec = directionVec;
    }
}

/**
 * Determines if a line segment lies entirely on one side of a given axis.
 * @param {Ray2D} axis The axis (represented as a ray).
 * @param {Segment2D} segment The segment to check.
 * @returns {boolean} True if the segment is on one side, false otherwise (crosses or is collinear).
 */
function isSegmentOneSided(axis, segment) {
    // Vector from axis origin to segment start point
    const displacement1 = subtractVec(segment.startPt, axis.origin);
    // Vector from axis origin to segment end point
    const displacement2 = subtractVec(segment.endPt, axis.origin);

    // Normal vector to the axis direction
    const axisNormal = getPerpendicularVector(axis.directionVec);

    // Dot products indicate which side of the axis the points lie on
    const dotProd1 = calculateDotProduct(axisNormal, displacement1);
    const dotProd2 = calculateDotProduct(axisNormal, displacement2);

    // If both dot products have the same sign (both positive or both negative),
    // they are on the same side. If one is zero, it's on the line, but still "one-sided" in terms of crossing.
    // For strict 'one side', check if both are > 0 OR both are < 0.
    // The original code checks if product > 0. This implies strictly one side, not crossing or on the line.
    return (dotProd1 * dotProd2) > FLOAT_TOLERANCE;
}

/**
 * Checks if two 1D intervals overlap.
 * @param {number} minA Minimum of interval A.
 * @param {number} maxA Maximum of interval A.
 * @param {number} minB Minimum of interval B.
 * @param {number} maxB Maximum of interval B.
 * @returns {boolean} True if the intervals overlap.
 */
function doIntervalsOverlap(minA, maxA, minB, maxB) {
    // Intervals overlap if the start of one is before the end of the other, AND vice-versa.
    // Using FLOAT_TOLERANCE for robust comparison.
    return (minB - FLOAT_TOLERANCE <= maxA) && (minA - FLOAT_TOLERANCE <= maxB);
}

/**
 * Determines if two line segments intersect.
 * Uses the Separating Axis Theorem for initial checks, then handles parallel case.
 * @param {Segment2D} seg1 First line segment.
 * @param {Segment2D} seg2 Second line segment.
 * @returns {boolean} True if the segments intersect.
 */
function checkSegmentIntersection(seg1, seg2) {
    // Guard against degenerate segments (points)
    if (areVectorsIdentical(seg1.startPt, seg1.endPt) && areVectorsIdentical(seg2.startPt, seg2.endPt)) {
        return areVectorsIdentical(seg1.startPt, seg2.startPt);
    }

    // Create rays representing the directions of the segments
    const axis1 = new Ray2D(seg1.startPt, subtractVec(seg1.endPt, seg1.startPt));
    const axis2 = new Ray2D(seg2.startPt, subtractVec(seg2.endPt, seg2.startPt));

    // Check if seg2 is entirely on one side of seg1's axis
    if (isSegmentOneSided(axis1, seg2)) {
        return false;
    }

    // Check if seg1 is entirely on one side of seg2's axis
    if (isSegmentOneSided(axis2, seg1)) {
        return false;
    }

    // Handle the case where segments are parallel or collinear
    if (areVectorsParallel(axis1.directionVec, axis2.directionVec)) {
        // Project both segments onto a common axis (e.g., axis1's direction)
        const rangeA = projectSegmentOntoAxis(seg1, axis1.directionVec);
        const rangeB = projectSegmentOntoAxis(seg2, axis1.directionVec);

        // Check for overlap of the projected ranges
        return testIntervalOverlap(rangeA, rangeB);
    }

    // If not one-sided and not parallel, they must intersect
    return true;
}

/**
 * Represents a 1D interval (range).
 */
class Interval {
    constructor(lowerBound, upperBound) {
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
    }
}

/**
 * Combines two intervals into a new interval that encompasses both.
 * Note: The original function was `getMaxMinRange` and had a bug in max calculation.
 * This function returns a new interval with the true min and max of the two inputs.
 * @param {Interval} intA First interval.
 * @param {Interval} intB Second interval.
 * @returns {Interval} The combined interval.
 */
function combineIntervals(intA, intB) {
    const newMin = Math.min(intA.lowerBound, intB.lowerBound);
    const newMax = Math.max(intA.upperBound, intB.upperBound); // Corrected logic
    return new Interval(newMin, newMax);
}

/**
 * Ensures an interval has its lower bound <= upper bound.
 * @param {Interval} originalInterval The interval to sort.
 * @returns {Interval} A new sorted interval.
 */
function normalizeInterval(originalInterval) {
    if (originalInterval.lowerBound > originalInterval.upperBound) {
        return new Interval(originalInterval.upperBound, originalInterval.lowerBound);
    }
    return new Interval(originalInterval.lowerBound, originalInterval.upperBound);
}

/**
 * Creates a new vector with negated components.
 * @param {Vec2} inputVector The vector to negate.
 * @returns {Vec2} A new negated vector.
 */
function getNegatedVector(inputVector) {
    return new Vec2(-inputVector.h_comp, -inputVector.v_comp);
}

/**
 * Adds two vectors.
 * @param {Vec2} vecA First vector.
 * @param {Vec2} vecB Second vector.
 * @returns {Vec2} The sum vector.
 */
function addVec(vecA, vecB) {
    return new Vec2(vecA.h_comp + vecB.h_comp, vecA.v_comp + vecB.v_comp);
}

/**
 * Projects a line segment onto a given axis vector.
 * @param {Segment2D} targetSegment The segment to project.
 * @param {Vec2} axisVector The vector representing the axis of projection.
 * @returns {Interval} The projected interval on the axis.
 */
function projectSegmentOntoAxis(targetSegment, axisVector) {
    const unitAxisVec = getNormalizedVector(axisVector);

    // Project segment endpoints onto the unit axis
    const proj1 = calculateDotProduct(unitAxisVec, targetSegment.startPt);
    const proj2 = calculateDotProduct(unitAxisVec, targetSegment.endPt);

    // Create an interval from the projected values and ensure it's sorted
    return normalizeInterval(new Interval(proj1, proj2));
}

/**
 * Checks for overlap between two 1D intervals.
 * @param {Interval} interval1 First interval.
 * @param {Interval} interval2 Second interval.
 * @returns {boolean} True if intervals overlap.
 */
function testIntervalOverlap(interval1, interval2) {
    return doIntervalsOverlap(interval1.lowerBound, interval1.upperBound, interval2.lowerBound, interval2.upperBound);
}

/**
 * Projects one vector onto another.
 * @param {Vec2} toProject The vector to be projected.
 * @param {Vec2} onto The vector to project onto.
 * @returns {Vec2} The projected vector.
 */
function projectVecOntoVec(toProject, onto) {
    const squaredMagnitudeOnto = getSquaredMagnitude(onto);
    if (squaredMagnitudeOnto < FLOAT_TOLERANCE) { // Check for zero vector
        return new Vec2(0, 0); // Projection onto a zero vector is a zero vector.
    }
    const dotProduct = calculateDotProduct(toProject, onto);
    const scalarProjection = dotProduct / squaredMagnitudeOnto;
    return new Vec2(onto.h_comp * scalarProjection, onto.v_comp * scalarProjection);
}

/**
 * Represents a 2D coordinate point. (Identical structure to Vec2, but semantically different in some contexts).
 */
class Coord2D {
    constructor(horiz = 0, vert = 0) {
        this.horiz = horiz;
        this.vert = vert;
    }
}

/**
 * Adds two 2D coordinate points.
 * @param {Coord2D} pt1 First point.
 * @param {Coord2D} pt2 Second point.
 * @returns {Coord2D} The resulting point.
 */
function addCoords(pt1, pt2) {
    return new Coord2D(pt1.horiz + pt2.horiz, pt1.vert + pt2.vert);
}

/**
 * Subtracts one 2D coordinate point from another.
 * @param {Coord2D} pt1 Point to subtract from.
 * @param {Coord2D} pt2 Point to subtract.
 * @returns {Coord2D} The resulting point.
 */
function subtractCoords(pt1, pt2) {
    return new Coord2D(pt1.horiz - pt2.horiz, pt1.vert - pt2.vert);
}

/**
 * Scales a 2D coordinate point by a scalar.
 * @param {Coord2D} pt The point to scale.
 * @param {number} factor The scalar factor.
 * @returns {Coord2D} The scaled point.
 */
function scaleCoords(pt, factor) {
    return new Coord2D(pt.horiz * factor, pt.vert * factor);
}

/**
 * Projects a point onto a line segment.
 * @param {Segment2D} lineSegment The segment to project onto.
 * @param {Coord2D} targetPoint The point to project.
 * @returns {Coord2D} The projected point on the line defined by the segment.
 */
function getProjectedPointOnSegment(lineSegment, targetPoint) {
    const segmentVector = subtractVec(lineSegment.endPt, lineSegment.startPt);
    const pointToStartVector = subtractVec(targetPoint, lineSegment.startPt);

    const segmentSquaredMagnitude = getSquaredMagnitude(segmentVector);
    // Handle degenerate segment (a point)
    if (segmentSquaredMagnitude < FLOAT_TOLERANCE) {
        return new Coord2D(lineSegment.startPt.h_comp, lineSegment.startPt.v_comp);
    }

    const projectionRatio = calculateDotProduct(pointToStartVector, segmentVector) / segmentSquaredMagnitude;
    const scaledSegmentVector = new Vec2(segmentVector.h_comp * projectionRatio, segmentVector.v_comp * projectionRatio);
    
    return new Coord2D(lineSegment.startPt.h_comp + scaledSegmentVector.h_comp, lineSegment.startPt.v_comp + scaledSegmentVector.v_comp);
}

/**
 * Calculates the reflection of a point across a line segment.
 * @param {Segment2D} mirrorSegment The segment acting as the mirror.
 * @param {Coord22D} originalPoint The point to reflect.
 * @returns {Coord2D} The reflected point.
 */
function reflectPointAcrossSegment(mirrorSegment, originalPoint) {
    const projection = getProjectedPointOnSegment(mirrorSegment, originalPoint);
    // Vector from original point to its projection
    const displacementVec = subtractCoords(projection, originalPoint);
    // Double this vector to get from original point to reflected point
    const reflectedDisplacement = scaleCoords(displacementVec, 2);
    // Add to original point
    return addCoords(originalPoint, reflectedDisplacement);
}

/**
 * Finds the intersection point of two line segments. Assumes segments intersect.
 * @param {Segment2D} segA First segment.
 * @param {Segment2D} segB Second segment.
 * @returns {Coord2D} The intersection point.
 */
function findIntersectionPoint(segA, segB) {
    // Vector representing segB's direction
    const segB_dir = subtractVec(segB.endPt, segB.startPt);

    // Vectors from segB.startPt to segA's endpoints
    const segA_p1_from_segB_p1 = subtractVec(segA.startPt, segB.startPt);
    const segA_p2_from_segB_p1 = subtractVec(segA.endPt, segB.startPt);

    // Cross products to determine relative orientation/distance
    const cross1 = Math.abs(calculateCrossProduct2D(segB_dir, segA_p1_from_segB_p1));
    const cross2 = Math.abs(calculateCrossProduct2D(segB_dir, segA_p2_from_segB_p1));

    // Calculate 't' parameter for interpolation along segA
    // This 't' represents the ratio along segA where the intersection occurs.
    const t_param = cross1 / (cross1 + cross2);

    // Interpolate along segA to find the intersection point
    const intersectionX = segA.startPt.h_comp + (segA.endPt.h_comp - segA.startPt.h_comp) * t_param;
    const intersectionY = segA.startPt.v_comp + (segA.endPt.v_comp - segA.startPt.v_comp) * t_param;

    return new Coord2D(intersectionX, intersectionY);
}

/**
 * Multiplies a vector by a scalar.
 * @param {Vec2} inputVec The vector to multiply.
 * @param {number} scalar The scalar value.
 * @returns {Vec2} A new scaled vector.
 */
function multiplyVecByScalar(inputVec, scalar) {
    return new Vec2(inputVec.h_comp * scalar, inputVec.v_comp * scalar);
}

/**
 * Clamps a value within a specified range.
 * @param {number} value The value to clamp.
 * @param {number} minimum The lower bound of the range.
 * @param {number} maximum The upper bound of the range.
 * @returns {number} The clamped value.
 */
function clampValue(value, minimum, maximum) {
    // Rewriting the if-else structure with Math.min/Math.max
    return Math.max(minimum, Math.min(value, maximum));
}

/**
 * Calculates the shortest distance from a point to an infinite line (defined by a segment).
 * @param {Segment2D} lineDefinitionSegment A segment defining the line.
 * @param {Coord2D} targetPoint The point to measure distance from.
 * @returns {number} The distance.
 */
function calcDistanceLineToPoint(lineDefinitionSegment, targetPoint) {
    const lineVec = subtractVec(lineDefinitionSegment.endPt, lineDefinitionSegment.startPt);
    const pointVec = subtractVec(targetPoint, lineDefinitionSegment.startPt);

    // Distance = |cross_product(lineVec, pointVec)| / |lineVec|
    // This is the formula for the area of a parallelogram (base * height) divided by the base length.
    const crossProd = calculateCrossProduct2D(lineVec, pointVec);
    const lineMagnitude = getVectorMagnitude(lineVec);

    if (lineMagnitude < FLOAT_TOLERANCE) { // Degenerate line (just a point)
        return getVectorMagnitude(pointVec); // Distance from point to that single point
    }
    return Math.abs(crossProd) / lineMagnitude;
}

/**
 * Calculates the shortest distance from a point to a line segment.
 * @param {Segment2D} segment The line segment.
 * @param {Coord2D} point The point.
 * @returns {number} The distance.
 */
function calcDistanceSegmentToPoint(segment, point) {
    const vecSegment = subtractVec(segment.endPt, segment.startPt);
    const vecPointToStart = subtractVec(point, segment.startPt);
    const vecPointToEnd = subtractVec(point, segment.endPt);

    // Case 1: Point projects outside segment, closer to startPt.
    // Dot product < 0 means angle > 90 degrees.
    if (calculateDotProduct(vecSegment, vecPointToStart) < FLOAT_TOLERANCE) {
        return getVectorMagnitude(vecPointToStart);
    }
    
    // Case 2: Point projects outside segment, closer to endPt.
    // Dot product of (start - end) and (point - end) < 0
    if (calculateDotProduct(getNegatedVector(vecSegment), vecPointToEnd) < FLOAT_TOLERANCE) {
        return getVectorMagnitude(vecPointToEnd);
    }

    // Case 3: Point projects onto the segment.
    return calcDistanceLineToPoint(segment, point);
}

/**
 * Calculates the shortest distance between two line segments.
 * @param {Segment2D} seg1 First segment.
 * @param {Segment2D} seg2 Second segment.
 * @returns {number} The distance. Returns 0 if they intersect.
 */
function calcMinSegmentDistance(seg1, seg2) {
    // If segments intersect, the distance is 0.
    if (checkSegmentIntersection(seg1, seg2)) {
        return 0;
    }

    // Otherwise, find the minimum of all point-to-segment distances.
    // Distance from seg1's endpoints to seg2, and from seg2's endpoints to seg1.
    const dist1_p1_to_seg2 = calcDistanceSegmentToPoint(seg2, seg1.startPt);
    const dist1_p2_to_seg2 = calcDistanceSegmentToPoint(seg2, seg1.endPt);
    const dist2_p1_to_seg1 = calcDistanceSegmentToPoint(seg1, seg2.startPt);
    const dist2_p2_to_seg1 = calcDistanceSegmentToPoint(seg1, seg2.endPt);

    return Math.min(dist1_p1_to_seg2, dist1_p2_to_seg2, dist2_p1_to_seg1, dist2_p2_to_seg1);
}

/**
 * Determines the orientation of three ordered points (p1, p2, p3).
 * Uses the 2D cross product.
 * @param {Coord2D} p1 First point.
 * @param {Coord2D} p2 Second point.
 * @param {Coord2D} p3 Third point.
 * @returns {number} One of ROTATION_CCW, ROTATION_CW, ALIGN_BACK, ALIGN_FRONT, ALIGN_ON_SEGMENT.
 */
function orient2D(p1, p2, p3) {
    const vec_p1_p2 = subtractVec(p2, p1);
    const vec_p1_p3 = subtractVec(p3, p1);
    const crossProduct = calculateCrossProduct2D(vec_p1_p2, vec_p1_p3);

    if (crossProduct > FLOAT_TOLERANCE) {
        return ROTATION_CCW;
    }
    if (crossProduct < -FLOAT_TOLERANCE) {
        return ROTATION_CW;
    }

    // Points are collinear. Check if p3 lies on the line segment p1-p2.
    const dotProduct = calculateDotProduct(vec_p1_p2, vec_p1_p3);
    if (dotProduct < -FLOAT_TOLERANCE) {
        return ALIGN_BACK; // p3 is behind p1 relative to p2
    }
    const squaredMagnitude_p1_p2 = getSquaredMagnitude(vec_p1_p2);
    const squaredMagnitude_p1_p3 = getSquaredMagnitude(vec_p1_p3);
    if (squaredMagnitude_p1_p2 < squaredMagnitude_p1_p3) {
        return ALIGN_FRONT; // p3 is beyond p2 relative to p1
    }
    return ALIGN_ON_SEGMENT; // p3 is on the segment p1-p2
}

/**
 * Computes the convex hull of a set of 2D points using the Monotone Chain (Andrew's algorithm).
 * @param {Array<Coord2D>} inputPoints An array of 2D points.
 * @returns {Array<Coord2D>} An array of points forming the convex hull in counter-clockwise order.
 */
function computeConvexHull(inputPoints) {
    const numPoints = inputPoints.length;
    if (numPoints < 3) {
        // A convex hull of 0, 1, or 2 points is just the points themselves.
        // Return a copy to avoid mutation issues.
        return [...inputPoints];
    }

    // Sort points lexicographically (by x, then by y)
    inputPoints.sort((ptA, ptB) => {
        if (ptA.horiz !== ptB.horiz) {
            return ptA.horiz - ptB.horiz;
        }
        return ptA.vert - ptB.vert;
    });

    let upperHull = [];
    let lowerHull = [];

    // Build upper hull
    for (let i = 0; i < numPoints; i++) {
        while (upperHull.length >= 2 && orient2D(upperHull[upperHull.length - 2], upperHull[upperHull.length - 1], inputPoints[i]) !== ROTATION_CCW) {
            upperHull.pop();
        }
        upperHull.push(inputPoints[i]);
    }

    // Build lower hull
    for (let i = numPoints - 1; i >= 0; i--) {
        while (lowerHull.length >= 2 && orient2D(lowerHull[lowerHull.length - 2], lowerHull[lowerHull.length - 1], inputPoints[i]) !== ROTATION_CCW) {
            lowerHull.pop();
        }
        lowerHull.push(inputPoints[i]);
    }

    // Combine hulls. The first and last points of both hulls are the same.
    // Remove the duplicates and concatenate.
    // The lower hull is already in clockwise order relative to the origin, or reverse of CCW.
    // We reverse lowerHull and append upperHull (excluding duplicates).
    lowerHull.pop(); // Remove last point (duplicate of upperHull's first)
    upperHull.pop(); // Remove last point (duplicate of lowerHull's first if lowerHull was reversed first)

    return lowerHull.concat(upperHull);
}

/**
 * Finds the diameter of a convex polygon (the maximum distance between any two points).
 * Uses Rotating Calipers algorithm. Assumes input points form a convex hull in CCW order.
 * @param {Array<Coord2D>} convexHullPoints An array of points representing a convex hull in CCW order.
 * @returns {number} The squared diameter (max squared distance). Take sqrt for actual distance.
 */
function findConvexDiameterSquared(convexHullPoints) {
    const numVertices = convexHullPoints.length;
    if (numVertices < 2) {
        return 0;
    }
    if (numVertices === 2) {
        return getSquaredMagnitude(subtractVec(convexHullPoints[0], convexHullPoints[1]));
    }

    // Find initial antipodal pair: points with min/max Y coordinates
    let minIdxY = 0;
    let maxIdxY = 0;
    for (let i = 1; i < numVertices; i++) {
        if (convexHullPoints[i].vert > convexHullPoints[maxIdxY].vert) maxIdxY = i;
        if (convexHullPoints[i].vert < convexHullPoints[minIdxY].vert) minIdxY = i;
    }

    let maxSquaredDistance = getSquaredMagnitude(subtractVec(convexHullPoints[maxIdxY], convexHullPoints[minIdxY]));

    // Initialize calipers
    let caliperP = minIdxY; // Pointer for one vertex
    let caliperQ = maxIdxY; // Pointer for the other vertex

    let initialP = minIdxY; // Store initial positions to know when we've completed a full rotation
    let initialQ = maxIdxY;

    // Rotate calipers until a full sweep is done
    do {
        const nextP = (caliperP + 1) % numVertices;
        const nextQ = (caliperQ + 1) % numVertices;

        const edgeP = subtractVec(convexHullPoints[nextP], convexHullPoints[caliperP]);
        const edgeQ = subtractVec(convexHullPoints[nextQ], convexHullPoints[caliperQ]);

        // Compare angles of edges with the current caliper line
        // The cross product determines which caliper should advance
        // If cross(edgeP, edgeQ) > 0, edgeP's angle is smaller, so advance Q.
        // If cross(edgeP, edgeQ) < 0, edgeQ's angle is smaller, so advance P.
        // If cross(edgeP, edgeQ) == 0, they are parallel. Advance both.
        if (calculateCrossProduct2D(edgeP, edgeQ) >= 0) {
            caliperQ = nextQ; // Advance caliper Q
        } else {
            caliperP = nextP; // Advance caliper P
        }

        const currentSquaredDistance = getSquaredMagnitude(subtractVec(convexHullPoints[caliperP], convexHullPoints[caliperQ]));
        if (currentSquaredDistance > maxSquaredDistance) {
            maxSquaredDistance = currentSquaredDistance;
        }

    } while (caliperP !== initialP || caliperQ !== initialQ); // Loop until both calipers return to their starting positions

    return maxSquaredDistance;
}