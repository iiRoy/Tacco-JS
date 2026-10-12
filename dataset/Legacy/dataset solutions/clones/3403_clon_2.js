var INPUT_PARSER = (function() {
  function createInputReader(rawInputString) {
    return new InputDataProcessor(rawInputString);
  }

  function InputDataProcessor(initialString) {
    this._sourceLines = initialString.trim().split("\n");
    this._linePointer = 0;
  }

  InputDataProcessor.prototype.fetchNextValue = function(asString) {
    var lineCollection = this._sourceLines;
    var currentLineIdx = this._linePointer;
    var extractedToken;

    if (typeof lineCollection[currentLineIdx] === "string") {
      lineCollection[currentLineIdx] = lineCollection[currentLineIdx].split(" ").reverse();
    }

    extractedToken = lineCollection[currentLineIdx].pop();

    if (!lineCollection[currentLineIdx].length) {
      this._linePointer++;
    }

    return asString ? extractedToken : +extractedToken;
  };

  InputDataProcessor.prototype.fetchLineValues = function(asString) {
    var lineContentString = this._sourceLines[this._linePointer++].split(" ");
    return asString ? lineContentString : lineContentString.map(valStr => +valStr);
  };

  InputDataProcessor.prototype.fetchMatrix = function(numRows, asString) {
    var matrixRowsRaw = this._sourceLines.slice(this._linePointer, this._linePointer += numRows).map(rowString => rowString.split(" "));
    return asString ? matrixRowsRaw : matrixRowsRaw.map(row => row.map(cellStr => +cellStr));
  };

  InputDataProcessor.prototype.fetchRawLines = function(numLines, asString) {
    var linesSlice = this._sourceLines.slice(this._linePointer, this._linePointer += numLines);
    return asString ? linesSlice : linesSlice.map(lineStr => +lineStr);
  };

  return createInputReader;
})();

var inputReaderInstance = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(solveProblem());

function solveProblem() {
  var gridHeight = inputReaderInstance.fetchNextValue();
  var gridWidth = inputReaderInstance.fetchNextValue();
  var obstacleCount = inputReaderInstance.fetchNextValue();

  var obstacleGrid = Array(gridHeight + 1).fill(0).map(_ => {
    return {};
  });

  for (var obsIdx = 0; obsIdx < obstacleCount; obsIdx++) {
    var obstacleCoordinates = inputReaderInstance.fetchLineValues();
    if (obstacleCoordinates[0] < obstacleCoordinates[1]) {
      continue;
    }
    obstacleGrid[obstacleCoordinates[1]][obstacleCoordinates[0]] = 1;
  }

  for (var rowIterator = 1; rowIterator <= gridHeight; rowIterator++) {
    obstacleGrid[rowIterator][gridWidth + 1] = 1;
  }

  var shortestPathLength = Object.keys(obstacleGrid[1])[0] - 1;
  var currentColumnPosition = 2;

  for (var currentRowIndex = 2; currentRowIndex <= gridHeight; currentRowIndex++) {
    while (obstacleGrid[currentRowIndex][currentColumnPosition]) {
      currentColumnPosition++;
    }
    if (currentColumnPosition > shortestPathLength) {
      break;
    }
    for (var obstacleColumnKey in obstacleGrid[currentRowIndex]) {
      var obstacleColumn = +obstacleColumnKey;
      if (currentColumnPosition >= obstacleColumn) {
        continue;
      }
      if (obstacleColumn - 1 < shortestPathLength) {
        shortestPathLength = obstacleColumn - 1;
      }
      break;
    }
    currentColumnPosition++;
  }
  return shortestPathLength;
}
