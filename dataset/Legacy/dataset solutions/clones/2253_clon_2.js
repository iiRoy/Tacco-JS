"use strict";
var INPUT_UTILITIES = (function () {
  function createInputReader(inputStringContent) {
    return new InputDataProcessor(inputStringContent);
  }

  function InputDataProcessor(inputStringContent) {
    this._sourceLinesArray = inputStringContent.trim().split("\n");
    this._currentLinePointer = 0;
  }

  InputDataProcessor.prototype.getNextToken = function (returnAsString) {
    var currentLines = this._sourceLinesArray,
      linePointer = this._currentLinePointer,
      tokenValue;
    if (typeof currentLines[linePointer] === "string") {
      currentLines[linePointer] = currentLines[linePointer].split(" ").reverse();
    }
    tokenValue = currentLines[linePointer].pop();
    if (!currentLines[linePointer].length) {
      this._currentLinePointer++;
    }
    return returnAsString ? tokenValue : +tokenValue;
  };

  InputDataProcessor.prototype.readTokensOnLine = function (returnAsString) {
    var lineTokens = this._sourceLinesArray[this._currentLinePointer++].split(" ");
    return returnAsString ? lineTokens : lineTokens.map(element => +element);
  };

  InputDataProcessor.prototype.readTokenMatrix = function (numRows, returnAsString) {
    var matrixRows = this._sourceLinesArray.slice(this._currentLinePointer, this._currentLinePointer += numRows).map(element => element.split(" "));
    return returnAsString ? matrixRows : matrixRows.map(element => element.map(element => +element));
  };

  InputDataProcessor.prototype.readLinesAsStrings = function (numLines, returnAsString) {
    var lineContents = this._sourceLinesArray.slice(this._currentLinePointer, this._currentLinePointer += numLines);
    return returnAsString ? lineContents : lineContents.map(element => +element);
  };

  return createInputReader;
})();

var dataStreamHandler = INPUT_UTILITIES(require("fs").readFileSync("/dev/stdin", "utf8"));

function initializeMultiDimensionalArray(initialValue) {
  var dimensionArguments = arguments,
    argLength = dimensionArguments.length,
    arrayCreationExpression = "Array(dimensionArguments[" + --argLength + "]).fill(0).map(x=>{return " + initialValue + ";})";
  while (--argLength) {
    arrayCreationExpression = "Array(dimensionArguments[" + argLength + "]).fill(0).map(x=>" + arrayCreationExpression + ")";
  }
  return eval(arrayCreationExpression);
}

var distanceMap, gridHeight, gridWidth, gridCells;

console.log(executeGridAnalysis());

function executeGridAnalysis() {
  gridHeight = dataStreamHandler.getNextToken();
  gridWidth = dataStreamHandler.getNextToken();
  gridCells = dataStreamHandler.readLinesAsStrings(gridHeight, true);

  var maximumDistanceFound = 0;

  for (var currentRow = 0; currentRow < gridHeight; currentRow++) {
    for (var currentCol = 0; currentCol < gridWidth; currentCol++) {
      if (gridCells[currentRow][currentCol] === ".") {
        performBFS(currentRow, currentCol);
        for (var checkRow = 0; checkRow < gridHeight; checkRow++) {
          for (var checkCol = 0; checkCol < gridWidth; checkCol++) {
            if (maximumDistanceFound < distanceMap[checkRow][checkCol]) {
              maximumDistanceFound = distanceMap[checkRow][checkCol];
            }
          }
        }
      }
    }
  }
  return maximumDistanceFound;
}

function performBFS(startRowCoord, startColCoord) {
  distanceMap = initializeMultiDimensionalArray(-1, gridHeight, gridWidth);
  distanceMap[startRowCoord][startColCoord] = 0;

  var currentLevelQueue = [startRowCoord, startColCoord];
  var currentPathLength = 1;

  while (currentLevelQueue.length) {
    var nextLevelQueue = [];
    while (currentLevelQueue.length) {
      var currentX = currentLevelQueue.pop();
      var currentY = currentLevelQueue.pop();

      if (currentX && distanceMap[currentY][currentX - 1] === -1 && gridCells[currentY][currentX - 1] === ".") {
        distanceMap[currentY][currentX - 1] = currentPathLength;
        nextLevelQueue.push(currentY, currentX - 1);
      }
      if (currentX < gridWidth - 1 && distanceMap[currentY][currentX + 1] === -1 && gridCells[currentY][currentX + 1] === ".") {
        distanceMap[currentY][currentX + 1] = currentPathLength;
        nextLevelQueue.push(currentY, currentX + 1);
      }
      if (currentY && distanceMap[currentY - 1][currentX] === -1 && gridCells[currentY - 1][currentX] === ".") {
        distanceMap[currentY - 1][currentX] = currentPathLength;
        nextLevelQueue.push(currentY - 1, currentX);
      }
      if (currentY < gridHeight - 1 && distanceMap[currentY + 1][currentX] === -1 && gridCells[currentY + 1][currentX] === ".") {
        distanceMap[currentY + 1][currentX] = currentPathLength;
        nextLevelQueue.push(currentY + 1, currentX);
      }
    }
    currentPathLength++;
    currentLevelQueue = nextLevelQueue;
  }
}
