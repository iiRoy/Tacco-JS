let networkGraph = [];
let numVertices = 0;
let totalEdges = 0;

let nodeVisitedStatus = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(incomingData) {
  const inputLines = incomingData.split('\n');

  for (let lineIndex = 0; lineIndex < inputLines.length - 1; ++lineIndex) {
    if (lineIndex === 0) {
      const nodeEdgeCounts = inputLines[lineIndex].split(' ').map(Number);

      if (nodeEdgeCounts.length < 2 || isNaN(nodeEdgeCounts[0]) || isNaN(nodeEdgeCounts[1])) {
        console.error("Error: Invalid graph dimension input on first line. Expected 'V E'.");
        process.exit(1); // Terminate on critical input error
      }

      numVertices = nodeEdgeCounts[0];
      totalEdges = nodeEdgeCounts[1];

      if (numVertices <= 0) {
        console.error("Error: Number of vertices must be positive.");
        process.exit(1);
      }

      for (let vertexIdx = 0; vertexIdx < numVertices; ++vertexIdx) {
        networkGraph[vertexIdx] = [];
      }
    } else {
      const edgeDetails = inputLines[lineIndex].split(' ').map(Number);

      if (edgeDetails.length < 3 || isNaN(edgeDetails[0]) || isNaN(edgeDetails[1]) || isNaN(edgeDetails[2])) {
        console.warn(`Warning: Invalid edge definition on line ${lineIndex + 1}. Skipping this line.`);
        continue;
      }

      appendEdgeData(edgeDetails[0], edgeDetails[1], edgeDetails[2]);
    }
  }

  const finalMaxFlow = calculateMaxNetworkFlow(0, numVertices - 1);
  console.log(finalMaxFlow);
});

function appendEdgeData(originNode, destinationNode, capacityValue) {
  if (originNode < 0 || originNode >= numVertices || destinationNode < 0 || destinationNode >= numVertices) {
    console.warn(`Warning: Attempted to add edge with out-of-bounds node indices: (${originNode}, ${destinationNode}). Skipping.`);
    return;
  }
  if (capacityValue < 0) {
    console.warn(`Warning: Attempted to add edge with negative capacity: ${capacityValue}. Skipping.`);
    return;
  }
  if (originNode === destinationNode && capacityValue > 0) {
    console.warn(`Warning: Self-loop edge detected for node ${originNode} with positive capacity. This might lead to unexpected behavior in flow algorithms. Skipping.`);
    return;
  }

  networkGraph[originNode].push({
    target: destinationNode,
    flowCapacity: capacityValue,
    reverseEdgeIdx: networkGraph[destinationNode].length
  });

  networkGraph[destinationNode].push({
    target: originNode,
    flowCapacity: 0,
    reverseEdgeIdx: networkGraph[originNode].length - 1
  });
}

function findAugmentingPath(currentNode, targetNode, currentFlowLimit) {
  if (currentFlowLimit <= 0) { // Early exit if no flow can be pushed
    return 0;
  }
  if (currentNode === targetNode) {
    return currentFlowLimit;
  }

  nodeVisitedStatus[currentNode] = true;

  for (let edgeIndex = 0; edgeIndex < networkGraph[currentNode].length; ++edgeIndex) {
    const currentEdge = networkGraph[currentNode][edgeIndex];

    if (!nodeVisitedStatus[currentEdge.target] && currentEdge.flowCapacity > 0) {
      const potentialFlow = Math.min(currentFlowLimit, currentEdge.flowCapacity);

      const foundFlowAmount = findAugmentingPath(currentEdge.target, targetNode, potentialFlow);

      if (foundFlowAmount > 0) {
        currentEdge.flowCapacity -= foundFlowAmount;
        networkGraph[currentEdge.target][currentEdge.reverseEdgeIdx].flowCapacity += foundFlowAmount;

        return foundFlowAmount;
      }
    }
  }

  return 0;
}

function calculateMaxNetworkFlow(sourceNode, sinkNode) {
  if (sourceNode < 0 || sourceNode >= numVertices || sinkNode < 0 || sinkNode >= numVertices) {
    console.error("Error: Invalid source or sink node specified for max flow calculation. Exiting.");
    process.exit(1);
  }
  if (sourceNode === sinkNode) {
    console.warn("Warning: Source and sink nodes are the same. Max flow will be 0.");
    return 0;
  }

  let totalNetworkFlow = 0;
  let foundFlowAmount = 0;
  let iterationSafetyCounter = 0;
  // A heuristic upper bound for Edmonds-Karp iterations is roughly E * V^2, but
  // for simple graphs, V*E can be a reasonable safety net.
  const MAX_ITERATIONS_ALLOWED = Math.max(1000, numVertices * totalEdges * 2);

  do {
    nodeVisitedStatus = new Array(numVertices).fill(false);

    // Initial flow limit for DFS is the maximum safe integer, effectively infinity.
    foundFlowAmount = findAugmentingPath(sourceNode, sinkNode, Number.MAX_SAFE_INTEGER);

    totalNetworkFlow += foundFlowAmount;

    iterationSafetyCounter++;
    if (iterationSafetyCounter > MAX_ITERATIONS_ALLOWED) {
      console.warn("Warning: Max flow calculation exceeded iteration limit. Graph might be too large or contains issues. Returning current flow.");
      break;
    }

  } while (foundFlowAmount > 0);

  return totalNetworkFlow;
}