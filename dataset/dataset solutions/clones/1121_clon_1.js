// This file defines various 2D vector and geometry utilities.
// It's a foundational library for geometric calculations.

// Represents a 2D vector or point.
var Vector2D = class Vector2D {
  constructor( x, y ) {
    this.x = x;
    this.y = y;
  }
}



// Initializes a Vector2D instance.
Vector2D.prototype.Init = function ( x, y ) {
  this.x = x;
  this.y = y;
}



// Rotates a given vector by 90 degrees counter-clockwise.
// @param v The input Vector2D.
function rotateVector90( v ) {
  var r = new Vector2D();

  r.x = -v.y;
  r.y = v.x;

  return r;
}



// Converts an angle from degrees to radians.
// @param degree The angle in degrees.
// @returns The angle in radians.
function getDegreeToRadian( degree ) {
  var pi = 3.14159265358979323846;
  return degree * pi / 180;
}



// Rotates a vector by a specified degree.
// @param vec The vector to rotate (Vector2D).
// @param degree The angle of rotation in degrees.
// @returns The rotated vector (Vector2D).
function getRotateVector( vec, degree ) {

  var radian = getDegreeToRadian( degree );

  var sin = Math.sin( radian );
  var cos = Math.cos( radian );

  var r = new Vector2D();
  r.x = vec.x * cos - vec.y * sin;
  r.y = vec.x * sin + vec.y * cos;

  return r;
}



// Checks if two vectors are approximately equal.
// Uses equalFloats for floating-point comparison.
function isEqualVectors( a, b ) {
  return equalFloats( a.x - b.x, 0 ) && equalFloats( a.y - b.y, 0 );
}



/**
 * Calculates the unit vector for a given vector.
 *
 * @param {Vector2D} vec The input vector.
 * @returns {Vector2D} The unit vector, or the original vector if its length is zero.
 */
function getUnitVector( vec ) {
  var length = getVectorLength2D( vec );

  if ( length > 0 ) {
    return getDivideVector( vec, length );
  }

  return vec;
}



/**
 * Computes the Euclidean length (magnitude) of a 2D vector.
 *
 * @param {Vector2D} vec The input vector.
 * @returns {number} The length of the vector.
 */
function getVectorLength2D( vec ) {
  return Math.sqrt( ( vec.x * vec.x ) + ( vec.y * vec.y ) );
}



// Divides a vector's components by a scalar length.
function getDivideVector( vec2D, length ) {
  vec2D.x = vec2D.x / length;
  vec2D.y = vec2D.y / length;
  return vec2D;
}



// Compares two floating-point numbers for approximate equality.
function equalFloats( a, b ) {
  var threshold = 1 / 8192;
  return Math.abs( a - b ) < threshold;
}



// Checks if two vectors are parallel.
function isParallelVector( vectorA, vectorB ) {
  var na = rotateVector90( vectorA );
  return equalFloats( 0, dotProduct2D( na, vectorB ) );
}



// Checks if two vectors are perpendicular (vertical).
function isVerticalVector( vectorA, vectorB ) {
  return equalFloats( 0, dotProduct2D( vectorA, vectorB ) );
}



// Subtracts vector B from vector A.
function subtractVector( vecA, vecB ) {
  var vec = new Vector2D();
  vec.x = vecA.x - vecB.x;
  vec.y = vecA.y - vecB.y;
  return vec;
}



// Calculates the dot product of two 2D vectors.
function dotProduct2D( vecA, vecB ) {
  var dot = vecA.x * vecB.x + vecA.y * vecB.y; // Intermediate variable
  return vecA.x * vecB.x + vecA.y * vecB.y;
}



/**
 * Calculates the 2D cross product (scalar magnitude).
 *
 * @param {Vector2D} vecA The first vector.
 * @param {Vector2D} vecB The second vector.
 * @returns {number} The scalar cross product.
 */
function getCross( vecA, vecB ) {
  return vecA.x * vecB.y - vecA.y * vecB.x;
}



/**
 * Represents a 2D line segment.
 * Composed of two Vector2D points.
 */
var LineSegment2D = class LineSegment2D {
  constructor( point1, point2 ) {
    this.point1 = point1;
    this.point2 = point2;
  }
}



// Initializes a LineSegment2D instance.
LineSegment2D.prototype.Init = function ( point1, point2 ) {
  this.point1 = point1;
  this.point2 = point2;
}



// Checks if a segment lies entirely on one side of an axis.
function onOneSide( axis, segment ) {
  var d1 = new Vector2D();
  d1 = subtractVector( segment.point1, axis.base );

  var d2 = new Vector2D();
  d2 = subtractVector( segment.point2, axis.base );

  var n = new Vector2D();
  n = rotateVector90( axis.direction );

  // Returns true if both points are on the same side.
  return dotProduct2D( n, d1 ) * dotProduct2D( n, d2 ) > 0;
}



// Checks if two numerical ranges overlap.
function overLapping( minA, maxA, minB, maxB ) {
  return minB <= maxA && minA <= maxB;
}



// Determines if two line segments collide.
function isSegmentsCollide( segment1, segment2 ) {
  // Define axes for checking segment directions.
  var axisA = new Line();
  var axisB = new Line();

  // Check if segment2 is on one side of segment1's axis.
  axisA.base = segment1.point1;
  axisA.direction = subtractVector( segment1.point2, segment1.point1 );

  if ( onOneSide( axisA, segment2 ) ) {
    return false;
  }

  // Similarly, check segment1 against segment2's axis.
  axisB.base = segment2.point1;
  axisB.direction = subtractVector( segment2.point2, segment2.point1 );

  if ( onOneSide( axisB, segment1 ) ) {
    return false;
  }

  // Handle the case where vectors are parallel.
  if ( isParallelVector( axisA.direction, axisB.direction ) ) {
    var rangeA = getProjectSegment( segment1, axisA.direction );
    var rangeB = getProjectSegment( segment2, axisA.direction );

    // Check if the projected ranges overlap.
    return isOverLappingRanges( rangeA, rangeB );
  } else {
    // If not parallel, and no side check returned false, they must collide.
    return true;
  }
}



/*
 * Represents a Line defined by a base point and a direction vector.
 */
function Line() {
  // Base point (Vector2D)
  this.base;
  // Direction vector (Vector2D)
  this.direction
}



// Initializes a Line object.
Line.prototype.Init = function ( base, direction, color ) {
  this.base = base;
  this.direction = direction;
}



/**
 * Represents a numerical range with a minimum and maximum value.
 */
var Range = class Range {
  constructor( min, max ) {
    this.min = min;
    this.max = max;
  }
}



// Returns a new range that encompasses the minimum of range1.min/range2.min and maximum of range1.max/range2.max
function getMaxMinRange( range1, range2 ) {
  var range = new Range();
  range.min = range1.min < range2.min ? range1.min : range2.min;
  range.max = range1.max < range2.max ? range2.max : range1.max;
  return range;
}



// Sorts the min and max values of a range if they are out of order.
function getSortRange( range ) {
  var sorted = new Range( range.min, range.max );
  if ( range.min > range.max ) {
    sorted.min = range.max;
    sorted.max = range.min;
  }
  return sorted;
}



// Negates both components of a vector.
function getNegateVector( vector ) {
  vector.x = -vector.x;
  vector.y = -vector.y;
  return vector;
}



// Adds two vectors component-wise.
function getAddVector( vecA, vecB ) {
  return new Vector2D( vecA.x + vecB.x, vecA.y + vecB.y );
}



/**
 * Projects a line segment onto a given vector and returns the scalar range.
 *
 * @param {LineSegment2D} segment The segment to project.
 * @param {Vector2D} onto The vector defining the projection axis.
 * @returns {Range} The scalar range of the projected segment.
 */
function getProjectSegment( segment, onto ) {
  var ontoUnitVec = getUnitVector( onto );

  var range = new Range();
  range.min = dotProduct2D( ontoUnitVec, segment.point1 );
  range.max = dotProduct2D( ontoUnitVec, segment.point2 );

  range = getSortRange( range ); // Ensure min <= max
  return range;
}



// Checks if two ranges overlap.
function isOverLappingRanges( range1, range2 ) {
  return overLapping( range1.min, range1.max, range2.min, range2.max );
}



// Projects one vector onto another.
function projectVector( project, onto ) {
  var d = dotProduct2D( onto, onto );
  if ( 0 < d ) {
    var dp = dotProduct2D( project, onto );
    return multiplyVector( onto, dp / d );
  }
  return onto;
}



// Calculates the squared magnitude (norm) of a vector.
function getNorm( vec ) {
  return vec.x * vec.x + vec.y * vec.y;
}



// Calculates the magnitude (length) of a 2D vector.
function getVec2DLength( vec ) {
  return Math.sqrt( getNorm( vec ) );
}



/**
 * Represents a 2D point.
 */
var Point2D = class Point2D {
  constructor( x, y ) {
    this.x = x;
    this.y = y;
  }
}



// Adds two points component-wise.
function addPoint( point1, point2 ) {
  return new Point2D( point1.x + point2.x, point1.y + point2.y );
}



// Subtracts point2 from point1 component-wise.
function subtractPoint( point1, point2 ) {
  return new Point2D( point1.x - point2.x, point1.y - point2.y );
}



// Multiplies a point's components by a scalar.
function multiplyPoint( point, scalar ) {
  return new Point2D( point.x * scalar, point.y * scalar );
}



/**
 * Finds the projection of a point onto a line segment.
 *
 * @param {LineSegment2D} segment The line segment.
 * @param {Point2D} point The point to project.
 * @returns {Point2D} The projected point on the line defined by the segment.
 */
function getProjectPoint( segment, point ) {
  var vec1 = new Vector2D( segment.point2.x - segment.point1.x, segment.point2.y - segment.point1.y );
  var vec2 = new Vector2D( point.x - segment.point1.x, point.y - segment.point1.y );
  var rate = dotProduct2D( vec2, vec1 ) / getNorm( vec1 );
  var vec3 = multiplyVector( vec1, rate );
  var project = new Point2D( segment.point1.x + vec3.x, segment.point1.y + vec3.y );
  return project;
}



// Calculates the reflection of a point across the line defined by a segment.
function getReflectionPoint( segment, point ) {
  var projection = getProjectPoint( segment, point );

  // Vector from point to its projection.
  var vec = subtractPoint( projection, point );

  // Double this vector to find the reflection.
  var reflectionPoint = multiplyPoint( vec, 2 );

  // Add the original point to get the absolute reflection coordinate.
  return addPoint( reflectionPoint, point );
}



/**
 * Calculates the intersection point of two line segments.
 *
 * @param {LineSegment2D} segment1 The first line segment.
 * @param {LineSegment2D} segment2 The second line segment.
 * @returns {Point2D} The intersection point.
 */
function getCrossPoint( segment1, segment2 ) {
  // Determine the reference line.
  var baseVector = new Vector2D( segment2.point2.x - segment2.point1.x, segment2.point2.y - segment2.point1.y );
  var d1Vec = new Vector2D( segment1.point1.x - segment2.point1.x, segment1.point1.y - segment2.point1.y );
  var d2Vec = new Vector2D( segment1.point2.x - segment2.point1.x, segment1.point2.y - segment2.point1.y );
  var d1 = Math.abs( getCross( baseVector, d1Vec ) );
  var d2 = Math.abs( getCross( baseVector, d2Vec ) );
  var t = d1 / ( d1 + d2 );
  var x = segment1.point1.x + ( segment1.point2.x - segment1.point1.x ) * t;
  var y = segment1.point1.y + ( segment1.point2.y - segment1.point1.y ) * t;
  return new Point2D( x, y );
}



// Multiplies a vector's components by a scalar.
function multiplyVector( vec, scalar ) {
  var temp = new Vector2D();
  temp.x = vec.x * scalar;
  temp.y = vec.y * scalar;
  return temp;
}



// Clamps a value within a specified range [min, max].
function clampOnRange( x, min, max ) {
  if ( x < min ) {
    return min;
  } else if ( x > max ) {
    return max;
  } else {
    return x;
  }
}



/**
 * Calculates the perpendicular distance from a point to an infinite line.
 * (Note: 'line' here is treated as a segment for defining direction, but acts as infinite line).
 *
 * @param {LineSegment2D} line The line segment defining the line.
 * @param {Point2D} point The point.
 * @returns {number} The distance.
 */
function getDistanceLinePoint( line, point ) {
  var vec1 = new Vector2D( line.point2.x - line.point1.x, line.point2.y - line.point1.y );
  var vec2 = new Vector2D( point.x - line.point1.x, point.y - line.point1.y );
  return Math.abs( getCross( vec1, vec2 ) / getVec2DLength( vec1 ) );
}



/**
 * Calculates the shortest distance from a point to a line segment.
 *
 * @param {LineSegment2D} segment The line segment.
 * @param {Point2D} point The point.
 * @returns {number} The shortest distance.
 */
function getDistanceSegmentPoint( segment, point ) {
  // If the projection falls outside the segment (before point1).
  if ( dotProduct2D( subtractPoint( segment.point2, segment.point1 ), subtractPoint( point, segment.point1 ) ) < 0 ) {
    return getVec2DLength( subtractPoint( point, segment.point1 ) );
  }
  // If the projection falls outside the segment (after point2).
  if ( dotProduct2D( subtractPoint( segment.point1, segment.point2 ), subtractPoint( point, segment.point2 ) ) < 0 ) {
    return getVec2DLength( subtractPoint( point, segment.point2 ) );
  }
  // Otherwise, the closest point is on the segment, so use line-point distance.
  return getDistanceLinePoint( segment, point );
}



/**
 * Calculates the shortest distance between two line segments.
 *
 * @param {LineSegment2D} segment1 The first line segment.
 * @param {LineSegment2D} segment2 The second line segment.
 * @returns {number} The shortest distance between the segments.
 */
function getSegmentDistance( segment1, segment2 ) {
  // If segments intersect, the distance is 0.
  if ( isSegmentsCollide( segment1, segment2 ) ) {
    return 0;
  }
  // Otherwise, find the minimum distance between endpoints of one segment to the other segment.
  return Math.min(
    Math.min(
      getDistanceSegmentPoint( segment1, segment2.point1 ),
      getDistanceSegmentPoint( segment1, segment2.point2 )
    ),
    Math.min(
      getDistanceSegmentPoint( segment2, segment1.point1 ),
      getDistanceSegmentPoint( segment2, segment1.point2 )
    )
  );
}



// Input reading and polygon area calculation (Shoelace formula).
var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );
// For local testing, you might use: var input = require('fs').readFileSync('input.txt', 'utf8');

var Arr = ( input.trim() ).split( "\n" );
var n = Arr[0];
var points = [];

// Remove the first element (n) as it's already used.
Arr.shift();

for ( var i = 0; i < n; ++i ) {
  var nums = Arr[i].split( " " ).map( Number );
  points[i] = new Point2D( nums[0], nums[1] );
}

var sum = getCross( points[n - 1], points[0] ); // Cross product of last and first point
for ( var i = 0; i < n - 1; ++i ) {
  sum += getCross( points[i], points[i + 1] ); // Sum cross products of consecutive points
}
sum = Math.abs( sum ) / 2; // Take absolute value and divide by 2 for area.

console.log( sum.toFixed( 1 ) );