class InputReaderFactory {
  static create(sourceString) {
    return new InputReader(sourceString);
  }
}

class InputReader {
  constructor(sourceString) {
    this.sourceLines = sourceString.trim().split("\n");
    this.currentLineIndex = 0;
    this.currentLineTokens = [];
  }

  _parseNumber(value) {
    return +value;
  }

  readNextToken(asString = false) {
    if (this.currentLineTokens.length === 0) {
      if (this.currentLineIndex >= this.sourceLines.length) {
        throw new Error("Attempted to read past end of input.");
      }
      this.currentLineTokens = this.sourceLines[this.currentLineIndex++].split(" ").reverse();
    }

    const token = this.currentLineTokens.pop();
    return asString ? token : this._parseNumber(token);
  }

  readLineTokens(asString = false) {
    if (this.currentLineIndex >= this.sourceLines.length) {
      throw new Error("Attempted to read past end of input.");
    }
    const line = this.sourceLines[this.currentLineIndex++];
    const tokens = line.split(" ");
    return asString ? tokens : tokens.map(this._parseNumber);
  }

  readMatrix(numRows, asString = false) {
    const startIdx = this.currentLineIndex;
    const endIdx = startIdx + numRows;
    if (endIdx > this.sourceLines.length) {
      throw new Error("Attempted to read past end of input for matrix.");
    }
    const matrixRows = this.sourceLines
      .slice(startIdx, endIdx)
      .map((line) => line.split(" "));
    this.currentLineIndex = endIdx;

    return asString
      ? matrixRows
      : matrixRows.map((row) => row.map(this._parseNumber));
  }

  readLines(numLines, asString = false) {
    const startIdx = this.currentLineIndex;
    const endIdx = startIdx + numLines;
    if (endIdx > this.sourceLines.length) {
      throw new Error("Attempted to read past end of input for lines.");
    }
    const lines = this.sourceLines.slice(startIdx, endIdx);
    this.currentLineIndex = endIdx;

    return asString ? lines : lines.map(this._parseNumber);
  }
}

const inputData = InputReaderFactory.create(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

function createMultiDimArray(initialValue, ...dimensions) {
  if (dimensions.length === 0) {
    return initialValue;
  }

  const currentDimSize = dimensions[0];
  const remainingDimensions = dimensions.slice(1);

  return Array.from({ length: currentDimSize }, () =>
    createMultiDimArray(initialValue, ...remainingDimensions)
  );
}

let dimensionSize, adjacencyMatrix, hasOutgoingEdge, isolatedNodesCount = 0;

function initializeGraphProperties() {
  hasOutgoingEdge = createMultiDimArray(0, dimensionSize);
  let anyOutgoingEdgeFound = false;

  for (let rowIdx = 0; rowIdx < dimensionSize; rowIdx++) {
    let nodeHasOutgoingEdge = false;
    for (let colIdx = 0; colIdx < dimensionSize; colIdx++) {
      if (adjacencyMatrix[rowIdx][colIdx] === "1") {
        nodeHasOutgoingEdge = true;
        anyOutgoingEdgeFound = true;
        break;
      }
    }
    if (nodeHasOutgoingEdge) {
      hasOutgoingEdge[rowIdx] = 1;
    } else {
      isolatedNodesCount++;
    }
  }
  return anyOutgoingEdgeFound;
}

function calculateMaxBipartiteDistance(startNodeIdx) {
  const distanceMap = createMultiDimArray(-1, dimensionSize);
  distanceMap[startNodeIdx] = 0;
  let currentLevelNodes = [];

  for (let neighborIdx = 0; neighborIdx < dimensionSize; neighborIdx++) {
    if (adjacencyMatrix[startNodeIdx][neighborIdx] === "1") {
      distanceMap[neighborIdx] = 1;
      currentLevelNodes.push(neighborIdx);
    }
  }

  let currentDistanceLevel = 1;

  while (currentLevelNodes.length > 0) {
    const nextLevelNodes = [];
    const nodesToProcessInCurrentLevel = currentLevelNodes;
    currentLevelNodes = [];

    for (const currentNode of nodesToProcessInCurrentLevel) {
      for (let neighborIdx = 0; neighborIdx < dimensionSize; neighborIdx++) {
        if (adjacencyMatrix[currentNode][neighborIdx] === "0") {
          continue;
        }

        const neighborDistance = distanceMap[neighborIdx];

        if (neighborDistance === -1) {
          distanceMap[neighborIdx] = currentDistanceLevel + 1;
          nextLevelNodes.push(neighborIdx);
        } else if (
          neighborDistance !== currentDistanceLevel - 1 &&
          neighborDistance !== currentDistanceLevel + 1
        ) {
          return -1;
        }
      }
    }
    currentDistanceLevel++;
    currentLevelNodes = nextLevelNodes;
  }
  return currentDistanceLevel;
}

function main() {
  dimensionSize = inputData.readNextToken();
  adjacencyMatrix = inputData.readLines(dimensionSize, true);

  const graphHasAnyEdges = initializeGraphProperties();

  if (!graphHasAnyEdges) {
    return dimensionSize;
  }
  return solve();
}

function solve() {
  let overallMaxDistancePlusOne = 0;

  for (let rowIdx = 0; rowIdx < dimensionSize; rowIdx++) {
    if (hasOutgoingEdge[rowIdx] === 0) {
      continue;
    }

    const componentMaxDistPlusOne = calculateMaxBipartiteDistance(rowIdx);

    if (componentMaxDistPlusOne === -1) {
      return -1;
    }
    if (overallMaxDistancePlusOne < componentMaxDistPlusOne) {
      overallMaxDistancePlusOne = componentMaxDistPlusOne;
    }
  }
  return overallMaxDistancePlusOne + isolatedNodesCount;
}

console.log(main());
