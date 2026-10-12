(function executeProgram() {
  const fs = require('fs');
  const NODE_UNVISITED = 0;
  const NODE_VISITING = 1;
  const NODE_VISITED = 2;

  const parseNumbers = (inputString) => inputString.split(' ').map(Number);

  const rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');
  const inputLines = rawInputContent.trim().split('\n');

  const [nodeCount, edgeCount] = parseNumbers(inputLines.shift());

  const graphAdjacency = new Array(nodeCount).fill(null).map(() => []);

  for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
    const [startNode, endNode] = parseNumbers(inputLines.shift());
    graphAdjacency[startNode].push(endNode);
    graphAdjacency[endNode].push(startNode);
  }

  function checkPathExistence(sourceNode, targetNode) {
    const nodeStates = new Array(graphAdjacency.length).fill(NODE_UNVISITED);
    const bfsTraversalQueue = [];

    bfsTraversalQueue.push(sourceNode);
    nodeStates[sourceNode] = NODE_VISITING;

    let currentProcessingNode;
    while (bfsTraversalQueue.length > 0) {
      currentProcessingNode = bfsTraversalQueue.shift();

      if (currentProcessingNode === targetNode) {
        return true;
      }

      const neighbors = graphAdjacency[currentProcessingNode];
      const neighborCount = neighbors.length;

      for (let neighborIdx = 0; neighborIdx < neighborCount; neighborIdx++) {
        const adjacentNode = neighbors[neighborIdx];
        if (nodeStates[adjacentNode] === NODE_UNVISITED) {
          nodeStates[adjacentNode] = NODE_VISITING;
          bfsTraversalQueue.push(adjacentNode);
        }
      }
      nodeStates[currentProcessingNode] = NODE_VISITED;
    }
    return false;
  }

  inputLines.shift(); // Discard the empty line separating graph data from queries

  const queryResults = [];
  for (const queryLine of inputLines) {
    const [queryStart, queryEnd] = parseNumbers(queryLine);
    const pathExists = checkPathExistence(queryStart, queryEnd);
    queryResults.push(pathExists ? 'yes' : 'no');
  }

  console.log(queryResults.join('\n'));
})();
