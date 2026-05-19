function ProcessGraphData(inputStr) {
  inputStr = inputStr.split("\n");

  const firstLineParts = inputStr[0].split(" ").map(val => +val);
  const nodeCount = firstLineParts[0];
  const edgeCount = firstLineParts[1];
  const startNodeA = firstLineParts[2] - 1;
  const startNodeB = firstLineParts[3] - 1;

  const edgeSourceNodes = [];
  const edgeTargetNodes = [];
  const edgeWeightsA = [];
  const edgeWeightsB = [];

  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    const currentEdgeData = inputStr[edgeIndex + 1].split(" ").map(val => +val);
    edgeSourceNodes[edgeIndex] = currentEdgeData[0] - 1;
    edgeTargetNodes[edgeIndex] = currentEdgeData[1] - 1;
    edgeWeightsA[edgeIndex] = currentEdgeData[2];
    edgeWeightsB[edgeIndex] = currentEdgeData[3];
  }

  const distancesFromA = calculateShortestPaths(edgeSourceNodes, edgeTargetNodes, edgeWeightsA, startNodeA, nodeCount);
  const distancesFromB = calculateShortestPaths(edgeSourceNodes, edgeTargetNodes, edgeWeightsB, startNodeB, nodeCount);

  const maximizedValues = [];
  const largeConstant = 1e15; // Represents 1 * 10^15

  let currentProcessingNodeIdx = nodeCount - 1;
  maximizedValues[currentProcessingNodeIdx] = largeConstant - distancesFromA[currentProcessingNodeIdx] - distancesFromB[currentProcessingNodeIdx];

  while (currentProcessingNodeIdx > 0) {
    currentProcessingNodeIdx--;
    const combinedCostForCurrentNode = largeConstant - distancesFromA[currentProcessingNodeIdx] - distancesFromB[currentProcessingNodeIdx];
    maximizedValues[currentProcessingNodeIdx] = Math.max(maximizedValues[currentProcessingNodeIdx + 1], combinedCostForCurrentNode);
  }

  console.log(maximizedValues.join("\n"));
}

function calculateShortestPaths(sourceNodes, targetNodes, weights, startNode, numNodes) {
  const adjacencyMatrix = Array(numNodes).fill(null).map(() => []);

  for (let edgeIndex = 0; edgeIndex < sourceNodes.length; edgeIndex++) {
    const srcNode = sourceNodes[edgeIndex];
    const destNode = targetNodes[edgeIndex];
    const edgeWeight = weights[edgeIndex];
    adjacencyMatrix[srcNode][destNode] = edgeWeight;
    adjacencyMatrix[destNode][srcNode] = edgeWeight;
  }

  const distances = Array(numNodes).fill(9e99); // Represents a very large number for initial distances
  distances[startNode] = 0;

  const UNREACHABLE_DIST_SENTINEL = 9e999; // Represents an even larger number, effectively Infinity
  let minDistanceValue = UNREACHABLE_DIST_SENTINEL;
  let nodeWithMinDistanceIdx;
  const unvisitedNodesQueue = [];

  const directNeighborsOfStart = adjacencyMatrix[startNode];
  for (const neighborKeyStr in directNeighborsOfStart) {
    const neighborNodeIdx = parseInt(neighborKeyStr, 10);
    unvisitedNodesQueue.push(neighborNodeIdx);
    distances[neighborNodeIdx] = directNeighborsOfStart[neighborNodeIdx];
    if (minDistanceValue > distances[neighborNodeIdx]) {
      minDistanceValue = distances[neighborNodeIdx];
      nodeWithMinDistanceIdx = neighborNodeIdx;
    }
  }

  while (unvisitedNodesQueue.length > 0) {
    minDistanceValue = UNREACHABLE_DIST_SENTINEL;
    let minNodeQueuePosition = -1;

    for (let queuePosition = 0; queuePosition < unvisitedNodesQueue.length; queuePosition++) {
      const candidateNode = unvisitedNodesQueue[queuePosition];
      if (minDistanceValue > distances[candidateNode]) {
        minDistanceValue = distances[candidateNode];
        nodeWithMinDistanceIdx = candidateNode;
        minNodeQueuePosition = queuePosition;
      }
    }

    if (minNodeQueuePosition === -1) {
      // No reachable nodes left in the queue, or queue contains only processed nodes
      break;
    }

    unvisitedNodesQueue.splice(minNodeQueuePosition, 1);
    const currentNodeBeingProcessed = nodeWithMinDistanceIdx;

    const neighborsOfCurrentNode = adjacencyMatrix[currentNodeBeingProcessed];
    for (const neighborKeyStr in neighborsOfCurrentNode) {
      const neighborNodeIdx = parseInt(neighborKeyStr, 10);
      const edgeWeightToNeighbor = neighborsOfCurrentNode[neighborNodeIdx];
      const newPathDistance = distances[currentNodeBeingProcessed] + edgeWeightToNeighbor;

      if (distances[neighborNodeIdx] > newPathDistance) {
        distances[neighborNodeIdx] = newPathDistance;
        unvisitedNodesQueue.push(neighborNodeIdx); // Add to queue, duplicates are handled by linear scan
      }
    }
  }

  return distances;
}

ProcessGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
