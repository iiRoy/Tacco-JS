function processGraphData(rawData) {
  const lines = rawData.split("\n");
  const nodeCount = parseInt(lines[0], 10);

  const distancesFromStart = new Array(nodeCount).fill(nodeCount);
  distancesFromStart[0] = 0;

  const distancesFromEnd = new Array(nodeCount).fill(nodeCount);
  distancesFromEnd[nodeCount - 1] = 0;

  const adjacencyList = Array.from({ length: nodeCount }, () => []);

  const edgeCount = nodeCount - 1;
  for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
    const currentLine = lines[edgeIdx + 1];
    const edgeParts = currentLine.split(" ");
    const nodeA = parseInt(edgeParts[0], 10) - 1;
    const nodeB = parseInt(edgeParts[1], 10) - 1;

    adjacencyList[nodeA].push(nodeB);
    adjacencyList[nodeB].push(nodeA);
  }

  function calculateDistancesBFS(startNode, currentDistances) {
    const bfsQueue = [];
    bfsQueue.push(startNode);
    let currentNodeToProcess = startNode;

    while (bfsQueue.length > 0) {
      const neighborsOfCurrent = adjacencyList[currentNodeToProcess];
      for (let neighborIdx = 0; neighborIdx < neighborsOfCurrent.length; neighborIdx++) {
        const neighborNode = neighborsOfCurrent[neighborIdx];
        if (currentDistances[neighborNode] > currentDistances[currentNodeToProcess]) {
          currentDistances[neighborNode] = currentDistances[currentNodeToProcess] + 1;
          bfsQueue.push(neighborNode);
        }
      }
      bfsQueue.shift();
      currentNodeToProcess = bfsQueue[0];
    }
    return currentDistances;
  }

  const finalDistancesFromStart = calculateDistancesBFS(0, distancesFromStart);
  const finalDistancesFromEnd = calculateDistancesBFS(nodeCount - 1, distancesFromEnd);

  let fennecAdvantageCount = 0;
  const totalIntermediateNodes = nodeCount - 2;

  for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    const isNotStartOrEndNode = (nodeIdx !== 0 && nodeIdx !== nodeCount - 1);
    if (isNotStartOrEndNode) {
      if (finalDistancesFromStart[nodeIdx] <= finalDistancesFromEnd[nodeIdx]) {
        fennecAdvantageCount++;
      }
    }
  }

  let winnerName = "Fennec";
  const snukeAdvantageCount = totalIntermediateNodes - fennecAdvantageCount;

  if (fennecAdvantageCount <= snukeAdvantageCount) {
    winnerName = "Snuke";
  }

  console.log('%s', winnerName);
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
