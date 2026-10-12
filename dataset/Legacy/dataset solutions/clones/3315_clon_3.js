'use strict';

function findLongestPath(currentNode, adjacencyMap, memoizationCache) {
  if (memoizationCache[currentNode.toString()]) {
    return memoizationCache[currentNode.toString()];
  }

  const outgoingEdges = adjacencyMap[currentNode];
  if (outgoingEdges.length === 0) {
    return 0;
  }

  let currentMaxPath = 0;
  for (let neighborIndex = 0; neighborIndex < outgoingEdges.length; neighborIndex++) {
    const nextNode = outgoingEdges[neighborIndex];
    const pathFromNeighbor = 1 + findLongestPath(nextNode, adjacencyMap, memoizationCache);
    currentMaxPath = Math.max(currentMaxPath, pathFromNeighbor);
  }

  memoizationCache[currentNode.toString()] = currentMaxPath;
  return currentMaxPath;
}

function buildGraphStructures(nodeCount, graphEdges) {
  const adjListContainer = Array.from({ length: nodeCount + 1 }, () => []);
  const inDegreeTracker = new Array(nodeCount + 1).fill(0);

  graphEdges.forEach(edge => {
    const [sourceNode, targetNode] = edge;
    adjListContainer[sourceNode].push(targetNode);
    inDegreeTracker[targetNode]++;
  });

  return {
    graphAdjacency: adjListContainer,
    nodeInDegrees: inDegreeTracker
  };
}

function solveGraphProblem(totalNodes, parsedEdges) {
  const graphData = buildGraphStructures(totalNodes, parsedEdges);
  const graphAdjacency = graphData.graphAdjacency;
  const nodeInDegrees = graphData.nodeInDegrees;

  let overallMaxPath = 0;

  const isPotentialStartNode = (nodeId, inDegrees) => inDegrees[nodeId] === 0;

  for (let nodeId = 1; nodeId <= nodeInDegrees.length; nodeId++) {
    if (isPotentialStartNode(nodeId, nodeInDegrees)) {
      const pathMemo = {};
      overallMaxPath = Math.max(overallMaxPath, findLongestPath(nodeId, graphAdjacency, pathMemo));
    }
  }
  return overallMaxPath;
}

function processInputAndSolve(inputContent) {
  const inputLines = inputContent.split("\n");

  const parseHeader = (line) => {
    const parts = line.split(' ').map(Number);
    return { totalNodes: parts[0], numEdges: parts[1] };
  };

  const { totalNodes } = parseHeader(inputLines[0]);
  
  const parsedEdges = inputLines.slice(1).map(line => line.split(' ').map(Number));

  const finalAnswer = solveGraphProblem(totalNodes, parsedEdges);
  return finalAnswer;
}

processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));
