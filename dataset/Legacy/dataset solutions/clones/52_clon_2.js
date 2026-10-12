const ROTATION_COUNTERCLOCKWISE =  1;
const ROTATION_CLOCKWISE_DIR = -1;
const LINE_POSITION_REAR =      2;
const LINE_POSITION_FRONT = -2;
const LINE_POSITION_ON =        0;

let CoordPair = class CoordPair {
	constructor(valX, valY) {
		this.valX = valX;
		this.valY = valY;
	}
}

CoordPair.prototype.setCoordinates = function (valX, valY) {
	this.valX = valX;
	this.valY = valY;
}

// Rotates a point by 90 degrees counter-clockwise
function rotatePointQuarter(inputCoord) {
	let resultCoord = new CoordPair();
	resultCoord.valX = -inputCoord.valY;
	resultCoord.valY = inputCoord.valX;
	return resultCoord;
}

// Converts an angle from degrees to radians
function angleToRadians(angleMeasurement) {
	const MATH_PI_CONSTANT = 3.14159265358979323846;
	return angleMeasurement * MATH_PI_CONSTANT / 180.0;
}

// Rotates a point by a given angle in degrees
function transformPointByAngle(currentPoint, angleMeasurement) {
	let radValue = angleToRadians(angleMeasurement);

	let sineValue = Math.sin(radValue);
	let cosineValue = Math.cos(radValue);

	let transformedPoint = new CoordPair();
	transformedPoint.valX = currentPoint.valX * cosineValue - currentPoint.valY * sineValue;
	transformedPoint.valY = currentPoint.valX * sineValue + currentPoint.valY * cosineValue;

	return transformedPoint;
}

// Rotates a point by a given angle in radians
function transformPointByRadians(currentPoint, radValue) {
	let sineValue = Math.sin(radValue);
	let cosineValue = Math.cos(radValue);

	let transformedPoint = new CoordPair();
	transformedPoint.valX = currentPoint.valX * cosineValue - currentPoint.valY * sineValue;
	transformedPoint.valY = currentPoint.valX * sineValue + currentPoint.valY * cosineValue;

	return transformedPoint;
}

// Checks if two points have approximately equal coordinates
function arePointsIdentical(pointOne, pointTwo) {
	return areNumbersClose(pointOne.valX - pointTwo.valX, 0) && areNumbersClose(pointOne.valY - pointTwo.valY, 0);
}

// Returns a normalized point (unit vector)
function normalizePoint(inputPoint) {
	let magnitude = calculatePointMagnitude(inputPoint);
	if (magnitude > 0.0) {
		return scalePointByDivision(inputPoint, magnitude);
	}
	return inputPoint;
}

// Computes the Euclidean magnitude of a 2D point
function calculatePointMagnitude(inputPoint) {
	return Math.sqrt((inputPoint.valX * inputPoint.valX) + (inputPoint.valY * inputPoint.valY));
}

// Calculates the squared magnitude of a point
function getSquaredMagnitude(inputPoint) {
	return inputPoint.valX * inputPoint.valX + inputPoint.valY * inputPoint.valY;
}

// Divides a point's coordinates by a scalar value
function scalePointByDivision(originalPoint, divisionFactor) {
	let scaledPoint = new CoordPair();
	scaledPoint.valX = originalPoint.valX / divisionFactor;
	scaledPoint.valY = originalPoint.valY / divisionFactor;
	return scaledPoint;
}

// Compares two floating-point numbers for approximate equality
function areNumbersClose(valueA, valueB) {
	const APPROX_EPSILON_TOLERANCE = 1.0 / 8192.0;
	return Math.abs(valueA - valueB) < APPROX_EPSILON_TOLERANCE;
}

// Determines if two points represent parallel directions
function checkParallelism(directionOne, directionTwo) {
	let normalDirection = rotatePointQuarter(directionOne);
	return areNumbersClose(0.0, computeDotProduct(normalDirection, directionTwo));
}

// Determines if two points represent orthogonal directions
function checkOrthogonality(directionOne, directionTwo) {
	return areNumbersClose(0.0, computeDotProduct(directionOne, directionTwo));
}

// Subtracts the coordinates of one point from another
function subtractPoints(minuendPoint, subtrahendPoint) {
	let differencePoint = new CoordPair();
	differencePoint.valX = minuendPoint.valX - subtrahendPoint.valX;
	differencePoint.valY = minuendPoint.valY - subtrahendPoint.valY;
	return differencePoint;
}

// Calculates the dot product of two points
function computeDotProduct(pointOne, pointTwo) {
	return pointOne.valX * pointTwo.valX + pointOne.valY * pointTwo.valY;
}

// Computes the 2D cross product (scalar) of two points
// This is effectively the z-component of the 3D cross product
function computeCrossProduct(pointOne, pointTwo) {
	return pointOne.valX * pointTwo.valY - pointOne.valY * pointTwo.valX;
}

// Represents a line segment in 2D space
let SegmentStructure = class SegmentStructure {
	constructor(beginPoint, endPoint) {
		this.beginPoint = beginPoint;
		this.endPoint = endPoint;
	}
}

SegmentStructure.prototype.setEndpoints = function (beginPoint, endPoint) {
	this.beginPoint = beginPoint;
	this.endPoint = endPoint;
}

// Checks if a segment lies entirely on one side of a line axis
function isOneSided(lineAxis, geometrySegment) {
	let offsetOne = new CoordPair();
	offsetOne = subtractPoints(geometrySegment.beginPoint, lineAxis.origin);

	let offsetTwo = new CoordPair();
	offsetTwo = subtractPoints(geometrySegment.endPoint, lineAxis.origin);

	let normalDirection = new CoordPair();
	normalDirection = rotatePointQuarter(lineAxis.orientation);

	// Returns true if both points are on the same side
	return computeDotProduct(normalDirection, offsetOne) * computeDotProduct(normalDirection, offsetTwo) > 0;
}

// Determines if two numerical ranges overlap
function checkOverlap(rangeA_min, rangeA_max, rangeB_min, rangeB_max) {
	return rangeB_min <= rangeA_max && rangeA_min <= rangeB_max;
}

// Detects if two line segments intersect
function detectSegmentIntersection(segA, segB) {
	// Vectors for checking segment directions
	let axisGeometryA = new GeometricLine();
	let axisGeometryB = new GeometricLine();

	// Check if segB lies on one side of segA's line
	axisGeometryA.origin = segA.beginPoint;
	axisGeometryA.orientation = subtractPoints(segA.endPoint, segA.beginPoint);

	if (isOneSided(axisGeometryA, segB)) {
		return false;
	}

	// Similarly, check if segA lies on one side of segB's line
	axisGeometryB.origin = segB.beginPoint;
	axisGeometryB.orientation = subtractPoints(segB.endPoint, segB.beginPoint);

	if (isOneSided(axisGeometryB, segA)) {
		return false;
	}

	// Handle case where segments are parallel
	if (checkParallelism(axisGeometryA.orientation, axisGeometryB.orientation)) {
		let rangeA = projectSegmentOntoDirection(segA, axisGeometryA.orientation);
		let rangeB = projectSegmentOntoDirection(segB, axisGeometryA.orientation);

		// Check if projected ranges overlap
		return areIntervalsOverlapping(rangeA, rangeB);
	}
	else {
		// If not parallel and not one-sided, they must intersect
		return true;
	}
}

// Represents a 2D line with an origin point and a direction vector
function GeometricLine() {
	this.origin;    // CoordPair
	this.orientation; // CoordPair
}

GeometricLine.prototype.initializeLine = function (originPoint, directionVector, lineColor) {
	this.origin = originPoint;
	this.orientation = directionVector;
}

// Represents a numerical interval with a lower and upper bound
let IntervalBounds = class IntervalBounds {
	constructor(lowerBound, upperBound) {
		this.lowerBound = lowerBound;
		this.upperBound = upperBound;
	}
}

// Merges two intervals to find the combined min and max (not intersection)
function getCombinedRange(boundsA, boundsB) {
	let combinedInterval = new IntervalBounds();
	combinedInterval.lowerBound = boundsA.lowerBound < boundsB.lowerBound ? boundsA.lowerBound : boundsB.lowerBound;
	combinedInterval.upperBound = boundsA.upperBound < boundsB.upperBound ? boundsB.upperBound : boundsA.upperBound;
	return combinedInterval;
}

// Ensures the lower bound is less than or equal to the upper bound
function sortInterval(unsortedBounds) {
	let orderedBounds = new IntervalBounds(unsortedBounds.lowerBound, unsortedBounds.upperBound);
	if (unsortedBounds.lowerBound > unsortedBounds.upperBound) {
		orderedBounds.lowerBound = unsortedBounds.upperBound;
		orderedBounds.upperBound = unsortedBounds.lowerBound;
	}
	return orderedBounds;
}

// Negates both coordinates of a point
function negatePointCoordinates(inputPoint) {
	inputPoint.valX = -inputPoint.valX;
	inputPoint.valY = -inputPoint.valY;
	return inputPoint;
}

// Adds the coordinates of two points
function addPoints(pointOne, pointTwo) {
	return new CoordPair(pointOne.valX + pointTwo.valX, pointOne.valY + pointTwo.valY);
}

// Projects a line segment onto a direction vector and returns the interval
function projectSegmentOntoDirection(inputSegment, projectionDirection) {
	let normalizedDirection = normalizePoint(projectionDirection);

	let projectedInterval = new IntervalBounds();
	projectedInterval.lowerBound = computeDotProduct(normalizedDirection, inputSegment.beginPoint);
	projectedInterval.upperBound = computeDotProduct(normalizedDirection, inputSegment.endPoint);

	projectedInterval = sortInterval(projectedInterval);
	return projectedInterval;
}

// Checks if two projected intervals overlap
function areIntervalsOverlapping(intervalA, intervalB) {
	return checkOverlap(intervalA.lowerBound, intervalA.upperBound, intervalB.lowerBound, intervalB.upperBound);
}

// Projects a point onto a direction vector
function projectPointToDirection(pointToProject, projectionDirection) {
	let dotProductDenom = computeDotProduct(projectionDirection, projectionDirection);
	if (0 < dotProductDenom) {
		let dotProductNum = computeDotProduct(pointToProject, projectionDirection);
		return scalePoint(projectionDirection, dotProductNum / dotProductDenom);
	}
	return projectionDirection;
}

// Represents a 2D coordinate point
let Coordinate = class Coordinate {
	constructor(valX, valY) {
		this.valX = valX;
		this.valY = valY;
	}
}

// Adds two coordinate points
function addCoordinates(coordA, coordB) {
	return new Coordinate(coordA.valX + coordB.valX, coordA.valY + coordB.valY);
}

// Subtracts one coordinate point from another
function subtractCoordinates(coordA, coordB) {
	return new Coordinate(coordA.valX - coordB.valX, coordA.valY - coordB.valY);
}

// Multiplies a coordinate point by a scalar
function scaleCoordinate(inputCoord, scalingFactor) {
	return new Coordinate(inputCoord.valX * scalingFactor, inputCoord.valY * scalingFactor);
}

// Projects a point onto a line segment
function projectPointOntoSegment(targetSegment, targetPoint) {
	let segmentVector = new CoordPair(targetSegment.endPoint.valX - targetSegment.beginPoint.valX, targetSegment.endPoint.valY - targetSegment.beginPoint.valY);
	let pointToStartVector = new CoordPair(targetPoint.valX - targetSegment.beginPoint.valX, targetPoint.valY - targetSegment.beginPoint.valY);
	let projectionRatio = computeDotProduct(pointToStartVector, segmentVector) / getSquaredMagnitude(segmentVector);
	let scaledVector = scalePoint(segmentVector, projectionRatio);
	let projectedCoord = new Coordinate(targetSegment.beginPoint.valX + scaledVector.valX, targetSegment.beginPoint.valY + scaledVector.valY);
	return projectedCoord;
}

// Reflects a point across a line segment
function reflectPointAcrossSegment(targetSegment, targetPoint) {
	let projectedCoord = projectPointOntoSegment(targetSegment, targetPoint);
	// Vector from the original point to its projection
	let offsetVector = subtractCoordinates(projectedCoord, targetPoint);
	// Double the offset to get the reflected point relative to the original
	let reflectedCoord = scaleCoordinate(offsetVector, 2);
	// Add the original point to get the final reflected position
	return addCoordinates(reflectedCoord, targetPoint);
}

// Finds the intersection point of two line segments
function findIntersectionPoint(segA, segB) {
	// Determine a reference line
	let segmentTwoDirection = new CoordPair(segB.endPoint.valX - segB.beginPoint.valX, segB.endPoint.valY - segB.beginPoint.valY);
	let offsetOne = new CoordPair(segA.beginPoint.valX - segB.beginPoint.valX, segA.beginPoint.valY - segB.beginPoint.valY);
	let offsetTwo = new CoordPair(segA.endPoint.valX - segB.beginPoint.valX, segA.endPoint.valY - segB.beginPoint.valY);
	let crossMagnitude1 = Math.abs(computeCrossProduct(segmentTwoDirection, offsetOne));
	let crossMagnitude2 = Math.abs(computeCrossProduct(segmentTwoDirection, offsetTwo));
	let interpolationFactor = crossMagnitude1 / (crossMagnitude1 + crossMagnitude2);
	let intersectX = segA.beginPoint.valX + (segA.endPoint.valX - segA.beginPoint.valX) * interpolationFactor;
	let intersectY = segA.beginPoint.valY + (segA.endPoint.valY - segA.beginPoint.valY) * interpolationFactor;
	return new Coordinate(intersectX, intersectY);
}

// Multiplies a point's coordinates by a scalar
function scalePoint(currentPoint, scalingFactor) {
	let scaledResult = new CoordPair();
	scaledResult.valX = currentPoint.valX * scalingFactor;
	scaledResult.valY = currentPoint.valY * scalingFactor;
	return scaledResult;
}

// Clamps a value within a specified range
function constrainValue(valueToClamp, lowerLimit, upperLimit) {
	if (valueToClamp < lowerLimit) {
		return lowerLimit;
	} else if (valueToClamp > upperLimit) {
		return upperLimit;
	} else {
		return valueToClamp;
	}
}

// Calculates the shortest distance from a point to an infinite line
function calculateLinePointDistance(geometricLine, targetPoint) {
	let lineVector = new CoordPair(geometricLine.endPoint.valX - geometricLine.beginPoint.valX, geometricLine.endPoint.valY - geometricLine.beginPoint.valY);
	let pointToLineStartVector = new CoordPair(targetPoint.valX - geometricLine.beginPoint.valX, targetPoint.valY - geometricLine.beginPoint.valY);
	return Math.abs(computeCrossProduct(lineVector, pointToLineStartVector) / calculatePointMagnitude(lineVector));
}

// Calculates the shortest distance from a point to a finite line segment
function calculateSegmentPointDistance(targetSegment, targetPoint) {
	// If the angle between (seg.p2 - seg.p1) and (point - seg.p1) is > 90 deg (or < -90 deg)
	// the closest point on the line is seg.p1
	if (computeDotProduct(subtractCoordinates(targetSegment.endPoint, targetSegment.beginPoint), subtractCoordinates(targetPoint, targetSegment.beginPoint)) < 0) {
		return calculatePointMagnitude(subtractCoordinates(targetPoint, targetSegment.beginPoint));
	}
	// If the angle between (seg.p1 - seg.p2) and (point - seg.p2) is > 90 deg (or < -90 deg)
	// the closest point on the line is seg.p2
	if (computeDotProduct(subtractCoordinates(targetSegment.beginPoint, targetSegment.endPoint), subtractCoordinates(targetPoint, targetSegment.endPoint)) < 0) {
		return calculatePointMagnitude(subtractCoordinates(targetPoint, targetSegment.endPoint));
	}
	// Otherwise, the closest point is on the segment between p1 and p2
	return calculateLinePointDistance(targetSegment, targetPoint);
}

// Calculates the shortest distance between two line segments
function calculateSegmentToSegmentDistance(segA, segB) {
	// If segments intersect, the distance is zero
	if (detectSegmentIntersection(segA, segB)) {
		return 0;
	}
	return Math.min(Math.min(calculateSegmentPointDistance(segA, segB.beginPoint), calculateSegmentPointDistance(segA, segB.endPoint)),
		Math.min(calculateSegmentPointDistance(segB, segA.beginPoint), calculateSegmentPointDistance(segB, segA.endPoint)));
}

// Determines the orientation of three points (counter-clockwise, clockwise, collinear)
function orientationTest(coord1, coord2, coord3) {
	let vecA = new CoordPair(coord2.valX - coord1.valX, coord2.valY - coord1.valY);
	let vecB = new CoordPair(coord3.valX - coord1.valX, coord3.valY - coord1.valY);
	let orientationCross = computeCrossProduct(vecA, vecB);

	const SMALL_TOLERANCE_VALUE = 1e-9; // Using a common small float for comparison

	if (orientationCross > SMALL_TOLERANCE_VALUE) {
		return ROTATION_COUNTERCLOCKWISE;
	}
	if (orientationCross < -SMALL_TOLERANCE_VALUE) {
		return ROTATION_CLOCKWISE_DIR;
	}
	if (computeDotProduct(vecA, vecB) < -SMALL_TOLERANCE_VALUE) {
		return LINE_POSITION_REAR; // collinear, C is behind A
	}
	if (calculatePointMagnitude(vecA) < calculatePointMagnitude(vecB)) {
		return LINE_POSITION_FRONT; // collinear, C is in front of B
	}
	return LINE_POSITION_ON; // collinear, C is on segment AB
}

// Computes the convex hull of a set of points using the Monotone Chain (Andrew's) algorithm
function computeConvexHull(inputPointsList) {
	if (inputPointsList.length < 3) {
		return inputPointsList;
	}

	// Sort points primarily by X, then by Y for ties
	inputPointsList.sort((p1, p2) => (p1.valX > p2.valX) ? 1 : (p1.valX === p2.valX) ? ((p1.valY > p2.valY) ? 1 : -1) : -1);

	let upperHull = [];
	upperHull.push(inputPointsList[0]);
	upperHull.push(inputPointsList[1]);

	let lowerHull = [];
	lowerHull.push(inputPointsList[inputPointsList.length - 1]);
	lowerHull.push(inputPointsList[inputPointsList.length - 2]);

	// Build the upper hull
	for (let idxA = 2; idxA < inputPointsList.length; ++idxA) {
		// Remove points that would make a non-counter-clockwise turn
		for (let idxB = upperHull.length; idxB >= 2 && orientationTest(upperHull[idxB - 2], upperHull[idxB - 1], inputPointsList[idxA]) === ROTATION_COUNTERCLOCKWISE; --idxB) {
			upperHull.pop();
		}
		upperHull.push(inputPointsList[idxA]);
	}
	// Build the lower hull
	for (let idxA = inputPointsList.length - 3; idxA >= 0; --idxA) {
		// Remove points that would make a non-counter-clockwise turn
		for (let idxB = lowerHull.length; idxB >= 2 && orientationTest(lowerHull[idxB - 2], lowerHull[idxB - 1], inputPointsList[idxA]) === ROTATION_COUNTERCLOCKWISE; --idxB) {
			lowerHull.pop();
		}
		lowerHull.push(inputPointsList[idxA]);
	}
	// Combine hulls to form the full convex hull in clockwise order
	lowerHull.reverse();
	for (let idxA = upperHull.length - 2; idxA >= 1; --idxA) {
		lowerHull.push(upperHull[idxA]);
	}
	return lowerHull;
}

// Computes the diameter of a convex polygon (farthest pair of points)
function calculateConvexDiameter(polygonVertices) {
	// Find initial antipodal pair (min/max Y-coordinates)
	let startYIndex = 0;
	let endYIndex = 0;
	for (let idx = 1; idx < polygonVertices.length; idx++) {
		if (polygonVertices[idx].valY > polygonVertices[startYIndex].valY) startYIndex = idx;
		if (polygonVertices[idx].valY < polygonVertices[endYIndex].valY) endYIndex = idx;
	}
	let maxDistanceSquared = getSquaredMagnitude(subtractPoints(polygonVertices[startYIndex], polygonVertices[endYIndex]));
	let maxPointIdxA = startYIndex, currentIdxA = endYIndex, maxPointIdxB = endYIndex, currentIdxB = endYIndex;

	// Rotating calipers method
	do {
		// Advance the caliper that makes the smaller angle
		if (computeCrossProduct(subtractPoints(polygonVertices[(currentIdxA + 1) % polygonVertices.length], polygonVertices[currentIdxA]), subtractPoints(polygonVertices[(currentIdxB + 1) % polygonVertices.length], polygonVertices[currentIdxB])) >= 0) {
			currentIdxB = (currentIdxB + 1) % polygonVertices.length;
		} else {
			currentIdxA = (currentIdxA + 1) % polygonVertices.length;
		}
		// Update max distance if a larger one is found
		if (getSquaredMagnitude(subtractPoints(polygonVertices[currentIdxA], polygonVertices[currentIdxB])) > maxDistanceSquared) {
			maxDistanceSquared = getSquaredMagnitude(subtractPoints(polygonVertices[currentIdxA], polygonVertices[currentIdxB]));
			maxPointIdxA = currentIdxA;
			maxPointIdxB = currentIdxB;
		}
	} while (currentIdxA !== startYIndex || currentIdxB !== endYIndex); // Continue until calipers complete a full rotation
	return maxDistanceSquared;
}