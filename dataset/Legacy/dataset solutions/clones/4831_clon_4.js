function main(inputLines) {
  const [nodeCount, kConnections, lConnections] = inputLines[0].split(' ').map(Number);

  const adjList1 = Array.from({ length: nodeCount }, () => []);
  const adjList2 = Array.from({ length: nodeCount }, () => []);

  for (let i = 1; i <= kConnections; i++) {
    const [u, v] = inputLines[i].split(' ').map(Number);
    adjList1[u - 1].push(v - 1);
    adjList1[v - 1].push(u - 1);
  }

  for (let i = kConnections + 1; i <= kConnections + lConnections; i++) {
    const [u, v] = inputLines[i].split(' ').map(Number);
    adjList2[u - 1].push(v - 1);
    adjList2[v - 1].push(u - 1);
  }

  const componentRoots1 = new Array(nodeCount).fill(null);
  const componentRoots2 = new Array(nodeCount).fill(null);

  const determineComponentRoots = (adjacencyList, rootArray) => {
    for (let i = 0; i < nodeCount; i++) {
      if (rootArray[i] === null) {
        if (adjacencyList[i].length === 0) {
          rootArray[i] = nodeCount; // Sentinel for isolated nodes (0-indexed N corresponds to 1-indexed N+1)
        } else {
          let currentMinIndex = i;
          const traversalQueue = [i];
          const visitedNodes = new Set();
          visitedNodes.add(i);
          let queuePointer = 0;

          while (queuePointer < traversalQueue.length) {
            const currentNode = traversalQueue[queuePointer++];
            currentMinIndex = Math.min(currentMinIndex, currentNode);

            for (const neighborNode of adjacencyList[currentNode]) {
              if (!visitedNodes.has(neighborNode)) {
                visitedNodes.add(neighborNode);
                traversalQueue.push(neighborNode);
              }
            }
          }

          for (const visitedNode of visitedNodes) {
            rootArray[visitedNode] = currentMinIndex;
          }
        }
      }
    }
  };

  determineComponentRoots(adjList1, componentRoots1);
  determineComponentRoots(adjList2, componentRoots2);

  const rootPairCounts = new Map();
  for (let i = 0; i < nodeCount; i++) {
    const pairKey = `${componentRoots1[i]}-${componentRoots2[i]}`;
    rootPairCounts.set(pairKey, (rootPairCounts.get(pairKey) || 0) + 1);
  }

  const finalCounts = new Array(nodeCount);
  for (let i = 0; i < nodeCount; i++) {
    const pairKey = `${componentRoots1[i]}-${componentRoots2[i]}`;
    finalCounts[i] = rootPairCounts.get(pairKey);
  }

  console.log(finalCounts.join(' '));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));
