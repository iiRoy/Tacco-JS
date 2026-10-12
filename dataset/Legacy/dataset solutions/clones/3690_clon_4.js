class MinHeap {
  constructor() {
    this.heapArray = [];
  }

  insert(item) {
    let currentPosition = this.heapArray.length;
    this.heapArray.push(item);

    while (currentPosition > 0) {
      const parentPosition = Math.floor((currentPosition - 1) / 2);
      if (this.heapArray[parentPosition].distance <= item.distance) {
        break;
      }
      [this.heapArray[currentPosition], this.heapArray[parentPosition]] = [this.heapArray[parentPosition], this.heapArray[currentPosition]];
      currentPosition = parentPosition;
    }
  }

  extractMin() {
    const currentLength = this.heapArray.length;
    if (currentLength === 0) return undefined;
    if (currentLength === 1) {
      return this.heapArray.pop().node;
    }

    const minimumElement = this.heapArray[0];
    this.heapArray[0] = this.heapArray.pop();

    let currentPosition = 0;

    while (true) {
      const leftChildPosition = 2 * currentPosition + 1;
      const rightChildPosition = 2 * currentPosition + 2;
      let smallestChildPosition = currentPosition;

      if (leftChildPosition < this.heapArray.length && this.heapArray[leftChildPosition].distance < this.heapArray[smallestChildPosition].distance) {
        smallestChildPosition = leftChildPosition;
      }
      if (rightChildPosition < this.heapArray.length && this.heapArray[rightChildPosition].distance < this.heapArray[smallestChildPosition].distance) {
        smallestChildPosition = rightChildPosition;
      }

      if (smallestChildPosition === currentPosition) {
        break;
      }

      [this.heapArray[currentPosition], this.heapArray[smallestChildPosition]] = [this.heapArray[smallestChildPosition], this.heapArray[currentPosition]];
      currentPosition = smallestChildPosition;
    }

    return minimumElement.node;
  }

  get size() {
    return this.heapArray.length;
  }
}

function computeShortestPaths(sourceNodes, targetNodes, edgeWeights, initialNode, totalNodes) {
  const adjacencyList = Array.from({ length: totalNodes }, () => []);
  for (let edgeIndex = 0; edgeIndex < sourceNodes.length; ++edgeIndex) {
    adjacencyList[sourceNodes[edgeIndex]].push({ neighbor: targetNodes[edgeIndex], weight: edgeWeights[edgeIndex] });
    adjacencyList[targetNodes[edgeIndex]].push({ neighbor: sourceNodes[edgeIndex], weight: edgeWeights[edgeIndex] });
  }

  const minDistances = Array(totalNodes).fill(Infinity);
  minDistances[initialNode] = 0;
  const visitedNodes = Array(totalNodes).fill(0);

  const pathQueue = new MinHeap();
  pathQueue.insert({ node: initialNode, distance: 0 });

  while (pathQueue.size > 0) {
    const currentVertex = pathQueue.extractMin();

    if (visitedNodes[currentVertex]) continue;
    visitedNodes[currentVertex] = 1;

    for (const { neighbor, weight } of adjacencyList[currentVertex]) {
      const newDistance = minDistances[currentVertex] + weight;
      if (minDistances[neighbor] > newDistance) {
        minDistances[neighbor] = newDistance;
        pathQueue.insert({ node: neighbor, distance: newDistance });
      }
    }
  }
  return minDistances;
}

function processGraphData(inputString) {
  const lines = inputString.split("\n");
  const [nodeCount, edgeCount, startNodeA, startNodeB] = lines[0].split(" ").map(Number);

  const edgeSources = [];
  const edgeTargets = [];
  const weightSetA = [];
  const weightSetB = [];

  for (let i = 0; i < edgeCount; ++i) {
    const [uVal, vVal, aVal, bVal] = lines[i + 1].split(" ").map(Number);
    edgeSources[i] = uVal - 1;
    edgeTargets[i] = vVal - 1;
    weightSetA[i] = aVal;
    weightSetB[i] = bVal;
  }

  const distancesFromA = computeShortestPaths(edgeSources, edgeTargets, weightSetA, startNodeA - 1, nodeCount);
  const distancesFromB = computeShortestPaths(edgeSources, edgeTargets, weightSetB, startNodeB - 1, nodeCount);

  const intermediateValues = Array(nodeCount);
  for (let idx = 0; idx < nodeCount; ++idx) {
    intermediateValues[idx] = 1e15 - distancesFromA[idx] - distancesFromB[idx];
  }

  const finalResults = Array(nodeCount);
  let currentMaxSuffix = -Infinity;

  for (let idx = nodeCount - 1; idx >= 0; --idx) {
    currentMaxSuffix = Math.max(currentMaxSuffix, intermediateValues[idx]);
    finalResults[idx] = currentMaxSuffix;
  }
  console.log(finalResults.join("\n"));
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
