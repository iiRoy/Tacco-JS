class InputReader {
  constructor(inputContent) {
    this.sourceLines = inputContent.trim().split("\n");
    this.linePointer = 0;
    this.currentLineTokenBuffer = null;
  }

  extractToken(asString) {
    if (this.currentLineTokenBuffer === null || this.currentLineTokenBuffer.length === 0) {
      if (this.linePointer >= this.sourceLines.length) {
        throw new Error("Input exhausted for token extraction.");
      }
      this.currentLineTokenBuffer = this.sourceLines[this.linePointer].split(" ").reverse();
    }

    const tokenValue = this.currentLineTokenBuffer.pop();
    if (this.currentLineTokenBuffer.length === 0) {
      this.linePointer++;
      this.currentLineTokenBuffer = null;
    }
    return asString ? tokenValue : Number(tokenValue);
  }

  extractLine(asString) {
    if (this.linePointer >= this.sourceLines.length) {
      throw new Error("Input exhausted for line extraction.");
    }
    const lineContent = this.sourceLines[this.linePointer].split(" ");
    this.linePointer++;
    this.currentLineTokenBuffer = null;
    return asString ? lineContent : lineContent.map(Number);
  }

  extractMatrix(rowCount, asString) {
    if (this.linePointer + rowCount > this.sourceLines.length) {
      throw new Error("Input exhausted for matrix extraction.");
    }
    const collectedRows = [];
    for (let i = 0; i < rowCount; i++) {
      const row = this.sourceLines[this.linePointer].split(" ");
      collectedRows.push(asString ? row : row.map(Number));
      this.linePointer++;
    }
    this.currentLineTokenBuffer = null;
    return collectedRows;
  }

  extractRawLines(rowCount, asString) {
    if (this.linePointer + rowCount > this.sourceLines.length) {
      throw new Error("Input exhausted for raw line extraction.");
    }
    const collectedLines = [];
    for (let i = 0; i < rowCount; i++) {
      const line = this.sourceLines[this.linePointer];
      collectedLines.push(asString ? line : Number(line));
      this.linePointer++;
    }
    this.currentLineTokenBuffer = null;
    return collectedLines;
  }
}

const inputSource = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue, ...dimensions) {
  const buildRecursiveArray = (currentDimensionIndex) => {
    if (currentDimensionIndex === dimensions.length) {
      return typeof initialValue === 'object' && initialValue !== null
             ? JSON.parse(JSON.stringify(initialValue))
             : initialValue;
    }

    const currentSize = dimensions[currentDimensionIndex];
    const newArray = new Array(currentSize);
    for (let i = 0; i < currentSize; i++) {
      newArray[i] = buildRecursiveArray(currentDimensionIndex + 1);
    }
    return newArray;
  };

  return buildRecursiveArray(0);
}

class BellmanFordSolver {
  constructor(graphData, startNode) {
    const nodeCount = graphData.length;
    const infiniteVal = 1000000000; // Using 1e9 as 1,000,000,000

    let currentDistances = Array(nodeCount).fill(infiniteVal);
    currentDistances[startNode] = 0;

    // Phase 1: Find shortest paths (nodeCount - 1 iterations)
    for (let iter = 0; iter < nodeCount - 1; iter++) {
      let changedInPhase1 = false;
      for (let u = 0; u < nodeCount; u++) {
        if (currentDistances[u] === infiniteVal) continue;
        for (const edge of graphData[u]) {
          if (currentDistances[edge.destination] > currentDistances[u] + edge.weight) {
            currentDistances[edge.destination] = currentDistances[u] + edge.weight;
            changedInPhase1 = true;
          }
        }
      }
      if (!changedInPhase1) break;
    }

    // Phase 2: Detect and propagate negative cycles (nodeCount iterations)
    // If any distance can still be relaxed, it indicates a negative cycle.
    // Propagate -infiniteVal from such nodes.
    for (let iter = 0; iter < nodeCount; iter++) {
      let changedInPhase2 = false;
      for (let u = 0; u < nodeCount; u++) {
        // If a node is already marked as -infiniteVal, propagate this to its neighbors
        if (currentDistances[u] === -infiniteVal) {
          for (const edge of graphData[u]) {
            if (currentDistances[edge.destination] !== -infiniteVal) {
              currentDistances[edge.destination] = -infiniteVal;
              changedInPhase2 = true;
            }
          }
          continue;
        }

        if (currentDistances[u] === infiniteVal) continue;

        // If relaxation occurs, it implies a negative cycle is reachable
        for (const edge of graphData[u]) {
          if (currentDistances[edge.destination] > currentDistances[u] + edge.weight) {
            currentDistances[edge.destination] = -infiniteVal;
            changedInPhase2 = true;
          }
        }
      }
      if (!changedInPhase2) break;
    }

    this.finalDistances = currentDistances;
    this.infinityValue = infiniteVal;
  }

  retrieveDistance(targetIndex) {
    return this.finalDistances[targetIndex];
  }
}

function processInputAndSolve() {
  const nodeCount = inputSource.extractToken();
  const edgeCount = inputSource.extractToken();
  const profitThreshold = inputSource.extractToken();

  const adjacencyList = createMultiDimArray([], nodeCount);

  for (let i = 0; i < edgeCount; i++) {
    const edgeDetails = inputSource.extractLine();
    const sourceNode = edgeDetails[0] - 1;
    const targetNode = edgeDetails[1] - 1;
    const edgeWeight = edgeDetails[2];
    adjacencyList[sourceNode].push({ destination: targetNode, weight: profitThreshold - edgeWeight });
  }

  const pathSolver = new BellmanFordSolver(adjacencyList, 0);

  const finalNodeDistance = pathSolver.retrieveDistance(nodeCount - 1);
  const infinityMarker = pathSolver.infinityValue;

  if (finalNodeDistance === -infinityMarker) {
    return -1;
  }
  if (finalNodeDistance >= 0) {
    return 0;
  }
  return -finalNodeDistance;
}

console.log(processInputAndSolve());
