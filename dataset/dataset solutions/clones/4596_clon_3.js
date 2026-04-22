const getInteger = (strVal) => {
  if (typeof strVal !== 'string' || strVal.trim() === '') {
    return 0;
  }
  const parsedVal = Number.parseInt(strVal, 10);
  return Number.isNaN(parsedVal) ? 0 : parsedVal;
};

const isValueEven = (val) => {
  if (typeof val !== 'number') {
    return false;
  }
  return (val % 2) === 0;
};

Object.defineProperties(Array.prototype, {
  'numericAscendingSort': {
    value: function() {
      return this.slice().sort((valA, valB) => {
        if (typeof valA !== 'number' || typeof valB !== 'number') {
          return 0;
        }
        return valA - valB;
      });
    },
    writable: true,
    configurable: true
  },
  'numericDescendingSort': {
    value: function() {
      return this.slice().sort((valA, valB) => {
        if (typeof valA !== 'number' || typeof valB !== 'number') {
          return 0;
        }
        return valB - valA;
      });
    },
    writable: true,
    configurable: true
  },
  'lexicographicalSort': {
    value: function() {
      return this.slice().sort((strA, strB) => {
        if (typeof strA !== 'string' || typeof strB !== 'string') {
          return 0;
        }
        return strA.localeCompare(strB);
      });
    },
    writable: true,
    configurable: true
  },
  'reverseLexicographicalSort': {
    value: function() {
      const sorted = this.slice().sort((strA, strB) => {
        if (typeof strA !== 'string' || typeof strB !== 'string') {
          return 0;
        }
        return strA.localeCompare(strB);
      });
      const reversedArray = [];
      while (sorted.length > 0) {
        reversedArray.push(sorted.pop());
      }
      return reversedArray;
    },
    writable: true,
    configurable: true
  },
  'discardElement': {
    value: function(elementToRemove) {
      const filteredElements = [];
      for (const currentElement of this) {
        if (currentElement !== elementToRemove) {
          filteredElements.push(currentElement);
        }
      }
      return filteredElements;
    },
    writable: true,
    configurable: true
  }
});

class CellTraversalQueue {
  constructor() {
    this.elements = [];
    this.head = 0;
  }

  enqueue(item) {
    this.elements.push(item);
  }

  dequeue() {
    if (this.head === this.elements.length) {
      this.elements = [];
      this.head = 0;
      return undefined;
    }
    const item = this.elements[this.head];
    this.head++;
    return item;
  }

  isEmpty() {
    return this.head === this.elements.length;
  }

  size() {
    return this.elements.length - this.head;
  }
}

function processGridExploration(inputDataRows) {
  if (!Array.isArray(inputDataRows) || inputDataRows.length < 2) {
    console.error("Input data is insufficient or malformed.");
    return;
  }

  const dimensionParameters = inputDataRows[0].split(' ').map(getInteger);
  if (dimensionParameters.length < 3) {
    console.error("Dimension parameters are incomplete.");
    return;
  }

  const gridHeight = dimensionParameters[0];
  const gridWidth = dimensionParameters[1];
  const maxAllowedMoves = dimensionParameters[2];

  if (gridHeight <= 0 || gridWidth <= 0 || maxAllowedMoves <= 0) {
    console.error("Invalid grid dimensions or move limit.");
    return;
  }
  if (inputDataRows.length < gridHeight + 1) {
    console.error("Input data rows do not match specified grid height.");
    return;
  }

  const layoutMatrix = [];
  for (let rowIdx = 1; rowIdx <= gridHeight; rowIdx++) {
    layoutMatrix.push(inputDataRows[rowIdx].split(''));
  }

  const deltaY = [-1, 1, 0, 0];
  const deltaX = [0, 0, -1, 1];

  const areCoordinatesValid = (yCoord, xCoord) => {
    return yCoord >= 0 && yCoord < gridHeight && xCoord >= 0 && xCoord < gridWidth;
  };

  let startNodeLocation = null;
  let foundStartFlag = false;

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (layoutMatrix[y][x] === 'S') {
        startNodeLocation = { y: y, x: x };
        foundStartFlag = true;
        break;
      }
    }
    if (foundStartFlag) {
      break;
    }
  }

  if (!startNodeLocation) {
    console.warn("Starting point 'S' not found in the grid.");
    return;
  }

  const traversalQueue = new CellTraversalQueue();
  traversalQueue.enqueue({
    y: startNodeLocation.y,
    x: startNodeLocation.x,
    steps: 0
  });

  while (!traversalQueue.isEmpty()) {
    const { y: currentY, x: currentX, steps: currentSteps } = traversalQueue.dequeue();

    if (currentSteps >= maxAllowedMoves) {
      continue;
    }

    for (let dirIdx = 0; dirIdx < 4; dirIdx++) {
      const nextY = currentY + deltaY[dirIdx];
      const nextX = currentX + deltaX[dirIdx];
      const nextSteps = currentSteps + 1;

      if (areCoordinatesValid(nextY, nextX)) {
        const targetCellContent = layoutMatrix[nextY][nextX];

        if (
          targetCellContent === '.' ||
          (typeof targetCellContent === 'number' && targetCellContent > nextSteps)
        ) {
          layoutMatrix[nextY][nextX] = nextSteps;
          traversalQueue.enqueue({ y: nextY, x: nextX, steps: nextSteps });
        }
      }
    }
  }

  const calculateEdgeDistance = (yPos, xPos) => {
    const distToTop = yPos;
    const distToBottom = gridHeight - 1 - yPos;
    const distToLeft = xPos;
    const distToRight = gridWidth - 1 - xPos;
    return Math.min(distToTop, distToBottom, distToLeft, distToRight);
  };

  let finalOptimalResult = Number.POSITIVE_INFINITY;

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const cellValue = layoutMatrix[y][x];

      if (typeof cellValue === 'number') {
        const currentCellSteps = cellValue;
        const minimumEdgeDistance = calculateEdgeDistance(y, x);

        if (minimumEdgeDistance === 0) {
          finalOptimalResult = 1;
          y = gridHeight;
          break;
        }

        const totalJumpsToEdge = Math.ceil(currentCellSteps / maxAllowedMoves) + 1;
        finalOptimalResult = Math.min(finalOptimalResult, totalJumpsToEdge);
      }
    }
  }

  console.log(finalOptimalResult);
}

processGridExploration(
  require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(lineStr => lineStr.trim())
);