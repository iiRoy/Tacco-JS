class InputParser {
  constructor(sourceString) {
    this._sourceLines = sourceString.trim().split("\n");
    this._currentLineIndex = 0;
  }

  _toNumber(value) {
    return +value;
  }

  readReversedInt(returnAsString = false) {
    let currentLineParts = this._sourceLines[this._currentLineIndex];
    if (typeof currentLineParts === "string") {
      this._sourceLines[this._currentLineIndex] = currentLineParts
        .split(" ")
        .reverse();
    }
    let extractedValue = this._sourceLines[this._currentLineIndex].pop();
    if (!this._sourceLines[this._currentLineIndex].length) {
      this._currentLineIndex++;
    }
    return returnAsString ? extractedValue : this._toNumber(extractedValue);
  }

  readLine(returnAsString = false) {
    let lineParts = this._sourceLines[this._currentLineIndex++].split(" ");
    return returnAsString ? lineParts : lineParts.map(this._toNumber);
  }

  readMatrix(numRows, returnAsString = false) {
    let matrixRows = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numRows)
    );
    let parsedMatrix = matrixRows.map((row) => row.split(" "));
    return returnAsString
      ? parsedMatrix
      : parsedMatrix.map((row) => row.map(this._toNumber));
  }

  readLinesAsNumbers(numLines, returnAsString = false) {
    let linesData = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numLines)
    );
    return returnAsString ? linesData : linesData.map(this._toNumber);
  }
}

function createMultiDimArray(initialValue, ...dimensions) {
  if (dimensions.length === 0) {
    return initialValue;
  }

  const currentDimensionSize = dimensions[0];
  const remainingDimensions = dimensions.slice(1);

  return Array(currentDimensionSize)
    .fill(null)
    .map(() => createMultiDimArray(initialValue, ...remainingDimensions));
}

var nodeCount, edgeCount, adjList;

var inputReader = new InputParser(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

console.log(processGraph());

function processGraph() {
  nodeCount = inputReader.readReversedInt();
  edgeCount = inputReader.readReversedInt();
  var edges = inputReader.readMatrix(edgeCount);

  function buildAdjacencyList(numNodes, edgeData) {
    let list = createMultiDimArray("[]", numNodes);
    for (let k = 0; k < edgeData.length; k++) {
      list[edgeData[k][0] - 1].push(edgeData[k][1] - 1);
    }
    return list;
  }

  adjList = buildAdjacencyList(nodeCount, edges);

  const initialShortestCycleLength = nodeCount + 1;
  var shortestCycle = Array(initialShortestCycleLength);

  for (let i = 0; i < nodeCount; i++) {
    var currentCycle = findCycleFromNode(i);
    if (currentCycle && currentCycle.length < shortestCycle.length) {
      shortestCycle = currentCycle;
    }
  }

  if (shortestCycle.length === initialShortestCycleLength) {
    return -1;
  }

  console.log(shortestCycle.length);
  return shortestCycle.join("\n");
}

function findCycleFromNode(startNode) {
  var parentMap = createMultiDimArray(-1, nodeCount);
  var queue = [startNode];

  while (queue.length > 0) {
    var nextQueue = [];
    while (queue.length > 0) {
      var currentNode = queue.pop();

      for (var neighborNode of adjList[currentNode]) {
        if (neighborNode === startNode) {
          return reconstructCyclePath(startNode, currentNode, parentMap);
        }

        if (parentMap[neighborNode] !== -1) {
          continue;
        }

        parentMap[neighborNode] = currentNode;
        nextQueue.push(neighborNode);
      }
    }
    queue = nextQueue;
  }
  return null;
}

function reconstructCyclePath(cycleStartNode, cycleEndNodeParent, parentTracker) {
  var path = [cycleStartNode + 1];
  var walker = cycleEndNodeParent;

  while (walker !== cycleStartNode) {
    path.push(walker + 1);
    walker = parentTracker[walker];
  }
  return path;
}
