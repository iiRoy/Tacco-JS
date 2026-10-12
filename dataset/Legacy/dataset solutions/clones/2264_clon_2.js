"use strict";

// This module provides utilities to parse input data from stdin.
var DATA_PARSER = (function() {
  function createParser(sourceText) {
    return new InputProcessor(sourceText);
  }

  function InputProcessor(rawInput) {
    this._sourceLines = rawInput.trim().split("\n");
    this._currentLineIndex = 0;
  }

  InputProcessor.prototype.extractNextValue = function(asString) {
    let lineSegments = this._sourceLines;
    let currentIdx = this._currentLineIndex;
    let resultValue;

    if (typeof lineSegments[currentIdx] === "string") {
      lineSegments[currentIdx] = lineSegments[currentIdx].split(" ").reverse();
    }

    resultValue = lineSegments[currentIdx].pop();

    if (!lineSegments[currentIdx].length) {
      this._currentLineIndex++;
    }

    return asString ? resultValue : +resultValue;
  };

  InputProcessor.prototype.extractLineValues = function(asStrings) {
    let lineData = this._sourceLines[this._currentLineIndex++].split(" ");
    return asStrings ? lineData : lineData.map(val => +val);
  };

  InputProcessor.prototype.extractMatrix = function(numRows, asStrings) {
    let matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows)
                                      .map(rowStr => rowStr.split(" "));
    return asStrings ? matrixRows : matrixRows.map(row => row.map(item => +item));
  };

  InputProcessor.prototype.extractRawLines = function(numLines, asStrings) {
    let lines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
    return asStrings ? lines : lines.map(line => +line);
  };

  return createParser;
})();

// Initialize input reader with data from standard input.
var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Helper to create multi-dimensional arrays (not used in this specific problem, but part of original)
function createMultiDimArray(initialValue) {
  var args = arguments,
    argCount = args.length,
    arrayCreationString = "Array(args[" + --argCount + "]).fill(0).map(element => { return " + initialValue + "; })";
  while (--argCount) {
    arrayCreationString = "Array(args[" + argCount + "]).fill(0).map(element => " + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

// Global variables for circle properties and problem state
var currentRadius, centerX, centerY, pointCoordinates, pointCount;
var epsilonFactor = 1 - 1e-9; // Small epsilon for floating point comparisons
var minEnclosingRadius = 1e9; // Initialize with a very large value

// Output the result of the main calculation function.
console.log(calculateMinCircle());

/**
 * Main function to determine the minimum enclosing circle radius.
 * @returns {number} The minimum radius found.
 */
function calculateMinCircle() {
  pointCount = inputReader.extractNextValue();
  pointCoordinates = inputReader.extractMatrix(pointCount);

  // Special case for two points: the circle is centered at their midpoint.
  if (pointCount === 2) {
    return handleTwoPoints(pointCoordinates);
  }

  // Iterate through all combinations of three points to find potential circumcircles.
  for (var i = 0; i < pointCount; i++) {
    for (var j = i + 1; j < pointCount; j++) {
      for (var k = j + 1; k < pointCount; k++) {
        // If a valid circumcircle is found and it encloses all points, update minEnclosingRadius.
        if (findCircumcircle(pointCoordinates[i][0], pointCoordinates[i][1],
                             pointCoordinates[j][0], pointCoordinates[j][1],
                             pointCoordinates[k][0], pointCoordinates[k][1])) {
          minEnclosingRadius = currentRadius;
        }
      }
    }
  }
  return minEnclosingRadius;
}

/**
 * Calculates the circumcircle for three given points.
 * Updates global currentRadius, centerX, centerY.
 * @param {number} p1x - X-coordinate of point 1.
 * @param {number} p1y - Y-coordinate of point 1.
 * @param {number} p2x - X-coordinate of point 2.
 * @param {number} p2y - Y-coordinate of point 2.
 * @param {number} p3x - X-coordinate of point 3.
 * @param {number} p3y - Y-coordinate of point 3.
 * @returns {boolean} True if the calculated circle encloses all points, false otherwise.
 */
function findCircumcircle(p1x, p1y, p2x, p2y, p3x, p3y) {
  var diffX12 = p1x - p2x,
    diffY12 = p1y - p2y,
    diffX23 = p2x - p3x,
    diffY23 = p2y - p3y;

  var determinant = 2 * (diffX12 * diffY23 - diffY12 * diffX23);

  if (determinant === 0) { // Points are collinear
    var diffX31 = p3x - p1x,
      diffY31 = p3y - p1y;
    var distSq12 = diffX12 * diffX12 + diffY12 * diffY12,
      distSq23 = diffX23 * diffX23 + diffY23 * diffY23,
      distSq31 = diffX31 * diffX31 + diffY31 * diffY31;

    var maxDistSq = Math.max(distSq12, distSq23, distSq31);
    currentRadius = Math.sqrt(maxDistSq) / 2;

    if (distSq12 === maxDistSq) {
      centerX = (p1x + p2x) / 2;
      centerY = (p1y + p2y) / 2;
    } else if (distSq23 === maxDistSq) {
      centerX = (p3x + p2x) / 2;
      centerY = (p3y + p2y) / 2;
    } else {
      centerX = (p1x + p3x) / 2;
      centerY = (p1y + p3y) / 2;
    }
    return checkAllPoints();
  }

  var val1Sq = p1x * p1x + p1y * p1y,
    val2Sq = p2x * p2x + p2y * p2y,
    val3Sq = p3x * p3x + p3y * p3y;

  determinant = 1 / determinant;
  centerX = determinant * (diffY23 * (val1Sq - val2Sq) - diffY12 * (val2Sq - val3Sq));
  centerY = determinant * (diffX12 * (val2Sq - val3Sq) - diffX23 * (val1Sq - val2Sq));

  var distFromP1X = p1x - centerX,
    distFromP1Y = p1y - centerY;
  currentRadius = Math.sqrt(distFromP1X * distFromP1X + distFromP1Y * distFromP1Y);

  return checkAllPoints();
}

/**
 * Checks if the currently calculated circle (centerX, centerY, currentRadius)
 * encloses all points in the pointCoordinates array.
 * @returns {boolean} True if all points are enclosed, false otherwise.
 */
function checkAllPoints() {
  // If the current radius is already larger than the best found, no need to check further.
  if (minEnclosingRadius < currentRadius) {
    return; // Implicitly returns undefined, which is falsy.
  }

  for (var idx = 0; idx < pointCount; idx++) {
    var deltaX = pointCoordinates[idx][0] - centerX,
      deltaY = pointCoordinates[idx][1] - centerY;
    var distanceToPoint = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // If any point is outside the circle (considering epsilon), this candidate circle is invalid.
    if (currentRadius < distanceToPoint * epsilonFactor) {
      return; // Returns undefined (falsy)
    }
  }
  return 1; // Returns 1 (truthy)
}

/**
 * Handles the special case of finding the minimum enclosing circle for two points.
 * The circle is centered at their midpoint, with radius half the distance between them.
 * @param {Array<Array<number>>} points - An array containing two [x, y] coordinate pairs.
 * @returns {number} The radius of the minimum enclosing circle.
 */
function handleTwoPoints(points) {
  var deltaX = points[0][0] - points[1][0],
    deltaY = points[0][1] - points[1][1];
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 2;
}
