function Main(rawInput) {
  const lines = rawInput.split("\n");
  const nodeCount = parseInt(lines[0], 10);

  const graphAdjacency = Array.from({ length: nodeCount }, () => []);

  for (let edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
    const [nodeU, nodeV] = lines[edgeIndex + 1].split(" ").map(Number);
    graphAdjacency[nodeU - 1].push(nodeV - 1);
    graphAdjacency[nodeV - 1].push(nodeU - 1);
  }

  const calculateShortestPaths = (startNode, totalNodes, adjList) => {
    const pathDistances = Array(totalNodes).fill(Infinity);
    const traversalQueue = [startNode];
    pathDistances[startNode] = 0;

    let queuePointer = 0;

    while (queuePointer < traversalQueue.length) {
      const currentNode = traversalQueue[queuePointer++];
      for (const neighborNode of adjList[currentNode]) {
        if (pathDistances[neighborNode] === Infinity) {
          pathDistances[neighborNode] = pathDistances[currentNode] + 1;
          traversalQueue.push(neighborNode);
        }
      }
    }
    return pathDistances;
  };

  const distancesFromZero = calculateShortestPaths(0, nodeCount, graphAdjacency);
  const distancesFromNMinusOne = calculateShortestPaths(nodeCount - 1, nodeCount, graphAdjacency);

  const fennecTerritoryCount = Array.from({ length: nodeCount }, (_, index) => index)
    .filter(nodeIndex => nodeIndex !== 0 && nodeIndex !== nodeCount - 1)
    .reduce((currentCount, nodeIndex) => {
      return currentCount + (distancesFromZero[nodeIndex] <= distancesFromNMinusOne[nodeIndex] ? 1 : 0);
    }, 0);

  const totalIntermediateNodes = nodeCount - 2;
  const snukeTerritoryCount = totalIntermediateNodes - fennecTerritoryCount;

  let finalWinner = "Fennec";
  if (fennecTerritoryCount <= snukeTerritoryCount) {
    finalWinner = "Snuke";
  }

  console.log('%s', finalWinner);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
