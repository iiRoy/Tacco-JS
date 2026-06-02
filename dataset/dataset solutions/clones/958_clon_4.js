class MinPriorityQueue {
  constructor() {
    this.heap = [];
  }

  enqueue(element) {
    this.heap.push(element);
    this._bubbleUp(this.heap.length - 1);
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const min = this.heap[0];
    const last = this.heap.pop();
    if (!this.isEmpty()) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return min;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  _bubbleUp(idx) {
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (this.heap[parentIdx][0] > this.heap[idx][0]) {
        [this.heap[parentIdx], this.heap[idx]] = [this.heap[idx], this.heap[parentIdx]];
        idx = parentIdx;
      } else {
        break;
      }
    }
  }

  _sinkDown(idx) {
    const leftChildIdx = 2 * idx + 1;
    const rightChildIdx = 2 * idx + 2;
    let smallestIdx = idx;
    const len = this.heap.length;

    if (leftChildIdx < len && this.heap[leftChildIdx][0] < this.heap[smallestIdx][0]) {
      smallestIdx = leftChildIdx;
    }
    if (rightChildIdx < len && this.heap[rightChildIdx][0] < this.heap[smallestIdx][0]) {
      smallestIdx = rightChildIdx;
    }

    if (smallestIdx !== idx) {
      [this.heap[idx], this.heap[smallestIdx]] = [this.heap[smallestIdx], this.heap[idx]];
      this._sinkDown(smallestIdx);
    }
  }
}

const inputConfiguration = { sourcePath: '/dev/stdin', lineDelimiter: '\n' };

const fileContent = require('fs').readFileSync(inputConfiguration.sourcePath, 'ascii');
const inputLines = fileContent.trim().split(inputConfiguration.lineDelimiter);

const nodeCount = Number(inputLines.shift());

const forwardEdges = new Map();
const backwardEdges = new Map();

function establishEdge(graphMap, origin, destination, cost) {
  if (!graphMap.has(origin)) {
    graphMap.set(origin, new Map());
  }
  graphMap.get(origin).set(destination, cost);
}

inputLines.forEach(lineEntry => {
  const parsedData = lineEntry.split(' ').map(Number);
  const sourceNode = parsedData[0];
  for (let k = 2; k < parsedData.length; k += 2) {
    const targetNode = parsedData[k];
    const edgeWeight = parsedData[k + 1];
    establishEdge(forwardEdges, sourceNode, targetNode, edgeWeight);
    establishEdge(backwardEdges, targetNode, sourceNode, edgeWeight);
  }
});

const nodeDistances = new Array(nodeCount).fill(Number.MAX_VALUE);
const pathQueue = new MinPriorityQueue();

nodeDistances[0] = 0;
pathQueue.enqueue([0, 0]);

while (!pathQueue.isEmpty()) {
  const [currentDistance, currentNode] = pathQueue.dequeue();

  if (currentDistance > nodeDistances[currentNode]) {
    continue;
  }

  const outgoingEdges = forwardEdges.get(currentNode);
  if (outgoingEdges) {
    for (const [neighborNode, edgeWeight] of outgoingEdges.entries()) {
      const newDistance = currentDistance + edgeWeight;
      if (newDistance < nodeDistances[neighborNode]) {
        nodeDistances[neighborNode] = newDistance;
        pathQueue.enqueue([newDistance, neighborNode]);
      }
    }
  }
}

const orderedNodes = Array.from({ length: nodeCount }, (_, idx) => idx);
orderedNodes.sort((nodeA, nodeB) => nodeDistances[nodeA] - nodeDistances[nodeB]);

const nodeRankMapping = new Map();
orderedNodes.forEach((nodeId, rank) => nodeRankMapping.set(nodeId, rank));

function findConstrainedPathValue(targetNode, currentProcessingNode, pruningThreshold) {
  const pathCostsFromTarget = new Map();
  const localPriorityQueue = new MinPriorityQueue();

  pathCostsFromTarget.set(targetNode, 0);
  localPriorityQueue.enqueue([0, targetNode]);

  let minimumOverallPath = Number.MAX_VALUE;

  while (!localPriorityQueue.isEmpty()) {
    const [currentCostFromTarget, currentNode] = localPriorityQueue.dequeue();

    if (currentCostFromTarget > (pathCostsFromTarget.get(currentNode) || Number.MAX_VALUE)) {
      continue;
    }

    if (nodeRankMapping.get(currentNode) < nodeRankMapping.get(currentProcessingNode)) {
      const potentialPath = nodeDistances[currentNode] + currentCostFromTarget;
      minimumOverallPath = Math.min(minimumOverallPath, potentialPath);
      continue;
    }

    const incomingEdges = backwardEdges.get(currentNode);
    if (incomingEdges) {
      for (const [predecessorNode, edgeWeight] of incomingEdges.entries()) {
        const newCostFromTarget = currentCostFromTarget + edgeWeight;

        if (nodeDistances[predecessorNode] !== Number.MAX_VALUE &&
            newCostFromTarget + nodeDistances[predecessorNode] >= pruningThreshold) {
            continue;
        }

        if (newCostFromTarget < (pathCostsFromTarget.get(predecessorNode) || Number.MAX_VALUE)) {
          pathCostsFromTarget.set(predecessorNode, newCostFromTarget);
          localPriorityQueue.enqueue([newCostFromTarget, predecessorNode]);
        }
      }
    }
  }
  return minimumOverallPath;
}

orderedNodes.forEach(currentU => {
  const incomingEdgesToU = backwardEdges.get(currentU);
  if (incomingEdgesToU) {
    for (const [predecessorV, weightVU] of incomingEdgesToU.entries()) {
      if (nodeRankMapping.get(predecessorV) < nodeRankMapping.get(currentU)) {
        const edgeWeightUV = forwardEdges.get(predecessorV).get(currentU);
        nodeDistances[currentU] = Math.min(nodeDistances[currentU], nodeDistances[predecessorV] + edgeWeightUV);
      }
    }

    for (const [predecessorV, weightVU] of incomingEdgesToU.entries()) {
      if (nodeRankMapping.get(predecessorV) > nodeRankMapping.get(currentU)) {
        const edgeWeightUV = forwardEdges.get(predecessorV).get(currentU);
        const currentPathToUThroughV = nodeDistances[currentU] - edgeWeightUV;
        const constrainedPathToV = findConstrainedPathValue(predecessorV, currentU, currentPathToUThroughV);
        nodeDistances[currentU] = Math.min(nodeDistances[currentU], constrainedPathToV + edgeWeightUV);
      }
    }
  }
});

for (let i = 0; i < nodeCount; i++) {
  console.log(`${i} ${nodeDistances[i]}`);
}
