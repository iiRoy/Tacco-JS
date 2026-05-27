var INPUT_PARSER = (function () {
  // This function creates a new text processing instance.
  function createParser(sourceText) {
    return new TextProcessor(sourceText);
  }

  // The main class for handling input text.
  function TextProcessor(inputString) {
    this._lines = inputString.trim().split("\n"); // Store lines as an array.
    this._currentLineIndex = 0; // Keep track of the current line being processed.
  }

  // Reads a single value from the current line.
  // If the line is exhausted, moves to the next.
  // 'asString' flag determines if the value is returned as a string or number.
  TextProcessor.prototype.readNextValue = function (asString) {
    var lineData = this._lines,
      lineIdx = this._currentLineIndex,
      extractedValue;

    // If the current line hasn't been split into parts yet, do it.
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    // Pop the last element (which is the first due to reverse).
    extractedValue = lineData[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return as string or convert to number.
    return asString ? extractedValue : +extractedValue;
  };

  // Reads all values from the current line.
  // 'returnStrings' flag determines if values are returned as strings or numbers.
  TextProcessor.prototype.readLineValues = function (returnStrings) {
    var lineParts = this._lines[this._currentLineIndex++].split(" ");
    return returnStrings ? lineParts : lineParts.map((valStr) => +valStr);
  };

  // Reads a matrix of 'numRows' rows.
  // 'keepStrings' flag determines if values are returned as strings or numbers.
  TextProcessor.prototype.readMatrix = function (numRows, keepStrings) {
    var matrixRows = this._lines
      .slice(this._currentLineIndex, (this._currentLineIndex += numRows))
      .map((rowStr) => rowStr.split(" "));
    return keepStrings
      ? matrixRows
      : matrixRows.map((row) => row.map((cellStr) => +cellStr));
  };

  // Reads 'count' number of raw lines.
  // 'asRawStrings' flag determines if values are returned as strings or numbers.
  TextProcessor.prototype.readRows = function (count, asRawStrings) {
    var selectedRows = this._lines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += count)
    );
    return asRawStrings ? selectedRows : selectedRows.map((rowContent) => +rowContent);
  };

  return createParser;
})();

// Initialize the input reader with content from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Function to create a multi-dimensional array initialized with a value.
function createMultiDimArray(initialValue) {
  var argsList = arguments,
    argCount = argsList.length,
    arrayCreationCode =
      "Array(argsList[" +
      --argCount +
      "]).fill(0).map(x=>{return " +
      initialValue +
      ";})";
  while (--argCount) {
    arrayCreationCode =
      "Array(argsList[" + argCount + "]).fill(0).map(x=>" + arrayCreationCode + ")";
  }
  return eval(arrayCreationCode);
}

// Output the result of the main processing function.
console.log(processGrid());

// Main function to perform the grid transformation.
function processGrid() {
  var gridHeight = inputReader.readNextValue(); // Read grid height.
  var gridWidth = inputReader.readNextValue(); // Read grid width.
  var thresholdA = inputReader.readNextValue(); // Read threshold A.
  var thresholdB = inputReader.readNextValue(); // Read threshold B.

  // Initialize a 2D array (grid) with zeros.
  var resultGrid = createMultiDimArray(0, gridHeight, gridWidth);
  var toggleFlag = 0; // Flag to control row-wise XOR operation.

  // Iterate through each row of the grid.
  for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    // If current row index matches threshold B, set the toggle flag.
    if (rowIdx === thresholdB) {
      toggleFlag = 1;
    }

    // Iterate through each column in the current row.
    for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
      // If current column index is greater than or equal to threshold A, set cell to 1.
      if (colIdx >= thresholdA) {
        resultGrid[rowIdx][colIdx] = 1;
      }
      // If the toggle flag is set, XOR the cell value with 1 (effectively flipping it).
      if (toggleFlag) {
        resultGrid[rowIdx][colIdx] ^= 1;
      }
    }
  }

  // Convert the 2D array into a string representation, with rows joined by newline.
  return resultGrid.map((row) => row.join("")).join("\n");
}
