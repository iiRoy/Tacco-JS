(function analyzeGraphConnectivity() {
  const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8').trim();
  const lineEntries = sourceData.split('\n');

  const [totalNodes, totalEdges] = lineEntries[0].split(' ').map(Number);

  const connectionData = lineEntries.slice(1, 1 + totalEdges);
  // Skip the header (1), connections (totalEdges), and the blank line (1)
  const investigationRequests = lineEntries.slice(2 + totalEdges);

  const networkLinks = new Map(); // Map<node: number, neighbors: Set<number>>

  function establishConnection(point1, point2) {
    if (!networkLinks.has(point1)) {
      networkLinks.set(point1, new Set());
    }
    networkLinks.get(point1).add(point2);
  }

  connectionData.forEach(linkString => {
    const [firstPoint, secondPoint] = linkString.split(' ').map(Number);
    establishConnection(firstPoint, secondPoint);
    establishConnection(secondPoint, firstPoint); // Undirected graph
  });

  function queryConnectivity(startPoint, endPoint, graphStructure) {
    if (startPoint === endPoint) {
      return true; // Path exists if origin and destination are the same
    }

    const exploredPoints = new Set();

    function traverseFrom(currentPoint) {
      if (currentPoint === endPoint) {
        return true;
      }
      exploredPoints.add(currentPoint);

      const adjacentPoints = graphStructure.get(currentPoint) || new Set();
      for (const neighbor of adjacentPoints) {
        if (!exploredPoints.has(neighbor)) {
          if (traverseFrom(neighbor)) { // Recursive depth-first search
            return true;
          }
        }
      }
      return false;
    }

    return traverseFrom(startPoint);
  }

  const outcomes = investigationRequests.map(requestString => {
    const [origin, target] = requestString.split(' ').map(Number);
    return queryConnectivity(origin, target, networkLinks) ? 'yes' : 'no';
  });

  console.log(outcomes.join('\n'));
})();