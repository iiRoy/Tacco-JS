const fileSystem = require("fs");
const rawData = fileSystem.readFileSync("/dev/stdin", "utf8").trim().split("\n");

const NO_SUCH_ELEMENT_ERROR = "NoSuchElementException:次に要素は無いよ";

const inputHandler = {
  dataLines: rawData,
  currentLineIndex: 0,
  totalLines: rawData.length,
  fetchNextLine: function() {
    if (!this.canFetchMore()) {
      throw NO_SUCH_ELEMENT_ERROR;
    }
    const lineContent = this.dataLines[this.currentLineIndex];
    this.currentLineIndex++;
    return lineContent;
  },
  canFetchMore: function() {
    return this.currentLineIndex < this.totalLines;
  }
};

executeProgram();

function fetchNextLine() {
  return inputHandler.fetchNextLine();
}

function canFetchMore() {
  return inputHandler.canFetchMore();
}

function printOutput(text) {
  console.log(text);
}

function printError(text) {
  console.error(text);
}

function convertInput(inputValue, conversionType) {
  try {
    const typeIdentifier = conversionType;
    switch (typeIdentifier) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        const numericStrings = inputValue.split(" ");
        return numericStrings.map((val) => Number(val));
      case 6:
        return inputValue.split("");
      case 7:
        const characterStrings = inputValue.split("");
        return characterStrings.map((val) => Number(val));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (e) {
    return inputValue;
  }
}

function executeProgram() {
  const dimensionsArray = convertInput(fetchNextLine(), 4);
  const gridHeight = dimensionsArray[0];
  const gridWidth = dimensionsArray[1];

  const gridMap = Array.from({
    length: gridHeight
  }, () => convertInput(fetchNextLine(), 6));
  const visitedCells = Array.from({
    length: gridHeight
  }, () => new Array(gridWidth).fill(false));

  const START_Y_COORD = 0;
  const START_X_COORD = 0;
  visitedCells[START_Y_COORD][START_X_COORD] = true;

  let minPathLength = 10000000;
  const UNREACHABLE_PATH_VALUE = 10000000;

  const bfsQueue = [
    [START_Y_COORD, START_X_COORD, 0]
  ]; // [y, x, path_count]

  const movementDirections = [
    [-1, 0], // Up
    [0, -1], // Left
    [1, 0], // Down
    [0, 1] // Right
  ];

  while (bfsQueue.length > 0) {
    const [currentY, currentX, currentPathCount] = bfsQueue.shift();

    const isGoalCell = (y, x) => y === gridHeight - 1 && x === gridWidth - 1;
    if (isGoalCell(currentY, currentX)) {
      minPathLength = Math.min(minPathLength, currentPathCount);
    }

    for (const [deltaY, deltaX] of movementDirections) {
      const nextY = currentY + deltaY;
      const nextX = currentX + deltaX;

      const isWithinBounds = (y, x) => y >= 0 && y < gridHeight && x >= 0 && x < gridWidth;
      const isWalkable = (y, x) => gridMap[y][x] === ".";
      const isNotVisited = (y, x) => !visitedCells[y][x];

      if (isWithinBounds(nextY, nextX) && isWalkable(nextY, nextX) && isNotVisited(nextY, nextX)) {
        visitedCells[nextY][nextX] = true;
        bfsQueue.push([nextY, nextX, currentPathCount + 1]);
      }
    }
  }

  if (minPathLength === UNREACHABLE_PATH_VALUE) {
    printOutput(-1);
  } else {
    let totalDotCount = 0;
    gridMap.forEach(row => {
      row.forEach(cell => {
        if (cell === ".") {
          totalDotCount++;
        }
      });
    });
    totalDotCount = totalDotCount - (minPathLength + 1);
    printOutput(totalDotCount);
  }
}
