function processGraphGame(rawData) {
  const graphLines = rawData.split("\n");
  const nodeCount = parseInt(graphLines[0]);

  const graphConnections = Array.from({ length: nodeCount }, () => []);

  for (let edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
    const [firstNodeStr, secondNodeStr] = graphLines[edgeIndex + 1].split(" ");
    const firstNode = parseInt(firstNodeStr) - 1;
    const secondNode = parseInt(secondNodeStr) - 1;

    graphConnections[firstNode].push(secondNode);
    graphConnections[secondNode].push(firstNode);
  }

  const computeShortestPaths = (startVertex, totalNodes, graphStructure) => {
    const pathDistances = new Array(totalNodes).fill(Infinity);
    const traversalQueue = [];
    
    traversalQueue.push(startVertex);
    pathDistances[startVertex] = 0;

    let queueHead = 0;

    while (queueHead < traversalQueue.length) {
      const currentVertex = traversalQueue[queueHead++];

      for (const neighborVertex of graphStructure[currentVertex]) {
        if (pathDistances[neighborVertex] === Infinity) {
          pathDistances[neighborVertex] = pathDistances[currentVertex] + 1;
          traversalQueue.push(neighborVertex);
        }
      }
    }
    return pathDistances;
  };

  const fennecReachDistances = computeShortestPaths(0, nodeCount, graphConnections);
  const snukeReachDistances = computeShortestPaths(nodeCount - 1, nodeCount, graphConnections);

  const fennecDominantNodes = Array.from({ length: nodeCount }).reduce((currentCount, _, nodeIndex) => {
    if (nodeIndex !== 0 && nodeIndex !== nodeCount - 1) {
      if (fennecReachDistances[nodeIndex] <= snukeReachDistances[nodeIndex]) {
        return currentCount + 1;
      }
    }
    return currentCount;
  }, 0);

  let gameOutcome = "Fennec";
  if (fennecDominantNodes <= (nodeCount - 2) - fennecDominantNodes) {
    gameOutcome = "Snuke";
  }

  console.log('%s', gameOutcome);
}

processGraphGame(require("fs").readFileSync("/dev/stdin", "utf8"));
