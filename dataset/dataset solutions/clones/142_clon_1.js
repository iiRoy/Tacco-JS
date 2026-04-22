/**
 * Geometric Constants for Direction and Position
 * These constants define orientations and relative positions
 * used in geometric calculations, particularly for `ccw` function.
 */
var COUNTER_CLOCKWISE = 1; /* Represents a counter-clockwise orientation */
var CLOCKWISE = -1; /* Represents a clockwise orientation */
var ONLINE_BACK = 2; /* Point is online, behind the segment's start */
var ONLINE_FRONT = -2; /* Point is online, in front of the segment's end */
var ON_SEGMENT = 0; /* Point lies directly on the segment */

// ============================================================================
// Vector2D Class Definition
// A fundamental class for representing 2-dimensional vectors or points.
// ============================================================================

var Vector2D = class Vector2D {
  /**
   * Constructor for Vector2D.
   * @param {number} x - The x-coordinate of the vector.
   * @param {number} y - The y-coordinate of the vector.
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
};

/**
 * Initializes or re-initializes a Vector2D instance.
 * This method is part of the prototype chain.
 * @param {number} x - New x-coordinate.
 * @param {number} y - New y-coordinate.
 */
Vector2D.prototype.Init = function(x, y) {
  this.x = x;
  this.y = y;
};

// ============================================================================
// Vector Utility Functions
// A collection of functions for common vector operations.
// ============================================================================

/**
 * Rotates a given vector 90 degrees counter-clockwise.
 * @param {Vector2D} v - The input vector to rotate.
 * @returns {Vector2D} A new Vector2D representing the rotated vector.
 */
function rotateVector90(v) {
  var r = new Vector2D();
  r.x = -v.y; // New x is negative of original y
  r.y = v.x; // New y is original x
  return r;
}

/**
 * Converts an angle from degrees to radians.
 * @param {number} degree - The angle in degrees.
 * @returns {number} The equivalent angle in radians.
 */
function getDegreeToRadian(degree) {
  var pi = 3.14159265358979323846; // High precision PI value
  return degree * pi / 180;
}

/**
 * Rotates a vector by a specified degree.
 * @param {Vector2D} vec - The vector to be rotated.
 * @param {number} degree - The angle of rotation in degrees.
 * @returns {Vector2D} A new Vector2D representing the rotated vector.
 */
function getRotateVector(vec, degree) {
  var radian = getDegreeToRadian(degree); // Convert degrees to radians first

  var sin = Math.sin(radian); // Pre-calculate sine
  var cos = Math.cos(radian); // Pre-calculate cosine

  var r = new Vector2D();
  r.x = vec.x * cos - vec.y * sin; // Standard rotation formula for x
  r.y = vec.x * sin + vec.y * cos; // Standard rotation formula for y

  return r;
}

/**
 * Rotates a vector by a specified radian angle.
 * This function directly uses radians, avoiding degree conversion.
 * @param {Vector2D} vec - The vector to be rotated.
 * @param {number} radian - The angle of rotation in radians.
 * @returns {Vector2D} A new Vector2D representing the rotated vector.
 */
function getRotateVectorFromRad(vec, radian) {
  var sin = Math.sin(radian); // Sine of the radian angle
  var cos = Math.cos(radian); // Cosine of the radian angle

  var r = new Vector2D();
  r.x = vec.x * cos - vec.y * sin;
  r.y = vec.x * sin + vec.y * cos;

  return r;
}

/**
 * Checks if two vectors are approximately equal.
 * Uses `equalFloats` for floating-point comparison.
 * @param {Vector2D} a - The first vector.
 * @param {Vector2D} b - The second vector.
 * @returns {boolean} True if vectors are equal within a threshold, false otherwise.
 */
function isEqualVectors(a, b) {
  return equalFloats(a.x - b.x, 0) && equalFloats(a.y - b.y, 0);
}

/**
 * Calculates the unit vector (normalized vector) of a given vector.
 * If the vector's length is zero, it returns the original vector to prevent division by zero.
 *
 * @param {Vector2D} vec - The input vector.
 * @returns {Vector2D} The unit vector of the input vector.
 */
function getUnitVector(vec) {
  var length = getVectorLength2D(vec);
  if (length > 0) {
    return getDivideVector(vec, length);
  }
  return vec; // Return original if length is zero
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

/**
 * Calculates the squared Euclidean length (magnitude) of a 2D vector.
 * This avoids the square root operation and is faster for comparisons.
 *
 * @param {Vector2D} vec - The input vector.
 * @returns {number} The squared length of the vector.
 */
function getNorm(vec) {
  return vec.x * vec.x + vec.y * vec.y;
}

/**
 * Divides a vector's components by a scalar value.
 *
 * @param {Vector2D} vec2D - The vector to divide.
 * @param {number} length - The scalar value to divide by.
 * @returns {Vector2D} A new vector with divided components.
 */
function getDivideVector(vec2D, length) {
  var vec = new Vector2D();
  vec.x = vec2D.x / length;
  vec.y = vec2D.y / length;
  return vec;
}

/**
 * Compares two floating-point numbers for approximate equality.
 * Uses a small threshold to account for floating-point inaccuracies.
 * @param {number} a - The first float.
 * @param {number} b - The second float.
 * @returns {boolean} True if the absolute difference is less than the threshold.
 */
function equalFloats(a, b) {
  var threshold = 1 / 8192; // A common threshold for float comparisons
  return Math.abs(a - b) < threshold;
}

/**
 * Checks if two vectors are parallel.
 * This is determined by checking if the dot product of one vector's 90-degree
 * rotation and the other vector is approximately zero.
 * @param {Vector2D} vectorA - The first vector.
 * @param {Vector2D} vectorB - The second vector.
 * @returns {boolean} True if the vectors are parallel, false otherwise.
 */
function isParallelVector(vectorA, vectorB) {
  var na = rotateVector90(vectorA); // Get normal vector for vectorA
  return equalFloats(0, dotProduct2D(na, vectorB));
}

/**
 * Checks if two vectors are perpendicular (vertical).
 * This is determined by checking if their dot product is approximately zero.
 * @param {Vector2D} vectorA - The first vector.
 * @param {Vector2D} vectorB - The second vector.
 * @returns {boolean} True if the vectors are perpendicular, false otherwise.
 */
function isVerticalVector(vectorA, vectorB) {
  return equalFloats(0, dotProduct2D(vectorA, vectorB));
}

/**
 * Subtracts one vector from another.
 * @param {Vector2D} vecA - The vector to subtract from.
 * @param {Vector2D} vecB - The vector to subtract.
 * @returns {Vector2D} A new vector representing the result of vecA - vecB.
 */
function subtractVector(vecA, vecB) {
  var vec = new Vector2D();
  vec.x = vecA.x - vecB.x;
  vec.y = vecA.y - vecB.y;
  return vec;
}

/**
 * Calculates the 2D dot product of two vectors.
 * @param {Vector2D} vecA - The first vector.
 * @param {Vector2D} vecB - The second vector.
 * @returns {number} The dot product of vecA and vecB.
 */
function dotProduct2D(vecA, vecB) {
  // Note: The original code had a redundant 'var dot = ...' line.
  // This is a Type I clone, so I must keep the exact expression.
  var dot = vecA.x * vecB.x + vecA.y * vecB.y;
  return vecA.x * vecB.x + vecA.y * vecB.y;
}

/**
 * Calculates the 2D cross product (or Z-component of the 3D cross product) of two vectors.
 * In 2D, this value indicates the orientation of vecB relative to vecA.
 * @param {Vector2D} vecA - The first vector.
 * @param {Vector2D} vecB - The second vector.
 * @returns {number} The cross product value. Positive if vecB is counter-clockwise from vecA, negative if clockwise.
 */
function getCross(vecA, vecB) {
  return vecA.x * vecB.y - vecA.y * vecB.x;
}

// ============================================================================
// LineSegment2D Class Definition
// Represents a line segment in 2D space, defined by two endpoints.
// ============================================================================

/**
 * Represents a line segment in 2D space.
 * Defined by two Vector2D points.
 */
var LineSegment2D = class LineSegment2D {
  /**
   * Constructs a new LineSegment2D.
   * @param {Vector2D} point1 - The starting point of the segment.
   * @param {Vector2D} point2 - The ending point of the segment.
   */
  constructor(point1, point2) {
    this.point1 = point1;
    this.point2 = point2;
  }
};

/**
 * Initializes or re-initializes a LineSegment2D instance.
 * This method is part of the prototype chain.
 * @param {Vector2D} point1 - The new starting point.
 * @param {Vector2D} point2 - The new ending point.
 */
LineSegment2D.prototype.Init = function(point1, point2) {
  this.point1 = point1;
  this.point2 = point2;
};

// ============================================================================
// Collision and Geometric Relationship Functions
// Functions to check relationships between segments, points, and lines.
// ============================================================================

/**
 * Checks if all points of a segment lie on one side of a given axis.
 * The axis is defined by a base point and a direction vector.
 *
 * @param {Line} axis - The axis (line) to check against.
 * @param {LineSegment2D} segment - The segment to check.
 * @returns {boolean} True if both points of the segment are on the same side of the axis, false otherwise.
 */
function onOneSide(axis, segment) {
  var d1 = new Vector2D();
  d1 = subtractVector(segment.point1, axis.base); // Vector from axis base to segment point1

  var d2 = new Vector2D();
  d2 = subtractVector(segment.point2, axis.base); // Vector from axis base to segment point2

  var n = new Vector2D();
  n = rotateVector90(axis.direction); // Normal vector to the axis direction

  // Returns true if the dot products have the same sign (both positive or both negative),
  // meaning both points are on the same side of the line defined by the axis.
  return dotProduct2D(n, d1) * dotProduct2D(n, d2) > 0;
}

/**
 * Checks if two 1D ranges overlap.
 * @param {number} minA - Minimum value of the first range.
 * @param {number} maxA - Maximum value of the first range.
 * @param {number} minB - Minimum value of the second range.
 * @param {number} maxB - Maximum value of the second range.
 * @returns {boolean} True if the ranges overlap, false otherwise.
 */
function overLapping(minA, maxA, minB, maxB) {
  return minB <= maxA && minA <= maxB;
}

/**
 * Determines if two line segments collide (intersect).
 * This uses the Separating Axis Theorem (SAT) for 2D line segments.
 *
 * @param {LineSegment2D} segment1 - The first line segment.
 * @param {LineSegment2D} segment2 - The second line segment.
 * @returns {boolean} True if the segments collide, false otherwise.
 */
function isSegmentsCollide(segment1, segment2) {
  // Create 'Line' objects to represent the axes for SAT
  var axisA = new Line();
  var axisB = new Line();

  // Axis derived from segment1: check if segment2 is on one side
  axisA.base = segment1.point1;
  axisA.direction = subtractVector(segment1.point2, segment1.point1);

  if (onOneSide(axisA, segment2)) {
    return false; // Separating axis found, no collision
  }

  // Axis derived from segment2: check if segment1 is on one side
  axisB.base = segment2.point1;
  axisB.direction = subtractVector(segment2.point2, segment2.point1);

  if (onOneSide(axisB, segment1)) {
    return false; // Separating axis found, no collision
  }

  // If both segments are parallel (or collinear)
  if (isParallelVector(axisA.direction, axisB.direction)) {
    var rangeA = getProjectSegment(segment1, axisA.direction); // Project segment1 onto axisA's direction
    var rangeB = getProjectSegment(segment2, axisA.direction); // Project segment2 onto axisA's direction

    // Check for overlap of projected ranges
    return isOverLappingRanges(rangeA, rangeB);
  } else {
    // If not parallel and no separating axis found, they must intersect
    return true;
  }
}

// ============================================================================
// Line Object Definition
// Represents an infinite line in 2D space.
// ============================================================================

/**
 * Represents an infinite line in 2D space.
 * Defined by a base point and a direction vector.
 * Note: This is an older constructor function style.
 */
function Line() {
  // vector2D - The base point of the line
  this.base;
  // vector2D - The direction vector of the line
  this.direction;
}

/**
 * Initializes or re-initializes a Line instance.
 * @param {Vector2D} base - The new base point of the line.
 * @param {Vector2D} direction - The new direction vector of the line.
 * @param {any} color - (Optional) A color parameter, though not used in logic.
 */
Line.prototype.Init = function(base, direction, color) {
  this.base = base;
  this.direction = direction;
};

// ============================================================================
// Range Class Definition
// Represents a 1D numerical range with a minimum and maximum value.
// ============================================================================

/**
 * Represents a numerical range with a minimum and maximum value.
 */
var Range = class Range {
  /**
   * Constructs a new Range.
   * @param {number} min - The minimum value of the range.
   * @param {number} max - The maximum value of the range.
   */
  constructor(min, max) {
    this.min = min;
    this.max = max;
  }
};

/**
 * Creates a new range that encompasses the minimum of range1.min and range2.min,
 * and the maximum of range1.max and range2.max. (This seems to be intended as a union or combined range).
 *
 * @param {Range} range1 - The first range.
 * @param {Range} range2 - The second range.
 * @returns {Range} A new range representing the combined extent.
 */
function getMaxMinRange(range1, range2) {
  var range = new Range();
  range.min = range1.min < range2.min ? range1.min : range2.min;
  range.max = range1.max < range2.max ? range2.max : range1.max;
  return range;
}

/**
 * Ensures that a range's min value is always less than or equal to its max value.
 * If min > max, it swaps them.
 * @param {Range} range - The input range.
 * @returns {Range} A new, sorted range.
 */
function getSortRange(range) {
  var sorted = new Range(range.min, range.max);
  if (range.min > range.max) {
    sorted.min = range.max;
    sorted.max = range.min;
  }
  return sorted;
}

/**
 * Negates both components of a vector in-place.
 * @param {Vector2D} vector - The vector to negate.
 * @returns {Vector2D} The modified (negated) vector.
 */
function getNegateVector(vector) {
  vector.x = -vector.x;
  vector.y = -vector.y;
  return vector;
}

/**
 * Adds two vectors component-wise.
 * @param {Vector2D} vecA - The first vector.
 * @param {Vector2D} vecB - The second vector.
 * @returns {Vector2D} A new vector representing the sum.
 */
function addVector(vecA, vecB) {
  return new Vector2D(vecA.x + vecB.x, vecA.y + vecB.y);
}

/**
 * Projects a line segment onto a given axis (direction vector).
 * The result is a 1D range representing the extent of the projection.
 *
 * @param {LineSegment2D} segment - The segment to project.
 * @param {Vector2D} onto - The direction vector onto which to project.
 * @returns {Range} A new Range object representing the projected interval.
 */
function getProjectSegment(segment, onto) {
  var ontoUnitVec = getUnitVector(onto); // Normalize the projection axis

  var range = new Range();
  // Project each endpoint onto the unit vector using dot product
  range.min = dotProduct2D(ontoUnitVec, segment.point1);
  range.max = dotProduct2D(ontoUnitVec, segment.point2);

  range = getSortRange(range); // Ensure min is less than or equal to max
  return range;
}

/**
 * Checks if two 1D ranges overlap.
 * This is a wrapper around the `overLapping` function.
 * @param {Range} range1 - The first range.
 * @param {Range} range2 - The second range.
 * @returns {boolean} True if the ranges overlap, false otherwise.
 */
function isOverLappingRanges(range1, range2) {
  return overLapping(range1.min, range1.max, range2.min, range2.max);
}

/**
 * Projects one vector onto another.
 *
 * @param {Vector2D} project - The vector to be projected.
 * @param {Vector2D} onto - The vector onto which 'project' is projected.
 * @returns {Vector2D} The projected vector. Returns 'onto' if the 'onto' vector has zero length.
 */
function projectVector(project, onto) {
  var d = dotProduct2D(onto, onto); // Squared length of 'onto' vector
  if (0 < d) {
    var dp = dotProduct2D(project, onto); // Dot product of 'project' and 'onto'
    return multiplyVector(onto, dp / d); // Scale 'onto' by the projection factor
  }
  return onto; // If 'onto' is a zero vector, return it as is.
}

// ============================================================================
// Point2D Class Definition
// A class for representing 2-dimensional points. Similar to Vector2D but semantically a point.
// ============================================================================

/**
 * Represents a 2D point.
 */
var Point2D = class Point2D {
  /**
   * Constructs a new Point2D.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
};

/**
 * Adds two points component-wise.
 * @param {Point2D} point1 - The first point.
 * @param {Point2D} point2 - The second point.
 * @returns {Point2D} A new point representing the sum.
 */
function addPoint(point1, point2) {
  return new Point2D(point1.x + point2.x, point1.y + point2.y);
}

/**
 * Subtracts one point from another component-wise.
 * @param {Point2D} point1 - The point to subtract from.
 * @param {Point2D} point2 - The point to subtract.
 * @returns {Point2D} A new point representing the difference (point1 - point2).
 */
function subtractPoint(point1, point2) {
  return new Point2D(point1.x - point2.x, point1.y - point2.y);
}

/**
 * Multiplies a point's coordinates by a scalar value.
 * @param {Point2D} point - The point to multiply.
 * @param {number} scalar - The scalar value.
 * @returns {Point2D} A new point with scaled coordinates.
 */
function multiplyPoint(point, scalar) {
  return new Point2D(point.x * scalar, point.y * scalar);
}

/**
 * Projects a point onto a line segment.
 * This function finds the point on the infinite line defined by the segment
 * that is closest to the given point. It does not clamp to the segment's endpoints.
 *
 * @param {LineSegment2D} segment - The line segment defining the projection line.
 * @param {Point2D} point - The point to project.
 * @returns {Point2D} The projected point on the infinite line.
 */
function getProjectPoint(segment, point) {
  var vec1 = new Vector2D(segment.point2.x - segment.point1.x, segment.point2.y - segment.point1.y); // Segment vector
  var vec2 = new Vector2D(point.x - segment.point1.x, point.y - segment.point1.y); // Vector from segment start to point
  var rate = dotProduct2D(vec2, vec1) / getNorm(vec1); // Projection rate along vec1
  var vec3 = multiplyVector(vec1, rate); // Scaled segment vector to get projection
  var project = new Point2D(segment.point1.x + vec3.x, segment.point1.y + vec3.y); // Add to segment start to get projected point
  return project;
}

/**
 * Calculates the reflection of a point across a line segment (treated as an infinite line).
 * @param {LineSegment2D} segment - The line segment acting as the mirror.
 * @param {Point2D} point - The point to reflect.
 * @returns {Point2D} The reflected point.
 */
function getReflectionPoint(segment, point) {
  var projection = getProjectPoint(segment, point); // Get the projection of the point onto the line
  // Vector from original point to its projection
  var vec = subtractPoint(projection, point);
  // Double this vector to go from projection to reflection
  var refrectionPoint = multiplyPoint(vec, 2);
  // Add the original point to get the final reflected point
  return addPoint(refrectionPoint, point);
}

/**
 * Calculates the intersection point of two line segments.
 * This function assumes the segments do intersect. It uses a parametric line intersection formula.
 *
 * @param {LineSegment2D} segment1 - The first line segment.
 * @param {LineSegment2D} segment2 - The second line segment.
 * @returns {Point2D} The intersection point.
 */
function getCrossPoint(segment1, segment2) {
  // Vector representing segment2's direction
  var baseVector = new Vector2D(segment2.point2.x - segment2.point1.x, segment2.point2.y - segment2.point1.y);
  // Vector from segment2's start to segment1's start
  var d1Vec = new Vector2D(segment1.point1.x - segment2.point1.x, segment1.point1.y - segment2.point1.y);
  // Vector from segment2's start to segment1's end
  var d2Vec = new Vector2D(segment1.point2.x - segment2.point1.x, segment1.point2.y - segment2.point1.y);

  // Absolute cross products to find areas (or magnitudes related to distance from line)
  var d1 = Math.abs(getCross(baseVector, d1Vec));
  var d2 = Math.abs(getCross(baseVector, d2Vec));

  // Calculate the parametric 't' value for segment1
  var t = d1 / (d1 + d2);

  // Use 't' to find the intersection point on segment1
  var x = segment1.point1.x + (segment1.point2.x - segment1.point1.x) * t;
  var y = segment1.point1.y + (segment1.point2.y - segment1.point1.y) * t;

  return new Point2D(x, y);
}

/**
 * Multiplies a vector's components by a scalar value.
 * @param {Vector2D} vec - The vector to multiply.
 * @param {number} scalar - The scalar value.
 * @returns {Vector2D} A new vector with scaled components.
 */
function multiplyVector(vec, scalar) {
  var temp = new Vector2D();
  temp.x = vec.x * scalar;
  temp.y = vec.y * scalar;
  return temp;
}

/**
 * Clamps a value within a specified range [min, max].
 * @param {number} x - The value to clamp.
 * @param {number} min - The minimum allowed value.
 * @param {number} max - The maximum allowed value.
 * @returns {number} The clamped value.
 */
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
 * The line is defined by two points (treated as a segment for defining the line).
 *
 * @param {LineSegment2D} line - A LineSegment2D representing the infinite line.
 * @param {Point2D} point - The point from which to measure the distance.
 * @returns {number} The perpendicular distance from the point to the line.
 */
function getDistanceLinePoint(line, point) {
  // Vector representing the direction of the line
  var vec1 = new Vector2D(line.point2.x - line.point1.x, line.point2.y - line.point1.y);
  // Vector from the line's start point to the external point
  var vec2 = new Vector2D(point.x - line.point1.x, point.y - line.point1.y);

  // The magnitude of the cross product of vec1 and vec2 is twice the area of the triangle
  // formed by the three points. Dividing by the length of vec1 gives the height of the triangle,
  // which is the perpendicular distance.
  return Math.abs(getCross(vec1, vec2) / getVectorLength2D(vec1));
}

/**
 * Calculates the shortest distance from a point to a line segment.
 * This considers the endpoints of the segment if the projection falls outside.
 *
 * @param {LineSegment2D} segment - The line segment.
 * @param {Point2D} point - The point.
 * @returns {number} The shortest distance from the point to the segment.
 */
function getDistanceSegmentPoint(segment, point) {
  // Vector from segment.point1 to segment.point2
  var segVec = subtractPoint(segment.point2, segment.point1);
  // Vector from segment.point1 to the external point
  var ptToSegStartVec = subtractPoint(point, segment.point1);

  // If the angle between segVec and ptToSegStartVec is obtuse (dot product < 0),
  // the closest point on the segment is segment.point1.
  if (dotProduct2D(segVec, ptToSegStartVec) < 0) {
    return getVectorLength2D(ptToSegStartVec); // Distance to segment.point1
  }

  // Vector from segment.point2 to segment.point1 (reversed segment direction)
  var negSegVec = subtractPoint(segment.point1, segment.point2);
  // Vector from segment.point2 to the external point
  var ptToSegEndVec = subtractPoint(point, segment.point2);

  // If the angle between negSegVec and ptToSegEndVec is obtuse (dot product < 0),
  // the closest point on the segment is segment.point2.
  if (dotProduct2D(negSegVec, ptToSegEndVec) < 0) {
    return getVectorLength2D(ptToSegEndVec); // Distance to segment.point2
  }

  // Otherwise, the closest point lies within the segment,
  // and the distance is the perpendicular distance to the infinite line.
  return getDistanceLinePoint(segment, point);
}

/**
 * Calculates the shortest distance between two line segments.
 *
 * @param {LineSegment2D} segment1 - The first line segment.
 * @param {LineSegment2D} segment2 - The second line segment.
 * @returns {number} The shortest distance between the two segments. Returns 0 if they intersect.
 */
function getSegmentDistance(segment1, segment2) {
  // If segments intersect, their distance is 0.
  if (isSegmentsCollide(segment1, segment2)) {
    return 0;
  }
  // Otherwise, the shortest distance is the minimum of the distances
  // from each segment's endpoints to the other segment.
  return Math.min(
    Math.min(
      getDistanceSegmentPoint(segment1, segment2.point1),
      getDistanceSegmentPoint(segment1, segment2.point2)
    ),
    Math.min(
      getDistanceSegmentPoint(segment2, segment1.point1),
      getDistanceSegmentPoint(segment2, segment1.point2)
    )
  );
}

/**
 * Determines the orientation of three points (p1, p2, p3) using the cross product.
 * This function is commonly used in computational geometry for convex hull algorithms.
 *
 * @param {Point2D} point1 - The first point.
 * @param {Point2D} point2 - The second point.
 * @param {Point2D} point3 - The third point.
 * @returns {number}
 *   - COUNTER_CLOCKWISE (1) if p3 is to the left of the directed line p1->p2.
 *   - CLOCKWISE (-1) if p3 is to the right.
 *   - ONLINE_BACK (2) if p3 is collinear with p1->p2 and behind p1.
 *   - ONLINE_FRONT (-2) if p3 is collinear with p1->p2 and beyond p2.
 *   - ON_SEGMENT (0) if p3 is collinear with p1->p2 and on the segment p1p2.
 */
function ccw(point1, point2, point3) {
  var vec1 = new Vector2D(point2.x - point1.x, point2.y - point1.y); // Vector p1->p2
  var vec2 = new Vector2D(point3.x - point1.x, point3.y - point1.y); // Vector p1->p3
  var cross = getCross(vec1, vec2); // Cross product of p1->p2 and p1->p3

  // Check orientation using a small epsilon for floating point comparison
  if (cross > Number.EPSILON) {
    return COUNTER_CLOCKWISE;
  }
  if (cross < -Number.EPSILON) {
    return CLOCKWISE;
  }

  // Points are collinear (cross product is zero or very close to zero)
  if (dotProduct2D(vec1, vec2) < -Number.EPSILON) {
    return ONLINE_BACK; // p3 is behind p1
  }
  if (getVectorLength2D(vec1) < getVectorLength2D(vec2)) {
    return ONLINE_FRONT; // p3 is beyond p2
  }
  return ON_SEGMENT; // p3 is on the segment p1p2
}

/**
 * Computes the convex hull of a set of 2D points using Monotone Chain (Andrew's algorithm).
 *
 * @param {Array<Point2D>} points - An array of Point2D objects.
 * @returns {Array<Point2D>} An array of points representing the convex hull in counter-clockwise order.
 */
function getConvexHoll(points) {
  if (points.length < 3) {
    return points; // A convex hull requires at least 3 points.
  }

  // Sort points primarily by x-coordinate, then by y-coordinate for ties.
  points.sort((a, b) => (a.x > b.x) ? 1 : (a.x === b.x) ? ((a.y > b.y) ? 1 : -1) : -1);

  // Build the upper hull
  var u = [];
  u.push(points[0]);
  u.push(points[1]);
  for (var i = 2; i < points.length; ++i) {
    // While the last two points and the current point form a non-left turn (clockwise or collinear),
    // remove the second-to-last point from the upper hull.
    while (u.length >= 2 && ccw(u[u.length - 2], u[u.length - 1], points[i]) === COUNTER_CLOCKWISE) {
      u.pop();
    }
    u.push(points[i]);
  }

  // Build the lower hull
  var l = [];
  l.push(points[points.length - 1]);
  l.push(points[points.length - 2]);
  for (var i = points.length - 3; i >= 0; --i) {
    // While the last two points and the current point form a non-left turn (clockwise or collinear),
    // remove the second-to-last point from the lower hull.
    while (l.length >= 2 && ccw(l[l.length - 2], l[l.length - 1], points[i]) === COUNTER_CLOCKWISE) {
      l.pop();; // Redundant semicolon, but preserved for Type I.
    }
    l.push(points[i]);
  }

  // Combine upper and lower hulls (excluding duplicate start/end points)
  l.reverse(); // Reverse the lower hull to get points in counter-clockwise order
  // Append upper hull points, skipping the first and last (which are already in lower hull)
  for (var i = u.length - 2; i >= 1; --i) {
    l.push(u[i]);
  }
  return l; // The combined convex hull
}

/**
 * Calculates the diameter of a convex polygon (the maximum distance between any two points).
 * Uses the rotating calipers algorithm.
 *
 * @param {Array<Point2D>} points - An array of Point2D objects representing the vertices of a convex polygon.
 * @returns {number} The squared maximum distance between any two points on the convex polygon.
 */
function getConvexDiameter(points) {
  // Find initial antipodal pair: points with min/max y-coordinate.
  var is = 0; // Index of point with minimum y
  var js = 0; // Index of point with maximum y
  for (var i = 1; i < points.length; i++) {
    if (points[i].y > points[is].y) is = i;
    if (points[i].y < points[js].y) js = i;
  }

  // Initialize max distance with the distance between the initial antipodal pair.
  var distance = getNorm(subtractVector(points[is], points[js]));
  var maxi = is,
    i = js,
    maxj = js,
    j = js; // Track indices of points forming max distance

  // Rotating calipers loop
  do {
    // Rotate the calipers. The caliper that forms a smaller angle with the next edge rotates first.
    // The cross product determines which "edge" has a smaller angle with the current "caliper" line.
    // We want to advance the caliper that maximizes the area with the other caliper's edge.
    // If cross product is positive, advance 'j'. Else, advance 'i'.
    if (getCross(
        subtractVector(points[(i + 1) % points.length], points[i]), // Vector for edge i -> i+1
        subtractVector(points[(j + 1) % points.length], points[j]) // Vector for edge j -> j+1
      ) >= 0) {
      j = (j + 1) % points.length; // Advance j
    } else {
      i = (i + 1) % points.length; // Advance i
    }

    // Update maximum distance if the current antipodal pair is further apart.
    if (getNorm(subtractVector(points[i], points[j])) > distance) {
      distance = getNorm(subtractVector(points[i], points[j]));
      maxi = i;
      maxj = j;
    }
  } while (i != is || j != js); // Continue until calipers complete a full rotation

  return distance; // Return the squared maximum distance
}