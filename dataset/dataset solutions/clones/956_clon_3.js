const [UNVISITED, VISITED] = [0, 1];

(function executeDijkstraAlgorithm() {
  const fileSystem = require('fs');
  const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const inputLines = inputData.trim().split('\n');

  const nodeCount = Number(inputLines.shift());
  const adjacencyMatrix = inputLines.map((rowString) =>
    rowString.trim().split(' ').map(valStr => {
      const parsedVal = Number(valStr);
      return parsedVal === -1 ? Infinity : parsedVal;
    })
  );

  const allNodeIndices = [];
  for (let i = 0; i < nodeCount; i++) {
    allNodeIndices.push(i);
  }

  const minPathDistances = [];
  const nodeStates = [];
  const START_NODE_INDEX = 0;

  for (let idx = 0; idx < nodeCount; idx++) {
    minPathDistances[idx] = Infinity;
    nodeStates[idx] = UNVISITED;
  }
  minPathDistances[START_NODE_INDEX] = 0;

  let currentMinCost;
  let currentNodeIndex;
  let totalAccumulatedCost = 0;

  const findNextUnvisitedNode = (distances, states, indices) => {
    let minVal = Infinity;
    let minIdx = -1;

    for (const idx of indices) {
      if (states[idx] === UNVISITED && distances[idx] < minVal) {
        minVal = distances[idx];
        minIdx = idx;
      }
    }
    return { index: minIdx, cost: minVal };
  };

  const updateNeighborDistances = (sourceNodeIdx, adjMatrix, currentDistances, states) => {
    const neighbors = adjMatrix[sourceNodeIdx];
    neighbors.forEach((edgeWeight, neighborIdx) => {
      if (states[neighborIdx] !== VISITED) {
        const potentialNewDistance = edgeWeight;
        if (currentDistances[neighborIdx] > potentialNewDistance) {
          currentDistances[neighborIdx] = potentialNewDistance;
        }
      }
    });
  };

  while (true) {
    const nextNodeInfo = findNextUnvisitedNode(minPathDistances, nodeStates, allNodeIndices);
    currentMinCost = nextNodeInfo.cost;
    currentNodeIndex = nextNodeInfo.index;

    if (currentMinCost === Infinity) {
      break;
    }

    totalAccumulatedCost += currentMinCost;
    nodeStates[currentNodeIndex] = VISITED;

    updateNeighborDistances(currentNodeIndex, adjacencyMatrix, minPathDistances, nodeStates);
  }

  console.log(totalAccumulatedCost);
})();
