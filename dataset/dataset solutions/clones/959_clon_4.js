const programConfig = { dataPath: 'tmp', lineBreak: '\r\n' };
//const programConfig = { dataPath: '/dev/stdin', lineBreak: '\n' };

const verifier = (condition, message = 'Assertion Failed') => {
  if (!condition) {
    throw new Error(message);
  }
};

const rawInputData = require('fs').readFileSync(programConfig.dataPath, 'ascii');
const inputSegments = rawInputData.trim().split(programConfig.lineBreak);
const nodeCount = Number(inputSegments.shift());

const forwardGraph = Array.from({ length: nodeCount }, () => []);
const backwardGraph = Array.from({ length: nodeCount }, () => []);

const linkNodes = (graphCollection, origin, destination, weight) => {
  graphCollection[origin].push({ destination, weight });
};

for (let currentLine of inputSegments) {
  const numericalParts = currentLine.split(' ').map(Number);
  const mainNode = numericalParts[0];
  for (let k = 2; k < numericalParts.length; k += 2) {
    linkNodes(forwardGraph, mainNode, numericalParts[k], numericalParts[k + 1]);
    linkNodes(backwardGraph, numericalParts[k], mainNode, numericalParts[k + 1]);
  }
}

verifier(forwardGraph.length > 0, 'Forward graph not populated.');
verifier(backwardGraph.length > 0, 'Backward graph not populated.');

class MinPriorityQueue {
  constructor() {
    this.elements = [];
  }

  enqueue(item, priority) {
    this.elements.push({ item, priority });
    this.bubbleUp();
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const min = this.elements[0];
    const last = this.elements.pop();
    if (!this.isEmpty()) {
      this.elements[0] = last;
      this.bubbleDown();
    }
    return min;
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  bubbleUp() {
    let index = this.elements.length - 1;
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.elements[parentIndex].priority > this.elements[index].priority) {
        [this.elements[parentIndex], this.elements[index]] = [this.elements[index], this.elements[parentIndex]];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  bubbleDown() {
    let index = 0;
    const lastIndex = this.elements.length - 1;
    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let smallestIndex = index;

      if (leftChildIndex <= lastIndex && this.elements[leftChildIndex].priority < this.elements[smallestIndex].priority) {
        smallestIndex = leftChildIndex;
      }

      if (rightChildIndex <= lastIndex && this.elements[rightChildIndex].priority < this.elements[smallestIndex].priority) {
        smallestIndex = rightChildIndex;
      }

      if (smallestIndex !== index) {
        [this.elements[index], this.elements[smallestIndex]] = [this.elements[smallestIndex], this.elements[index]];
        index = smallestIndex;
      } else {
        break;
      }
    }
  }
}

const shortestPathWeights = new Array(nodeCount).fill(Number.MAX_VALUE);
const startingPoint = 0; 
shortestPathWeights[startingPoint] = 0;

const pathQueue = new MinPriorityQueue();
pathQueue.enqueue(startingPoint, 0);

while (!pathQueue.isEmpty()) {
  const { item: currentNodeId, priority: currentDistanceDequeued } = pathQueue.dequeue(); 

  if (currentDistanceDequeued > shortestPathWeights[currentNodeId]) {
    continue;
  }
  
  for (const connection of forwardGraph[currentNodeId]) {
    const candidatePathValue = currentDistanceDequeued + connection.weight;
    if (candidatePathValue < shortestPathWeights[connection.destination]) {
      shortestPathWeights[connection.destination] = candidatePathValue;
      pathQueue.enqueue(connection.destination, candidatePathValue);
    }
  }
}

verifier(shortestPathWeights.some(val => val !== Number.MAX_VALUE), 'Shortest path weights not calculated.');

const sortedNodeIdentifiers = Array.from({ length: nodeCount }, (_, i) => i);
sortedNodeIdentifiers.sort((a, b) => shortestPathWeights[a] - shortestPathWeights[b]);

const identifierOrderMap = new Array(nodeCount);
for (let i = 0; i < nodeCount; i++) {
  identifierOrderMap[sortedNodeIdentifiers[i]] = i;
}

verifier(sortedNodeIdentifiers.length > 0, 'Sorted node identifiers not created.');
verifier(identifierOrderMap.length > 0, 'Identifier order map not created.');

const recursivePathTraversal = (
  explorationNode,        
  primaryTargetNode,      
  pathAccumulatedWeight,  
  costLimit,              
  nodesInCurrentPath      
) => {
  if (identifierOrderMap[explorationNode] < identifierOrderMap[primaryTargetNode]) {
    return shortestPathWeights[explorationNode] + pathAccumulatedWeight;
  }

  if (pathAccumulatedWeight >= costLimit) {
    return Number.MAX_VALUE;
  }

  nodesInCurrentPath.add(explorationNode); 

  let minimalPathSegment = Number.MAX_VALUE;

  for (const inboundConnection of backwardGraph[explorationNode]) {
    const previousNode = inboundConnection.destination;
    const connectionCost = inboundConnection.weight;

    if (nodesInCurrentPath.has(previousNode)) {
      continue; 
    }

    const potentialPathValue = recursivePathTraversal(
      previousNode,
      primaryTargetNode,
      pathAccumulatedWeight + connectionCost,
      costLimit,
      nodesInCurrentPath
    );
    minimalPathSegment = Math.min(minimalPathSegment, potentialPathValue);
  }

  nodesInCurrentPath.delete(explorationNode); 
  return minimalPathSegment;
};


for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
  const currentFocalNode = sortedNodeIdentifiers[nodeIndex];

  for (const inboundConnection of backwardGraph[currentFocalNode]) {
    const predecessor = inboundConnection.destination;
    const edgeWeight = inboundConnection.weight;
    if (identifierOrderMap[predecessor] < identifierOrderMap[currentFocalNode]) {
      shortestPathWeights[currentFocalNode] = Math.min(
        shortestPathWeights[currentFocalNode],
        shortestPathWeights[predecessor] + edgeWeight
      );
    }
  }

  for (const inboundConnection of backwardGraph[currentFocalNode]) {
    const predecessorNode = inboundConnection.destination;
    const edgeWeightToFocal = inboundConnection.weight;

    if (identifierOrderMap[predecessorNode] > identifierOrderMap[currentFocalNode]) {
      const pathSearchLimit = shortestPathWeights[currentFocalNode] - edgeWeightToFocal;
      
      const visitedForThisSearch = new Set();
      visitedForThisSearch.add(currentFocalNode);
      visitedForThisSearch.add(predecessorNode);

      const alternativePathResult = recursivePathTraversal(
        predecessorNode,
        currentFocalNode,
        0, 
        pathSearchLimit,
        visitedForThisSearch
      );

      if (alternativePathResult !== Number.MAX_VALUE) {
        shortestPathWeights[currentFocalNode] = Math.min(
          shortestPathWeights[currentFocalNode],
          alternativePathResult + edgeWeightToFocal 
        );
      }
    }
  }
}

for (let i = 0; i < nodeCount; i++) {
  console.log(i + ' ' + shortestPathWeights[i]);
}