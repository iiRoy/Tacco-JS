var INPUT_PARSER = (function () {
  function createParser(sourceText) {
    return new TextProcessor(sourceText);
  }

  function TextProcessor(inputString) {
    // Split the input string into an array of lines, then trim whitespace.
    this._lines = inputString.trim().split("\n");
    // Initialize the current line index for sequential reading.
    this._currentLineIndex = 0;
  }

  // Method to extract a single value from the current line.
  TextProcessor.prototype.extractValue = function (isString) {
    var linesArray = this._lines;
    var lineIdx = this._currentLineIndex;
    var extractedToken;

    // If the current line hasn't been processed into tokens yet, do so.
    if (typeof linesArray[lineIdx] === "string") {
      linesArray[lineIdx] = linesArray[lineIdx].split(" ").reverse();
    }

    // Pop the last token (which is the first in original order due to reverse).
    extractedToken = linesArray[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!linesArray[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the token, either as a string or converted to a number.
    return isString ? extractedToken : +extractedToken;
  };

  // Method to extract all values from the current line.
  TextProcessor.prototype.extractLine = function (asStrings) {
    var lineTokens = this._lines[this._currentLineIndex++].split(" ");
    // Return tokens as strings or numbers.
    return asStrings ? lineTokens : lineTokens.map((val) => +val);
  };

  // Method to extract a matrix of values over multiple lines.
  TextProcessor.prototype.extractMatrix = function (numRows, asStrings) {
    var resultMatrix = this._lines
      .slice(this._currentLineIndex, (this._currentLineIndex += numRows))
      .map((row) => row.split(" "));
    // Return matrix elements as strings or numbers.
    return asStrings
      ? resultMatrix
      : resultMatrix.map((row) => row.map((val) => +val));
  };

  // Method to extract a specified number of lines as individual values.
  TextProcessor.prototype.extractRows = function (count, asStrings) {
    var resultRows = this._lines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += count)
    );
    // Return rows as strings or numbers.
    return asStrings ? resultRows : resultRows.map((rowVal) => +rowVal);
  };

  return createParser;
})();

// Initialize the input reader by reading from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Utility function to create a multi-dimensional array with an initial value.
function initializeMultiDimArray(initialValue) {
  var args = arguments,
    length = args.length,
    arrayCreationString =
      "Array(args[" +
      --length +
      "]).fill(0).map(x=>{return " +
      initialValue +
      ";})";
  while (--length)
    arrayCreationString =
      "Array(args[" + length + "]).fill(0).map(x=>" + arrayCreationString + ")";
  return eval(arrayCreationString);
}

// Global array to store boundary ranges for different directions.
// Each sub-array will store [min_coord, max_coord].
var boundaryRanges = initializeMultiDimArray("[]", 6);
// A set to store unique candidate values for optimization.
var uniqueValues = new Set([0]);

// Output the result of the main processing function.
console.log(processInputAndCalculate());

// Main function to process input and compute the final answer.
function processInputAndCalculate() {
  var numOperations = inputReader.extractValue(); // Read the number of operations.

  // Process each operation.
  for (var opIndex = 0; opIndex < numOperations; opIndex++) {
    var coordX = inputReader.extractValue();
    var coordY = inputReader.extractValue();
    var directionChar = inputReader.extractValue(1); // Read direction as string.

    // Update boundary ranges based on the direction.
    if (directionChar === "U") {
      updateBoundary(0, coordY); // Upward movement affects Y-max.
      updateBoundary(5, coordX); // Upward movement affects X-max.
    } else if (directionChar === "R") {
      updateBoundary(1, coordX); // Rightward movement affects X-max.
      updateBoundary(4, coordY); // Rightward movement affects Y-max.
    } else if (directionChar === "D") {
      updateBoundary(2, coordY); // Downward movement affects Y-min.
      updateBoundary(5, coordX); // Downward movement affects X-max.
    } else {
      // Leftward movement.
      updateBoundary(3, coordX); // Leftward movement affects X-min.
      updateBoundary(4, coordY); // Leftward movement affects Y-max.
    }
  }

  // Calculate and add candidate values to the set based on boundary ranges.
  addCandidateValues(
    boundaryRanges[0][1],
    boundaryRanges[4][1],
    boundaryRanges[2][1]
  );
  addCandidateValues(
    -boundaryRanges[2][0],
    -boundaryRanges[4][0],
    -boundaryRanges[0][0]
  );
  addCandidateValues(
    boundaryRanges[1][1],
    boundaryRanges[5][1],
    boundaryRanges[3][1]
  );
  addCandidateValues(
    -boundaryRanges[3][0],
    -boundaryRanges[5][0],
    -boundaryRanges[1][0]
  );

  var finalAnswer = 1e18; // Initialize with a very large number.

  // Iterate through all candidate values to find the minimum area.
  for (var currentOffset of uniqueValues) {
    // Calculate bounds for the current offset.
    var upperBound = findMaximum(
      boundaryRanges[0][1] + currentOffset,
      boundaryRanges[2][1] - currentOffset,
      boundaryRanges[4][1]
    );
    var lowerCoord = findMinimum(
      boundaryRanges[0][0] + currentOffset,
      boundaryRanges[2][0] - currentOffset,
      boundaryRanges[4][0]
    );
    var rightBound = findMaximum(
      boundaryRanges[1][1] + currentOffset,
      boundaryRanges[3][1] - currentOffset,
      boundaryRanges[5][1]
    );
    var leftBound = findMinimum(
      boundaryRanges[1][0] + currentOffset,
      boundaryRanges[3][0] - currentOffset,
      boundaryRanges[5][0]
    );

    // Calculate the area for the current bounds.
    var currentArea = (upperBound - lowerCoord) * (rightBound - leftBound);

    // Update the minimum answer if a smaller area is found.
    if (currentArea < finalAnswer) {
      finalAnswer = currentArea;
    }
  }

  return finalAnswer;
}

// Function to update the min/max range for a specific boundary index.
function updateBoundary(rangeIndex, coordinateValue) {
  if (boundaryRanges[rangeIndex].length) {
    // If range already exists, update min or max.
    if (boundaryRanges[rangeIndex][0] > coordinateValue)
      boundaryRanges[rangeIndex][0] = coordinateValue;
    else if (boundaryRanges[rangeIndex][1] < coordinateValue)
      boundaryRanges[rangeIndex][1] = coordinateValue;
  } else {
    // If range is empty, initialize it with the current coordinate.
    boundaryRanges[rangeIndex][0] = boundaryRanges[rangeIndex][1] =
      coordinateValue;
  }
}

// Function to add potential candidate values to the uniqueValues set.
function addCandidateValues(valU, valX, valD) {
  uniqueValues.add(Math.max(0, (valD - valX) || 0));
  uniqueValues.add(Math.max(0, ((valD - valU) / 2) || 0));
  uniqueValues.add(Math.max(0, (valX - valU) || 0));
}

// Function to find the maximum value among its arguments, ignoring NaNs.
function findMaximum() {
  var allArguments = arguments;
  var currentMax = allArguments[0];
  for (var argIndex = 1; argIndex < allArguments.length; argIndex++) {
    if (isNaN(allArguments[argIndex])) continue;
    if (currentMax > allArguments[argIndex]) continue;
    currentMax = allArguments[argIndex];
  }
  return currentMax;
}

// Function to find the minimum value among its arguments, ignoring NaNs.
function findMinimum() {
  var allArguments = arguments;
  var currentMin = allArguments[0];
  for (var argIndex = 1; argIndex < allArguments.length; argIndex++) {
    if (isNaN(allArguments[argIndex])) continue;
    if (currentMin < allArguments[argIndex]) continue;
    currentMin = allArguments[argIndex];
  }
  return currentMin;
}
