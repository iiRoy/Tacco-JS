var INPUT_PARSER = (function () {
  // This function serves as the entry point for creating an input reader instance.
  function createParser(sourceText) {
    return new InputReader(sourceText);
  }

  // The core class responsible for parsing input data.
  function InputReader(sourceText) {
    // Store the input string, trimmed and split into individual lines.
    this._lines = sourceText.trim().split("\n");
    // Initialize the current line index to the beginning of the input.
    this._currentLineIndex = 0;
  }

  // Prototype method to extract a single value from the current line.
  // It reads from the end of the line, effectively consuming tokens from right to left.
  InputReader.prototype.readSingleValue = function (asString) {
    var lineArray = this._lines;
    var currentIdx = this._currentLineIndex;
    var resultValue;

    // If the current line hasn't been processed into an array of tokens yet, do so.
    // It's reversed so that `pop()` gets the first token from the original line.
    if (typeof lineArray[currentIdx] === "string") {
      lineArray[currentIdx] = lineArray[currentIdx].split(" ").reverse();
    }

    // Retrieve the next token (which was originally the first on the line).
    resultValue = lineArray[currentIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineArray[currentIdx].length) {
      this._currentLineIndex++;
    }

    // Return the value, either as a string or converted to a number.
    return asString ? resultValue : +resultValue;
  };

  // Prototype method to read an entire line and split it into an array of values.
  InputReader.prototype.readLineValues = function (asString) {
    // Get the current line and advance the line index.
    var lineParts = this._lines[this._currentLineIndex++].split(" ");
    // Return the array of values, either as strings or converted to numbers.
    return asString ? lineParts : lineParts.map((element) => +element);
  };

  // Prototype method to read a specified number of lines as a matrix (2D array).
  InputReader.prototype.readMatrix = function (numRows, asString) {
    // Extract the relevant lines and advance the line index.
    var matrixRows = this._lines
      .slice(this._currentLineIndex, (this._currentLineIndex += numRows))
      .map((element) => element.split(" "));

    // Return the matrix, with elements either as strings or converted to numbers.
    return asString
      ? matrixRows
      : matrixRows.map((row) => row.map((item) => +item));
  };

  // Prototype method to read a specified number of raw lines without splitting.
  InputReader.prototype.readRawLines = function (numLines, asString) {
    // Extract the relevant lines and advance the line index.
    var rawLineData = this._lines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numLines)
    );

    // Return the array of lines, either as strings or converted to numbers.
    return asString ? rawLineData : rawLineData.map((item) => +item);
  };

  // The IIFE returns the `createParser` function, which is the public interface.
  return createParser;
})();

// Initialize the data processor by reading input from standard input.
var dataProcessor = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main logic and print the result to the console.
console.log(processInput());

// The primary function containing the problem's solution logic.
function processInput() {
  // Read the total count of data points.
  var totalCount = dataProcessor.readSingleValue();
  // Read the first threshold value.
  var thresholdA = dataProcessor.readSingleValue();
  // Read the second threshold value.
  var thresholdB = dataProcessor.readSingleValue();
  // Read all data points as an array.
  var dataPoints = dataProcessor.readLineValues();

  // Initialize counters for two distinct groups.
  var groupOneCount = 0;
  var groupTwoCount = 0;

  // Iterate through each data point to categorize it.
  for (var idx = 0; idx < totalCount; idx++) {
    // If a data point is less than or equal to thresholdA, increment groupOneCount.
    if (dataPoints[idx] <= thresholdA) {
      groupOneCount++;
    }
    // If a data point is greater than thresholdB, increment groupTwoCount.
    else if (dataPoints[idx] > thresholdB) {
      groupTwoCount++;
    }
    // Data points between thresholdA (exclusive) and thresholdB (inclusive) are not counted in these groups.
  }

  // Return the minimum count among groupOneCount, groupTwoCount, and the remaining data points.
  return Math.min(groupOneCount, groupTwoCount, totalCount - groupOneCount - groupTwoCount);
}
