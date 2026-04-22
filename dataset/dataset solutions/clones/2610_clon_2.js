// This module provides utilities for parsing input streams.
const InputStreamParser = ( function() {

  // Factory function to create a new parser instance.
  function produceParser( inputContent ) {
    return new StreamDataParser( inputContent );
  }

  // Constructor for the StreamDataParser class.
  // It preprocesses the input string and initializes the line cursor.
  function StreamDataParser( inputContent ) {
    this._linesData = inputContent.trim().split("\n"); // Store lines after trimming and splitting.
    this._lineCursor = 0; // Initialize current line index.
  }

  // Prototype methods for StreamDataParser.

  // Fetches the next token from the current line.
  // If the current line is a string, it splits it into tokens and reverses them.
  // 'returnAsString' flag determines if the token should be returned as a string or a number.
  StreamDataParser.prototype.fetchNextToken = function( returnAsString ) {
    let lineBuffer = this._linesData;
    let currentPosition = this._lineCursor;
    let extractedValue;

    // Check if the current line needs to be tokenized.
    if ( typeof lineBuffer[currentPosition] === "string" ) {
      lineBuffer[currentPosition] = lineBuffer[currentPosition].split(" ").reverse();
    }

    // Extract the last token from the current line's token array.
    extractedValue = lineBuffer[currentPosition].pop();

    // If the current line is exhausted, advance to the next line.
    if ( !lineBuffer[currentPosition].length ) {
      this._lineCursor++;
    }

    // Return the value based on the 'returnAsString' flag.
    return returnAsString ? extractedValue : parseFloat(extractedValue);
  };

  // Reads an entire line of space-separated tokens.
  // 'asStrings' flag determines if tokens should be returned as strings or numbers.
  StreamDataParser.prototype.obtainLineTokens = function( asStrings ) {
    // Retrieve the current line and advance the cursor.
    let currentLineData = this._linesData[this._lineCursor++].split(" ");

    // Return tokens based on the 'asStrings' flag.
    return asStrings ? currentLineData : currentLineData.map( val => parseFloat(val) );
  };

  // Extracts a matrix of 'numRows' lines.
  // Each line is split into tokens.
  // 'keepStrings' flag determines if elements should be returned as strings or numbers.
  StreamDataParser.prototype.extractMatrix = function( numRows, keepStrings ) {
    // Slice the required number of lines and advance the cursor.
    let matrixRows = this._linesData.slice( this._lineCursor, this._lineCursor += numRows ).map( line => line.split(" ") );

    // Return the matrix with elements converted to numbers if 'keepStrings' is false.
    return keepStrings ? matrixRows : matrixRows.map( row => row.map( item => parseFloat(item) ) );
  };

  // Retrieves a specified 'count' of raw lines.
  // 'stringFormat' flag determines if lines should be returned as strings or numbers.
  StreamDataParser.prototype.retrieveLines = function( count, stringFormat ) {
    // Slice the required number of lines and advance the cursor.
    let retrievedData = this._linesData.slice( this._lineCursor, this._lineCursor += count );

    // Return lines with elements converted to numbers if 'stringFormat' is false.
    return stringFormat ? retrievedData : retrievedData.map( line => parseFloat(line) );
  };

  return produceParser; // Expose the factory function.

} )();

// Initialize the data source by reading from standard input.
const dataSource = InputStreamParser( require("fs").readFileSync("/dev/stdin", "utf8") );

/**
 * Dynamically creates a multi-dimensional array with specified dimensions.
 * @param {any} initialValue - The value to fill the innermost array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., dim1, dim2, dim3).
 * @returns {Array} A new multi-dimensional array.
 */
function spawnMultiArray( initialValue ) {
  let allArguments = arguments;
  let argCount = allArguments.length;
  // Start building the string for the innermost array.
  let arrayConstructionString = "Array(allArguments[" + --argCount + "]).fill(0).map(_ => { return " + initialValue + "; })";

  // Wrap the string with outer array definitions based on remaining dimensions.
  while ( --argCount ) {
    arrayConstructionString = "Array(allArguments[" + argCount + "]).fill(0).map(_ => " + arrayConstructionString + ")";
  }
  // Evaluate the constructed string to create the array.
  return eval(arrayConstructionString);
}

// Global variables for storing processed data.
let totalItemCount;         // Stores the total number of data points.
let horizontalPoints = [];  // Array to store x-coordinates.
let verticalPoints = [];    // Array to store y-coordinates.
let directionAngles = [];   // Array to store calculated angles for each point.

// Constant representing the resolution for angular scanning (e.g., 360000 iterations for a full circle scan).
const angularScanDivisions = 360000;

// Output the result of the main calculation function.
console.log(runMainCalculation());

/**
 * Main function to perform the core calculation logic.
 * It reads input points, calculates angles, and then scans through a full circle
 * to find the maximum squared magnitude of the sum of vectors within a 180-degree arc.
 * @returns {number} The square root of the maximum squared magnitude found.
 */
function runMainCalculation() {
  // Read the initial count of items.
  totalItemCount = dataSource.fetchNextToken();

  // Process each input point.
  for ( let dataIndex = 0; dataIndex < totalItemCount; dataIndex++ ) {
    let coordX = dataSource.fetchNextToken(); // Read x-coordinate.
    let coordY = dataSource.fetchNextToken(); // Read y-coordinate.

    // Skip points that are at the origin (0,0).
    if ( coordX === 0 && coordY === 0 ) {
      continue;
    }

    // Store coordinates and calculate their polar angle.
    horizontalPoints.push(coordX);
    verticalPoints.push(coordY);
    directionAngles.push(computePolarAngle(coordX, coordY));
  }

  // Update total item count based on non-zero points.
  totalItemCount = horizontalPoints.length;

  let maxSquaredDistance = 0; // Initialize maximum squared distance found.

  // Iterate through a full 360-degree scan with high resolution.
  for ( let scanIteration = 0; scanIteration < angularScanDivisions; scanIteration++ ) {
    // Calculate the current scan angle in degrees.
    const currentScanAngle = (scanIteration / angularScanDivisions) * 360.0;
    let sumX = 0; // Sum of x-components for points within the current arc.
    let sumY = 0; // Sum of y-components for points within the current arc.

    // Check each point to see if it falls within the 180-degree viewing arc.
    for ( let pointIndex = 0; pointIndex < totalItemCount; pointIndex++ ) {
      const pointAngle = directionAngles[pointIndex];
      // Condition to check if the point's angle is within the 180-degree arc
      // centered at currentScanAngle. The second part handles angle wrap-around (e.g., 350 deg and 10 deg).
      const isWithinAngularRange = (
        ( (currentScanAngle - 90.0) < pointAngle && pointAngle < (currentScanAngle + 90.0) ) ||
        ( (currentScanAngle + 270.0) < pointAngle ) // This handles cases where the arc wraps around 360/0 degrees.
      );

      if ( isWithinAngularRange ) {
        sumX += horizontalPoints[pointIndex];
        sumY += verticalPoints[pointIndex];
      }
    }

    // Calculate the squared magnitude (distance from origin) for the summed vector.
    const currentSquaredMagnitude = (sumX * sumX) + (sumY * sumY);

    // Update the maximum squared distance if the current one is greater.
    if ( maxSquaredDistance < currentSquaredMagnitude ) {
      maxSquaredDistance = currentSquaredMagnitude;
    }
  }

  // Return the square root of the maximum squared distance, representing the maximum magnitude.
  return Math.sqrt(maxSquaredDistance);
}

/**
 * Computes the polar angle (in degrees, 0-360) for a given Cartesian coordinate (x, y).
 * @param {number} coordinateA - The x-coordinate.
 * @param {number} coordinateB - The y-coordinate.
 * @returns {number} The angle in degrees, ranging from 0 (inclusive) to 360 (exclusive).
 */
function computePolarAngle( coordinateA, coordinateB ) {
  // Handle special cases where x or y is zero to avoid division by zero and ensure correct quadrant.
  if ( coordinateA === 0 ) {
    // If x is 0, angle is 90 (positive y) or 270 (negative y).
    return coordinateB > 0 ? 90.0 : 270.0;
  }
  if ( coordinateB === 0 ) {
    // If y is 0, angle is 0 (positive x) or 180 (negative x).
    return coordinateA > 0 ? 0.0 : 180.0;
  }

  // Calculate the angle using arctangent.
  // Math.atan returns radians in range (-PI/2, PI/2), convert to degrees.
  let calculatedAngleInDegrees = (Math.atan(coordinateB / coordinateA) / Math.PI) * 180.0;

  // Adjust angle for quadrants II and III (where x is negative).
  if ( coordinateA < 0 ) {
    calculatedAngleInDegrees += 180.0;
  }
  // Ensure the angle is positive and within [0, 360).
  if ( calculatedAngleInDegrees < 0 ) {
    calculatedAngleInDegrees += 360.0;
  }

  return calculatedAngleInDegrees;
}