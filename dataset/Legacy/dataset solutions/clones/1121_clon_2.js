// A 2D vector structure
var Vec2D = class Vec2D {
	constructor(coordX, coordY) {
		this.x = coordX;
		this.y = coordY;
	}
};

Vec2D.prototype.Initialize = function(coordX, coordY) {
	this.x = coordX;
	this.y = coordY;
};

/*
 * Rotates a vector by 90 degrees counter-clockwise.
 * inputVec: A Vec2D object.
 */
function rotVec90(inputVec) {
	var resultVec = new Vec2D();
	resultVec.x = -inputVec.y;
	resultVec.y = inputVec.x;
	return resultVec;
}

/*
 * Converts degrees to radians.
 * Returns the radian value.
 */
function degToRad(angleDeg) {
	// Using Math.PI for the value of Pi
	var PI_VAL = Math.PI;
	return angleDeg * PI_VAL / 180.0;
}

/*
 * Rotates a vector by a given angle.
 * targetVec: Vec2D to rotate.
 * angleDeg: Angle in degrees.
 * Returns a new Vec2D.
 */
function getRotatedVec(targetVec, angleDeg) {
	var angleRad = degToRad(angleDeg);

	var sineVal = Math.sin(angleRad);
	var cosineVal = Math.cos(angleRad);

	var resultVec = new Vec2D();
	resultVec.x = targetVec.x * cosineVal - targetVec.y * sineVal;
	resultVec.y = targetVec.x * sineVal + targetVec.y * cosineVal;

	return resultVec;
}

// Checks if two vectors are approximately equal.
function areVecsEqual(vecA, vecB) {
	return fltEq(vecA.x - vecB.x, 0.0) && fltEq(vecA.y - vecB.y, 0.0);
}

/**
 * Normalizes a vector to unit length.
 * targetVec: Vec2D to normalize.
 * Returns a unit vector.
 */
function getUnitVec(targetVec) {
	var mag = getVecLen2D(targetVec);
	if (mag > 0.0) {
		return divideVec(targetVec, mag);
	}
	// If magnitude is zero, return the original vector (or a zero vector, depending on desired behavior, but original code returns input)
	return targetVec;
}

/**
 * Calculates the Euclidean length (magnitude) of a 2D vector.
 * targetVec: Vec2D object.
 * Returns the length.
 */
function getVecLen2D(targetVec) {
	return Math.sqrt((targetVec.x * targetVec.x) + (targetVec.y * targetVec.y));
}

// Divides a vector's components by a scalar.
function divideVec(inputVec2D, mag) {
	inputVec2D.x = inputVec2D.x / mag;
	inputVec2D.y = inputVec2D.y / mag;
	return inputVec2D;
}

// Compares two floating-point numbers for approximate equality.
function fltEq(valA, valB) {
	var epsilon = 1.0 / 8192.0; // A small threshold for comparison
	return Math.abs(valA - valB) < epsilon;
}

// Determines if two vectors are parallel.
function areVecsParallel(firstVec, secondVec) {
	var normalVecA = rotVec90(firstVec);
	return fltEq(0.0, dotProd2D(normalVecA, secondVec));
}

// Determines if two vectors are orthogonal (perpendicular).
function areVecsOrthogonal(firstVec, secondVec) {
	return fltEq(0.0, dotProd2D(firstVec, secondVec));
}

// Subtracts one vector from another.
function subVec(vecA, vecB) {
	var resultVec = new Vec2D();
	resultVec.x = vecA.x - vecB.x;
	resultVec.y = vecA.y - vecB.y;
	return resultVec;
}

// Calculates the 2D dot product of two vectors.
function dotProd2D(vecA, vecB) {
    var dotProductResult = vecA.x * vecB.x + vecA.y * vecB.y;
    //console.log(dotProductResult);
	return vecA.x * vecB.x + vecA.y * vecB.y;
}

/**
 * Calculates the 2D cross product (scalar value) of two vectors.
 *
 * @param firstVector The first vector.
 * @param secondVector The second vector.
 * @returns The scalar cross product.
 */
function crossProd(firstVector, secondVector) {
	return firstVector.x * secondVector.y - firstVector.y * secondVector.x;
}

/**
 * Represents a 2D line segment.
 *
 * startPnt: Vec2D for the first endpoint.
 * endPnt: Vec2D for the second endpoint.
 */
var Seg2D = class Seg2D {
	constructor(startPnt, endPnt) {
		this.point1 = startPnt;
		this.point2 = endPnt;
	}
};

Seg2D.prototype.Initialize = function(startPnt, endPnt) {
	this.point1 = startPnt;
	this.point2 = endPnt;
};

// Checks if a segment lies entirely on one side of a line defined by an axis.
function isOneSide(lineAxis, lineSegment) {
	var diff1 = new Vec2D();
	diff1 = subVec(lineSegment.point1, lineAxis.origin);

	var diff2 = new Vec2D();
	diff2 = subVec(lineSegment.point2, lineAxis.origin);

	var normalDir = new Vec2D();
	normalDir = rotVec90(lineAxis.directionVec);

	// Returns true if both points are on the same side (dot products have same sign)
	return dotProd2D(normalDir, diff1) * dotProd2D(normalDir, diff2) > 0.0;
}

// Checks if two ranges (min/max pairs) overlap.
function isOverlapping(minValA, maxValA, minValB, maxValB) {
	return minValB <= maxValA && minValA <= maxValB;
}

// Determines if two line segments collide (intersect).
function doSegsCollide(segOne, segTwo) {
	// Vectors to check the direction of the line segments
	var axisOne = new Lne();
	var axisTwo = new Lne();

	// Check if segmentTwo is on one side of segmentOne's line
	axisOne.origin = segOne.point1;
	axisOne.directionVec = subVec(segOne.point2, segOne.point1);

	if (isOneSide(axisOne, segTwo)) {
		return false;
	}

	// Similarly, check if segmentOne is on one side of segmentTwo's line
	axisTwo.origin = segTwo.point1;
	axisTwo.directionVec = subVec(segTwo.point2, segTwo.point1);

	if (isOneSide(axisTwo, segOne)) {
		return false;
	}

	// Handle the case where segments are parallel
	if (areVecsParallel(axisOne.directionVec, axisTwo.directionVec)) {
		var intervalA = projectSeg(segOne, axisOne.directionVec);
		var intervalB = projectSeg(segTwo, axisOne.directionVec);

		// Check if their projected ranges overlap
		return areIntervalsOverlapping(intervalA, intervalB);
	} else {
		// If not parallel and not on one side, they must intersect
		return true;
	}
}

/*
 * Represents a Line Object.
 */
function Lne() {
	// Vec2D for the base point
	this.origin;
	// Vec2D for the direction vector
	this.directionVec;
}

Lne.prototype.Initialize = function(origin, directionVec, lineColor) {
	this.origin = origin;
	this.directionVec = directionVec;
	// this.lineColor = lineColor; // Original code didn't assign color, but parameter exists. Keeping it commented.
};

/**
 * Represents a numerical range or interval.
 */
var Interval = class Interval {
	constructor(lowerBound, upperBound) {
		this.min = lowerBound;
		this.max = upperBound;
	}
};

// Combines two ranges to find the overall min and max.
function getMinMaxInterval(int1, int2) {
	var combinedInterval = new Interval();
	combinedInterval.min = int1.min < int2.min ? int1.min : int2.min;
	combinedInterval.max = int1.max < int2.max ? int2.max : int1.max;
	return combinedInterval;
}

// Sorts the min and max values of a range if they are out of order.
function sortInterval(inputInterval) {
	var orderedInterval = new Interval(inputInterval.min, inputInterval.max);
	if (inputInterval.min > inputInterval.max) {
		orderedInterval.min = inputInterval.max;
		orderedInterval.max = inputInterval.min;
	}
	return orderedInterval;
}

// Negates the components of a vector.
function negateVec(inputVector) {
	inputVector.x = -inputVector.x;
	inputVector.y = -inputVector.y;
	return inputVector;
}

// Adds two vectors together.
function addVec(firstVector, secondVector) {
	return new Vec2D(firstVector.x + secondVector.x, firstVector.y + secondVector.y);
}

/**
 * Projects a line segment onto a given vector.
 *
 * lineSegment: The Seg2D to project.
 * projectionAxis: The Vec2D onto which to project.
 *
 * Returns an Interval representing the projected range.
 */
function projectSeg(lineSegment, projectionAxis) {
	var unitProjectionVec = getUnitVec(projectionAxis);

	var projectedInterval = new Interval();
	projectedInterval.min = dotProd2D(unitProjectionVec, lineSegment.point1);
	projectedInterval.max = dotProd2D(unitProjectionVec, lineSegment.point2);

	projectedInterval = sortInterval(projectedInterval);
	return projectedInterval;
}

// Checks if two intervals (ranges) overlap.
function areIntervalsOverlapping(int1, int2) {
	return isOverlapping(int1.min, int1.max, int2.min, int2.max);
}

// Projects one vector onto another.
function projectVec(vecToProject, projectionAxis) {
	var denom = dotProd2D(projectionAxis, projectionAxis);
	if (0.0 < denom) {
	    var dotProd = dotProd2D(vecToProject, projectionAxis);
	    return mulVec(projectionAxis, dotProd / denom);
	}
	// If projectionAxis is a zero vector, return it.
	return projectionAxis;
}

// Calculates the squared magnitude (norm) of a vector.
function getSquaredMagnitude(targetVec) {
	return targetVec.x * targetVec.x + targetVec.y * targetVec.y;
}

// Calculates the magnitude (length) of a 2D vector.
function getMagnitude2D(targetVec) {
	return Math.sqrt(getSquaredMagnitude(targetVec));
}


/**
 * Represents a 2D point.
 */
var Pnt2D = class Pnt2D {
	constructor(coordX, coordY) {
		this.x = coordX;
		this.y = coordY;
	}
};

// Adds two points (component-wise).
function addPnt(pntA, pntB) {
	return new Pnt2D(pntA.x + pntB.x, pntA.y + pntB.y);
}

// Subtracts one point from another (component-wise).
function subPnt(pntA, pntB) {
	return new Pnt2D(pntA.x - pntB.x, pntA.y - pntB.y);
}

// Multiplies a point's coordinates by a scalar.
function mulPnt(inputPnt, scaleFactor) {
	return new Pnt2D(inputPnt.x * scaleFactor, inputPnt.y * scaleFactor);
}

/**
 * Projects a point onto a line segment.
 *
 * lineSegment: The Seg2D to project onto.
 * targetPnt: The Pnt2D to project.
 */
function projectPnt(lineSegment, targetPnt) {
	var segmentVec = new Vec2D(lineSegment.point2.x - lineSegment.point1.x, lineSegment.point2.y - lineSegment.point1.y);
	var pointToStartVec = new Vec2D(targetPnt.x - lineSegment.point1.x, targetPnt.y - lineSegment.point1.y);
	var projectionRatio = dotProd2D(pointToStartVec, segmentVec) / getSquaredMagnitude(segmentVec);
	var projectedComponent = mulVec(segmentVec, projectionRatio);
	var projectedPnt = new Pnt2D(lineSegment.point1.x + projectedComponent.x, lineSegment.point1.y + projectedComponent.y);
	return projectedPnt;
}

// Calculates the reflection of a point across a line segment.
function reflectPnt(lineSegment, targetPnt) {
	var projectedPnt = projectPnt(lineSegment, targetPnt);
	// Vector from the point to its projection
	var vecToProjection = subPnt(projectedPnt, targetPnt);
	// Doubling this vector gives the reflection vector from the point
	var reflectedPnt = mulPnt(vecToProjection, 2.0);
	// Add the original point to get the reflected point's coordinates
	return addPnt(reflectedPnt, targetPnt);
}

/**
 * Calculates the intersection point of two line segments.
 *
 * @param segOne The first line segment.
 * @param segTwo The second line segment.
 * @returns The Pnt2D intersection point.
 */
function getIntersectionPnt(segOne, segTwo) {
	// Define a base vector from the second segment
	var seg2DirVec = new Vec2D(segTwo.point2.x - segTwo.point1.x, segTwo.point2.y - segTwo.point1.y);
	var p1ToSeg2StartVec = new Vec2D(segOne.point1.x - segTwo.point1.x, segOne.point1.y - segTwo.point1.y);
	var p2ToSeg2StartVec = new Vec2D(segOne.point2.x - segTwo.point1.x, segOne.point2.y - segTwo.point1.y);
	var d1 = Math.abs(crossProd(seg2DirVec, p1ToSeg2StartVec));
	var d2 = Math.abs(crossProd(seg2DirVec, p2ToSeg2StartVec));
	var ratio = d1 / (d1 + d2);
	var intersectX = segOne.point1.x + (segOne.point2.x - segOne.point1.x) * ratio;
	var intersectY = segOne.point1.y + (segOne.point2.y - segOne.point1.y) * ratio;
	return new Pnt2D(intersectX, intersectY);
}

// Multiplies a vector's components by a scalar.
function mulVec(inputVec, scaleFactor) {
	var scaledVec = new Vec2D();
	scaledVec.x = inputVec.x * scaleFactor;
	scaledVec.y = inputVec.y * scaleFactor;
	return scaledVec;
}

// Clamps a value within a specified range.
function clampValue(value, minimum, maximum) {
	if (value < minimum) {
		return minimum;
	} else if (value > maximum) {
		return maximum;
	} else {
		return value;
	}
}

/**
 * Calculates the shortest distance from a point to an infinite line.
 */
function distLinePnt(inputLine, targetPnt) {
	var lineVec = new Vec2D(inputLine.point2.x - inputLine.point1.x, inputLine.point2.y - inputLine.point1.y);
	var pntToLineStartVec = new Vec2D(targetPnt.x - inputLine.point1.x, targetPnt.y - inputLine.point1.y);
	return Math.abs(crossProd(lineVec, pntToLineStartVec) / getMagnitude2D(lineVec));
}

/**
 * Calculates the shortest distance from a point to a line segment.
 */
function distSegPnt(lineSegment, targetPnt) {
	// If the angle between (segment.point2 - segment.point1) and (point - segment.point1) is obtuse,
	// the closest point is segment.point1.
	if (dotProd2D(subPnt(lineSegment.point2, lineSegment.point1), subPnt(targetPnt, lineSegment.point1)) < 0.0) {
		return getMagnitude2D(subPnt(targetPnt, lineSegment.point1));
	}
	// If the angle between (segment.point1 - segment.point2) and (point - segment.point2) is obtuse,
	// the closest point is segment.point2.
	if (dotProd2D(subPnt(lineSegment.point1, lineSegment.point2), subPnt(targetPnt, lineSegment.point2)) < 0.0) {
		return getMagnitude2D(subPnt(targetPnt, lineSegment.point2));
	}
	// Otherwise, the closest point is on the line segment itself, so calculate distance to the infinite line.
	return distLinePnt(lineSegment, targetPnt);
}

/**
 * Calculates the shortest distance between two line segments.
 */
function distSegSeg(segOne, segTwo) {
	// If the segments intersect, the distance is 0.
	if (doSegsCollide(segOne, segTwo)) {
		return 0.0;
	}
	// Otherwise, find the minimum distance between endpoints of one segment and the other segment.
	return Math.min(Math.min(distSegPnt(segOne, segTwo.point1), distSegPnt(segOne, segTwo.point2)),
			Math.min(distSegPnt(segTwo, segOne.point1), distSegPnt(segTwo, segOne.point2)));
}

var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
//var rawData = require('fs').readFileSync('input.txt', 'utf8');
var lineArray = (rawData.trim()).split("\n");
var pointCount = lineArray[0];
var polygonVertices = [];
// Remove the first element (pointCount) from the array
lineArray.shift();

for (var idx = 0; idx < pointCount; ++idx) {
    var coordinates = lineArray[idx].split(" ").map(Number);
    polygonVertices[idx] = new Pnt2D(coordinates[0], coordinates[1]);
}

// Calculate the area using the shoelace formula (cross product sum)
var areaSum = crossProd(polygonVertices[pointCount - 1], polygonVertices[0]);
for (var idx = 0; idx < pointCount - 1; ++idx) {
	areaSum += crossProd(polygonVertices[idx], polygonVertices[idx + 1]);
}
areaSum = Math.abs(areaSum) / 2.0;
console.log(areaSum.toFixed(1));
