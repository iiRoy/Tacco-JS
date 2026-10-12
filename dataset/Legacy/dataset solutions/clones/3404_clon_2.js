var INPUT_PARSER = (function () {
  // This function serves as the entry point to create a new data reader instance.
  function createReader(sourceText) {
    return new DataReader(sourceText);
  }

  // The DataReader class is responsible for parsing and extracting values from the input string.
  function DataReader(sourceText) {
    this._sourceLines = sourceText.trim().split("\n"); // Stores the input as an array of lines.
    this._linePointer = 0; // Keeps track of the current line being processed.
  }

  // Extracts a single token (either a number or a string) from the current line.
  DataReader.prototype.extractNextValue = function (returnAsString) {
    var allLines = this._sourceLines;
    var currentLineIdx = this._linePointer;
    var extractedToken;

    // If the current line has not yet been tokenized, split it by spaces and reverse for efficient popping.
    if (typeof allLines[currentLineIdx] === "string") {
      allLines[currentLineIdx] = allLines[currentLineIdx].split(" ").reverse();
    }

    // Retrieve the next token from the end of the reversed array.
    extractedToken = allLines[currentLineIdx].pop();

    // If the current line is now empty, advance the line pointer to the next line.
    if (!allLines[currentLineIdx].length) {
      this._linePointer++;
    }

    // Return the token as a string or convert it to a number based on the 'returnAsString' flag.
    return returnAsString ? extractedToken : +extractedToken;
  };

  // Reads all tokens from the current line and advances the line pointer.
  DataReader.prototype.fetchLineTokens = function (returnStrings) {
    var lineContent = this._sourceLines[this._linePointer++].split(" ");
    // Returns tokens as strings or converts them to numbers.
    return returnStrings ? lineContent : lineContent.map((strItem) => +strItem);
  };

  // Reads a specified number of rows and processes them as a matrix.
  DataReader.prototype.getMatrixData = function (numRows, returnStringMatrix) {
    var matrixRows = this._sourceLines
      .slice(this._linePointer, (this._linePointer += numRows)) // Extract 'numRows' lines.
      .map((rowString) => rowString.split(" ")); // Split each line into cells.
    // Returns the matrix with string values or converts all cell values to numbers.
    return returnStringMatrix
      ? matrixRows
      : matrixRows.map((row) => row.map((cellStr) => +cellStr));
  };

  // Reads a specified number of raw lines without further tokenization.
  DataReader.prototype.getRawLinesArray = function (numLines, returnStringArray) {
    var linesCollection = this._sourceLines.slice(
      this._linePointer,
      (this._linePointer += numLines)
    );
    // Returns lines as strings or attempts to convert each line to a number.
    return returnStringArray
      ? linesCollection
      : linesCollection.map((lineText) => +lineText);
  };

  return createReader;
})();

// Initialize the input processor by reading data from standard input.
var inputProcessor = INPUT_PARSER(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

// Output the result of the main problem-solving function.
console.log(processGridProblem());

// The primary function that implements the grid pathfinding logic.
function processGridProblem() {
  // Read the grid dimensions (height, width) and the number of obstacles.
  var gridHeight = inputProcessor.extractNextValue();
  var gridWidth = inputProcessor.extractNextValue();
  var obstacleCount = inputProcessor.extractNextValue();

  // Create a map to store blocked cells. 'blockedCellsMap[row]' will be an object
  // where keys are blocked column indices.
  var blockedCellsMap = Array(gridHeight + 1);
  for (var rowIdx = 0; rowIdx <= gridHeight; rowIdx++) {
    blockedCellsMap[rowIdx] = {};
    // Mark the column just outside the grid boundary as blocked. This simplifies boundary checks.
    blockedCellsMap[rowIdx][gridWidth + 1] = 1;
  }

  // Populate the blocked cells map with obstacle coordinates from the input.
  for (var obsIdx = 0; obsIdx < obstacleCount; obsIdx++) {
    var currentObstacleCoords = inputProcessor.fetchLineTokens();
    // The input format seems to be (column, row), so currentObstacleCoords[1] is row, currentObstacleCoords[0] is column.
    blockedCellsMap[currentObstacleCoords[1]][currentObstacleCoords[0]] = 1;
  }

  // Initialize the minimum path length.
  // For the first row (row 1), find the first available column (not blocked).
  // Object.keys returns string keys, so convert to number and subtract 1.
  var minPathResult = Object.keys(blockedCellsMap[1])[0] - 1;
  var currentSearchColumn = 2; // Start searching for paths from column 2 for subsequent rows.

  // Iterate through the grid rows, starting from the second row.
  for (var r = 2; r <= gridHeight; r++) {
    // Find the first unblocked column in the current row, starting from 'currentSearchColumn'.
    while (blockedCellsMap[r][currentSearchColumn]) {
      currentSearchColumn++;
    }

    // If the current search column has already exceeded the best path found so far,
    // it means no shorter path can be found, so we can terminate early.
    if (currentSearchColumn > minPathResult) {
      break;
    }

    // Iterate through the blocked cells in the current row to potentially update 'minPathResult'.
    // Object.keys returns string keys, so explicit conversion to number is needed.
    for (var colKeyStr in blockedCellsMap[r]) {
      var columnNumber = +colKeyStr; // Convert the string key to a numeric column index.

      // If the blocked column is before our current search column, it's not relevant for this path.
      if (currentSearchColumn > columnNumber) {
        continue;
      }

      // If a path ending at (columnNumber - 1) is shorter than the current 'minPathResult', update it.
      if (columnNumber - 1 < minPathResult) {
        minPathResult = columnNumber - 1;
      }
      // Once a relevant blocked cell is found and processed, we can break,
      // as we are interested in the minimum path, which would be limited by the first such cell.
      break;
    }
    currentSearchColumn++; // Increment the search column for the next row.
  }
  return minPathResult; // Return the final calculated minimum path length.
}
