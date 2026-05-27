var INPUT_PARSER=(function(){
  // Factory function to create an input reader instance.
  function createParser(sourceText) {
    return new InputReader(sourceText);
  }

  // Constructor for the InputReader object.
  function InputReader(sourceText) {
    this._sourceLines = sourceText.trim().split("\n");
    this._currentLineIndex = 0;
  }

  // Reads a single value from the current line.
  // If 'asString' is true, returns as string; otherwise, as number.
  InputReader.prototype.readNextValue = function(asString) {
    var lineData = this._sourceLines,
        lineIdx = this._currentLineIndex,
        extractedVal;

    // If the current line hasn't been split into tokens yet, do it.
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    extractedVal = lineData[lineIdx].pop();

    // If the current line is exhausted, advance to the next line.
    if (!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }

    return asString ? extractedVal : +extractedVal;
  };

  // Reads all values from the current line.
  // If 'asString' is true, returns array of strings; otherwise, array of numbers.
  InputReader.prototype.readLineValues = function(asString) {
    var lineContent = this._sourceLines[this._currentLineIndex++];
    var values = lineContent.split(" ");
    return asString ? values : values.map(element => +element);
  };

  // Reads a matrix of 'numLines' rows.
  // If 'asString' is true, returns matrix of strings; otherwise, matrix of numbers.
  InputReader.prototype.readMatrix = function(numLines, asString) {
    var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
    var processedMatrix = matrixRows.map(row => row.split(" "));
    return asString ? processedMatrix : processedMatrix.map(row => row.map(element => +element));
  };

  // Reads 'numLines' raw lines.
  // If 'asString' is true, returns array of strings; otherwise, array of numbers.
  InputReader.prototype.readRawLines = function(numLines, asString) {
    var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
    return asString ? rawLines : rawLines.map(element => +element);
  };

  return createParser;
})();

var inputHandler = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(solveMaze());

function solveMaze() {
  var gridHeight = inputHandler.readNextValue();
  var gridWidth = inputHandler.readNextValue();
  var mazeLayout = inputHandler.readRawLines(gridHeight, true);

  // Initialize a 2D array to store distances, filled with zeros.
  var distanceGrid = Array(gridHeight).fill(0).map(row => Array(gridWidth).fill(0));

  // Mark the starting cell as visited with a special value.
  distanceGrid[0][0] = -1;

  var totalPathCells = 0;
  // Calculate the total number of '.' cells in the maze.
  for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    totalPathCells += mazeLayout[rowIdx].match(/\./g).length;
  }

  // Initialize the BFS queue with the starting position.
  var currentLevelQueue = [[0, 0]];

  // Adjust dimensions for easier boundary checks.
  gridHeight--;
  gridWidth--;

  // Perform BFS. 'currentDistance' represents the current distance from the start.
  for (var currentDistance = 1; ; currentDistance++) {
    // If the queue is empty, it means the target is unreachable.
    if (currentLevelQueue.length === 0) {
      return -1;
    }

    var nextLevelQueue = [];
    while (currentLevelQueue.length) {
      var currentCoords = currentLevelQueue.pop();
      var currentRow = currentCoords[0];
      var currentCol = currentCoords[1];

      // If the target cell is reached, calculate the result.
      if (currentRow === gridHeight && currentCol === gridWidth) {
        return totalPathCells - currentDistance;
      }

      // Check adjacent cells (up, down, left, right).
      // Move Up
      if (currentRow > 0 && distanceGrid[currentRow - 1][currentCol] === 0 && mazeLayout[currentRow - 1][currentCol] === ".") {
        distanceGrid[currentRow - 1][currentCol] = currentDistance;
        nextLevelQueue.push([currentRow - 1, currentCol]);
      }
      // Move Down
      if (currentRow < gridHeight && distanceGrid[currentRow + 1][currentCol] === 0 && mazeLayout[currentRow + 1][currentCol] === ".") {
        distanceGrid[currentRow + 1][currentCol] = currentDistance;
        nextLevelQueue.push([currentRow + 1, currentCol]);
      }
      // Move Left
      if (currentCol > 0 && distanceGrid[currentRow][currentCol - 1] === 0 && mazeLayout[currentRow][currentCol - 1] === ".") {
        distanceGrid[currentRow][currentCol - 1] = currentDistance;
        nextLevelQueue.push([currentRow, currentCol - 1]);
      }
      // Move Right
      if (currentCol < gridWidth && distanceGrid[currentRow][currentCol + 1] === 0 && mazeLayout[currentRow][currentCol + 1] === ".") {
        distanceGrid[currentRow][currentCol + 1] = currentDistance;
        nextLevelQueue.push([currentRow, currentCol + 1]);
      }
    }
    // Move to the next level of the BFS.
    currentLevelQueue = nextLevelQueue;
  }
}
