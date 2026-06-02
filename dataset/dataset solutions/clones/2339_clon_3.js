'use strict'

const solveProblem = (rawInputString) => {
  const processedLines = rawInputString.trim().split('\n');
  
  const initialConfigValues = processedLines[0].split(' ').map(Number);
  const [totalNodes, startNodeU, startNodeV] = initialConfigValues;
  
  const remainingLines = processedLines.slice(1);
  const edgeDefinitions = remainingLines.map(line =>
    line.split(' ').map(Number)
  );

  let graphAdjacency = {};
  
  for (let edgeIndex = 0; edgeIndex < totalNodes - 1; ++edgeIndex) {
    const currentEdgePair = edgeDefinitions[edgeIndex];
    const [nodeA, nodeB] = currentEdgePair;

    graphAdjacency[nodeA] = graphAdjacency[nodeA] || [];
    graphAdjacency[nodeB] = graphAdjacency[nodeB] || [];
    
    graphAdjacency[nodeA].push(nodeB);
    graphAdjacency[nodeB].push(nodeA);
  }

  const INITIAL_DISTANCE = 0;
  const NO_PARENT_MARKER = -1;

  const distancesFromU = Array(totalNodes + 1).fill(INITIAL_DISTANCE);
  const distancesFromV = Array(totalNodes + 1).fill(INITIAL_DISTANCE);

  const traverseAndCalculateDistances = (currentVertex, previousVertex, currentDepth, targetDistanceArray) => {
    targetDistanceArray[currentVertex] = currentDepth;

    const neighbors = graphAdjacency[currentVertex] || [];
    for (const neighborVertexId of neighbors) {
      if (neighborVertexId !== previousVertex) {
        traverseAndCalculateDistances(neighborVertexId, currentVertex, currentDepth + 1, targetDistanceArray);
      }
    }
  };

  traverseAndCalculateDistances(startNodeU, NO_PARENT_MARKER, INITIAL_DISTANCE, distancesFromU);
  traverseAndCalculateDistances(startNodeV, NO_PARENT_MARKER, INITIAL_DISTANCE, distancesFromV);

  let finalMaxDistance = 0;
  for (let nodeIdx = 0; nodeIdx <= totalNodes; ++nodeIdx) {
    if (distancesFromU[nodeIdx] < distancesFromV[nodeIdx]) {
      finalMaxDistance = Math.max(finalMaxDistance, distancesFromU[nodeIdx]);
    }
  }
  
  console.log(finalMaxDistance);
};

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
