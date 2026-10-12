var inputBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
  inputBuffer += chunk;
});
process.stdin.on('end', function () {
  const lines = inputBuffer.split('\n');
  processGraphData(lines);
});

class MinPriorityQueue {
  constructor() {
    this.heap = [];
  }

  push(item) {
    this.heap.push(item);
    this._bubbleUp();
  }

  pop() {
    if (this.isEmpty()) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop();
    if (!this.isEmpty()) {
      this.heap[0] = last;
      this._sinkDown();
    }
    return min;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  _bubbleUp() {
    let currentIdx = this.heap.length - 1;
    while (currentIdx > 0) {
      let parentIdx = Math.floor((currentIdx - 1) / 2);
      if (this.heap[parentIdx].priority <= this.heap[currentIdx].priority) break;
      [this.heap[parentIdx], this.heap[currentIdx]] = [this.heap[currentIdx], this.heap[parentIdx]];
      currentIdx = parentIdx;
    }
  }

  _sinkDown() {
    let currentIdx = 0;
    const totalLength = this.heap.length;
    const element = this.heap[0];
    while (true) {
      let leftChildIdx = 2 * currentIdx + 1;
      let rightChildIdx = 2 * currentIdx + 2;
      let swapIdx = null;
      let leftChild, rightChild;

      if (leftChildIdx < totalLength) {
        leftChild = this.heap[leftChildIdx];
        if (leftChild.priority < element.priority) {
          swapIdx = leftChildIdx;
        }
      }

      if (rightChildIdx < totalLength) {
        rightChild = this.heap[rightChildIdx];
        if (
          (swapIdx === null && rightChild.priority < element.priority) ||
          (swapIdx !== null && rightChild.priority < leftChild.priority)
        ) {
          swapIdx = rightChildIdx;
        }
      }

      if (swapIdx === null) break;
      [this.heap[currentIdx], this.heap[swapIdx]] = [this.heap[swapIdx], this.heap[currentIdx]];
      currentIdx = swapIdx;
    }
  }
}

function computeShortestPaths(initialNode, graphStructure, totalNodes) {
  const pathCosts = new Array(totalNodes).fill(Infinity);
  pathCosts[initialNode] = 0;

  const pq = new MinPriorityQueue();
  pq.push({ node: initialNode, priority: 0 });

  while (!pq.isEmpty()) {
    const { node: currentNode, priority: currentCost } = pq.pop();

    if (currentCost > pathCosts[currentNode]) continue;

    const neighbors = graphStructure.get(currentNode) || [];
    for (const { target: neighborNode, weight: edgeWeight } of neighbors) {
      const newCost = currentCost + edgeWeight;
      if (newCost < pathCosts[neighborNode]) {
        pathCosts[neighborNode] = newCost;
        pq.push({ node: neighborNode, priority: newCost });
      }
    }
  }
  return pathCosts;
}

function processGraphData(inputLines) {
  const firstLineParts = inputLines[0].split(' ').map(Number);
  const nodeCount = firstLineParts[0];
  const edgeCount = firstLineParts[1];
  const startPoint = firstLineParts[2] - 1;
  const goalOne = firstLineParts[3] - 1;
  const goalTwo = firstLineParts[4] - 1;

  const forwardGraph = new Map();
  const backwardGraph = new Map();

  for (let idx = 0; idx < nodeCount; idx++) {
    forwardGraph.set(idx, []);
    backwardGraph.set(idx, []);
  }

  for (let idx = 1; idx <= edgeCount; idx++) {
    const edgeDetails = inputLines[idx].split(' ').map(Number);
    const sourceNode = edgeDetails[0] - 1;
    const destinationNode = edgeDetails[1] - 1;
    const edgeWeight = edgeDetails[2];

    forwardGraph.get(sourceNode).push({ target: destinationNode, weight: edgeWeight });
    backwardGraph.get(destinationNode).push({ target: sourceNode, weight: edgeWeight });
  }

  const distancesFromStart = computeShortestPaths(startPoint, forwardGraph, nodeCount);
  const distancesToGoalOne = computeShortestPaths(goalOne, backwardGraph, nodeCount);
  const distancesToGoalTwo = computeShortestPaths(goalTwo, backwardGraph, nodeCount);

  let minimumTotalPath = Infinity;

  for (let meetingPoint = 0; meetingPoint < nodeCount; meetingPoint++) {
    const currentPathSum = distancesFromStart[meetingPoint] + distancesToGoalOne[meetingPoint] + distancesToGoalTwo[meetingPoint];
    minimumTotalPath = Math.min(minimumTotalPath, currentPathSum);
  }

  console.log(minimumTotalPath);
}
