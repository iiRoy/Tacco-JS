var INPUT_PARSER = (function() {
  /**
   * Factory function to create an input reader instance.
   * @param {string} sourceText - The raw string content from the input source.
   * @returns {InputReader} A new InputReader object ready for parsing.
   */
  function createInputReader(sourceText) {
    return new InputReader(sourceText);
  }

  /**
   * InputReader class for sequential parsing of text lines.
   * @param {string} sourceText - The complete string content to be processed.
   */
  function InputReader(sourceText) {
    // Stores all lines of the input, trimmed and split by newline characters.
    this._lines = sourceText.trim().split("\n");
    // Keeps track of the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Reads and extracts a single token from the current line. Tokens are space-separated.
   * This method reads tokens from right to left on a line, effectively processing them
   * in the order they appear by reversing the line's tokens once.
   * @param {boolean} asString - If true, returns the token as a string; otherwise, attempts conversion to number.
   * @returns {string|number} The extracted token.
   */
  InputReader.prototype.readItem = function(asString) {
    var lineArray = this._lines;
    var lineIdx = this._currentLineIndex;
    var resultValue;

    // If the current line hasn't been tokenized yet, split it and reverse for pop-based reading.
    if (typeof lineArray[lineIdx] === "string") {
      lineArray[lineIdx] = lineArray[lineIdx].split(" ").reverse();
    }

    // Retrieve the next token (which was the first in the original line due to reversal).
    resultValue = lineArray[lineIdx].pop();

    // If the current line is exhausted, advance the line pointer.
    if (!lineArray[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the token, optionally converted to a number.
    return asString ? resultValue : +resultValue;
  };

  /**
   * Reads an entire line and returns its space-separated tokens as an array.
   * The line pointer is advanced after reading.
   * @param {boolean} asString - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array containing all tokens from the read line.
   */
  InputReader.prototype.readLine = function(asString) {
    // Split the current line and immediately increment the line index.
    var lineContents = this._lines[this._currentLineIndex++].split(" ");
    // Map tokens to numbers if requested, otherwise return as strings.
    return asString ? lineContents : lineContents.map(element => +element);
  };

  /**
   * Reads a specified number of lines and processes them into a 2D array (matrix).
   * Each line becomes a row, and its space-separated tokens become elements of that row.
   * @param {number} numLines - The count of lines to read for the matrix.
   * @param {boolean} asString - If true, matrix elements are strings; otherwise, numbers.
   * @returns {Array<Array<string|number>>} The parsed matrix.
   */
  InputReader.prototype.readMatrix = function(numLines, asString) {
    // Extract the relevant lines and split each into tokens.
    var resultValue = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numLines)
                                 .map(element => element.split(" "));
    // If numeric conversion is needed, apply it to all elements in the matrix.
    return asString ? resultValue : resultValue.map(row => row.map(item => +item));
  };

  /**
   * Reads a specified number of lines and returns them as a flat array of strings or numbers.
   * Each line is treated as a single item in the resulting list.
   * @param {number} numLines - The count of lines to read for the list.
   * @param {boolean} asString - If true, list elements are strings; otherwise, numbers.
   * @returns {Array<string|number>} The parsed list.
   */
  InputReader.prototype.readList = function(numLines, asString) {
    // Extract the relevant lines.
    var resultValue = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
    // If numeric conversion is needed, apply it to all elements in the list.
    return asString ? resultValue : resultValue.map(element => +element);
  };

  return createInputReader;
})();

// Initialize the input parsing utility by reading the entire standard input.
var inputHandler = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Generates a multi-dimensional array initialized with a specific value.
 * The dimensions are provided as subsequent arguments.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension, from outermost to innermost.
 * @returns {Array} A multi-dimensional array.
 */
function multiDimArray(initialValue) {
  var args = arguments;
  var len = args.length;
  // Construct a string representation of the array creation logic.
  var arrayCreationString = "Array(args[" + --len + "]).fill(0).map(x=>{return " + initialValue + ";})";
  // Build up the nested array creation string for each dimension.
  while (--len) {
    arrayCreationString = "Array(args[" + len + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }
  // Evaluate the constructed string to create the array.
  return eval(arrayCreationString);
}

// Global arrays to store processed coordinate data and their calculated angles.
var dataSize;
var xCoordinates = [];
var yCoordinates = [];
var angles = [];

// A constant defining the number of angular samples to take for the main calculation.
var iterationCount = 1e4; // Represents 10,000 iterations.

// Execute the primary calculation function and output its result to the console.
console.log(calculateMaxMagnitude());

/**
 * Computes the maximum magnitude of the resultant vector by summing components
 * of input vectors that fall within a 180-degree arc, rotated across 360 degrees.
 * @returns {number} The square root of the maximum squared magnitude found.
 */
function calculateMaxMagnitude() {
  // Read the initial number of coordinate pairs.
  dataSize = inputHandler.readItem();

  // Loop through the input data to populate coordinate arrays and calculate angles.
  for (var idx = 0; idx < dataSize; idx++) {
    var coordA = inputHandler.readItem();
    var coordB = inputHandler.readItem();

    // Skip coordinate pairs that are at the origin (0,0) as they have no direction.
    if (coordA === 0.0 && coordB === 0.0) {
      continue;
    }

    // Store the valid coordinates and their corresponding angle.
    xCoordinates.push(coordA);
    yCoordinates.push(coordB);
    angles.push(calculateAngleInDegrees(coordA, coordB));
  }

  // Update dataSize to reflect the actual number of non-origin points.
  dataSize = xCoordinates.length;
  var maxSquaredMagnitude = 0.0; // Stores the maximum squared magnitude found.

  // Iterate through a full 360-degree range, sampling `iterationCount` times.
  for (var idx = 0; idx < iterationCount; idx++) {
    // Calculate the current test angle in degrees for the center of the 180-degree arc.
    var currentAngleDegrees = (idx + 0.5) / iterationCount * 360.0;
    var totalXComponent = 0.0;
    var totalYComponent = 0.0;

    // Sum the X and Y components of all vectors whose angles fall within the current 180-degree arc.
    for (var dataIdx = 0; dataIdx < dataSize; dataIdx++) {
      var angleOfVector = angles[dataIdx];
      // The condition checks if the vector's angle is within (currentAngleDegrees - 90, currentAngleDegrees + 90)
      // or handles the wrap-around case where the arc crosses the 0/360 degree boundary.
      if ((currentAngleDegrees - 90.0 < angleOfVector && angleOfVector < currentAngleDegrees + 90.0) || currentAngleDegrees + 270.0 < angleOfVector) {
        totalXComponent += xCoordinates[dataIdx];
        totalYComponent += yCoordinates[dataIdx];
      }
    }

    // Calculate the squared magnitude of the resultant vector for this specific arc.
    var currentSquaredMagnitude = totalXComponent * totalXComponent + totalYComponent * totalYComponent;

    // Update the overall maximum squared magnitude if the current one is greater.
    if (maxSquaredMagnitude < currentSquaredMagnitude) {
      maxSquaredMagnitude = currentSquaredMagnitude;
    }
  }
  // The final answer is the square root of the maximum squared magnitude.
  return Math.sqrt(maxSquaredMagnitude);
}

/**
 * Calculates the angle in degrees for a vector defined by its deltaX and deltaY components.
 * The angle is normalized to be within the [0, 360) range.
 * @param {number} deltaX - The horizontal component of the vector.
 * @param {number} deltaY - The vertical component of the vector.
 * @returns {number} The angle of the vector in degrees.
 * @throws {number} Throws '1' if the calculated angle falls outside the expected [0, 360) range.
 */
function calculateAngleInDegrees(deltaX, deltaY) {
  // Handle special cases for vectors aligned with axes to prevent division by zero
  // and ensure correct angle assignment (e.g., 90 for positive Y-axis).
  if (deltaX === 0.0) {
    return deltaY > 0.0 ? 90.0 : 270.0; // Positive Y-axis or Negative Y-axis
  }
  if (deltaY === 0.0) {
    return deltaX > 0.0 ? 0.0 : 180.0; // Positive X-axis or Negative X-axis
  }

  // Calculate the angle using arctangent, converting radians to degrees.
  var rawAngle = Math.atan(deltaY / deltaX) / Math.PI * 180.0;

  // Adjust the angle based on the quadrant to get a full 0-360 degree range.
  if (deltaX < 0.0) {
    rawAngle += 180.0; // For vectors in the 2nd or 3rd quadrants.
  }
  // Ensure the angle is non-negative.
  if (rawAngle < 0.0) {
    rawAngle += 360.0;
  }

  // A final check to ensure the angle is within the valid range.
  if (rawAngle < 0.0 || rawAngle >= 360.0) {
    throw(1); // Indicate an unexpected angle calculation error.
  }
  return rawAngle;
}
