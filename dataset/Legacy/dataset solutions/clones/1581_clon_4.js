class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  enqueue(priorityValue, dataItem) {
    this.elements.push({ priority: priorityValue, item: dataItem });
    this.bubbleUp(this.elements.length - 1);
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const minElement = this.elements[0];
    const lastElement = this.elements.pop();
    if (!this.isEmpty()) {
      this.elements[0] = lastElement;
      this.sinkDown(0);
    }
    return minElement;
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.elements[index].priority < this.elements[parentIndex].priority) {
        [this.elements[parentIndex], this.elements[index]] = [this.elements[index], this.elements[parentIndex]];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  sinkDown(index) {
    const lastIndex = this.elements.length - 1;
    while (true) {
      let leftChild = 2 * index + 1;
      let rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild <= lastIndex && this.elements[leftChild].priority < this.elements[smallest].priority) {
        smallest = leftChild;
      }

      if (rightChild <= lastIndex && this.elements[rightChild].priority < this.elements[smallest].priority) {
        smallest = rightChild;
      }

      if (smallest !== index) {
        [this.elements[index], this.elements[smallest]] = [this.elements[smallest], this.elements[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }
}

function processGridPath(inputData) {
  const dataLines = inputData.split('\n');
  const [gridHeight, gridWidth] = dataLines[0].split(' ').map(Number);
  const [initialY, initialX] = dataLines[1].split(' ').map(Number);
  const [targetY, targetX] = dataLines[2].split(' ').map(Number);
  const terrainMap = dataLines.slice(3, 3 + gridHeight).map(rowStr => rowStr.split(''));

  const startCoordinates = [initialY - 1, initialX - 1];
  const goalCoordinates = [targetY - 1, targetX - 1];

  const minimumWarpCosts = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(Infinity)
  );

  const traversalQueue = new PriorityQueue();

  minimumWarpCosts[startCoordinates[0]][startCoordinates[1]] = 0;
  traversalQueue.enqueue(0, startCoordinates);

  const directMoveOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const teleportOffsets = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      teleportOffsets.push([dy, dx]);
    }
  }

  while (!traversalQueue.isEmpty()) {
    const { priority: currentCost, item: [currentR, currentC] } = traversalQueue.dequeue();

    if (currentCost > minimumWarpCosts[currentR][currentC]) {
      continue;
    }

    // Explore adjacent cells (0 warp cost)
    for (const [dr, dc] of directMoveOffsets) {
      const nextR = currentR + dr;
      const nextC = currentC + dc;

      if (nextR >= 0 && nextR < gridHeight && nextC >= 0 && nextC < gridWidth && terrainMap[nextR][nextC] !== '#') {
        const newCost = currentCost;
        if (newCost < minimumWarpCosts[nextR][nextC]) {
          minimumWarpCosts[nextR][nextC] = newCost;
          traversalQueue.enqueue(newCost, [nextR, nextC]);
        }
      }
    }

    // Explore 5x5 area cells (1 warp cost)
    for (const [dr, dc] of teleportOffsets) {
      const nextR = currentR + dr;
      const nextC = currentC + dc;

      if (nextR >= 0 && nextR < gridHeight && nextC >= 0 && nextC < gridWidth && terrainMap[nextR][nextC] !== '#') {
        const newCost = currentCost + 1;
        if (newCost < minimumWarpCosts[nextR][nextC]) {
          minimumWarpCosts[nextR][nextC] = newCost;
          traversalQueue.enqueue(newCost, [nextR, nextC]);
        }
      }
    }
  }

  const finalResult = minimumWarpCosts[goalCoordinates[0]][goalCoordinates[1]];
  console.log(finalResult === Infinity ? -1 : finalResult);
}

processGridPath(require("fs").readFileSync("/dev/stdin", "utf8"));
