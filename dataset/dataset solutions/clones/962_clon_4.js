const config = { input: '/dev/stdin', newline: '\n' };

const inputContent = require('fs').readFileSync(config.input, 'ascii');
const inputLines = inputContent.trim().split(config.newline);

const nodeCount = Number(inputLines.shift());

const graphEdges = [];

inputLines.forEach(lineData => {
  const parts = lineData.split(' ').map(Number);
  const sourceNodeId = parts[0];
  for (let i = 2; i < parts.length; i += 2) {
    const targetNodeId = parts[i];
    const edgeWeight = parts[i + 1];
    graphEdges.push({ from: sourceNodeId, to: targetNodeId, weight: edgeWeight });
  }
});

let shortestDistances;
let pathPredecessors;

function computeShortestPaths(numNodes, edges, startNode) {
  shortestDistances = Array.from({ length: numNodes }, () => Number.POSITIVE_INFINITY);
  pathPredecessors = Array.from({ length: numNodes }, () => null);
  shortestDistances[startNode] = 0;

  for (let iteration = 1; iteration < numNodes; iteration++) {
    edges.forEach(edge => {
      const { from, to, weight } = edge;
      if (shortestDistances[from] !== Number.POSITIVE_INFINITY &&
          shortestDistances[to] > shortestDistances[from] + weight) {
        shortestDistances[to] = shortestDistances[from] + weight;
        pathPredecessors[to] = from;
      }
    });
  }

  const hasNegativeCycle = edges.some(edge => {
    const { from, to, weight } = edge;
    return shortestDistances[from] !== Number.POSITIVE_INFINITY &&
           shortestDistances[to] > shortestDistances[from] + weight;
  });

  return !hasNegativeCycle;
}

computeShortestPaths(nodeCount, graphEdges, 0);

for (let i = 0; i < nodeCount; i++) {
  console.log("%s %d", i, shortestDistances[i]);
}
