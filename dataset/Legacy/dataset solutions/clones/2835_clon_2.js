var INPUT_PARSER = (function () {
  /**
   * Factory function to create a new input parser instance.
   * @param {string} inputString The complete input string to be parsed.
   * @returns {ParserInstance} A new parser object.
   */
  function createParser(inputString) {
    return new ParserInstance(inputString);
  }

  /**
   * Constructor for the ParserInstance.
   * Manages reading lines and values from the provided text.
   * @class
   * @param {string} sourceText The raw text input, typically from a file or stdin.
   */
  function ParserInstance(sourceText) {
    // Store the input text split into an array of lines.
    // Trim removes any leading/trailing whitespace from the entire input.
    this._lines = sourceText.trim().split("\n");
    // Keep track of the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Reads the next single value from the current line.
   * If the current line contains multiple space-separated values, it extracts one.
   * Advances to the next line if the current one is exhausted.
   * @param {boolean} [asString=false] If true, returns the value as a string; otherwise, attempts to convert to a number.
   * @returns {string|number} The parsed value.
   */
  ParserInstance.prototype.readNextValue = function (asString) {
    var linesArray = this._lines;
    var lineIdx = this._currentLineIndex;
    var extractedValue;

    // If the current line is still a string, split it into parts and reverse for efficient `pop()`.
    if (typeof linesArray[lineIdx] === "string") {
      linesArray[lineIdx] = linesArray[lineIdx].split(" ").reverse();
    }

    // Get the next value from the end of the (reversed) array.
    extractedValue = linesArray[lineIdx].pop();

    // If the current line is now empty, increment the line index.
    if (!linesArray[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the value, either as a string or converted to a number.
    return asString ? extractedValue : +extractedValue;
  };

  /**
   * Reads an entire line and returns its space-separated values.
   * Advances the line index after reading.
   * @param {boolean} [asStrings=false] If true, returns values as strings; otherwise, attempts to convert to numbers.
   * @returns {Array<string|number>} An array of values from the line.
   */
  ParserInstance.prototype.readLineValues = function (asStrings) {
    var lineParts = this._lines[this._currentLineIndex++].split(" ");
    return asStrings ? lineParts : lineParts.map((item) => +item);
  };

  /**
   * Reads a matrix of `numRows` rows. Each row is split by spaces.
   * Advances the line index by `numRows`.
   * @param {number} numRows The number of rows to read for the matrix.
   * @param {boolean} [asStrings=false] If true, returns values as strings; otherwise, attempts to convert to numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  ParserInstance.prototype.readMatrix = function (numRows, asStrings) {
    var resultMatrix = this._lines
      .slice(this._currentLineIndex, (this._currentLineIndex += numRows))
      .map((rowStr) => rowStr.split(" "));
    return asStrings
      ? resultMatrix
      : resultMatrix.map((row) => row.map((cellStr) => +cellStr));
  };

  /**
   * Reads `count` individual rows as an array of strings or numbers.
   * Advances the line index by `count`.
   * @param {number} count The number of rows to read.
   * @param {boolean} [asStrings=false] If true, returns rows as strings; otherwise, attempts to convert to numbers.
   * @returns {Array<string|number>} An array of rows.
   */
  ParserInstance.prototype.readRows = function (count, asStrings) {
    var rowStrings = this._lines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += count)
    );
    return asStrings ? rowStrings : rowStrings.map((rowItem) => +rowItem);
  };

  return createParser;
})();

// Initialize the input reader by reading the entire content of standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a specified value.
 * The dimensions are provided as subsequent arguments.
 * @param {*} initialValue The value to fill each element of the array with.
 * @param {...number} dimensions The sizes of each dimension (e.g., `createMultiDimArray(0, 2, 3)` for a 2x3 array).
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments,
    len = args.length,
    // Start building the string for the innermost array.
    arrayCreationString =
      "Array(args[" +
      --len +
      "]).fill(0).map(_=>{return " +
      initialValue +
      ";})";
  // Wrap the string with outer array creation calls for each remaining dimension.
  while (--len)
    arrayCreationString =
      "Array(args[" + len + "]).fill(0).map(_=>" + arrayCreationString + ")";
  // Evaluate the constructed string to create the array.
  return eval(arrayCreationString);
}

// `boundaryRanges` will store the minimum and maximum values for 6 different coordinate transformations.
// Each inner array will hold `[min_value, max_value]`.
var boundaryRanges = createMultiDimArray("[]", 6);

// `candidateOffsets` is a Set to store unique offset values that need to be tested.
// It's initialized with 0 as a default candidate.
var candidateOffsets = new Set([0]);

// Execute the main processing logic and print the final result to standard output.
console.log(processInputAndCalculate());

/**
 * The primary function that orchestrates reading input, updating coordinate bounds,
 * generating candidate offsets, and calculating the minimum possible bounding box area.
 * @returns {number} The smallest calculated area.
 */
function processInputAndCalculate() {
  var numOperations = inputReader.readNextValue(); // Read N, the total number of operations.

  // Loop through each operation to update the boundary ranges.
  for (var opIndex = 0; opIndex < numOperations; opIndex++) {
    var coordX = inputReader.readNextValue();
    var coordY = inputReader.readNextValue();
    var directionChar = inputReader.readNextValue(true); // Read the direction as a string.

    // Based on the direction, update specific boundary ranges.
    // The indices (0-5) correspond to different transformed coordinate axes.
    if (directionChar === "U") {
      updateBoundaryRange(0, coordY); // Y-axis related
      updateBoundaryRange(5, coordX); // X-axis related
    } else if (directionChar === "R") {
      updateBoundaryRange(1, coordX); // X-axis related
      updateBoundaryRange(4, coordY); // Y-axis related
    } else if (directionChar === "D") {
      updateBoundaryRange(2, coordY); // Y-axis related
      updateBoundaryRange(5, coordX); // X-axis related
    } else {
      // Direction is "L"
      updateBoundaryRange(3, coordX); // X-axis related
      updateBoundaryRange(4, coordY); // Y-axis related
    }
  }

  // After processing all operations, calculate and add potential offset values.
  // These offsets are derived from combinations of the current boundary ranges.
  addCandidateOffsets(
    boundaryRanges[0][1], // Max Y
    boundaryRanges[4][1], // Max Y
    boundaryRanges[2][1]  // Max Y
  );
  addCandidateOffsets(
    -boundaryRanges[2][0], // -Min Y
    -boundaryRanges[4][0], // -Min Y
    -boundaryRanges[0][0]  // -Min Y
  );
  addCandidateOffsets(
    boundaryRanges[1][1], // Max X
    boundaryRanges[5][1], // Max X
    boundaryRanges[3][1]  // Max X
  );
  addCandidateOffsets(
    -boundaryRanges[3][0], // -Min X
    -boundaryRanges[5][0], // -Min X
    -boundaryRanges[1][0]  // -Min X
  );

  var minArea = 1e18; // Initialize the minimum area with a very large number.

  // Iterate through each candidate offset to find the true minimum bounding box area.
  for (var currentOffset of candidateOffsets) {
    // Calculate the effective upper, lower, right, and left bounds for the current offset.
    var upperBound = findMaximum(
      boundaryRanges[0][1] + currentOffset, // Y + offset
      boundaryRanges[2][1] - currentOffset, // Y - offset
      boundaryRanges[4][1]                  // Y
    );
    var minYVal = findMinimum( // Renamed from 'd' to avoid conflict with 'directionChar'
      boundaryRanges[0][0] + currentOffset, // Y + offset
      boundaryRanges[2][0] - currentOffset, // Y - offset
      boundaryRanges[4][0]                  // Y
    );
    var rightBound = findMaximum(
      boundaryRanges[1][1] + currentOffset, // X + offset
      boundaryRanges[3][1] - currentOffset, // X - offset
      boundaryRanges[5][1]                  // X
    );
    var leftBound = findMinimum(
      boundaryRanges[1][0] + currentOffset, // X + offset
      boundaryRanges[3][0] - currentOffset, // X - offset
      boundaryRanges[5][0]                  // X
    );

    // Calculate the area of the bounding box for the current offset.
    var currentArea = (upperBound - minYVal) * (rightBound - leftBound);

    // Update the overall minimum area if the current area is smaller.
    if (currentArea < minArea) {
      minArea = currentArea;
    }
  }
  return minArea;
}

/**
 * Updates the minimum and maximum values for a specific boundary range.
 * If the range is initially empty, it's initialized with the given coordinate value.
 * Otherwise, the minimum (index 0) or maximum (index 1) is updated if the coordinate
 * falls outside the current range.
 * @param {number} rangeIndex The index in `boundaryRanges` to update.
 * @param {number} coordinateValue The coordinate value to incorporate into the range.
 */
function updateBoundaryRange(rangeIndex, coordinateValue) {
  if (boundaryRanges[rangeIndex].length) {
    // If the range already contains values, update its min or max.
    if (boundaryRanges[rangeIndex][0] > coordinateValue)
      boundaryRanges[rangeIndex][0] = coordinateValue; // Update minimum if `coordinateValue` is smaller.
    else if (boundaryRanges[rangeIndex][1] < coordinateValue)
      boundaryRanges[rangeIndex][1] = coordinateValue; // Update maximum if `coordinateValue` is larger.
  } else {
    // If the range is empty, initialize both min and max with the current value.
    boundaryRanges[rangeIndex][0] = boundaryRanges[rangeIndex][1] = coordinateValue;
  }
}

/**
 * Calculates and adds potential offset values to the `candidateOffsets` set.
 * These offsets are derived from various combinations of three input boundary values.
 * The `Math.max(0, ...)` ensures only non-negative offsets are considered.
 * The `|| 0` handles cases where a calculation might result in NaN or a falsy value, defaulting to 0.
 * @param {number} valU A boundary value (e.g., a maximum Y coordinate).
 * @param {number} valX Another boundary value (e.g., another maximum Y coordinate).
 * @param {number} valD A third boundary value (e.g., a third maximum Y coordinate).
 */
function addCandidateOffsets(valU, valX, valD) {
  candidateOffsets.add(Math.max(0, (valD - valX) || 0, ((valD - valU) / 2) || 0));
  candidateOffsets.add(Math.max(0, (valX - valU) || 0, ((valD - valU) / 2) || 0));
}

/**
 * Finds the maximum value among its arguments.
 * It skips any arguments that are `NaN`.
 * @param {...number} values A variable number of numeric arguments.
 * @returns {number} The largest numeric value among the arguments.
 */
function findMaximum() {
  var values = arguments;
  var currentMax = values[0]; // Initialize with the first argument.
  for (var idx = 1; idx < values.length; idx++) {
    if (isNaN(values[idx])) continue; // Ignore NaN values.
    if (currentMax > values[idx]) continue; // If current max is already greater, no update needed.
    currentMax = values[idx]; // Update current max if a larger value is found.
  }
  return currentMax;
}

/**
 * Finds the minimum value among its arguments.
 * It skips any arguments that are `NaN`.
 * @param {...number} values A variable number of numeric arguments.
 * @returns {number} The smallest numeric value among the arguments.
 */
function findMinimum() {
  var values = arguments;
  var currentMin = values[0]; // Initialize with the first argument.
  for (var idx = 1; idx < values.length; idx++) {
    if (isNaN(values[idx])) continue; // Ignore NaN values.
    if (currentMin < values[idx]) continue; // If current min is already smaller, no update needed.
    currentMin = values[idx]; // Update current min if a smaller value is found.
  }
  return currentMin;
}
