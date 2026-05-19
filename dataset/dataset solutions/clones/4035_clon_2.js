const rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const dataStream = {
  sourceLines: rawData,
  currentIdx: 0,
  totalLines: rawData.length,

  fetchNext: function() {
    if (!this.hasMore()) {
      throw "InputError: No more elements available in the stream.";
    }
    const retrievedLine = this.sourceLines[this.currentIdx];
    this.currentIdx++;
    return retrievedLine;
  },

  hasMore: function() {
    return (this.currentIdx < this.totalLines);
  }
};

executeProgram();

function getNextLine() {
  return dataStream.fetchNext();
}

function checkMoreLines() {
  return dataStream.hasMore();
}

function printOutput(content) {
  console.log(content);
}

function printError(errorMessage) {
  console.error(errorMessage);
}

/**
 * Transforms an input value based on a specified conversion type.
 * @param {string|Array} inputValue - The value to be transformed.
 * @param {number} conversionType - The type of conversion to apply.
 *   - 1: Convert to integer.
 *   - 2: Split by space into a string array.
 *   - 4: Split by space and convert to a number array.
 *   - 6: Split into a character array.
 *   - 7: Split into a character array and convert to a number array.
 *   - 8: Join array elements with spaces.
 *   - 9: Join array elements with newlines.
 *   - 0: Join array elements without a separator.
 *   - Default: Return input as is.
 * @returns {any} The transformed value or the original input on error.
 */
function transformInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((element) => Number(element));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((element) => Number(element));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (error) {
    return inputValue;
  }
}

function executeProgram() {
  const dimensions = transformInput(getNextLine(), 4);
  const gridHeight = dimensions[0];
  const gridWidth = dimensions[1];

  const gridMap = new Array(gridHeight);
  const visitedCells = new Array(gridHeight);

  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    gridMap[rowIdx] = transformInput(getNextLine(), 6);
    visitedCells[rowIdx] = new Array(gridWidth).fill(false);
  }

  visitedCells[0][0] = true;
  let minSteps = 10000000;
  const bfsQueue = [[0, 0, 0]];

  while (bfsQueue.length > 0) {
    const currentCell = bfsQueue.shift();
    const currentY = currentCell[0];
    const currentX = currentCell[1];
    const stepCount = currentCell[2];

    if (currentY === gridHeight - 1 && currentX === gridWidth - 1) {
      minSteps = Math.min(minSteps, stepCount);
    }

    // Check cell above
    if (currentY !== 0 && gridMap[currentY - 1][currentX] === "." && !visitedCells[currentY - 1][currentX]) {
      visitedCells[currentY - 1][currentX] = true;
      bfsQueue.push([currentY - 1, currentX, stepCount + 1]);
    }
    // Check cell to the left
    if (currentX !== 0 && gridMap[currentY][currentX - 1] === "." && !visitedCells[currentY][currentX - 1]) {
      visitedCells[currentY][currentX - 1] = true;
      bfsQueue.push([currentY, currentX - 1, stepCount + 1]);
    }
    // Check cell below
    if (currentY !== gridHeight - 1 && gridMap[currentY + 1][currentX] === "." && !visitedCells[currentY + 1][currentX]) {
      visitedCells[currentY + 1][currentX] = true;
      bfsQueue.push([currentY + 1, currentX, stepCount + 1]);
    }
    // Check cell to the right
    if (currentX !== gridWidth - 1 && gridMap[currentY][currentX + 1] === "." && !visitedCells[currentY][currentX + 1]) {
      visitedCells[currentY][currentX + 1] = true;
      bfsQueue.push([currentY, currentX + 1, stepCount + 1]);
    }
  }

  if (minSteps === 10000000) {
    printOutput(-1);
  } else {
    let dotCount = 0;
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
      for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
        if (gridMap[rowIdx][colIdx] === ".") {
          dotCount++;
        }
      }
    }
    dotCount -= (minSteps + 1);
    printOutput(dotCount);
  }
}
