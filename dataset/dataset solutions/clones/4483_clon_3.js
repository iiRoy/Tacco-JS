function parseGraphInput(lines, nodeCount) {
  const adjList = Array.from({ length: nodeCount }, () => []);
  for (let k = 0; k < nodeCount - 1; k++) {
    const edgeStr = lines[k + 1];
    const [uStr, vStr] = edgeStr.split(" ");
    const u = parseInt(uStr) - 1;
    const v = parseInt(vStr) - 1;
    adjList[u].push(v);
    adjList[v].push(u);
  }
  return adjList;
}

function computeShortestPaths(startNodeIndex, totalNodes, graphAdjacencyList) {
  const distances = new Array(totalNodes).fill(totalNodes);
  distances[startNodeIndex] = 0;

  const remainingNodes = Array.from({ length: totalNodes }, (_, i) => i);

  let currentProcessingNode = startNodeIndex;

  const findNextMinNode = (nodesToSearch, dists) => {
    let minVal = Infinity;
    let nextNode = -1;
    for (const node of nodesToSearch) {
      if (dists[node] < minVal) {
        minVal = dists[node];
        nextNode = node;
      }
    }
    return nextNode;
  };

  while (remainingNodes.length > 0) {
    for (const neighbor of graphAdjacencyList[currentProcessingNode]) {
      const potentialNewDist = distances[currentProcessingNode] + 1;
      if (distances[neighbor] > potentialNewDist) {
        distances[neighbor] = potentialNewDist;
      }
    }

    const currentIdxInRemaining = remainingNodes.indexOf(currentProcessingNode);
    if (currentIdxInRemaining > -1) {
      remainingNodes.splice(currentIdxInRemaining, 1);
    }

    if (remainingNodes.length === 0) break;

    currentProcessingNode = findNextMinNode(remainingNodes, distances);
  }
  return distances;
}

function processGameLogic(rawData) {
  const inputLines = rawData.split("\n");
  const numNodes = parseInt(inputLines[0]);

  const graphAdjList = parseGraphInput(inputLines, numNodes);

  const fennecDistances = computeShortestPaths(0, numNodes, graphAdjList);

  const snukeDistances = computeShortestPaths(numNodes - 1, numNodes, graphAdjList);

  let fennecControlledNodes = 0;
  const totalPlayableNodes = numNodes - 2;

  for (let nodeIndex = 1; nodeIndex < numNodes - 1; nodeIndex++) {
    if (fennecDistances[nodeIndex] <= snukeDistances[nodeIndex]) {
      fennecControlledNodes++;
    }
  }

  const snukeControlledNodes = totalPlayableNodes - fennecControlledNodes;

  let gameWinner = "Fennec";
  if (fennecControlledNodes <= snukeControlledNodes) {
    gameWinner = "Snuke";
  }

  console.log('%s', gameWinner);
}

processGameLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
