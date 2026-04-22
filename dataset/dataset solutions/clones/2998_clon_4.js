const acquireInput = (function() {
  function InputProcessor(sourceTextContent) {
    this.rawLines = sourceTextContent.trim().split("\n");
    this.currentLineIndex = 0;
    this.processedTokens = [];
  }

  InputProcessor.prototype._ensureCurrentLineTokens = function() {
    if (this.processedTokens.length === 0 && this.currentLineIndex < this.rawLines.length) {
      this.processedTokens = this.rawLines[this.currentLineIndex].split(" ");
    }
  };

  InputProcessor.prototype.fetchScalar = function(asString = false) {
    this._ensureCurrentLineTokens();
    const tokenValue = this.processedTokens.shift();
    if (this.processedTokens.length === 0) {
      this.currentLineIndex++;
    }
    return asString ? tokenValue : Number(tokenValue);
  };

  InputProcessor.prototype.fetchLine = function(asString = false) {
    const lineContent = this.rawLines[this.currentLineIndex++];
    this.processedTokens = [];
    const tokens = lineContent.split(" ");
    return asString ? tokens : tokens.map(Number);
  };

  InputProcessor.prototype.fetchMatrix = function(rowsCount, asString = false) {
    const matrixData = [];
    for (let i = 0; i < rowsCount; i++) {
      const lineContent = this.rawLines[this.currentLineIndex++];
      this.processedTokens = [];
      const tokens = lineContent.split(" ");
      matrixData.push(asString ? tokens : tokens.map(Number));
    }
    return matrixData;
  };

  InputProcessor.prototype.fetchColumn = function(elementsCount, asString = false) {
    const columnElements = [];
    for (let i = 0; i < elementsCount; i++) {
      const lineContent = this.rawLines[this.currentLineIndex++];
      this.processedTokens = [];
      columnElements.push(asString ? lineContent : Number(lineContent));
    }
    return columnElements;
  };

  return function(inputSource) {
    return new InputProcessor(inputSource);
  };
})();

const buildNestedCollection = (leafValueDefinition, ...dimensions) => {
  const createLeafInstance = () => {
    if (typeof leafValueDefinition === 'string') {
      try {
        return JSON.parse(leafValueDefinition);
      } catch (e) {
        return (new Function(`return ${leafValueDefinition}`))();
      }
    }
    return leafValueDefinition;
  };

  const constructRecursive = (remainingDimensions) => {
    if (remainingDimensions.length === 0) {
      return createLeafInstance();
    }
    const currentDimensionSize = remainingDimensions[0];
    const nextDimensions = remainingDimensions.slice(1);
    return Array.from({ length: currentDimensionSize }, () => constructRecursive(nextDimensions));
  };
  return constructRecursive(dimensions);
};

class VertexQueue {
  constructor() {
    this.elements = [];
    this.front = 0;
  }
  offer(item) {
    this.elements.push(item);
  }
  poll() {
    if (this.front < this.elements.length) {
      return this.elements[this.front++];
    }
    return undefined;
  }
  isEmpty() {
    return this.front >= this.elements.length;
  }
}

const locateFarthestNode = (startVertexIdentifier, graphConnections) => {
  const totalVertices = graphConnections.length;
  const distances = new Array(totalVertices).fill(-1);
  const searchQueue = new VertexQueue();

  searchQueue.offer(startVertexIdentifier);
  distances[startVertexIdentifier] = 0;

  let mostDistantVertex = startVertexIdentifier;
  let maximumDistance = 0;

  while (!searchQueue.isEmpty()) {
    const currentVertex = searchQueue.poll();
    const currentPathLength = distances[currentVertex];

    if (currentPathLength > maximumDistance) {
      maximumDistance = currentPathLength;
      mostDistantVertex = currentVertex;
    }

    for (const adjacentVertex of graphConnections[currentVertex]) {
      if (distances[adjacentVertex] === -1) {
        distances[adjacentVertex] = currentPathLength + 1;
        searchQueue.offer(adjacentVertex);
      }
    }
  }
  return { farthest: mostDistantVertex, distance: maximumDistance };
};

const solutionEntry = () => {
  const stream = acquireInput(require("fs").readFileSync("/dev/stdin", "utf8"));

  const nodeCountValue = stream.fetchScalar();
  const identityVector = buildNestedCollection(1, nodeCountValue); // Unused, but cloned
  const graphAdjacencyList = buildNestedCollection("[]", nodeCountValue);

  for (let edgeIterator = 1; edgeIterator < nodeCountValue; edgeIterator++) {
    const edgeEndpoints = stream.fetchLine().map(idx => idx - 1);
    graphAdjacencyList[edgeEndpoints[0]].push(edgeEndpoints[1]);
    graphAdjacencyList[edgeEndpoints[1]].push(edgeEndpoints[0]);
  }

  const firstTraversal = locateFarthestNode(0, graphAdjacencyList);
  const secondTraversal = locateFarthestNode(firstTraversal.farthest, graphAdjacencyList);
  const graphSpan = secondTraversal.distance;

  return graphSpan % 3 === 1 ? "Second" : "First";
};

console.log(solutionEntry());