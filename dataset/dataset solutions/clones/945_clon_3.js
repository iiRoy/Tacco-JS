(function executeProgram() {
  const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
  const inputLines = rawInput.trim().split('\n');

  const nodeCount = Number(inputLines[0]);
  const dataLines = inputLines.slice(1);

  const neighborLists = Array.from({ length: nodeCount }, () => []);
  
  dataLines.forEach((currentLineData, nodeIndex) => {
    const parts = currentLineData.split(' ');
    const neighborsRaw = parts.slice(2);
    for (const neighborIdString of neighborsRaw) {
      neighborLists[nodeIndex].push(Number(neighborIdString) - 1);
    }
  });

  const distances = new Array(nodeCount).fill(-1);
  distances[0] = 0; // Distance from source node (0) to itself is 0

  performBreadthFirstSearch(neighborLists, distances);

  for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    console.log(nodeIdx + 1, distances[nodeIdx]);
  }
})();

function performBreadthFirstSearch(graph, distArray) {
  const NODE_STATE_UNVISITED = 0;
  const NODE_STATE_VISITING = 1;
  const NODE_STATE_VISITED = 2;

  const nodeStates = new Array(graph.length).fill(NODE_STATE_UNVISITED);
  
  const processingQueue = [0]; // Start BFS from node 0
  nodeStates[0] = NODE_STATE_VISITING; // Mark source node as visiting

  let currentNodeIdentifier;
  while (processingQueue.length > 0) {
    currentNodeIdentifier = processingQueue.shift();

    const currentNeighbors = graph[currentNodeIdentifier];
    if (currentNeighbors) { // Guard against undefined or null neighbors list
      for (const adjacentNode of currentNeighbors) {
        if (nodeStates[adjacentNode] === NODE_STATE_UNVISITED) {
          nodeStates[adjacentNode] = NODE_STATE_VISITING;
          distArray[adjacentNode] = distArray[currentNodeIdentifier] + 1;
          processingQueue.push(adjacentNode);
        }
      }
    }
    nodeStates[currentNodeIdentifier] = NODE_STATE_VISITED;
  }
}
