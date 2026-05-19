const fileSystem = require("fs");
const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8").trim().split("\n");

const createInputReader = (lines) => {
  let currentLineIndex = 0;
  const totalLines = lines.length;

  const getNextLine = () => {
    if (!hasMoreLines()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    const returnLine = lines[currentLineIndex];
    currentLineIndex++;
    return returnLine;
  };

  const hasMoreLines = () => {
    return currentLineIndex < totalLines;
  };

  return {
    getNextLine,
    hasMoreLines
  };
};

const inputReaderInstance = createInputReader(rawInputData);

const readNextInputLine = () => inputReaderInstance.getNextLine();
const hasMoreInputLines = () => inputReaderInstance.hasMoreLines();

const printResult = (content) => console.log(content);
const logDebugError = (content) => console.error(content);

// Conversion mode constants
const CONVERSION_TYPE_INT = 1;
const CONVERSION_TYPE_SPLIT_SPACE = 2;
const CONVERSION_TYPE_SPLIT_SPACE_NUM = 4;
const CONVERSION_TYPE_SPLIT_CHAR = 6;
const CONVERSION_TYPE_SPLIT_CHAR_NUM = 7;
const CONVERSION_TYPE_JOIN_SPACE = 8;
const CONVERSION_TYPE_JOIN_NEWLINE = 9;
const CONVERSION_TYPE_JOIN_NONE = 0;

function processInputLine(inputStr, conversionMode) {
  try {
    if (conversionMode === CONVERSION_TYPE_INT) {
      return parseInt(inputStr, 10);
    } else if (conversionMode === CONVERSION_TYPE_SPLIT_SPACE) {
      return inputStr.split(" ");
    } else if (conversionMode === CONVERSION_TYPE_SPLIT_SPACE_NUM) {
      return inputStr.split(" ").map(Number);
    } else if (conversionMode === CONVERSION_TYPE_SPLIT_CHAR) {
      return inputStr.split("");
    } else if (conversionMode === CONVERSION_TYPE_SPLIT_CHAR_NUM) {
      return inputStr.split("").map(Number);
    } else if (conversionMode === CONVERSION_TYPE_JOIN_SPACE) {
      return inputStr.join(" ");
    } else if (conversionMode === CONVERSION_TYPE_JOIN_NEWLINE) {
      return inputStr.join("\n");
    } else if (conversionMode === CONVERSION_TYPE_JOIN_NONE) {
      return inputStr.join("");
    } else {
      return inputStr;
    }
  } catch (error) {
    return inputStr;
  }
}

// Main pathfinding logic
function solveGridPath() {
  const WALL_CHAR = "#";
  const PATH_CHAR = ".";
  const VISITED_CHAR = "k";
  const IMPOSSIBLE_MSG = "Impossible";
  const POSSIBLE_MSG = "Possible";

  const dimensionsData = processInputLine(readNextInputLine(), CONVERSION_TYPE_SPLIT_SPACE_NUM);
  const gridHeight = dimensionsData[0];
  const gridWidth = dimensionsData[1];

  const gridMap = new Array(gridHeight);
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    gridMap[rowIdx] = processInputLine(readNextInputLine(), CONVERSION_TYPE_SPLIT_CHAR);
  }

  // Helper for a common complex condition in pathfinding
  const isOneDirectionBlocked = (yCoord, xCoord, grid) => {
    const upCellContent = grid[yCoord - 1][xCoord];
    const leftCellContent = grid[yCoord][xCoord - 1];
    return (upCellContent === WALL_CHAR && leftCellContent === PATH_CHAR) || (leftCellContent === WALL_CHAR && upCellContent === PATH_CHAR);
  };

  // Start from the goal and move backwards
  let currentY = gridHeight - 1;
  let currentX = gridWidth - 1;

  while (currentY >= 0 && currentX >= 0) {
    logDebugError(currentX + " " + currentY);
    gridMap[currentY][currentX] = VISITED_CHAR;

    // Case 1: Reached the start (0,0)
    if (currentX === 0 && currentY === 0) {
      const rightCellExists = currentX + 1 < gridWidth;
      const downCellExists = currentY + 1 < gridHeight;

      const rightCellIsBlocked = rightCellExists && gridMap[currentY][currentX + 1] === WALL_CHAR;
      const downCellIsBlocked = downCellExists && gridMap[currentY + 1][currentX] === WALL_CHAR;

      if (!rightCellIsBlocked && !downCellIsBlocked) {
        break;
      } else {
        printResult(IMPOSSIBLE_MSG);
        return;
      }
    }

    // Case 2: On the left edge (x=0), but not at (0,0)
    if (currentX === 0) {
      const upCellIsWall = gridMap[currentY - 1][currentX] === WALL_CHAR;
      const rightCellIsNotWall = gridMap[currentY][currentX + 1] !== WALL_CHAR;
      const downCellIsNotWall = gridMap[currentY + 1][currentX] !== WALL_CHAR;

      if (upCellIsWall && rightCellIsNotWall && downCellIsNotWall) {
        currentY--;
        continue;
      } else {
        printResult(IMPOSSIBLE_MSG);
        return;
      }
    }

    // Case 3: On the top edge (y=0), but not at (0,0)
    if (currentY === 0) {
      const leftCellIsWall = gridMap[currentY][currentX - 1] === WALL_CHAR;
      const downCellIsNotWall = gridMap[currentY + 1][currentX] !== WALL_CHAR;
      const rightCellIsNotWall = gridMap[currentY][currentX + 1] !== WALL_CHAR;

      if (leftCellIsWall && downCellIsNotWall && rightCellIsNotWall) {
        currentX--;
        continue;
      } else {
        printResult(IMPOSSIBLE_MSG);
        return;
      }
    }

    // Case 4: Starting point (H-1, W-1)
    if (currentY === gridHeight - 1 && currentX === gridWidth - 1) {
      const upCellIsWall = gridMap[currentY - 1][currentX] === WALL_CHAR;
      if (upCellIsWall) {
        currentY--;
      } else {
        currentX--;
      }
      continue;
    }

    // Case 5: On the bottom or right edge (but not the start corner)
    if (currentY === gridHeight - 1 || currentX === gridWidth - 1) {
      const canMoveBackwards = isOneDirectionBlocked(currentY, currentX, gridMap);
      if (canMoveBackwards) {
        const preferMoveUp = gridMap[currentY - 1][currentX] === WALL_CHAR;
        if (preferMoveUp) {
          currentY--;
        } else {
          currentX--;
        }
        continue;
      } else {
        printResult(IMPOSSIBLE_MSG);
        return;
      }
    }

    // Case 6: General case (not on any edge or corner)
    const downCellHasBeenVisited = gridMap[currentY + 1][currentX] === VISITED_CHAR;

    if (downCellHasBeenVisited) {
      const canMoveBackwards = isOneDirectionBlocked(currentY, currentX, gridMap);
      const rightCellIsNotWall = gridMap[currentY][currentX + 1] !== WALL_CHAR;

      if (canMoveBackwards && rightCellIsNotWall) {
        const preferMoveUp = gridMap[currentY - 1][currentX] === WALL_CHAR;
        if (preferMoveUp) {
          currentY--;
        } else {
          currentX--;
        }
      } else {
        printResult(IMPOSSIBLE_MSG);
        return;
      }
    } else {
      const canMoveBackwards = isOneDirectionBlocked(currentY, currentX, gridMap);
      const downCellIsNotWall = gridMap[currentY + 1][currentX] !== WALL_CHAR;

      if (canMoveBackwards && downCellIsNotWall) {
        const preferMoveUp = gridMap[currentY - 1][currentX] === WALL_CHAR;
        if (preferMoveUp) {
          currentY--;
        } else {
          currentX--;
        }
        continue;
      } else {
        printResult(IMPOSSIBLE_MSG);
        return;
      }
    }
  }
  printResult(POSSIBLE_MSG);
}

solveGridPath();
