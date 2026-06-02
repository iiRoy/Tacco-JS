var inputBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  inputBuffer += dataChunk;
});
process.stdin.on('end', function() {
  executeMainLogic();
});

function executeMainLogic() {
  const inputLines = inputBuffer.split('\n');

  const firstLineParts = inputLines[0].split(' ');
  const numNodes = parseInt(firstLineParts[0], 10);
  const numEdges = parseInt(firstLineParts[1], 10);
  const initialHeight = parseInt(firstLineParts[2], 10);

  const nodeHeights = new Array(numNodes);
  const adjacencyList = new Array(numNodes);
  const visitedStates = new Array(numNodes);
  const searchQueue = [];

  for (let nodeIdx = 0; nodeIdx < numNodes; nodeIdx++) {
    nodeHeights[nodeIdx] = parseInt(inputLines[nodeIdx + 1], 10);
    adjacencyList[nodeIdx] = [];
    visitedStates[nodeIdx] = [];
  }

  const allGraphEdges = new Array(numEdges);
  for (let edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
    const edgeDataParts = inputLines[edgeIdx + numNodes + 1].split(' ');
    const nodeA = parseInt(edgeDataParts[0], 10) - 1;
    const nodeB = parseInt(edgeDataParts[1], 10) - 1;
    const edgeCost = parseInt(edgeDataParts[2], 10);

    adjacencyList[nodeA].push({
      target: nodeB,
      cost: edgeCost
    });
    adjacencyList[nodeB].push({
      target: nodeA,
      cost: edgeCost
    });
    allGraphEdges[edgeIdx] = [nodeA, nodeB, edgeCost];
  }

  function calculateShortestPathsBellmanFord(vertexCount, startNode, graphEdges) {
    const distances = new Array(vertexCount);
    for (let vtx = 0; vtx < vertexCount; vtx++) {
      distances[vtx] = Number.POSITIVE_INFINITY;
    }
    distances[startNode] = 0;

    let hasUpdated = true;
    while (hasUpdated) {
      hasUpdated = false;
      for (let edgeIndex = 0; edgeIndex < graphEdges.length; edgeIndex++) {
        const [u, v, weight] = graphEdges[edgeIndex]; // Destructuring assignment

        // Relax edge (u, v)
        if (distances[v] > distances[u] + weight && nodeHeights[v] >= weight) {
          distances[v] = distances[u] + weight;
          hasUpdated = true;
        }
        // Relax edge (v, u)
        if (distances[u] > distances[v] + weight && nodeHeights[u] >= weight) {
          distances[u] = distances[v] + weight;
          hasUpdated = true;
        }
      }
    }
    return distances;
  }

  const minTravelTimesToTarget = calculateShortestPathsBellmanFord(numNodes, numNodes - 1, allGraphEdges);

  function determineNextSearchNode(currentSearchState, edgeConnection, allNodeHeights) {
    const nextPosition = edgeConnection.target;
    const traversalCost = edgeConnection.cost;
    let newTimeElapsed, newCurrentHeight;

    const nextNodeHeight = allNodeHeights[nextPosition];
    const currentHeightOfNode = currentSearchState.currentHeight;
    const currentTime = currentSearchState.timeElapsed;

    if (nextNodeHeight + traversalCost < currentHeightOfNode) {
      // Case 1: Next node's height plus edge cost is less than current height.
      // The height becomes the next node's height, and time increases by cost plus the difference in height.
      newTimeElapsed = currentTime + traversalCost + currentHeightOfNode - (nextNodeHeight + traversalCost);
      newCurrentHeight = nextNodeHeight;
    } else if (nextNodeHeight + traversalCost >= currentHeightOfNode && currentHeightOfNode >= traversalCost) {
      // Case 2: Next node's height plus edge cost is greater or equal to current height,
      // and current height is sufficient to cover the edge cost.
      // Height decreases by edge cost, time increases by edge cost.
      newTimeElapsed = currentTime + traversalCost;
      newCurrentHeight = currentHeightOfNode - traversalCost;
    } else {
      // Case 3: Current height is less than edge cost.
      // Height becomes 0, time increases by cost plus the difference needed to cover the cost.
      newTimeElapsed = currentTime + traversalCost + traversalCost - currentHeightOfNode;
      newCurrentHeight = 0;
    }
    return {
      position: nextPosition,
      timeElapsed: newTimeElapsed,
      currentHeight: newCurrentHeight
    };
  }

  searchQueue.push({
    position: 0,
    timeElapsed: 0,
    currentHeight: initialHeight
  });
  visitedStates[0].push({
    timeElapsed: 0,
    currentHeight: initialHeight
  });

  let minimumTotalTime = Number.POSITIVE_INFINITY;
  const finalNodeIndex = numNodes - 1;

  while (searchQueue.length > 0) {
    const currentSearchState = searchQueue.pop();

    const potentialPruningValue = currentSearchState.timeElapsed + minTravelTimesToTarget[currentSearchState.position] * 2 - currentSearchState.currentHeight;
    if (potentialPruningValue >= minimumTotalTime) {
      continue;
    }

    for (let k = 0; k < adjacencyList[currentSearchState.position].length; k++) {
      const edgeConnection = adjacencyList[currentSearchState.position][k];
      const nextVertex = edgeConnection.target;

      if (nodeHeights[currentSearchState.position] < edgeConnection.cost) {
        continue; // Cannot traverse if current node's height is less than edge cost
      }

      const newSearchState = determineNextSearchNode(currentSearchState, edgeConnection, nodeHeights);

      if (nextVertex === finalNodeIndex) {
        minimumTotalTime = Math.min(minimumTotalTime, newSearchState.timeElapsed + nodeHeights[finalNodeIndex] - newSearchState.currentHeight);
      } else {
        const isStateRedundant = visitedStates[nextVertex].some(function(pastState) {
          return pastState.timeElapsed < newSearchState.timeElapsed && pastState.currentHeight >= newSearchState.currentHeight;
        });

        if (!isStateRedundant) {
          visitedStates[nextVertex].push({
            timeElapsed: newSearchState.timeElapsed,
            currentHeight: newSearchState.currentHeight
          });
          searchQueue.push(newSearchState);
        }
      }
    }
    // Sort the queue to prioritize states with less time elapsed (Dijkstra-like behavior)
    searchQueue.sort((stateA, stateB) => stateB.timeElapsed - stateA.timeElapsed);
  }

  if (minimumTotalTime === Number.POSITIVE_INFINITY) {
    console.log(-1);
  } else {
    console.log(minimumTotalTime);
  }
}
