function processGameInput(rawData) {
  const lineSeparator = "\n";
  const lines = rawData.split(lineSeparator);

  const nodeCount = parseInt(lines[0]);

  const initialMaxDistance = nodeCount; // Represents "infinity" for distances

  let distFromStart = Array.from({ length: nodeCount }, () => initialMaxDistance);
  distFromStart[0] = 0;

  let distFromEnd = Array.from({ length: nodeCount }, () => initialMaxDistance);
  distFromEnd[nodeCount - 1] = 0;

  // Pre-parse edges to avoid repeated string operations inside the distance calculation loop
  const edgeList = [];
  const numberOfEdgesInGraph = nodeCount - 1;
  for (let edgeIdx = 0; edgeIdx < numberOfEdgesInGraph; edgeIdx++) {
    const edgeParts = lines[edgeIdx + 1].split(" ");
    const u = parseInt(edgeParts[0]) - 1; // Adjust to 0-indexed nodes
    const v = parseInt(edgeParts[1]) - 1; // Adjust to 0-indexed nodes
    edgeList.push([u, v]);
  }

  function findShortestPaths(startNodeIndex, currentDistancesArray, totalNodes, edges) {
    let currentNodeToProcess = startNodeIndex;
    let distances = currentDistancesArray;

    let unvisitedNodeIndices = Array.from({ length: totalNodes }, (_, i) => i);

    const numGraphEdges = edges.length;

    while (unvisitedNodeIndices.length > 0) {
      for (let edgeIterator = 0; edgeIterator < numGraphEdges; edgeIterator++) {
        const [nodeA, nodeB] = edges[edgeIterator];

        const distA = distances[nodeA];
        const distB = distances[nodeB];

        // If currentNodeToProcess is nodeA and nodeB's distance can be improved
        if (nodeA === currentNodeToProcess && distB > distA + 1) {
          distances[nodeB] = distA + 1;
        }
        // If currentNodeToProcess is nodeB and nodeA's distance can be improved
        if (nodeB === currentNodeToProcess && distA > distB + 1) {
          distances[nodeA] = distB + 1;
        }
      }

      // Remove the processed node from the unvisited set
      const currentIdxInUnvisited = unvisitedNodeIndices.indexOf(currentNodeToProcess);
      if (currentIdxInUnvisited > -1) {
        unvisitedNodeIndices.splice(currentIdxInUnvisited, 1);
      }

      // Find the next node to process (node with the minimum distance among unvisited)
      let nextNodeCandidate = -1;
      let minimumDistanceFound = initialMaxDistance + 1;

      for (let searchIdx = 0; searchIdx < unvisitedNodeIndices.length; searchIdx++) {
        const candidateNode = unvisitedNodeIndices[searchIdx];
        if (distances[candidateNode] < minimumDistanceFound) {
          nextNodeCandidate = candidateNode;
          minimumDistanceFound = distances[candidateNode];
        }
      }
      currentNodeToProcess = nextNodeCandidate;
      
      // Guard clause: if no reachable unvisited nodes are left, break
      if (currentNodeToProcess === -1 && unvisitedNodeIndices.length > 0) {
          break; 
      }
    }
    return distances;
  }

  distFromStart = findShortestPaths(0, distFromStart, nodeCount, edgeList);
  distFromEnd = findShortestPaths(nodeCount - 1, distFromEnd, nodeCount, edgeList);

  let fennecControlledNodesCount = 0;

  for (let nodeIterator = 0; nodeIterator < nodeCount; nodeIterator++) {
    // Skip the start and end nodes as per game rules
    if (nodeIterator === 0 || nodeIterator === nodeCount - 1) {
      continue;
    }

    if (distFromStart[nodeIterator] <= distFromEnd[nodeIterator]) {
      fennecControlledNodesCount++;
    }
  }

  let gameWinner = "Fennec";
  
  const totalIntermediateNodes = nodeCount - 2;
  const snukeControlledNodesCount = totalIntermediateNodes - fennecControlledNodesCount;

  // Determine the winner based on the number of controlled nodes
  if (fennecControlledNodesCount <= snukeControlledNodesCount) {
    gameWinner = "Snuke";
  }

  console.log(`${gameWinner}`);
}

processGameInput(require("fs").readFileSync("/dev/stdin", "utf8"));
