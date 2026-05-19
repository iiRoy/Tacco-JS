'use strict'

const parseIntegerArray = (lineString) => {
  return lineString.split(' ').map(s => parseInt(s, 10));
};

const addEdgeToGraph = (graphMap, node1, node2) => {
  if (!graphMap.has(node1)) {
    graphMap.set(node1, []);
  }
  if (!graphMap.has(node2)) {
    graphMap.set(node2, []);
  }
  graphMap.get(node1).push(node2);
  graphMap.get(node2).push(node1);
};

function solveGraphProblem(rawInputString) {
  const processedLines = rawInputString.trim().split('\n');

  const firstLineValues = parseIntegerArray(processedLines[0]);
  const numNodes = firstLineValues[0];
  const startNodeU = firstLineValues[1];
  const startNodeV = firstLineValues[2];

  const edgeDescriptionLines = processedLines.slice(1);

  const parsedEdges = edgeDescriptionLines.map(line => parseIntegerArray(line));

  const adjList = new Map();

  for (let edgeIndex = 0; edgeIndex < numNodes - 1; ++edgeIndex) {
    const currentEdgePair = parsedEdges[edgeIndex];
    const nodeOne = currentEdgePair[0];
    const nodeTwo = currentEdgePair[1];
    addEdgeToGraph(adjList, nodeOne, nodeTwo);
  }

  const distancesFromU = new Array(numNodes + 1).fill(0);
  const distancesFromV = new Array(numNodes + 1).fill(0);

  const performDFS = (currentVertex, previousVertex, currentDepth, targetDistancesArray) => {
    targetDistancesArray[currentVertex] = currentDepth;

    if (adjList.has(currentVertex)) {
      for (const neighborVertex of adjList.get(currentVertex)) {
        if (neighborVertex !== previousVertex) {
          performDFS(neighborVertex, currentVertex, currentDepth + 1, targetDistancesArray);
        }
      }
    }
  };

  performDFS(startNodeV, 0, 0, distancesFromV);

  let resultMaxDistance = 0;
  for (let nodeIdx = 1; nodeIdx <= numNodes; ++nodeIdx) {
    if (distancesFromU[nodeIdx] < distancesFromV[nodeIdx]) {
      resultMaxDistance = Math.max(resultMaxDistance, distancesFromV[nodeIdx] - 1);
    }
  }
  console.log(resultMaxDistance);
}

solveGraphProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
