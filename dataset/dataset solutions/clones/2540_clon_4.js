function analyzeNetworkPaths(inputData) {
  const [nodeEdgeCounts, ...edgeData] = inputData;
  const [nodeCount, edgeCount] = nodeEdgeCounts.split(' ').map(Number);

  const connections = new Array(nodeCount).fill(null).map(() => new Set());

  for (let i = 0; i < edgeCount; i++) {
    const [src, dst] = edgeData[i].split(' ').map(Number);
    connections[src - 1].add(dst - 1);
  }

  function traceCircuit(initialPoint, currentPoint, pathHistory, visitedInCurrentPath) {
    for (const nextPoint of connections[currentPoint]) {
      if (nextPoint === initialPoint) {
        console.log(pathHistory.length);
        pathHistory.forEach(node => console.log(node + 1));
        return true;
      }

      if (!visitedInCurrentPath.has(nextPoint)) {
        pathHistory.push(nextPoint);
        visitedInCurrentPath.add(nextPoint);

        if (traceCircuit(initialPoint, nextPoint, pathHistory, visitedInCurrentPath)) {
          return true;
        }

        visitedInCurrentPath.delete(nextPoint);
        pathHistory.pop();
      }
    }
    return false;
  }

  for (let startNodeId = 0; startNodeId < nodeCount; startNodeId++) {
    if (traceCircuit(startNodeId, startNodeId, [startNodeId], new Set([startNodeId]))) {
      return;
    }
  }

  console.log(-1);
}

const fs = require('fs');
analyzeNetworkPaths(fs.readFileSync("/dev/stdin", "UTF-8").split("\n"));