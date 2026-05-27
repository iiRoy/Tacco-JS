function ProcessInput(rawData) {
  let lines = rawData.split("\n");
  const nodeCount = parseInt(lines[0]);

  let edgeSrc = Array.from({ length: nodeCount - 1 }, () => 0);
  let edgeDest = Array.from({ length: nodeCount - 1 }, () => 0);

  for (let k = 0; k < nodeCount - 1; k++) {
    const edgeParts = lines[k + 1].split(" ");
    edgeSrc[k] = parseInt(edgeParts[0]) - 1;
    edgeDest[k] = parseInt(edgeParts[1]) - 1;
  }

  let distFromStart = Array.from({ length: nodeCount }, () => nodeCount);
  distFromStart[0] = 0;

  let distFromEnd = Array.from({ length: nodeCount }, () => nodeCount);
  distFromEnd[nodeCount - 1] = 0;

  const calculateDistances = (initialNode, distanceArray) => {
    let currentProcessingNode = initialNode;
    let unvisitedNodesList = Array.from({ length: nodeCount }, (_, idx) => idx);

    const findNextNodeToProcess = (nodesList, distances) => {
      let minimumDistanceFound = nodeCount + 1;
      let nextNodeCandidate = -1;

      for (let nodeIdx of nodesList) {
        if (distances[nodeIdx] < minimumDistanceFound) {
          minimumDistanceFound = distances[nodeIdx];
          nextNodeCandidate = nodeIdx;
        }
      }
      return nextNodeCandidate;
    };

    while (unvisitedNodesList.length > 0) {
      for (let edgeIdx = 0; edgeIdx < nodeCount - 1; edgeIdx++) {
        const u = edgeSrc[edgeIdx];
        const v = edgeDest[edgeIdx];

        if (u === currentProcessingNode && distanceArray[v] > distanceArray[u]) {
          distanceArray[v] = distanceArray[u] + 1;
        }
        if (v === currentProcessingNode && distanceArray[u] > distanceArray[v]) {
          distanceArray[u] = distanceArray[v] + 1;
        }
      }

      const nodeIndexInList = unvisitedNodesList.indexOf(currentProcessingNode);
      if (nodeIndexInList > -1) {
        unvisitedNodesList.splice(nodeIndexInList, 1);
      }

      currentProcessingNode = findNextNodeToProcess(unvisitedNodesList, distanceArray);

      if (currentProcessingNode === -1 && unvisitedNodesList.length > 0) {
          // This case implies disconnected graph or all reachable nodes processed.
          // For this problem's constraints, graphs are typically connected.
          break;
      }
    }
    return distanceArray;
  };

  distFromStart = calculateDistances(0, distFromStart);
  distFromEnd = calculateDistances(nodeCount - 1, distFromEnd);

  let fennecAdvantageCount = 0;
  const excludedNodesCount = 2;

  for (let idx = 0; idx < nodeCount; idx++) {
    const isIntermediateNode = (idx !== 0 && idx !== nodeCount - 1);
    if (isIntermediateNode) {
      if (distFromStart[idx] <= distFromEnd[idx]) {
        fennecAdvantageCount++;
      }
    }
  }

  let winnerName = "Fennec";
  const totalIntermediateNodes = nodeCount - excludedNodesCount;
  if (2 * fennecAdvantageCount <= totalIntermediateNodes) {
    winnerName = "Snuke";
  }

  console.log('%s', winnerName);
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
