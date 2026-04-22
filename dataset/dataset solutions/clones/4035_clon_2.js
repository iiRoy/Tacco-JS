const dataLines = require("node:fs").readFileSync("/proc/self/fd/0", { encoding: "utf8" }).trimEnd().split("\n");

const dataIterator = {
  sourceList: dataLines,
  currentPosition: 0,
  maximumElements: dataLines.length,
  
  retrieveNext: function() {
    if (!this.hasFurtherElements()) {
      throw new Error("IteratorExhaustedError: No more elements available for retrieval.");
    }
    const retrievedItem = this.sourceList[this.currentPosition];
    this.currentPosition++;
    return retrievedItem;
  },
  
  hasFurtherElements: function() {
    return (this.currentPosition < this.maximumElements);
  }
};

ExecuteProgram();

function fetchNextItem() {
  return dataIterator.retrieveNext();
}

function checkAvailability() {
  return dataIterator.hasFurtherElements();
}

function displayOutput(valueToLog) {
  console.log(valueToLog);
}

function reportError(errorMessage) {
  console.error(errorMessage);
}

// This function performs various transformations on input data based on a numeric code.
// inputVal: The data to be processed.
// transformType: An integer specifying the type of transformation.
function dataTransformer(inputVal, transformType) {
  try {
    switch (transformType) {
      case 1: // Convert to integer base 10.
        return Number.parseInt(inputVal, 10);
      case 2: // Split a string by space characters.
        return inputVal.split(" ");
      case 4: // Split by spaces and map each segment to a floating-point number.
        return inputVal.split(" ").map((segment) => parseFloat(segment));
      case 6: // Split a string into an array of individual characters.
        return inputVal.split("");
      case 7: // Split into characters and convert each character to a floating-point number.
        return inputVal.split("").map((character) => parseFloat(character));
      case 8: // Join array elements using a single space as a separator.
        return inputVal.join(" ");
      case 9: // Join array elements using newline characters.
        return inputVal.join("\n");
      case 0: // Join array elements without any separator.
        return inputVal.join("");
      default: // If no matching transformation type, return the input unchanged.
        return inputVal;
    }
  } catch (err) {
    // In case of any error during transformation, safely return the original input.
    return inputVal;
  }
}

function ExecuteProgram() {
  const dimensionsArray = dataTransformer(fetchNextItem(), 4);
  const gridHeight = dimensionsArray[0];
  const gridWidth = dimensionsArray[1];

  const gridMap = new Array(gridHeight);
  const visitedCells = new Array(gridHeight);

  // Initialize the grid layout and the tracking of visited cells.
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    gridMap[rowIdx] = dataTransformer(fetchNextItem(), 6);
    visitedCells[rowIdx] = new Array(gridWidth).fill(false);
  }

  // Mark the starting point (top-left) as visited.
  visitedCells[0][0] = true;
  
  // Set an initial very high value for the shortest path length.
  let shortestPathLength = 99999999;
  
  // Initialize the queue for Breadth-First Search (BFS).
  // Each element in the queue stores [y-coordinate, x-coordinate, current_path_length].
  const bfsQueue = [[0, 0, 0]];

  // Commence BFS traversal until the queue is empty.
  while (bfsQueue.length > 0) {
    const currentCellData = bfsQueue.shift();
    const currentY = currentCellData[0];
    const currentX = currentCellData[1];
    const currentPathCount = currentCellData[2];

    // Check if the current cell is the target destination.
    if (currentY === gridHeight - 1 && currentX === gridWidth - 1) {
      shortestPathLength = Math.min(shortestPathLength, currentPathCount);
    }

    // Explore adjacent cells (Up, Left, Down, Right).

    // Check the cell above.
    if (currentY !== 0 && gridMap[currentY - 1][currentX] === "." && !visitedCells[currentY - 1][currentX]) {
      visitedCells[currentY - 1][currentX] = true;
      bfsQueue.push([currentY - 1, currentX, currentPathCount + 1]);
    }
    // Check the cell to the left.
    if (currentX !== 0 && gridMap[currentY][currentX - 1] === "." && !visitedCells[currentY][currentX - 1]) {
      visitedCells[currentY][currentX - 1] = true;
      bfsQueue.push([currentY, currentX - 1, currentPathCount + 1]);
    }
    // Check the cell below.
    if (currentY !== gridHeight - 1 && gridMap[currentY + 1][currentX] === "." && !visitedCells[currentY + 1][currentX]) {
      visitedCells[currentY + 1][currentX] = true;
      bfsQueue.push([currentY + 1, currentX, currentPathCount + 1]);
    }
    // Check the cell to the right.
    if (currentX !== gridWidth - 1 && gridMap[currentY][currentX + 1] === "." && !visitedCells[currentY][currentX + 1]) {
      visitedCells[currentY][currentX + 1] = true;
      bfsQueue.push([currentY, currentX + 1, currentPathCount + 1]);
    }
  }

  // Determine the final output based on the BFS results.
  if (shortestPathLength === 99999999) {
    // If the destination was unreachable.
    displayOutput(-1);
  } else {
    let dotCount = 0;
    // Count all '.' cells in the entire grid.
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
      for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
        if (gridMap[rowIdx][colIdx] === ".") {
          dotCount++;
        }
      }
    }
    // Subtract the cells forming the shortest path from the total '.' cells.
    dotCount -= (shortestPathLength + 1);
    displayOutput(dotCount);
  }
}