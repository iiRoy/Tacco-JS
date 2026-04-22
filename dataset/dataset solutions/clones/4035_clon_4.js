const obtainSourceData = () => require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
let dataFeed = obtainSourceData();
let lineIndex = 0;

const extractEntry = () => {
  if (lineIndex >= dataFeed.length) {
    throw new Error("End of data reached: No more entries available.");
  }
  return dataFeed[lineIndex++];
};

const processNumericPair = (str) => str.split(" ").map(Number);
const decomposeIntoChars = (str) => str.split("");

const displayOutput = (val) => {
  console.log(val);
};

class GridPoint {
  constructor(r, c, d) {
    this.r = r;
    this.c = c;
    this.d = d;
  }

  get key() {
    return `${this.r}_${this.c}`;
  }
}

class PathQueue {
  constructor() {
    this.elements = [];
    this.head = 0;
  }

  add(item) {
    this.elements.push(item);
  }

  remove() {
    if (this.isEmpty()) {
      return undefined;
    }
    const item = this.elements[this.head];
    this.head++;
    if (this.head > 2048 && this.head > this.elements.length / 2) {
      this.elements = this.elements.slice(this.head);
      this.head = 0;
    }
    return item;
  }

  isEmpty() {
    return this.head >= this.elements.length;
  }
}

const initiateProcessing = () => {
  const initialDimensions = processNumericPair(extractEntry());
  const rowCount = initialDimensions[0];
  const colCount = initialDimensions[1];

  const terrainMap = [];
  for (let r = 0; r < rowCount; r++) {
    terrainMap.push(decomposeIntoChars(extractEntry()));
  }

  const movementVectors = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1]
  ];

  const minimumPathLengths = new Map();
  
  const traversalQueue = new PathQueue();
  
  const startingPoint = new GridPoint(0, 0, 0);
  traversalQueue.add(startingPoint);
  minimumPathLengths.set(startingPoint.key, 0);

  let finalDestinationPathLength = Infinity;

  while (!traversalQueue.isEmpty()) {
    const currentPoint = traversalQueue.remove();
    const { r, c, d } = currentPoint;

    if (r === rowCount - 1 && c === colCount - 1) {
      finalDestinationPathLength = Math.min(finalDestinationPathLength, d);
    }

    for (const [dr, dc] of movementVectors) {
      const nextR = r + dr;
      const nextC = c + dc;

      if (nextR >= 0 && nextR < rowCount && nextC >= 0 && nextC < colCount) {
        const neighborKey = `${nextR}_${nextC}`;
        if (terrainMap[nextR][nextC] === "." && d + 1 < (minimumPathLengths.get(neighborKey) ?? Infinity)) {
          minimumPathLengths.set(neighborKey, d + 1);
          traversalQueue.add(new GridPoint(nextR, nextC, d + 1));
        }
      }
    }
  }

  if (finalDestinationPathLength === Infinity) {
    displayOutput(-1);
  } else {
    let totalWalkableCells = 0;
    for (let r = 0; r < rowCount; r++) {
      for (let c = 0; c < colCount; c++) {
        if (terrainMap[r][c] === ".") {
          totalWalkableCells++;
        }
      }
    }
    const resultValue = totalWalkableCells - (finalDestinationPathLength + 1);
    displayOutput(resultValue);
  }
};

initiateProcessing();