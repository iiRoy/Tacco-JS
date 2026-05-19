'use strict';

function processInputAndSolve(inputData) {
  const lines = inputData.split('\n');
  const [nodeCount, edgeCount] = lines.shift().split(' ').map(Number);
  const edgeList = lines.map(edgeStr => edgeStr.split(' ').map(Number));
  
  const visitedNodes = new Array(nodeCount + 1).fill(false);
  const adjacencyList = Array.from({ length: nodeCount + 1 }, () => []);

  for (const edge of edgeList) {
    const sourceNode = edge[0];
    const destinationNode = edge[1];
    adjacencyList[sourceNode].push(destinationNode);
  }

  function explorePath(currentNode) {
    visitedNodes[currentNode] = true;

    const outgoingEdges = adjacencyList[currentNode];
    if (outgoingEdges.length > 0) {
      const nextNodeToVisit = outgoingEdges.shift();
      explorePath(nextNodeToVisit);
    }
  }

  let componentCount = 0;
  let currentTraversalNode = 1;
  while (currentTraversalNode <= nodeCount) {
    componentCount++;
    explorePath(currentTraversalNode);
    
    while (currentTraversalNode <= nodeCount && visitedNodes[currentTraversalNode]) {
      currentTraversalNode++;
    }
  }
  
  console.log(componentCount);
}

processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));
