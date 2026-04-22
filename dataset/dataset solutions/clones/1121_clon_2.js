var SpatialCoord = class SpatialCoord {
    constructor(coordX, coordY) {
        this.coordX = coordX;
        this.coordY = coordY;
    }
}

SpatialCoord.prototype.resetCoords = function (coordX, coordY) {
    this.coordX = coordX;
    this.coordY = coordY;
}

// Rotates a spatial coordinate by 90 degrees counter-clockwise.
function turnCoordQuarter(sourcePoint) {
    var rotatedCoord = new SpatialCoord();
    rotatedCoord.coordX = -sourcePoint.coordY;
    rotatedCoord.coordY = sourcePoint.coordX;
    return rotatedCoord;
}

// Converts an angle from degrees to radians.
function convertAngleToRad(inputDegree) {
    var mathConstantPi = 3.14159265358979323846;
    return inputDegree * mathConstantPi / 180.0;
}

// Applies a rotation to a spatial coordinate around the origin.
function applyRotation(initialCoord, rotationAngle) {
    var radMeasure = convertAngleToRad(rotationAngle);

    var sineVal = Math.sin(radMeasure);
    var cosineVal = Math.cos(radMeasure);

    var transformedCoord = new SpatialCoord();
    transformedCoord.coordX = initialCoord.coordX * cosineVal - initialCoord.coordY * sineVal;
    transformedCoord.coordY = initialCoord.coordX * sineVal + initialCoord.coordY * cosineVal;

    return transformedCoord;
}

function compareSpatialCoords(firstCoord, secondCoord) {
    return compareNumbersWithTolerance(firstCoord.coordX - secondCoord.coordX, 0) && compareNumbersWithTolerance(firstCoord.coordY - secondCoord.coordY, 0);
}

// Normalizes a spatial coordinate to a unit length.
// Returns the original if its length is zero.
function normalizeCoord(originalCoord) {
    var magnitude = calcCoordMagnitude(originalCoord);
    if (magnitude > 0) {
        return divideCoordByScalar(originalCoord, magnitude);
    }
    return originalCoord;
}

// Calculates the Euclidean magnitude (length) of a 2D spatial coordinate.
function calcCoordMagnitude(inputCoord) {
    return Math.sqrt((inputCoord.coordX * inputCoord.coordX) + (inputCoord.coordY * inputCoord.coordY));
}

function divideCoordByScalar(targetCoord, divisorValue) {
    targetCoord.coordX = targetCoord.coordX / divisorValue;
    targetCoord.coordY = targetCoord.coordY / divisorValue;
    return targetCoord;
}

function compareNumbersWithTolerance(valA, valB) {
    var toleranceLimit = 1 / 8192;
    return Math.abs(valA - valB) < toleranceLimit;
}

function checkParallelAlignment(coordOne, coordTwo) {
    var normalCoord = turnCoordQuarter(coordOne);
    return compareNumbersWithTolerance(0, calculateDotProduct(normalCoord, coordTwo));
}

function checkOrthogonalAlignment(coordOne, coordTwo) {
    return compareNumbersWithTolerance(0, calculateDotProduct(coordOne, coordTwo));
}

function calculateDifferenceCoord(minuendCoord, subtrahendCoord) {
    var differenceCoord = new SpatialCoord();
    differenceCoord.coordX = minuendCoord.coordX - subtrahendCoord.coordX;
    differenceCoord.coordY = minuendCoord.coordY - subtrahendCoord.coordY;
    return differenceCoord;
}

function calculateDotProduct(operandA, operandB) {
    var scalarResult = operandA.coordX * operandB.coordX + operandA.coordY * operandB.coordY;
    //console.log(scalarResult); // Original comment was here
    return operandA.coordX * operandB.coordX + operandA.coordY * operandB.coordY;
}

// Computes the 2D cross product (scalar result) for two spatial coordinates.
function calcZCrossProduct(firstOperand, secondOperand) {
    return firstOperand.coordX * secondOperand.coordY - firstOperand.coordY * secondOperand.coordX;
}

// Class for a 2D line segment.
var LinePath = class LinePath {
    constructor(startNode, endNode) {
        this.startNode = startNode;
        this.endNode = endNode;
    }
}

LinePath.prototype.setEndpoints = function (startNode, endNode) {
    this.startNode = startNode;
    this.endNode = endNode;
}

function checkSideOfLine(referenceLine, targetSegment) {
    var offsetOne = new SpatialCoord();
    offsetOne = calculateDifferenceCoord(targetSegment.startNode, referenceLine.originPoint);

    var offsetTwo = new SpatialCoord();
    offsetTwo = calculateDifferenceCoord(targetSegment.endNode, referenceLine.originPoint);

    var normalVector = new SpatialCoord();
    normalVector = turnCoordQuarter(referenceLine.directionVector);

    // Checks if both segment points are on the same side of the line
    return calculateDotProduct(normalVector, offsetOne) * calculateDotProduct(normalVector, offsetTwo) > 0;
}

function doRangesIntersect(rangeAMin, rangeAMax, rangeBMin, rangeBMax) {
    return rangeBMin <= rangeAMax && rangeAMin <= rangeBMax;
}

function segmentsIntersect(pathOne, pathTwo) {
    // Vectors representing the directions of the line segments
    var lineAxisA = new VectorLine();
    var lineAxisB = new VectorLine();

    // Check if pathTwo is entirely on one side of the line defined by pathOne
    lineAxisA.originPoint = pathOne.startNode;
    lineAxisA.directionVector = calculateDifferenceCoord(pathOne.endNode, pathOne.startNode);

    if (checkSideOfLine(lineAxisA, pathTwo)) {
        return false;
    }

    // Similarly, check if pathOne is entirely on one side of the line defined by pathTwo
    lineAxisB.originPoint = pathTwo.startNode;
    lineAxisB.directionVector = calculateDifferenceCoord(pathTwo.endNode, pathTwo.startNode);

    if (checkSideOfLine(lineAxisB, pathOne)) {
        return false;
    }

    // If segments are parallel
    if (checkParallelAlignment(lineAxisA.directionVector, lineAxisB.directionVector)) {
        var projRangeA = getProjectedInterval(pathOne, lineAxisA.directionVector);
        var projRangeB = getProjectedInterval(pathTwo, lineAxisA.directionVector);

        // Check for overlap of projected intervals
        return checkIntervalIntersection(projRangeA, projRangeB);
    }
    else {
        return true; // Non-parallel lines that pass the one-side check must intersect
    }
}

// A representation of a geometric line.
function VectorLine() {
    this.originPoint; // The starting coordinate
    this.directionVector; // The directional vector
}

VectorLine.prototype.configureLine = function (originPoint, directionVector, colorValue) {
    this.originPoint = originPoint;
    this.directionVector = directionVector;
}

// Represents a numerical interval.
var NumericalInterval = class NumericalInterval {
    constructor(lowerBound, upperBound) {
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
    }
}

function mergeIntervals(intervalOne, intervalTwo) {
    var mergedInterval = new NumericalInterval();
    mergedInterval.lowerBound = intervalOne.lowerBound < intervalTwo.lowerBound ? intervalOne.lowerBound : intervalTwo.lowerBound;
    mergedInterval.upperBound = intervalOne.upperBound < intervalTwo.upperBound ? intervalTwo.upperBound : intervalOne.upperBound;
    return mergedInterval;
}

function orderIntervalBounds(inputInterval) {
    var orderedInterval = new NumericalInterval(inputInterval.lowerBound, inputInterval.upperBound);
    if (inputInterval.lowerBound > inputInterval.upperBound) {
        orderedInterval.lowerBound = inputInterval.upperBound;
        orderedInterval.upperBound = inputInterval.lowerBound;
    }
    return orderedInterval;
}

function negateSpatialCoord(inputCoord) {
    inputCoord.coordX = -inputCoord.coordX;
    inputCoord.coordY = -inputCoord.coordY;
    return inputCoord;
}

function addSpatialCoords(addendOne, addendTwo) {
    return new SpatialCoord(addendOne.coordX + addendTwo.coordX, addendOne.coordY + addendTwo.coordY);
}

// Projects a line segment onto a given coordinate axis.
function getProjectedInterval(linePath, projectionAxis) {
    var unitAxis = normalizeCoord(projectionAxis);

    var projectedInterval = new NumericalInterval();
    projectedInterval.lowerBound = calculateDotProduct(unitAxis, linePath.startNode);
    projectedInterval.upperBound = calculateDotProduct(unitAxis, linePath.endNode);

    projectedInterval = orderIntervalBounds(projectedInterval);
    return projectedInterval;
}

function checkIntervalIntersection(intervalA, intervalB) {
    return doRangesIntersect(intervalA.lowerBound, intervalA.upperBound, intervalB.lowerBound, intervalB.upperBound);
}

function calcProjectionCoord(coordToProject, projectionDirection) {
    var denominator = calculateDotProduct(projectionDirection, projectionDirection);
    if (0 < denominator) {
        var dotProd = calculateDotProduct(coordToProject, projectionDirection);
        return multiplySpatialCoordByScalar(projectionDirection, dotProd / denominator);
    }
    return projectionDirection;
}

function calcSquaredLength(inputCoord) {
    return inputCoord.coordX * inputCoord.coordX + inputCoord.coordY * inputCoord.coordY;
}

function getCoordMagnitude(inputCoord) {
    return Math.sqrt(calcSquaredLength(inputCoord));
}

// A class representing a 2D location or point.
var Location2D = class Location2D {
    constructor(posHoriz, posVert) {
        this.posHoriz = posHoriz;
        this.posVert = posVert;
    }
}

function combineLocations(locA, locB) {
    return new Location2D(locA.posHoriz + locB.posHoriz, locA.posVert + locB.posVert);
}

function findLocationDifference(locA, locB) {
    return new Location2D(locA.posHoriz - locB.posHoriz, locA.posVert - locB.posVert);
}

function multiplyLocationByScalar(targetLoc, scaleFactor) {
    return new Location2D(targetLoc.posHoriz * scaleFactor, targetLoc.posVert * scaleFactor);
}

// Projects a target point onto the infinite line defined by a line segment.
function projectPointOntoSegment(linePath, targetLoc) {
    var segmentVector = new SpatialCoord(linePath.endNode.posHoriz - linePath.startNode.posHoriz, linePath.endNode.posVert - linePath.startNode.posVert);
    var pointToStartVector = new SpatialCoord(targetLoc.posHoriz - linePath.startNode.posHoriz, targetLoc.posVert - linePath.startNode.posVert);
    var projectionRatio = calculateDotProduct(pointToStartVector, segmentVector) / calcSquaredLength(segmentVector);
    var scaledProjectionVector = multiplySpatialCoordByScalar(segmentVector, projectionRatio);
    var projectedLocation = new Location2D(linePath.startNode.posHoriz + scaledProjectionVector.coordX, linePath.startNode.posVert + scaledProjectionVector.coordY);
    return projectedLocation;
}

function reflectPointAcrossSegment(reflectionAxisPath, originalLocation) {
    var projectionResult = projectPointOntoSegment(reflectionAxisPath, originalLocation);
    // Vector from original point to its projection
    var offsetVector = findLocationDifference(projectionResult, originalLocation);
    // Double the offset to get reflected point
    var reflectedLocation = multiplyLocationByScalar(offsetVector, 2);
    // Add back the original point to get the final reflected position
    return combineLocations(reflectedLocation, originalLocation);
}

// Determines the intersection point of two line segments.
function calculateCollisionLocation(pathOne, pathTwo) {
    // Establish a reference vector from the second segment
    var pathTwoDir = new SpatialCoord(pathTwo.endNode.posHoriz - pathTwo.startNode.posHoriz, pathTwo.endNode.posVert - pathTwo.startNode.posVert);
    var offsetOneFromPathTwo = new SpatialCoord(pathOne.startNode.posHoriz - pathTwo.startNode.posHoriz, pathOne.startNode.posVert - pathTwo.startNode.posVert);
    var offsetTwoFromPathTwo = new SpatialCoord(pathOne.endNode.posHoriz - pathTwo.startNode.posHoriz, pathOne.endNode.posVert - pathTwo.startNode.posVert);
    var crossOneAbs = Math.abs(calcZCrossProduct(pathTwoDir, offsetOneFromPathTwo));
    var crossTwoAbs = Math.abs(calcZCrossProduct(pathTwoDir, offsetTwoFromPathTwo));
    var intersectionParam = crossOneAbs / (crossOneAbs + crossTwoAbs);
    var intersectX = pathOne.startNode.posHoriz + (pathOne.endNode.posHoriz - pathOne.startNode.posHoriz) * intersectionParam;
    var intersectY = pathOne.startNode.posVert + (pathOne.endNode.posVert - pathOne.startNode.posVert) * intersectionParam;
    return new Location2D(intersectX, intersectY);
}

function multiplySpatialCoordByScalar(sourceCoord, scaleVal) {
    var scaledCoord = new SpatialCoord();
    scaledCoord.coordX = sourceCoord.coordX * scaleVal;
    scaledCoord.coordY = sourceCoord.coordY * scaleVal;
    return scaledCoord;
}

function limitToRange(inputValue, minimumBound, maximumBound) {
    if (inputValue < minimumBound) {
        return minimumBound;
    } else if (inputValue > maximumBound) {
        return maximumBound;
    } else {
        return inputValue;
    }
}

// Computes the perpendicular distance from a point to an infinite line.
function measureLinePointSeparation(referenceLine, targetLocation) {
    var lineDirection = new SpatialCoord(referenceLine.endNode.posHoriz - referenceLine.startNode.posHoriz, referenceLine.endNode.posVert - referenceLine.startNode.posVert);
    var pointOffset = new SpatialCoord(targetLocation.posHoriz - referenceLine.startNode.posHoriz, targetLocation.posVert - referenceLine.startNode.posVert);
    return Math.abs(calcZCrossProduct(lineDirection, pointOffset) / getCoordMagnitude(lineDirection));
}

// Calculates the shortest distance from a point to a line segment.
function measureSegmentPointSeparation(referenceSegment, targetLocation) {
    // If the projection falls outside the segment's start point
    if (calculateDotProduct(findLocationDifference(referenceSegment.endNode, referenceSegment.startNode), findLocationDifference(targetLocation, referenceSegment.startNode)) < 0) {
        return getCoordMagnitude(findLocationDifference(targetLocation, referenceSegment.startNode));
    }
    // If the projection falls outside the segment's end point
    if (calculateDotProduct(findLocationDifference(referenceSegment.startNode, referenceSegment.endNode), findLocationDifference(targetLocation, referenceSegment.endNode)) < 0) {
        return getCoordMagnitude(findLocationDifference(targetLocation, referenceSegment.endNode));
    }
    // Otherwise, it's the perpendicular distance to the line containing the segment
    return measureLinePointSeparation(referenceSegment, targetLocation);
}

// Computes the shortest distance between two line segments.
function measurePathSeparation(pathA, pathB) {
    // If segments intersect, distance is zero
    if (segmentsIntersect(pathA, pathB)) {
        return 0;
    }
    // Otherwise, find the minimum distance from endpoints of one segment to the other segment
    return Math.min(Math.min(measureSegmentPointSeparation(pathA, pathB.startNode), measureSegmentPointSeparation(pathA, pathB.endNode)),
        Math.min(measureSegmentPointSeparation(pathB, pathA.startNode), measureSegmentPointSeparation(pathB, pathA.endNode)));
}

var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// var rawData = require('fs').readFileSync('input.txt', 'utf8'); // Alternative input source
var inputLines = (rawData.trim()).split("\n");
var numPoints = inputLines[0];
var locationList = [];
// Remove the first line (number of points)
inputLines.shift();

for (var idx = 0; idx < numPoints; ++idx) {
    var coordinateValues = inputLines[idx].split(" ").map(Number);
    locationList[idx] = new Location2D(coordinateValues[0], coordinateValues[1]);
}

var areaAccumulator = calcZCrossProduct(locationList[numPoints - 1], locationList[0]);
for (var idx = 0; idx < numPoints - 1; ++idx) {
    areaAccumulator += calcZCrossProduct(locationList[idx], locationList[idx + 1]);
}
areaAccumulator = Math.abs(areaAccumulator) / 2;
console.log(areaAccumulator.toFixed(1));