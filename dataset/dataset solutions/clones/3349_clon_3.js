'use strict';

const moduloConstant = 1e9 + 7;

function depthFirstSearch(currentNode, adjacencyList, visitedNodes) {
  let currentPathResults = [1, 1];

  const neighbors = adjacencyList[currentNode];
  const neighborCount = neighbors.length;

  for (let loopIndex = 0; loopIndex < neighborCount; loopIndex++) {
    const neighborNode = neighbors[loopIndex];

    if (!visitedNodes[neighborNode]) {
      visitedNodes[neighborNode] = 1;
      const childResult = depthFirstSearch(neighborNode, adjacencyList, visitedNodes);

      const sumOfChildResults = (childResult[0] + childResult[1]) % moduloConstant;
      currentPathResults[0] = (currentPathResults[0] * sumOfChildResults) % moduloConstant;

      currentPathResults[1] = (currentPathResults[1] * childResult[0]) % moduloConstant;
    }
  }
  return currentPathResults;
}

function constructAdjacencyList(totalNodes, edgeConnections) {
  const graphStructure = Array.from({ length: totalNodes + 1 }, () => []);

  for (const edge of edgeConnections) {
    const sourceNodeId = edge[0];
    const destinationNodeId = edge[1];

    graphStructure[sourceNodeId].push(destinationNodeId);
    graphStructure[destinationNodeId].push(sourceNodeId);
  }
  return graphStructure;
}

function computeFinalResult(totalNodes, edgeConnections) {
  const adjacencyList = constructAdjacencyList(totalNodes, edgeConnections);
  let visitedNodes = new Array(totalNodes + 1).fill(0);
  visitedNodes[1] = 1;

  const dfsResult = depthFirstSearch(1, adjacencyList, visitedNodes);
  const finalSum = (dfsResult[0] + dfsResult[1]);
  return finalSum % moduloConstant;
}

function processInputAndOutput(inputData) {
  const inputLines = inputData.split("\n");
  const totalNodes = parseInt(inputLines[0], 10);

  const rawEdgeLines = inputLines.slice(1);
  const edgeConnections = rawEdgeLines.map(currentLine => {
    const stringElements = currentLine.split(' ');
    return stringElements.map(elementString => parseInt(elementString, 10));
  });

  const finalOutputValue = computeFinalResult(totalNodes, edgeConnections);
  console.log(finalOutputValue);
}

processInputAndOutput(require('fs').readFileSync('/dev/stdin', 'utf8'));
