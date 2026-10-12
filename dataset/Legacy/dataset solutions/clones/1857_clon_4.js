function main(inputContent) {
  const rawInputLines = inputContent.trim().split('\n');
  const [nodeCountStr, edgeCountStr] = rawInputLines[0].split(' ');
  const nodeCount = Number(nodeCountStr);
  const edgeCount = Number(edgeCountStr);

  const adjacencyMap = new Map();
  for (let nodeIdentifier = 0; nodeIdentifier < nodeCount; nodeIdentifier++) {
    adjacencyMap.set(nodeIdentifier, []);
  }

  for (let edgeIndex = 1; edgeIndex <= edgeCount; edgeIndex++) {
    const [firstNodeStr, secondNodeStr] = rawInputLines[edgeIndex].split(' ');
    const firstNode = Number(firstNodeStr) - 1;
    const secondNode = Number(secondNodeStr) - 1;

    adjacencyMap.get(firstNode).push(secondNode);
    adjacencyMap.get(secondNode).push(firstNode);
  }

  const pathLengths = new Map();
  const traversalQueue = [];
  const discoveredNodes = new Set();

  traversalQueue.push(0);
  discoveredNodes.add(0);
  pathLengths.set(0, 0);

  let queuePointer = 0;
  while (queuePointer < traversalQueue.length) {
    const currentNode = traversalQueue[queuePointer++];
    const currentPathLength = pathLengths.get(currentNode);

    const connectedNodes = adjacencyMap.get(currentNode);
    for (const neighborNode of connectedNodes) {
      if (!discoveredNodes.has(neighborNode)) {
        discoveredNodes.add(neighborNode);
        pathLengths.set(neighborNode, currentPathLength + 1);
        traversalQueue.push(neighborNode);
      }
    }
  }

  if (discoveredNodes.size !== nodeCount) {
    console.log('No');
  } else {
    console.log('Yes');
    for (let nodeIdentifier = 1; nodeIdentifier < nodeCount; nodeIdentifier++) {
      console.log(pathLengths.get(nodeIdentifier));
    }
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
