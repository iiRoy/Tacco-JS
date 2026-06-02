let adjList = [];
let nodeCount, edgeCount;

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputData) {
  const inputLines = inputData.split('\n');

  for (let lineIndex = 0; lineIndex < inputLines.length; ++lineIndex) {
    if (lineIndex === 0) {
      const graphDimensions = inputLines[lineIndex].split(' ').map(Number);
      nodeCount = graphDimensions[0];
      edgeCount = graphDimensions[1];

      for (let vertexIndex = 0; vertexIndex < nodeCount; ++vertexIndex) {
        adjList[vertexIndex] = [];
      }
    } else {
      const connectionDetails = inputLines[lineIndex].split(' ').map(Number);
      establishConnection(connectionDetails[0], connectionDetails[1], connectionDetails[2]);
    }
  }

  console.log(computeMaxFlow(0, nodeCount - 1));
});

function establishConnection(sourceNode, targetNode, capacityValue) {
  adjList[sourceNode].push({
    targetNode: targetNode,
    capacityValue: capacityValue,
    reverseEdgeIndex: adjList[targetNode].length
  });
  adjList[targetNode].push({
    targetNode: sourceNode,
    capacityValue: 0,
    reverseEdgeIndex: adjList[sourceNode].length - 1
  });
}

function findAugmentingPathBFS(startNode, endNode, predecessorEdgeIndices, predecessorNodes) {
  const traversalQueue = [];
  traversalQueue.push(startNode);

  predecessorEdgeIndices[startNode] = -2;
  predecessorNodes[startNode] = -2;

  const pathCapacities = new Array(nodeCount).fill(0);
  pathCapacities[startNode] = Number.POSITIVE_INFINITY;

  let head = 0;
  while (head < traversalQueue.length) {
    const currentNode = traversalQueue[head++];

    if (currentNode === endNode) {
      return pathCapacities[endNode];
    }

    for (let i = 0; i < adjList[currentNode].length; ++i) {
      const currentEdge = adjList[currentNode][i];
      if (predecessorEdgeIndices[currentEdge.targetNode] === -1 && currentEdge.capacityValue > 0) {
        predecessorEdgeIndices[currentEdge.targetNode] = i;
        predecessorNodes[currentEdge.targetNode] = currentNode;
        pathCapacities[currentEdge.targetNode] = Math.min(pathCapacities[currentNode], currentEdge.capacityValue);
        traversalQueue.push(currentEdge.targetNode);
      }
    }
  }
  return 0;
}

function computeMaxFlow(entryNode, exitNode) {
  let totalFlow = 0;
  let predecessorEdgeIndices;
  let predecessorNodes;

  while (true) {
    predecessorEdgeIndices = new Array(nodeCount).fill(-1);
    predecessorNodes = new Array(nodeCount).fill(-1);

    const pathCapacity = findAugmentingPathBFS(entryNode, exitNode, predecessorEdgeIndices, predecessorNodes);

    if (pathCapacity === 0) {
      break;
    }

    totalFlow += pathCapacity;

    let currentNode = exitNode;
    while (currentNode !== entryNode) {
      const previousNode = predecessorNodes[currentNode];
      const edgeIndex = predecessorEdgeIndices[currentNode];
      const forwardEdge = adjList[previousNode][edgeIndex];

      forwardEdge.capacityValue -= pathCapacity;
      adjList[forwardEdge.targetNode][forwardEdge.reverseEdgeIndex].capacityValue += pathCapacity;

      currentNode = previousNode;
    }
  }
  return totalFlow;
}
