'use strict';

function solutionFinder(rawData) {
  const lineSegments = rawData.split('\n');
  const dimensionInfo = lineSegments.shift().split(' ').map((val) => parseInt(val, 10));
  const totalNodes = dimensionInfo[0];
  const totalEdges = dimensionInfo[1];

  let adjacencyMap = Array(totalNodes).fill(0).map(() => Array(totalNodes).fill(0));
  for (let edgeDescription of lineSegments) {
    const edgePoints = edgeDescription.split(' ').map((val) => parseInt(val, 10));
    const endpointA = edgePoints[0];
    const endpointB = edgePoints[1];

    adjacencyMap[endpointA - 1][endpointB - 1] = 1;
    adjacencyMap[endpointB - 1][endpointA - 1] = 1;
  }

  let finalCount = 0;
  const explorationQueue = []; // Stores [currentVertexIndex, visitedNodeMask]

  // Initialize with starting node (node 0), marking it as visited in the mask
  explorationQueue.push([0, 1 << 0]); // current node index, bitmask of visited nodes

  while (explorationQueue.length > 0) {
    const [currentPosition, currentVisitedMask] = explorationQueue.pop();

    // Check if all nodes have been visited in this particular path
    // (1 << totalNodes) - 1 creates a bitmask with all 'totalNodes' bits set to 1
    if (currentVisitedMask === (1 << totalNodes) - 1) {
      finalCount++;
      continue; // This path is complete, no need to extend further
    }

    // Iterate through all possible next nodes
    for (let nextPosition = 0; nextPosition < totalNodes; nextPosition++) {
      // Check if there's an edge between currentPosition and nextPosition
      // AND if nextPosition has NOT been visited in the current path (using bitmask)
      if (adjacencyMap[currentPosition][nextPosition] === 1 && !(currentVisitedMask & (1 << nextPosition))) {
        // Push the new state onto the queue for further exploration
        explorationQueue.push([nextPosition, currentVisitedMask | (1 << nextPosition)]);
      }
    }
  }

  console.log(finalCount);
}

solutionFinder(require('fs').readFileSync('/dev/stdin', 'utf8'));