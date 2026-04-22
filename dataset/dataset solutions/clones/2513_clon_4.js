class InputParser {
  #sourceSegments;
  #currentSegmentIndex = 0;
  #segmentTokens = null;

  constructor(sourceText) {
    this.#sourceSegments = sourceText.trim().split("\n");
  }

  extractToken(returnAsString) {
    if (this.#segmentTokens === null || this.#segmentTokens.length === 0) {
      if (this.#currentSegmentIndex >= this.#sourceSegments.length) {
        return undefined;
      }
      this.#segmentTokens = this.#sourceSegments[this.#currentSegmentIndex].split(" ");
    }

    const tokenValue = this.#segmentTokens.shift();

    if (this.#segmentTokens.length === 0) {
      this.#segmentTokens = null;
      this.#currentSegmentIndex++;
    }

    return returnAsString ? tokenValue : +tokenValue;
  }

  extractSegments(count, returnAsString) {
    const extractedItems = [];
    for (let i = 0; i < count; i++) {
      if (this.#currentSegmentIndex >= this.#sourceSegments.length) break;
      const segment = this.#sourceSegments[this.#currentSegmentIndex];
      extractedItems.push(returnAsString ? segment : +segment);
      this.#currentSegmentIndex++;
    }
    this.#segmentTokens = null;
    return extractedItems;
  }
}

function constructNestedArray(initialValue, ...dimensions) {
  const recursiveArrayBuilder = (value, remainingDimensions) => {
    if (remainingDimensions.length === 0) {
      return value;
    }
    const currentDimensionSize = remainingDimensions[0];
    const nextDimensions = remainingDimensions.slice(1);
    return Array.from({ length: currentDimensionSize }, () => recursiveArrayBuilder(value, nextDimensions));
  };
  return recursiveArrayBuilder(initialValue, dimensions);
}

let nodeTotal;
let graphConnections;
let nodeConnectivity;
let isolatedNodeCount = 0;

function processGraph() {
  const dataHandler = new InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

  nodeTotal = dataHandler.extractToken();
  graphConnections = dataHandler.extractSegments(nodeTotal, true);
  nodeConnectivity = constructNestedArray(0, nodeTotal);

  let globalConnectionExists = 0;

  for (let currentNodeIndex = 0; currentNodeIndex < nodeTotal; currentNodeIndex++) {
    let nodeRowConnected = false;
    for (let currentNeighborIndex = 0; currentNeighborIndex < nodeTotal; currentNeighborIndex++) {
      if (graphConnections[currentNodeIndex][currentNeighborIndex] === "1") {
        globalConnectionExists = 1;
        nodeConnectivity[currentNodeIndex] = 1;
        nodeRowConnected = true;
        break;
      }
    }
    if (!nodeRowConnected) {
      isolatedNodeCount++;
    }
  }

  if (globalConnectionExists === 0) {
    return nodeTotal;
  }
  return determineGraphProperty();
}

function determineGraphProperty() {
  let maximumDepth = 0;

  for (let sourceNode = 0; sourceNode < nodeTotal; sourceNode++) {
    if (nodeConnectivity[sourceNode] === 0) {
      continue;
    }

    const pathLengths = constructNestedArray(-1, nodeTotal);
    pathLengths[sourceNode] = 0;

    let currentExplorationQueue = [];

    for (let adjacentNode = 0; adjacentNode < nodeTotal; adjacentNode++) {
      if (graphConnections[sourceNode][adjacentNode] === "1") {
        pathLengths[adjacentNode] = 1;
        currentExplorationQueue.push(adjacentNode);
      }
    }

    let currentTraversalDepth = 1;

    while (currentExplorationQueue.length > 0) {
      let nextExplorationQueue = [];
      while (currentExplorationQueue.length > 0) {
        const processedNode = currentExplorationQueue.pop();

        for (let adjacentNode = 0; adjacentNode < nodeTotal; adjacentNode++) {
          if (graphConnections[processedNode][adjacentNode] === "0") {
            continue;
          }

          if (pathLengths[adjacentNode] === -1) {
            pathLengths[adjacentNode] = currentTraversalDepth + 1;
            nextExplorationQueue.push(adjacentNode);
          } else if (pathLengths[adjacentNode] !== currentTraversalDepth - 1 && pathLengths[adjacentNode] !== currentTraversalDepth + 1) {
            return -1;
          }
        }
      }
      currentTraversalDepth++;
      currentExplorationQueue = nextExplorationQueue;
    }

    if (maximumDepth < currentTraversalDepth) {
      maximumDepth = currentTraversalDepth;
    }
  }
  return maximumDepth + isolatedNodeCount;
}

console.log(processGraph());