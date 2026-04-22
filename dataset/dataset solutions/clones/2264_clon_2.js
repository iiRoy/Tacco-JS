"use strict";
// This module provides a flexible utility for parsing structured input data.
var DATA_PARSER = ( function ( ) {
  // Inner factory function to instantiate an InputReader object.
  function createParser( inputString ) {
    return new InputReader( inputString );
  }

  // The main constructor for the InputReader class.
  // It takes a raw string and prepares it for sequential line-by-line parsing.
  function InputReader( rawData ) {
    this._sourceLines = rawData.trim( ).split( "\n" ); // Stores all input lines.
    this._currentLineIndex = 0;                        // Tracks the current line being processed.
  }

  // Prototype method to extract a single numerical or string value from the current line.
  // Values are typically read from right-to-left within a line after splitting by space.
  InputReader.prototype.readNextValue = function ( returnAsString ) {
    var lineData = this._sourceLines,
        currIdx = this._currentLineIndex,
        extractedVal;

    // Lazily split the current line into parts if it hasn't been already.
    if ( typeof lineData[currIdx] === "string" ) {
      lineData[currIdx] = lineData[currIdx].split( " " ).reverse( );
    }

    // Retrieve the last element (which was originally the first) and remove it.
    extractedVal = lineData[currIdx].pop( );

    // If the current line is now empty after popping, advance to the next line.
    if ( !lineData[currIdx].length ) {
      this._currentLineIndex++;
    }

    // Return the value either as its original string form or as a parsed number.
    return returnAsString ? extractedVal : +extractedVal;
  };

  // Prototype method to read all space-separated values from the current line.
  // Advances the line index after reading.
  InputReader.prototype.readLineValues = function ( retrieveStrings ) {
    var lineParts = this._sourceLines[this._currentLineIndex++].split( " " ); // Split current line by space.
    // Return all parts as strings or map them to numbers.
    return retrieveStrings ? lineParts : lineParts.map( currentItem => +currentItem );
  };

  // Prototype method to read a block of 'numberOfRows' lines and parse them into a matrix.
  // Each line is split by space, and values can be returned as strings or numbers.
  InputReader.prototype.readMatrix = function ( numberOfRows, stringsOnly ) {
    var matrixData = this._sourceLines.slice( this._currentLineIndex, this._currentLineIndex += numberOfRows ).map( singleRowStr => singleRowStr.split( " " ) );
    // Map each row's elements to numbers if 'stringsOnly' is false.
    return stringsOnly ? matrixData : matrixData.map( rowElements => rowElements.map( cellElement => +cellElement ) );
  };

  // Prototype method to read a specified 'quantity' of lines as a simple array.
  // Each line is treated as a single value.
  InputReader.prototype.readRows = function ( quantity, asText ) {
    var rowStrings = this._sourceLines.slice( this._currentLineIndex, this._currentLineIndex += quantity );
    // Return lines as raw strings or parsed numbers.
    return asText ? rowStrings : rowStrings.map( valueStr => +valueStr );
  };

  return createParser; // Return the factory function.
} ) ( );

// Initialize the input reader by reading the entire content of standard input.
var inputReaderInstance = DATA_PARSER( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

// A utility function to dynamically create multi-dimensional arrays with an initial value.
function multiDimArray( initialValue ) {
  var argsList = arguments,
      argsLength = argsList.length,
      arrayCreationString = "Array(argsList[" + --argsLength + "]).fill(0).map(x=>{return " + initialValue + ";})";

  // Build the array creation string for nested arrays.
  while ( --argsLength ) {
    arrayCreationString = "Array(argsList[" + argsLength + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }
  return eval( arrayCreationString ); // Execute the generated string to create the array.
}

// Global variables to store the results of circle calculations and input data.
var minCircleRadius,   // Stores the radius of the currently evaluated minimum enclosing circle.
    centerX,           // X-coordinate of the center of the current circle.
    centerY,           // Y-coordinate of the center of the current circle.
    coordinatesData,   // Array containing all input points, e.g., [[x1, y1], [x2, y2], ...].
    totalPoints;       // The total number of points provided in the input.

// A small factor used for floating-point comparisons to account for precision errors.
var comparisonEpsilon = 1 - 0.000000001; // Equivalent to 1 - 1e-9.

// Stores the smallest radius found across all valid candidate circles.
var overallMinRadius = 1000000000; // Initialized to a very large number (1e9).

// Call the main processing function and log its return value to the console.
console.log( performMainCalculation( ) );

/**
 * Orchestrates the main logic of the program to find the minimum enclosing circle.
 * It reads point data, handles special cases for fewer points, and iterates through
 * combinations of three points to find the smallest circle.
 * @returns {number} The radius of the minimum enclosing circle that encloses all points.
 */
function performMainCalculation( ) {
  totalPoints = inputReaderInstance.readNextValue( ); // Read the number of points.
  coordinatesData = inputReaderInstance.readMatrix( totalPoints ); // Read all point coordinates.

  // Special case: If only two points, the circle is defined by them as a diameter.
  if ( totalPoints === 2 ) {
    return handleTwoPoints( coordinatesData );
  }

  // Iterate through all unique combinations of three points (i, j, k).
  // These three points potentially define the minimum enclosing circle.
  for ( var idxP1 = 0; idxP1 < totalPoints; idxP1++ ) {
    for ( var idxP2 = idxP1 + 1; idxP2 < totalPoints; idxP2++ ) {
      for ( var idxP3 = idxP2 + 1; idxP3 < totalPoints; idxP3++ ) {
        // Attempt to calculate the circumcircle for the current triplet of points.
        if ( calculateCircumcircle(
             coordinatesData[idxP1][0], coordinatesData[idxP1][1], // Point 1 (x, y)
             coordinatesData[idxP2][0], coordinatesData[idxP2][1], // Point 2 (x, y)
             coordinatesData[idxP3][0], coordinatesData[idxP3][1]  // Point 3 (x, y)
        ) ) {
          // If a valid circle is found (i.e., it encloses all points), update the overall minimum.
          overallMinRadius = minCircleRadius;
        }
      }
    }
  }
  return overallMinRadius; // Return the smallest radius found.
}

/**
 * Calculates the circumcenter and circumradius for three given points.
 * It handles both collinear and non-collinear cases.
 * Updates the global variables `centerX`, `centerY`, and `minCircleRadius`.
 * After calculation, it calls `verifyAllPointsContainment` to ensure all points are within this circle.
 * @param {number} point1X - X-coordinate of the first point.
 * @param {number} point1Y - Y-coordinate of the first point.
 * @param {number} point2X - X-coordinate of the second point.
 * @param {number} point2Y - Y-coordinate of the second point.
 * @param {number} point3X - X-coordinate of the third point.
 * @param {number} point3Y - Y-coordinate of the third point.
 * @returns {number | undefined} Returns 1 if the calculated circle encloses all points, otherwise undefined.
 */
function calculateCircumcircle( point1X, point1Y, point2X, point2Y, point3X, point3Y ) {
  // Calculate differences between point coordinates.
  var diffX12 = point1X - point2X,
      diffY12 = point1Y - point2Y,
      diffX23 = point2X - point3X,
      diffY23 = point2Y - point3Y;

  // Calculate the determinant, which helps determine if points are collinear.
  var determinantVal = 2 * ( diffX12 * diffY23 - diffY12 * diffX23 );

  // Check if the points are collinear (determinant is zero).
  if ( determinantVal === 0 ) {
    // If collinear, the minimum enclosing circle's diameter is the longest distance
    // between any two of the three points.
    var deltaX13 = point3X - point1X,
        deltaY13 = point3Y - point1Y;

    var distSq12 = diffX12 * diffX12 + diffY12 * diffY12, // Squared distance between P1 and P2.
        distSq23 = diffX23 * diffX23 + diffY23 * diffY23, // Squared distance between P2 and P3.
        distSq13 = deltaX13 * deltaX13 + deltaY13 * deltaY13; // Squared distance between P1 and P3.

    var maxDistSq = Math.max( distSq12, distSq23, distSq13 ); // Find the maximum squared distance.
    minCircleRadius = Math.sqrt( maxDistSq ) / 2;           // Radius is half of the square root of max distance.

    // Determine the center of this circle (midpoint of the longest segment).
    if ( distSq12 === maxDistSq ) {
      centerX = ( point1X + point2X ) / 2;
      centerY = ( point1Y + point2Y ) / 2;
    } else if ( distSq23 === maxDistSq ) {
      centerX = ( point3X + point2X ) / 2;
      centerY = ( point3Y + point2Y ) / 2;
    } else { // distSq13 === maxDistSq
      centerX = ( point1X + point3X ) / 2;
      centerY = ( point1Y + point3Y ) / 2;
    }
    return verifyAllPointsContainment( ); // Check if this circle encloses all points.
  }

  // If points are not collinear, calculate the circumcenter and circumradius using formulas.
  var magSq1 = point1X * point1X + point1Y * point1Y, // Squared magnitude (distance from origin) for P1.
      magSq2 = point2X * point2X + point2Y * point2Y, // Squared magnitude for P2.
      magSq3 = point3X * point3X + point3Y * point3Y; // Squared magnitude for P3.

  determinantVal = 1 / determinantVal; // Use the inverse of the determinant for efficiency.

  // Calculate the circumcenter coordinates.
  centerX = determinantVal * ( diffY23 * ( magSq1 - magSq2 ) - diffY12 * ( magSq2 - magSq3 ) );
  centerY = determinantVal * ( diffX12 * ( magSq2 - magSq3 ) - diffX23 * ( magSq1 - magSq2 ) );

  // Calculate the circumradius using the distance from the center to any of the three points.
  var deltaX = point1X - centerX,
      deltaY = point1Y - centerY;

  minCircleRadius = Math.sqrt( deltaX * deltaX + deltaY * deltaY );

  return verifyAllPointsContainment( ); // Check if this circle encloses all points.
}

/**
 * Verifies if the currently calculated circle (defined by global `centerX`, `centerY`, `minCircleRadius`)
 * successfully encloses all points provided in `coordinatesData`.
 * @returns {number | undefined} Returns 1 if all points are within or on the circle's boundary,
 *                               otherwise returns undefined (indicating the circle is not valid).
 */
function verifyAllPointsContainment( ) {
  // Optimization: If the current circle's radius is already greater than or equal to
  // the best minimum radius found so far, it cannot be the new minimum, so we can exit early.
  if ( overallMinRadius < minCircleRadius ) {
    return;
  }

  // Iterate through every single input point.
  for ( var pointIndex = 0; pointIndex < totalPoints; pointIndex++ ) {
    // Calculate the distance from the current point to the circle's center.
    var deltaXCoord = coordinatesData[pointIndex][0] - centerX,
        deltaYCoord = coordinatesData[pointIndex][1] - centerY;

    var currentPointDist = Math.sqrt( deltaXCoord * deltaXCoord + deltaYCoord * deltaYCoord );

    // Check if the current point is outside the circle, accounting for floating point precision.
    // We use `comparisonEpsilon` to allow for slight numerical inaccuracies.
    if ( minCircleRadius < currentPointDist * comparisonEpsilon ) {
      return; // If any point is outside, this circle is not a valid enclosing circle.
    }
  }
  return 1; // All points are successfully contained within this circle.
}

/**
 * Handles the specific case where there are only two input points.
 * The minimum enclosing circle for two points has these points as its diameter.
 * @param {Array<Array<number>>} inputCoords - An array containing two [x, y] coordinate pairs.
 * @returns {number} The radius of the minimum enclosing circle for these two points.
 */
function handleTwoPoints( inputCoords ) {
  // Calculate the difference in x and y coordinates between the two points.
  var diffX = inputCoords[0][0] - inputCoords[1][0],
      diffY = inputCoords[0][1] - inputCoords[1][1];
  // The radius is half the distance between the two points.
  return Math.sqrt( diffX * diffX + diffY * diffY ) / 2;
}