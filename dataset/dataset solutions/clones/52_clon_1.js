// Define some constants for geometric calculations.
// These values are used to represent orientation or segment status.
var COUNTER_CLOCKWISE = 1;      // Indicates a counter-clockwise orientation.
var CLOCKWISE = -1;             // Indicates a clockwise orientation.
var ONLINE_BACK = 2;            // Point is online, behind the segment.
var ONLINE_FRONT = -2;          // Point is online, in front of the segment.
var ON_SEGMENT = 0;             // Point is directly on the segment.


// A basic 2D Vector class definition.
var Vector2D = class Vector2D {

    // Constructor for the Vector2D class.
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

}; // End of Vector2D class definition.


// Initializes an existing Vector2D instance with new coordinates.
Vector2D.prototype.Init = function (x, y) {
    this.x = x;
    this.y = y;
};


/*
 * Function to rotate a given 2D vector by 90 degrees counter-clockwise.
 *
 * @param {Vector2D} v - The input vector to be rotated.
 * @returns {Vector2D} A new vector representing the 90-degree rotation.
 */
function rotateVector90(v) {
    // Create a new vector for the result.
    var r = new Vector2D();

    // Perform the 90-degree rotation logic.
    r.x = -v.y;
    r.y = v.x;

    return r;
}


/*
 * Converts an angle from degrees to radians.
 *
 * @param {number} degree - The angle in degrees.
 * @returns {number} The angle in radians.
 */
function getDegreeToRadian(degree) {
    // Define PI with high precision.
    var pi = 3.14159265358979323846;

    // Conversion formula: degrees * (PI / 180).
    return degree * pi / 180;
}


/*
 * Rotates a 2D vector by a specified angle in degrees.
 *
 * @param {Vector2D} vec - The vector to rotate.
 * @param {number} degree - The angle of rotation in degrees.
 * @returns {Vector2D} A new rotated vector.
 */
function getRotateVector(vec, degree) {
    // First, convert the angle to radians.
    var radian = getDegreeToRadian(degree);

    // Calculate sine and cosine of the radian angle.
    var sin = Math.sin(radian);
    var cos = Math.cos(radian);

    // Create a new vector for the rotated result.
    var r = new Vector2D();

    // Apply the 2D rotation matrix.
    r.x = vec.x * cos - vec.y * sin;
    r.y = vec.x * sin + vec.y * cos;

    return r;
}


/*
 * Rotates a 2D vector by a specified angle in radians.
 *
 * @param {Vector2D} vec - The vector to rotate.
 * @param {number} radian - The angle of rotation in radians.
 * @returns {Vector2D} A new rotated vector.
 */
function getRotateVectorFromRad(vec, radian) {
    // Calculate sine and cosine of the radian angle.
    var sin = Math.sin(radian);
    var cos = Math.cos(radian);

    // Create a new vector for the rotated result.
    var r = new Vector2D();

    // Apply the 2D rotation matrix.
    r.x = vec.x * cos - vec.y * sin;
    r.y = vec.x * sin + vec.y * cos;

    return r;
}


// Checks if two vectors are approximately equal, considering floating-point precision.
// Uses the equalFloats function for individual component comparison.
function isEqualVectors(a, b) {
    return equalFloats(a.x - b.x, 0) && equalFloats(a.y - b.y, 0);
}


/**
 * Calculates the unit vector (a vector with length 1) for a given vector.
 * If the input vector has zero length, it returns the original vector.
 *
 * @param {Vector2D} vec - The input vector.
 * @returns {Vector2D} The unit vector.
 */
function getUnitVector(vec) {
    var length = getVectorLength2D(vec);

    if (length > 0) {
        // Divide each component by the length to get the unit vector.
        return getDivideVector(vec, length);
    }

    // If length is zero, return the original vector to avoid division by zero.
    return vec;
}


/**
 * Calculates the Euclidean length (magnitude) of a 2D vector.
 *
 * @param {Vector2D} vec - The input vector.
 * @returns {number} The length of the vector.
 */
function getVectorLength2D(vec) {
    return Math.sqrt((vec.x * vec.x) + (vec.y * vec.y));
}


// Calculates the squared Euclidean length (norm) of a 2D vector.
function getNorm(vec) {
    return vec.x * vec.x + vec.y * vec.y;
}


// Divides a vector by a scalar value.
function getDivideVector(vec2D, length) {
    var vec = new Vector2D();
    vec.x = vec2D.x / length;
    vec.y = vec2D.y / length;
    return vec;
}


// Compares two floating-point numbers for approximate equality.
// Uses a small threshold to account for floating-point inaccuracies.
function equalFloats(a, b) {
    var threshold = 1 / 8192; // A common threshold for floating point comparisons.
    return Math.abs(a - b) < threshold;
}


// Checks if two vectors are parallel.
// This is done by checking if the dot product of one vector rotated 90 degrees
// and the other vector is approximately zero.
function isParallelVector(vectorA, vectorB) {
    var na = rotateVector90(vectorA);
    return equalFloats(0, dotProduct2D(na, vectorB));
}


// Checks if two vectors are perpendicular (vertical).
// This is done by checking if their dot product is approximately zero.
function isVerticalVector(vectorA, vectorB) {
    return equalFloats(0, dotProduct2D(vectorA, vectorB));
}


// Subtracts one vector from another.
function subtractVector(vecA, vecB) {
    var vec = new Vector2D();
    vec.x = vecA.x - vecB.x;
    vec.y = vecA.y - vecB.y;
    return vec;
}


// Calculates the dot product of two 2D vectors.
function dotProduct2D(vecA, vecB) {
    // The intermediate variable 'dot' is redundant here as the value is returned directly.
    var dot = vecA.x * vecB.x + vecA.y * vecB.y;
    return vecA.x * vecB.x + vecA.y * vecB.y;
}


/**
 * Calculates the 2D cross product (or Z-component of the 3D cross product)
 * of two vectors. This effectively gives the signed area of the parallelogram
 * formed by the vectors, and indicates orientation.
 *
 * @param {Vector2D} vecA - The first vector.
 * @param {Vector2D} vecB - The second vector.
 * @returns {number} The cross product value.
 */
function getCross(vecA, vecB) {
    return vecA.x * vecB.y - vecA.y * vecB.x;
}


/**
 * Represents a 2D line segment defined by two points.
 * Each point is a Vector2D object.
 */
var LineSegment2D = class LineSegment2D {

    // Constructor for LineSegment2D.
    constructor(point1, point2) {
        this.point1 = point1;
        this.point2 = point2;
    }

}; // End of LineSegment2D class definition.


// Initializes an existing LineSegment2D instance with new points.
LineSegment2D.prototype.Init = function (point1, point2) {
    this.point1 = point1;
    this.point2 = point2;
};


// Checks if both points of a segment lie on the same side of a given axis (line).
function onOneSide(axis, segment) {
    // Vector from axis base to segment's first point.
    var d1 = new Vector2D();
    d1 = subtractVector(segment.point1, axis.base);

    // Vector from axis base to segment's second point.
    var d2 = new Vector2D();
    d2 = subtractVector(segment.point2, axis.base);

    // Normal vector to the axis direction.
    var n = new Vector2D();
    n = rotateVector90(axis.direction);

    // If the dot products of the normal with d1 and d2 have the same sign,
    // both points are on the same side.
    return dotProduct2D(n, d1) * dotProduct2D(n, d2) > 0;
}


// Checks if two 1D ranges overlap.
function overLapping(minA, maxA, minB, maxB) {
    // Ranges overlap if minB is less than or equal to maxA AND minA is less than or equal to maxB.
    return minB <= maxA && minA <= maxB;
}


// Determines if two line segments intersect (collide).
function isSegmentsCollide(segment1, segment2) {
    // Create Line objects to represent the segments for axis-based checks.
    var axisA = new Line();
    var axisB = new Line();

    // Set up axisA based on segment1.
    axisA.base = segment1.point1;
    axisA.direction = subtractVector(segment1.point2, segment1.point1);

    // Check if segment2 is entirely on one side of segment1's line.
    if (onOneSide(axisA, segment2)) {
        return false; // No collision if on one side.
    }

    // Set up axisB based on segment2.
    axisB.base = segment2.point1;
    axisB.direction = subtractVector(segment2.point2, segment2.point1);

    // Check if segment1 is entirely on one side of segment2's line.
    if (onOneSide(axisB, segment1)) {
        return false; // No collision if on one side.
    }

    // Handle the case where segments are parallel.
    if (isParallelVector(axisA.direction, axisB.direction)) {
        // Project both segments onto the direction vector to get 1D ranges.
        var rangeA = getProjectSegment(segment1, axisA.direction);
        var rangeB = getProjectSegment(segment2, axisA.direction);

        // Check if these projected ranges overlap.
        return isOverLappingRanges(rangeA, rangeB);
    } else {
        // If segments are not parallel and not on one side of each other, they must intersect.
        return true;
    }
}


/*
 * Represents a Line in 2D space.
 * Defined by a base point and a direction vector.
 */
function Line() {
    // The base point of the line (Vector2D).
    this.base;
    // The direction vector of the line (Vector2D).
    this.direction;
}


// Initializes an existing Line object.
Line.prototype.Init = function (base, direction, color) {
    this.base = base;
    this.direction = direction;
    // Note: 'color' parameter is present but not used/stored in this implementation.
};


/**
 * Represents a 1D range with a minimum and maximum value.
 */
var Range = class Range {

    // Constructor for the Range class.
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }

}; // End of Range class definition.


// Finds the combined min and max of two ranges.
// This function seems to intend to find the intersection or union,
// but the current implementation for max looks like it might be for intersection if min was also for intersection.
// For union, it would be Math.min(range1.min, range2.min) and Math.max(range1.max, range2.max).
function getMaxMinRange(range1, range2) {
    var range = new Range();
    range.min = range1.min < range2.min ? range1.min : range2.min; // Takes the smaller of the two mins.
    range.max = range1.max < range2.max ? range2.max : range1.max; // Takes the larger of the two maxs.
    return range;
}


// Ensures that the min value of a range is less than or equal to its max value.
function getSortRange(range) {
    var sorted = new Range(range.min, range.max);
    if (range.min > range.max) {
        sorted.min = range.max;
        sorted.max = range.min;
    }
    return sorted;
}


// Negates the components of a vector in place.
function getNegateVector(vector) {
    vector.x = -vector.x;
    vector.y = -vector.y;
    return vector;
}


// Adds two vectors and returns a new vector.
function addVector(vecA, vecB) {
    return new Vector2D(vecA.x + vecB.x, vecA.y + vecB.y);
}


/**
 * Projects a line segment onto a given direction vector and returns the 1D range
 * of the projection.
 *
 * @param {LineSegment2D} segment - The line segment to project.
 * @param {Vector2D} onto - The direction vector onto which to project.
 * @returns {Range} The 1D range representing the projection.
 */
function getProjectSegment(segment, onto) {
    // Get the unit vector of the projection axis.
    var ontoUnitVec = getUnitVector(onto);

    var range = new Range();
    // Project segment points onto the axis using dot product.
    range.min = dotProduct2D(ontoUnitVec, segment.point1);
    range.max = dotProduct2D(ontoUnitVec, segment.point2);

    // Ensure min is indeed less than or equal to max.
    range = getSortRange(range);
    return range;
}


// Checks if two 1D ranges overlap.
function isOverLappingRanges(range1, range2) {
    return overLapping(range1.min, range1.max, range2.min, range2.max);
}


// Projects one vector onto another.
function projectVector(project, onto) {
    var d = dotProduct2D(onto, onto); // Squared length of 'onto' vector.
    if (0 < d) {
        var dp = dotProduct2D(project, onto); // Dot product of 'project' and 'onto'.
        return multiplyVector(onto, dp / d); // Scalar projection * unit vector of 'onto'.
    }
    // If 'onto' is a zero vector, return 'onto' itself (which is zero).
    return onto;
}


/**
 * Represents a 2D Point.
 * Note: This is functionally identical to Vector2D, but semantically
 * might be used to distinguish points from vectors.
 */
var Point2D = class Point2D {

    // Constructor for Point2D.
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

}; // End of Point2D class definition.


// Adds two points (or a point and a vector) and returns a new point.
function addPoint(point1, point2) {
    return new Point2D(point1.x + point2.x, point1.y + point2.y);
}


// Subtracts one point from another (or a vector from a point) and returns a new point.
function subtractPoint(point1, point2) {
    return new Point2D(point1.x - point2.x, point1.y - point2.y);
}


// Multiplies a point's coordinates by a scalar and returns a new point.
function multiplyPoint(point, scalar) {
    return new Point2D(point.x * scalar, point.y * scalar);
}


/**
 * Projects a given point onto a line segment.
 * This finds the closest point on the line *defined by* the segment to the given point.
 * It does not clamp the projection to be within the segment's endpoints.
 *
 * @param {LineSegment2D} segment - The line segment.
 * @param {Point2D} point - The point to project.
 * @returns {Point2D} The projected point on the infinite line.
 */
function getProjectPoint(segment, point) {
    // Vector representing the segment's direction (P1 -> P2).
    var vec1 = new Vector2D(segment.point2.x - segment.point1.x, segment.point2.y - segment.point1.y);

    // Vector from segment start to the point (P1 -> P).
    var vec2 = new Vector2D(point.x - segment.point1.x, point.y - segment.point1.y);

    // Calculate the scalar projection ratio (how far along vec1 vec2 projects).
    var rate = dotProduct2D(vec2, vec1) / getNorm(vec1);

    // Scale vec1 by the rate to get the projection vector from P1.
    var vec3 = multiplyVector(vec1, rate);

    // Add this projection vector to P1 to get the projected point.
    var project = new Point2D(segment.point1.x + vec3.x, segment.point1.y + vec3.y);
    return project;
}


// Calculates the reflection of a point across a line segment (treated as an infinite line).
function getReflectionPoint(segment, point) {
    // First, find the projection of the point onto the line.
    var projection = getProjectPoint(segment, point);

    // Calculate the vector from the original point to its projection.
    var vec = subtractPoint(projection, point);

    // Multiply this vector by 2 to get the vector from the original point to the reflection point.
    var refrectionPoint = multiplyPoint(vec, 2);

    // Add this doubled vector to the original point to get the reflection point.
    return addPoint(refrectionPoint, point);
}


/**
 * Calculates the intersection point of two line segments.
 * This implementation uses a cross-product based method to find the intersection.
 * It assumes the segments actually intersect; it does not explicitly check for non-intersection.
 *
 * @param {LineSegment2D} segment1 - The first line segment.
 * @param {LineSegment2D} segment2 - The second line segment.
 * @returns {Point2D} The intersection point.
 */
function getCrossPoint(segment1, segment2) {
    // Define base vector for segment2 (P1 -> P2).
    var baseVector = new Vector2D(segment2.point2.x - segment2.point1.x, segment2.point2.y - segment2.point1.y);

    // Vector from segment2.point1 to segment1.point1.
    var d1Vec = new Vector2D(segment1.point1.x - segment2.point1.x, segment1.point1.y - segment2.point1.y);

    // Vector from segment2.point1 to segment1.point2.
    var d2Vec = new Vector2D(segment1.point2.x - segment2.point1.x, segment1.point2.y - segment2.point1.y);

    // Absolute cross products to determine relative distances/areas.
    var d1 = Math.abs(getCross(baseVector, d1Vec));
    var d2 = Math.abs(getCross(baseVector, d2Vec));

    // Calculate the interpolation parameter 't' along segment1.
    // This 't' indicates where the intersection point lies on segment1.
    var t = d1 / (d1 + d2);

    // Calculate the intersection point's coordinates using linear interpolation on segment1.
    var x = segment1.point1.x + (segment1.point2.x - segment1.point1.x) * t;
    var y = segment1.point1.y + (segment1.point2.y - segment1.point1.y) * t;

    return new Point2D(x, y);
}


// Multiplies a vector by a scalar value and returns a new vector.
function multiplyVector(vec, scalar) {
    var temp = new Vector2D();
    temp.x = vec.x * scalar;
    temp.y = vec.y * scalar;
    return temp;
}


// Clamps a value 'x' within a specified range [min, max].
function clampOnRange(x, min, max) {
    if (x < min) {
        return min;
    } else if (x > max) {
        return max;
    } else {
        return x;
    }
}


/**
 * Calculates the shortest distance from a point to an infinite line.
 * The line is implicitly defined by a LineSegment2D (its two points define the line).
 *
 * @param {LineSegment2D} line - The line segment defining the line.
 * @param {Point2D} point - The point to measure distance from.
 * @returns {number} The distance from the point to the line.
 */
function getDistanceLinePoint(line, point) {
    // Vector representing the direction of the line.
    var vec1 = new Vector2D(line.point2.x - line.point1.x, line.point2.y - line.point1.y);

    // Vector from the line's starting point to the given point.
    var vec2 = new Vector2D(point.x - line.point1.x, point.y - line.point1.y);

    // The magnitude of the cross product (vec1 x vec2) is twice the area of the triangle
    // formed by the three points. Dividing by the length of vec1 gives the height of
    // the triangle relative to vec1 as its base, which is the perpendicular distance.
    return Math.abs(getCross(vec1, vec2) / getVectorLength2D(vec1));
}


/**
 * Calculates the shortest distance from a point to a line segment.
 * This correctly handles cases where the closest point is one of the segment's endpoints.
 *
 * @param {LineSegment2D} segment - The line segment.
 * @param {Point2D} point - The point to measure distance from.
 * @returns {number} The distance from the point to the segment.
 */
function getDistanceSegmentPoint(segment, point) {
    // Vector from segment.point1 to segment.point2.
    var segVec = subtractPoint(segment.point2, segment.point1);

    // Vector from segment.point1 to the given point.
    var ptVec1 = subtractPoint(point, segment.point1);

    // If the dot product of segVec and ptVec1 is negative, the projection
    // of the point onto the line defined by the segment falls outside the segment
    // on the side of segment.point1. In this case, the closest point is segment.point1.
    if (dotProduct2D(segVec, ptVec1) < 0) {
        return getVectorLength2D(ptVec1);
    }

    // Vector from segment.point2 to segment.point1.
    var segVecRev = subtractPoint(segment.point1, segment.point2);

    // Vector from segment.point2 to the given point.
    var ptVec2 = subtractPoint(point, segment.point2);

    // If the dot product of segVecRev and ptVec2 is negative, the projection
    // falls outside the segment on the side of segment.point2.
    // In this case, the closest point is segment.point2.
    if (dotProduct2D(segVecRev, ptVec2) < 0) {
        return getVectorLength2D(ptVec2);
    }

    // Otherwise, the projection falls within the segment.
    // The closest point is on the line, so calculate the distance to the infinite line.
    return getDistanceLinePoint(segment, point);
}


/**
 * Calculates the shortest distance between two line segments.
 * Handles cases of intersection (distance 0) and non-intersection.
 *
 * @param {LineSegment2D} segment1 - The first line segment.
 * @param {LineSegment2D} segment2 - The second line segment.
 * @returns {number} The shortest distance between the two segments.
 */
function getSegmentDistance(segment1, segment2) {
    // If the segments intersect, the distance is 0.
    if (isSegmentsCollide(segment1, segment2)) {
        return 0;
    }

    // If they don't intersect, the shortest distance is the minimum
    // of the distances from each segment's endpoints to the other segment.
    var dist1_p1_to_s2 = getDistanceSegmentPoint(segment2, segment1.point1);
    var dist1_p2_to_s2 = getDistanceSegmentPoint(segment2, segment1.point2);
    var dist2_p1_to_s1 = getDistanceSegmentPoint(segment1, segment2.point1);
    var dist2_p2_to_s1 = getDistanceSegmentPoint(segment1, segment2.point2);

    return Math.min(
        Math.min(dist1_p1_to_s2, dist1_p2_to_s2),
        Math.min(dist2_p1_to_s1, dist2_p2_to_s1)
    );
}


// Determines the orientation of three points (p1, p2, p3) using the cross product.
// Returns COUNTER_CLOCKWISE, CLOCKWISE, ONLINE_BACK, ONLINE_FRONT, or ON_SEGMENT.
function ccw(point1, point2, point3) {
    // Vector from point1 to point2.
    var vec1 = new Vector2D(point2.x - point1.x, point2.y - point1.y);

    // Vector from point1 to point3.
    var vec2 = new Vector2D(point3.x - point1.x, point3.y - point1.y);

    // Calculate the 2D cross product.
    var cross = getCross(vec1, vec2);

    // Check for counter-clockwise orientation.
    if (cross > Number.EPSILON) {
        return COUNTER_CLOCKWISE;
    }
    // Check for clockwise orientation.
    if (cross < -Number.EPSILON) {
        return CLOCKWISE;
    }

    // If cross product is close to zero, points are collinear.
    // Check if point3 is behind point2 relative to point1.
    if (dotProduct2D(vec1, vec2) < -Number.EPSILON) {
        return ONLINE_BACK;
    }
    // Check if point3 is in front of point2 relative to point1, but not on the segment.
    if (getVectorLength2D(vec1) < getVectorLength2D(vec2)) {
        return ONLINE_FRONT;
    }

    // If none of the above, point3 is on the segment (point1, point2).
    return ON_SEGMENT;
}


/**
 * Computes the convex hull of a set of 2D points using the Monotone Chain (Andrew's algorithm).
 *
 * @param {Point2D[]} points - An array of Point2D objects.
 * @returns {Point2D[]} An array of points representing the convex hull in clockwise order.
 */
function getConvexHoll(points) {
    // A convex hull requires at least 3 points. If fewer, all points are on the hull.
    if (points.length < 3) {
        return points;
    }

    // Sort points primarily by x-coordinate, then by y-coordinate for ties.
    points.sort((a, b) => (a.x > b.x) ? 1 : (a.x == b.x) ? ((a.y > b.y) ? 1 : -1) : -1);

    // 'u' will store the upper hull.
    var u = [];
    u.push(points[0]);
    u.push(points[1]);

    // 'l' will store the lower hull (built in reverse order initially).
    var l = [];
    l.push(points[points.length - 1]);
    l.push(points[points.length - 2]);

    // Build the upper hull.
    for (var i = 2; i < points.length; ++i) {
        // While the last two points in 'u' and the current point 'points[i]' make a
        // counter-clockwise turn (meaning the second-to-last point is inside the hull),
        // remove the second-to-last point.
        for (var j = u.length; j >= 2 && ccw(u[j - 2], u[j - 1], points[i]) == COUNTER_CLOCKWISE; --j) {
            u.pop();
        }
        u.push(points[i]);
    }

    // Build the lower hull.
    // Iterate from right to left (second to last point to first point).
    for (var i = points.length - 3; i >= 0; --i) {
        // Similar logic as the upper hull, but for the lower hull formation.
        for (var j = l.length; j >= 2 && ccw(l[j - 2], l[j - 1], points[i]) == COUNTER_CLOCKWISE; --j) {
            l.pop();; // Pop the point if it creates a counter-clockwise turn.
        }
        l.push(points[i]);
    }

    // Combine the upper and lower hulls.
    // Reverse the lower hull to get points in clockwise order.
    l.reverse();

    // Append points from the upper hull, excluding the start and end points
    // which are already included in the lower hull (after reversal).
    for (var i = u.length - 2; i >= 1; --i) {
        l.push(u[i]);
    }

    return l;
}


/**
 * Calculates the diameter of a convex polygon (the maximum distance between any two points).
 * This uses the Rotating Calipers algorithm.
 * The input `points` array is assumed to be a convex hull in either clockwise or counter-clockwise order.
 *
 * @param {Point2D[]} points - An array of points forming a convex polygon.
 * @returns {number} The squared diameter of the convex polygon.
 */
function getConvexDiameter(points) {
    // Find the points with minimum and maximum y-coordinates (antipodal pair along y-axis).
    var is = 0; // Index of point with max Y.
    var js = 0; // Index of point with min Y.
    for (var i = 1; i < points.length; i++) {
        if (points[i].y > points[is].y) is = i;
        if (points[i].y < points[js].y) js = i;
    }

    // Initialize maximum distance with the distance between the initial antipodal pair.
    var distance = getNorm(subtractVector(points[is], points[js]));

    // Initialize rotating caliper pointers.
    var maxi = is, i = js, maxj = js, j = js;

    // Rotate calipers until they complete a full revolution.
    do {
        // Advance the caliper that makes the smaller angle with the current edge.
        // This is determined by the cross product of the current edge vectors.
        // If (P_i+1 - P_i) x (P_j+1 - P_j) >= 0, advance j.
        if (getCross(subtractVector(points[(i + 1) % points.length], points[i]), subtractVector(points[(j + 1) % points.length], points[j])) >= 0) {
            j = (j + 1) % points.length;
        } else {
            i = (i + 1) % points.length;
        }

        // Update maximum distance if the current antipodal pair is further apart.
        var currentDistance = getNorm(subtractVector(points[i], points[j]));
        if (currentDistance > distance) {
            distance = currentDistance;
            maxi = i;
            maxj = j;
        }
    } while (i != is || j != js); // Continue until both calipers return to their starting positions.

    return distance; // Returns the squared distance.
}