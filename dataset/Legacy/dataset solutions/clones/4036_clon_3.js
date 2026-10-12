const createInputParser = (function() {
  class InputDataHandler {
    constructor(inputString) {
      this._inputLines = inputString.trim().split("\n");
      this._currentLinePointer = 0;
    }

    readSingleToken(returnAsString) {
      const currentLineData = this._inputLines;
      let lineIndex = this._currentLinePointer;
      let tokenValue;

      if (typeof currentLineData[lineIndex] === "string") {
        currentLineData[lineIndex] = currentLineData[lineIndex].split(" ").reverse();
      }

      tokenValue = currentLineData[lineIndex].pop();

      if (!currentLineData[lineIndex].length) {
        this._currentLinePointer++;
      }
      return returnAsString ? tokenValue : +tokenValue;
    }

    readLineTokens(returnAsString) {
      const lineContent = this._inputLines[this._currentLinePointer++];
      const tokens = lineContent.split(" ");
      return returnAsString ? tokens : tokens.map(val => +val);
    }

    readMatrixOfTokens(numRows, returnAsString) {
      const startIdx = this._currentLinePointer;
      this._currentLinePointer += numRows;
      const matrixRows = this._inputLines.slice(startIdx, this._currentLinePointer);

      const processedMatrix = matrixRows.map(rowStr => rowStr.split(" "));
      return returnAsString ? processedMatrix : processedMatrix.map(row => row.map(val => +val));
    }

    readLinesRaw(numRows, returnAsString) {
      const startIdx = this._currentLinePointer;
      this._currentLinePointer += numRows;
      const rawLines = this._inputLines.slice(startIdx, this._currentLinePointer);
      return returnAsString ? rawLines : rawLines.map(val => +val);
    }
  }

  return function(inputString) {
    return new InputDataHandler(inputString);
  };
})();

const inputReader = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(findShortestPathAndDots());

function findShortestPathAndDots() {
  const gridHeight = inputReader.readSingleToken();
  const gridWidth = inputReader.readSingleToken();
  const gridLayout = inputReader.readLinesRaw(gridHeight, true);

  const UNVISITED_MARKER = 0;
  const START_CELL_VISITED_VALUE = -1;
  const PATH_CELL_CHAR = ".";

  const visitedDistanceGrid = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(UNVISITED_MARKER));
  visitedDistanceGrid[0][0] = START_CELL_VISITED_VALUE;

  let totalDotCells = 0;
  for (let r = 0; r < gridHeight; r++) {
    const matches = gridLayout[r].match(new RegExp(`\\${PATH_CELL_CHAR}`, 'g'));
    if (matches) {
      totalDotCells += matches.length;
    }
  }

  let currentLayerQueue = [[0, 0]];
  const finalTargetRow = gridHeight - 1;
  const finalTargetCol = gridWidth - 1;

  const processNeighbor = (r, c, currentDist, nextQueueRef) => {
    const isRowInBounds = r >= 0 && r < gridHeight;
    const isColInBounds = c >= 0 && c < gridWidth;

    if (isRowInBounds && isColInBounds) {
      const cellContent = gridLayout[r][c];
      const isCellUnvisited = visitedDistanceGrid[r][c] === UNVISITED_MARKER;

      if (cellContent === PATH_CELL_CHAR && isCellUnvisited) {
        visitedDistanceGrid[r][c] = currentDist;
        nextQueueRef.push([r, c]);
      }
    }
  };

  for (let currentDistance = 1; ; currentDistance++) {
    if (currentLayerQueue.length === 0) {
      return -1;
    }

    let nextLayerQueue = [];
    while (currentLayerQueue.length > 0) {
      const currentCellCoords = currentLayerQueue.pop();
      const currentRow = currentCellCoords[0];
      const currentCol = currentCellCoords[1];

      if (currentRow === finalTargetRow && currentCol === finalTargetCol) {
        return totalDotCells - currentDistance;
      }

      processNeighbor(currentRow - 1, currentCol, currentDistance, nextLayerQueue);
      processNeighbor(currentRow + 1, currentCol, currentDistance, nextLayerQueue);
      processNeighbor(currentRow, currentCol - 1, currentDistance, nextLayerQueue);
      processNeighbor(currentRow, currentCol + 1, currentDistance, nextLayerQueue);
    }
    currentLayerQueue = nextLayerQueue;
  }
}
