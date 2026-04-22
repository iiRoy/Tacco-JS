var INPUT_PARSER = (function() {
  function factoryMethod(sourceContent) {
    return new DataProcessor(sourceContent);
  }

  function DataProcessor(initialText) {
    this.processedLines = initialText.trim().split("\n");
    this.linePointer = 0;
  }

  DataProcessor.prototype.extractToken = function(returnAsString) {
    let linesRef = this.processedLines,
        pointerRef = this.linePointer,
        tokenValue;

    if (typeof linesRef[pointerRef] === "string") {
      linesRef[pointerRef] = linesRef[pointerRef].split(" ").reverse();
    }
    tokenValue = linesRef[pointerRef].pop();

    if (!linesRef[pointerRef].length) {
      this.linePointer++;
    }

    return returnAsString ? tokenValue : +tokenValue;
  };

  DataProcessor.prototype.readAllTokens = function(keepLiteral) {
    let lineTokens = this.processedLines[this.linePointer++].split(" ");
    return keepLiteral ? lineTokens : lineTokens.map(tokenItem => +tokenItem);
  };

  DataProcessor.prototype.readBlockMatrix = function(numberOfRows, stringOutput) {
    let matrixResult = this.processedLines.slice(this.linePointer, this.linePointer += numberOfRows).map(rowString => rowString.split(" "));
    return stringOutput ? matrixResult : matrixResult.map(innerRow => innerRow.map(cellValue => +cellValue));
  };

  DataProcessor.prototype.readBlockArray = function(countOfLines, asRawString) {
    let arrayResult = this.processedLines.slice(this.linePointer, this.linePointer += countOfLines);
    return asRawString ? arrayResult : arrayResult.map(lineItem => +lineItem);
  };

  return factoryMethod;
})();

let dataSource = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(performBFS());


function performBFS() {
  let mapHeight = dataSource.extractToken();
  let mapWidth = dataSource.extractToken();
  let mazeGrid = dataSource.readBlockArray(mapHeight, 1);

  let visitedGrid = Array(mapHeight).fill(null).map( _ => Array(mapWidth).fill(0));
  visitedGrid[0][0] = -1;

  let totalAvailableCells = 0;
  for (let rowIdx = 0; rowIdx < mapHeight; rowIdx++) {
    totalAvailableCells += (mazeGrid[rowIdx].match(/\./g) || []).length;
  }

  let currentLevelQueue = [
    [0, 0]
  ];
  const maxRowIdx = mapHeight - 1;
  const maxColIdx = mapWidth - 1;

  for (let distance = 1;; distance++) {
    if (currentLevelQueue.length === 0) {
      return -1;
    }

    let nextLevelBuffer = [];
    while (currentLevelQueue.length) {
      let currentPosition = currentLevelQueue.pop();
      let currentYCoord = currentPosition[0];
      let currentXCoord = currentPosition[1];

      if (currentYCoord === maxRowIdx && currentXCoord === maxColIdx) {
        return totalAvailableCells - distance;
      }

      if (currentYCoord > 0 && visitedGrid[currentYCoord - 1][currentXCoord] === 0 && mazeGrid[currentYCoord - 1][currentXCoord] === ".") {
        visitedGrid[currentYCoord - 1][currentXCoord] = distance;
        nextLevelBuffer.push([currentYCoord - 1, currentXCoord]);
      }
      if (currentYCoord < maxRowIdx && visitedGrid[currentYCoord + 1][currentXCoord] === 0 && mazeGrid[currentYCoord + 1][currentXCoord] === ".") {
        visitedGrid[currentYCoord + 1][currentXCoord] = distance;
        nextLevelBuffer.push([currentYCoord + 1, currentXCoord]);
      }
      if (currentXCoord > 0 && visitedGrid[currentYCoord][currentXCoord - 1] === 0 && mazeGrid[currentYCoord][currentXCoord - 1] === ".") {
        visitedGrid[currentYCoord][currentXCoord - 1] = distance;
        nextLevelBuffer.push([currentYCoord, currentXCoord - 1]);
      }
      if (currentXCoord < maxColIdx && visitedGrid[currentYCoord][currentXCoord + 1] === 0 && mazeGrid[currentYCoord][currentXCoord + 1] === ".") {
        visitedGrid[currentYCoord][currentXCoord + 1] = distance;
        nextLevelBuffer.push([currentYCoord, currentXCoord + 1]);
      }
    }
    currentLevelQueue = nextLevelBuffer;
  }
}