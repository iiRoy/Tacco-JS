var ROTATION_LEFT = 1;
var ROTATION_RIGHT = -1;
var ALIGN_BEHIND = 2;
var ALIGN_AHEAD = -2;
var ON_LINE_PART = 0;

var SMALL_FLOAT_VAL = 1e-9; // A small value for float comparisons

/*
 * Represents a 2D vector or point.
 */
var PointVec = class PointVec {
  create(coordX, coordY) {
    this.horiz = coordX;
    this.vert = coordY;
  }
};

PointVec.prototype.initialize = function (horizComp, vertComp) {
  this.horiz = horizComp;
  this.vert = vertComp;
};

/*
 * Rotates a PointVec by 90 degrees counter-clockwise.
 * inputVec: PointVec
 */
function turnPointVec90(inputVec) {
  var resultant = new PointVec();
  resultant.horiz = -inputVec.vert;
  resultant.vert = inputVec.horiz;
  return resultant;
}

/*
 * Converts an angle from degrees to radians.
 */
function convertAngleToRad(angleInDegrees) {
  var mathPi = 3.14159265358979323846;
  return angleInDegrees * mathPi / 180.0;
}

/*
 * Rotates a PointVec by a given angle in degrees.
 * inputVector: PointVec, angleDeg: number
 */
function obtainRotatedPointVec(inputVector, angleDeg) {
  var angleRad = convertAngleToRad(angleDeg);

  var sineVal = Math.sin(angleRad);
  var cosineVal = Math.cos(angleRad);

  var rotatedVec = new PointVec();
  rotatedVec.horiz = inputVector.horiz * cosineVal - inputVector.vert * sineVal;
  rotatedVec.vert = inputVector.horiz * sineVal + inputVector.vert * cosineVal;

  return rotatedVec;
}

/*
 * Rotates a PointVec by a given angle in radians.
 * sourceVec: PointVec, angleRad: number
 */
function deriveRotatedPointVecFromRad(sourceVec, angleRad) {
  var sineValue = Math.sin(angleRad);
  var cosineValue = Math.cos(angleRad);

  var finalVec = new PointVec();
  finalVec.horiz = sourceVec.horiz * cosineValue - sourceVec.vert * sineValue;
  finalVec.vert = sourceVec.horiz * sineValue + sourceVec.vert * cosineValue;

  return finalVec;
}

/*
 * Checks if two vectors are approximately equal.
 */
function areVectorsIdentical(firstVec, secondVec) {
  return compareFloats(firstVec.horiz - secondVec.horiz, 0.0) && compareFloats(firstVec.vert - secondVec.vert, 0.0);
}

/*
 * Computes the unit vector for a given PointVec.
 * inputVec: PointVec
 * returns: PointVec (unit vector)
 */
function calculateUnitVector(inputVec) {
  var vecMagnitude = getPointVecMagnitude(inputVec);
  if (vecMagnitude > 0.0) {
    return scaleDownVector(inputVec, vecMagnitude);
  }
  return inputVec;
}

/*
 * Determines the length (magnitude) of a PointVec.
 * inputVec: PointVec
 * returns: number
 */
function getPointVecMagnitude(inputVec) {
  return Math.sqrt((inputVec.horiz * inputVec.horiz) + (inputVec.vert * inputVec.vert));
}

/*
 * Calculates the squared magnitude (norm) of a vector.
 */
function getSquaredMagnitude(inputVec) {
  return inputVec.horiz * inputVec.horiz + inputVec.vert * inputVec.vert;
}

/*
 * Divides a vector by a scalar value.
 */
function scaleDownVector(originalVec, scalarVal) {
  var resVec = new PointVec();
  resVec.horiz = originalVec.horiz / scalarVal;
  resVec.vert = originalVec.vert / scalarVal;
  return resVec;
}

/*
 * Compares two floating-point numbers for approximate equality.
 */
function compareFloats(valA, valB) {
  var epsilonTolerance = 1.0 / 8192.0;
  return Math.abs(valA - valB) < epsilonTolerance;
}

/*
 * Checks if two vectors are parallel.
 */
function areVectorsParallel(firstVector, secondVector) {
  var normalVec = turnPointVec90(firstVector);
  return compareFloats(0.0, computeDotProduct(normalVec, secondVector));
}

/*
 * Checks if two vectors are perpendicular.
 */
function areVectorsPerpendicular(vecOne, vecTwo) {
  return compareFloats(0.0, computeDotProduct(vecOne, vecTwo));
}

/*
 * Subtracts one vector from another.
 */
function deductVector(vecAlpha, vecBeta) {
  var diffVec = new PointVec();
  diffVec.horiz = vecAlpha.horiz - vecBeta.horiz;
  diffVec.vert = vecAlpha.vert - vecBeta.vert;
  return diffVec;
}

/*
 * Computes the 2D dot product of two vectors.
 */
function computeDotProduct(vecAlpha, vecBeta) {
  return vecAlpha.horiz * vecBeta.horiz + vecAlpha.vert * vecBeta.vert;
}

/**
 * Computes the 2D cross product (z-component) of two vectors.
 *
 * vecAlpha: PointVec
 * vecBeta: PointVec
 * returns: number
 */
function calculateCrossProduct(vecAlpha, vecBeta) {
  return vecAlpha.horiz * vecBeta.vert - vecAlpha.vert * vecBeta.horiz;
}

/**
 * Represents a 2D line segment.
 */
var Segment2D = class Segment2D {
  create(startPoint, endPoint) {
    this.initialP = startPoint;
    this.finalP = endPoint;
  }
};

Segment2D.prototype.setup = function (firstP, secondP) {
  this.initialP = firstP;
  this.finalP = secondP;
};

/*
 * Checks if a segment's endpoints are on the same side of a reference line.
 */
function isSegmentOnOneSide(refLine, targetSegment) {
  var diff1 = new PointVec();
  diff1 = deductVector(targetSegment.initialP, refLine.baseP);

  var diff2 = new PointVec();
  diff2 = deductVector(targetSegment.finalP, refLine.baseP);

  var normalVec = new PointVec();
  normalVec = turnPointVec90(refLine.directionV);

  // Returns true if both points are on the same side of the axis.
  return computeDotProduct(normalVec, diff1) * computeDotProduct(normalVec, diff2) > 0.0;
}

/*
 * Checks if two numerical ranges overlap.
 */
function checkOverlap(rangeAMin, rangeAMax, rangeBMin, rangeBMax) {
  return rangeBMin <= rangeAMax && rangeAMin <= rangeBMax;
}

/*
 * Determines if two line segments intersect.
 */
function doSegmentsIntersect(segA, segB) {
  // Helper lines to check segment orientations
  var lineA = new GeometryLine();
  var lineB = new GeometryLine();

  // Check if segment B is entirely on one side of segment A's line
  lineA.baseP = segA.initialP;
  lineA.directionV = deductVector(segA.finalP, segA.initialP);

  if (isSegmentOnOneSide(lineA, segB)) {
    return false;
  }

  // Likewise for segment A relative to segment B
  lineB.baseP = segB.initialP;
  lineB.directionV = deductVector(segB.finalP, segB.initialP);

  if (isSegmentOnOneSide(lineB, segA)) {
    return false;
  }

  // Handle parallel segments case
  if (areVectorsParallel(lineA.directionV, lineB.directionV)) {
    var projRangeA = projectSegmentOntoVector(segA, lineA.directionV);
    var projRangeB = projectSegmentOntoVector(segB, lineA.directionV);

    // Check for overlap on the projected axis
    return areRangesOverlapping(projRangeA, projRangeB);
  } else {
    return true;
  }
}

/*
 * Represents a geometric line with a base point and a direction vector.
 */
function GeometryLine() {
  this.baseP; // PointVec
  this.directionV; // PointVec
}

GeometryLine.prototype.configure = function (basePt, directionVec, visualColor) {
  this.baseP = basePt;
  this.directionV = directionVec;
};

/**
 * Represents a numerical interval.
 */
var Interval = class Interval {
  create(minimum, maximum) {
    this.lower = minimum;
    this.upper = maximum;
  }
};

/*
 * Combines two intervals to form a new interval spanning their union.
 */
function getCombinedInterval(intervalA, intervalB) {
  var combined = new Interval();
  combined.lower = intervalA.lower < intervalB.lower ? intervalA.lower : intervalB.lower;
  combined.upper = intervalA.upper < intervalB.upper ? intervalB.upper : intervalA.upper;
  return combined;
}

/*
 * Ensures an interval's lower bound is less than or equal to its upper bound.
 */
function normalizeInterval(inputInterval) {
  var normalized = new Interval(inputInterval.lower, inputInterval.upper);
  if (inputInterval.lower > inputInterval.upper) {
    normalized.lower = inputInterval.upper;
    normalized.upper = inputInterval.lower;
  }
  return normalized;
}

/*
 * Reverses the direction of a vector.
 */
function reverseVectorDirection(targetVector) {
  targetVector.horiz = -targetVector.horiz;
  targetVector.vert = -targetVector.vert;
  return targetVector;
}

/*
 * Adds two vectors together.
 */
function sumVectors(firstVec, secondVec) {
  return new PointVec(firstVec.horiz + secondVec.horiz, firstVec.vert + secondVec.vert);
}

/**
 * Projects a line segment onto a given vector, returning an Interval.
 * lineSegment: Segment2D, projectionAxis: PointVec
 * returns: Interval
 */
function projectSegmentOntoVector(lineSegment, projectionAxis) {
  var axisUnitVec = calculateUnitVector(projectionAxis);

  var projInterval = new Interval();
  projInterval.lower = computeDotProduct(axisUnitVec, lineSegment.initialP);
  projInterval.upper = computeDotProduct(axisUnitVec, lineSegment.finalP);

  projInterval = normalizeInterval(projInterval);
  return projInterval;
}

/*
 * Checks if two intervals overlap.
 */
function areRangesOverlapping(interval1, interval2) {
  return checkOverlap(interval1.lower, interval1.upper, interval2.lower, interval2.upper);
}

/*
 * Projects one vector onto another.
 */
function computeVectorProjection(vectorToProject, targetVector) {
  var targetVecSquaredMag = computeDotProduct(targetVector, targetVector);
  if (0.0 < targetVecSquaredMag) {
    var dotProd = computeDotProduct(vectorToProject, targetVector);
    return scaleVector(targetVector, dotProd / targetVecSquaredMag);
  }
  return targetVector;
}

/**
 * Represents a 2D coordinate point.
 */
var Coord2D = class Coord2D {
  create(horizCoord, vertCoord) {
    this.h = horizCoord;
    this.v = vertCoord;
  }
};

/*
 * Adds the coordinates of two points.
 */
function sumPoints(ptA, ptB) {
  return new Coord2D(ptA.h + ptB.h, ptA.v + ptB.v);
}

/*
 * Subtracts the coordinates of one point from another.
 */
function deductPoints(ptA, ptB) {
  return new Coord2D(ptA.h - ptB.h, ptA.v - ptB.v);
}

/*
 * Scales a point's coordinates by a scalar factor.
 */
function scalePoint(targetPoint, factor) {
  return new Coord2D(targetPoint.h * factor, targetPoint.v * factor);
}

/**
 * Calculates the projection of a point onto a line segment.
 * lineSegment: Segment2D, targetPoint: Coord2D
 */
function determineProjectedPoint(lineSegment, targetPoint) {
  var segmentVec = new PointVec(lineSegment.finalP.horiz - lineSegment.initialP.horiz, lineSegment.finalP.vert - lineSegment.initialP.vert);
  var pointToSegmentStartVec = new PointVec(targetPoint.h - lineSegment.initialP.horiz, targetPoint.v - lineSegment.initialP.vert);
  var projectionRatio = computeDotProduct(pointToSegmentStartVec, segmentVec) / getSquaredMagnitude(segmentVec);
  var scaledSegmentVec = scaleVector(segmentVec, projectionRatio);
  var finalProjectedPoint = new Coord2D(lineSegment.initialP.horiz + scaledSegmentVec.horiz, lineSegment.initialP.vert + scaledSegmentVec.vert);
  return finalProjectedPoint;
}

/*
 * Finds the reflection of a point across a line segment.
 */
function findReflectionPoint(lineSegment, inputPoint) {
  var projectedLoc = determineProjectedPoint(lineSegment, inputPoint);
  // Vector from original point to its projection
  var vecToProjected = deductPoints(projectedLoc, inputPoint);
  // Double this vector to find the offset for reflection
  var reflectedLocOffset = scalePoint(vecToProjected, 2.0);
  // Add the original point to the offset to get the reflected point
  return sumPoints(reflectedLocOffset, inputPoint);
}

/**
 * Determines the intersection point of two line segments.
 *
 * segAlpha: Segment2D
 * segBeta: Segment2D
 * returns: Coord2D
 */
function calculateIntersectionPoint(segAlpha, segBeta) {
  // Define a base vector from the second segment
  var baseVec = new PointVec(segBeta.finalP.horiz - segBeta.initialP.horiz, segBeta.finalP.vert - segBeta.initialP.vert);
  var segAlphaStartToSegBetaStartVec = new PointVec(segAlpha.initialP.horiz - segBeta.initialP.horiz, segAlpha.initialP.vert - segBeta.initialP.vert);
  var segAlphaEndToSegBetaStartVec = new PointVec(segAlpha.finalP.horiz - segBeta.initialP.horiz, segAlpha.finalP.vert - segBeta.initialP.vert);
  var crossProductAbs1 = Math.abs(calculateCrossProduct(baseVec, segAlphaStartToSegBetaStartVec));
  var crossProductAbs2 = Math.abs(calculateCrossProduct(baseVec, segAlphaEndToSegBetaStartVec));
  var interpolationFactor = crossProductAbs1 / (crossProductAbs1 + crossProductAbs2);
  var intersectX = segAlpha.initialP.horiz + (segAlpha.finalP.horiz - segAlpha.initialP.horiz) * interpolationFactor;
  var intersectY = segAlpha.initialP.vert + (segAlpha.finalP.vert - segAlpha.initialP.vert) * interpolationFactor;
  return new Coord2D(intersectX, intersectY);
}

/*
 * Multiplies a vector by a scalar value.
 */
function scaleVector(inputVec, multiplier) {
  var scaledVec = new PointVec();
  scaledVec.horiz = inputVec.horiz * multiplier;
  scaledVec.vert = inputVec.vert * multiplier;
  return scaledVec;
}

/*
 * Clamps a numerical value within a specified range.
 */
function constrainValue(value, lowerBound, upperBound) {
  if (value < lowerBound) {
    return lowerBound;
  } else if (value > upperBound) {
    return upperBound;
  } else {
    return value;
  }
}

/**
 * Calculates the distance from a point to an infinite line (defined by a segment).
 * geometryLine: Segment2D, targetPoint: Coord2D
 */
function measureLinePointDistance(geometryLine, targetPoint) {
  var lineDirVec = new PointVec(geometryLine.finalP.horiz - geometryLine.initialP.horiz, geometryLine.finalP.vert - geometryLine.initialP.vert);
  var pointToLineStartVec = new PointVec(targetPoint.h - geometryLine.initialP.horiz, targetPoint.v - geometryLine.initialP.vert);
  return Math.abs(calculateCrossProduct(lineDirVec, pointToLineStartVec) / getPointVecMagnitude(lineDirVec));
}

/**
 * Computes the shortest distance from a point to a line segment.
 * lineSeg: Segment2D, targetPoint: Coord2D
 */
function measureSegmentPointDistance(lineSeg, targetPoint) {
  // If the projection falls outside the segment's start boundary, distance is to start point.
  if (computeDotProduct(deductPoints(lineSeg.finalP, lineSeg.initialP), deductPoints(targetPoint, lineSeg.initialP)) < 0.0) {
    return getPointVecMagnitude(deductPoints(targetPoint, lineSeg.initialP));
  }
  // If the projection falls outside the segment's end boundary, distance is to end point.
  if (computeDotProduct(deductPoints(lineSeg.initialP, lineSeg.finalP), deductPoints(targetPoint, lineSeg.finalP)) < 0.0) {
    return getPointVecMagnitude(deductPoints(targetPoint, lineSeg.finalP));
  }
  // Otherwise, the distance is to the infinite line containing the segment.
  return measureLinePointDistance(lineSeg, targetPoint);
}

/**
 * Finds the shortest distance between two line segments.
 * segA: Segment2D, segB: Segment2D
 */
function calcSegmentToSegmentDistance(segA, segB) {
  // If segments intersect, distance is zero.
  if (doSegmentsIntersect(segA, segB)) {
    return 0.0;
  }
  return Math.min(Math.min(measureSegmentPointDistance(segA, segB.initialP), measureSegmentPointDistance(segA, segB.finalP)),
    Math.min(measureSegmentPointDistance(segB, segA.initialP), measureSegmentPointDistance(segB, segA.finalP)));
}

/*
 * Determines the orientation of three points (clockwise, counter-clockwise, collinear).
 */
function checkOrientation(pA, pB, pC) {
  var vecAB = new PointVec(pB.h - pA.h, pB.v - pA.v);
  var vecAC = new PointVec(pC.h - pA.h, pC.v - pA.v);
  var crossProd = calculateCrossProduct(vecAB, vecAC);

  if (crossProd > SMALL_FLOAT_VAL) {
    return ROTATION_LEFT;
  }
  if (crossProd < -SMALL_FLOAT_VAL) {
    return ROTATION_RIGHT;
  }
  if (computeDotProduct(vecAB, vecAC) < -SMALL_FLOAT_VAL) {
    return ALIGN_BEHIND;
  }
  if (getPointVecMagnitude(vecAB) < getPointVecMagnitude(vecAC)) {
    return ALIGN_AHEAD;
  }
  return ON_LINE_PART;
}

/**
 * Implements Andrew's Monotone Chain algorithm to find the convex hull.
 * inputPoints: Array<Coord2D>
 */
function computeConvexHull(inputPoints) {
  if (inputPoints.length < 3) {
    return inputPoints;
  }

  // Sort points primarily by x-coordinate, then by y-coordinate for ties.
  inputPoints.sort((a, b) => (a.h > b.h) ? 1 : (a.h === b.h) ? ((a.v > b.v) ? 1 : -1) : -1);

  // Initialize upper hull with first two sorted points.
  var upperHull = [];
  upperHull.push(inputPoints[0]);
  upperHull.push(inputPoints[1]);
  // Initialize lower hull with last two sorted points.
  var lowerHull = [];
  lowerHull.push(inputPoints[inputPoints.length - 1]);
  lowerHull.push(inputPoints[inputPoints.length - 2]);

  // Build the upper hull.
  for (var idx = 2; idx < inputPoints.length; ++idx) {
    // Remove points that would create a non-left turn.
    for (var innerIdx = upperHull.length; innerIdx >= 2 && checkOrientation(upperHull[innerIdx - 2], upperHull[innerIdx - 1], inputPoints[idx]) === ROTATION_LEFT; --innerIdx) {
      upperHull.pop();
    }
    upperHull.push(inputPoints[idx]);
  }
  // Build the lower hull.
  for (var idx = inputPoints.length - 3; idx >= 0; --idx) {
    // Remove points that would create a non-left turn.
    for (var innerIdx = lowerHull.length; innerIdx >= 2 && checkOrientation(lowerHull[innerIdx - 2], lowerHull[innerIdx - 1], inputPoints[idx]) === ROTATION_LEFT; --innerIdx) {
      lowerHull.pop();
    }
    lowerHull.push(inputPoints[idx]);
  }
  // Combine hulls to form the complete convex hull (clockwise order).
  lowerHull.reverse();
  for (var idx = upperHull.length - 2; idx >= 1; --idx) {
    lowerHull.push(upperHull[idx]);
  }
  return lowerHull;
}

/*
 * Calculates the diameter (longest distance between any two points) of a convex hull.
 * hullPoints: Array<Coord2D> (assumed to be a convex hull)
 */
function calculateConvexDiameter(hullPoints) {
  // Find initial antipodal points (min/max Y coordinates).
  var idxMinY = 0;
  var idxMaxY = 0;
  for (var i = 1; i < hullPoints.length; i++) {
    if (hullPoints[i].v > hullPoints[idxMinY].v) idxMinY = i;
    if (hullPoints[i].v < hullPoints[idxMaxY].v) idxMaxY = i;
  }
  var maxDiameterSquared = getSquaredMagnitude(deductVector(hullPoints[idxMinY], hullPoints[idxMaxY]));
  var maxIdxA = idxMinY, currentIdxA = idxMaxY, maxIdxB = idxMaxY, currentIdxB = idxMaxY;
  do {
    // Rotating calipers algorithm to find the maximum distance.
    if (calculateCrossProduct(deductVector(hullPoints[(currentIdxA + 1) % hullPoints.length], hullPoints[currentIdxA]), deductVector(hullPoints[(currentIdxB + 1) % hullPoints.length], hullPoints[currentIdxB])) >= 0.0) {
      currentIdxB = (currentIdxB + 1) % hullPoints.length;
    } else {
      currentIdxA = (currentIdxA + 1) % hullPoints.length;
    }
    if (getSquaredMagnitude(deductVector(hullPoints[currentIdxA], hullPoints[currentIdxB])) > maxDiameterSquared) {
      maxDiameterSquared = getSquaredMagnitude(deductVector(hullPoints[currentIdxA], hullPoints[currentIdxB]));
      maxIdxA = currentIdxA;
      maxIdxB = currentIdxB;
    }
  } while (currentIdxA !== idxMinY || currentIdxB !== idxMaxY);
  return maxDiameterSquared; // Returning squared diameter, as original did for 'getNorm'
}