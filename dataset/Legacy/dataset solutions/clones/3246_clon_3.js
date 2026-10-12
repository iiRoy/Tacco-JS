function processInput(rawData) {
  const firstLineParts = rawData[0].split(' ');
  const nodeCount = parseInt(firstLineParts[0]);
  const edgeCount = parseInt(firstLineParts[1]);

  const graphEdges = {};
  // Initialize adjacency list for all nodes from 1 to nodeCount
  for (let nodeIdx = 1; nodeIdx <= nodeCount; nodeIdx++) {
    graphEdges[nodeIdx] = [];
  }

  const totalEdgesToProcess = nodeCount - 1 + edgeCount;
  for (let loopIdx = 0; loopIdx < totalEdgesToProcess; loopIdx++) {
    const currentLineParts = rawData[loopIdx + 1].split(' ');
    const sourceNode = parseInt(currentLineParts[0]);
    const targetNode = parseInt(currentLineParts[1]);

    const edgeData = {
      from: sourceNode,
      to: targetNode
    };

    // Add edge to the adjacency list
    // Guard clause for safety, though pre-initialization makes it less critical for existing nodes.
    if (!graphEdges[edgeData.to]) {
      graphEdges[edgeData.to] = [];
    }
    graphEdges[edgeData.to].push(edgeData);
  }

  const resultArray = new Array(nodeCount); // Pre-allocate array for efficiency

  for (let currentNodeIdx = 1; currentNodeIdx <= nodeCount; currentNodeIdx++) {
    const currentEdgesForNode = graphEdges[currentNodeIdx];
    const edgeCountForNode = currentEdgesForNode.length;

    if (edgeCountForNode > 1) {
      const foundParents = determineSourceNodes(currentNodeIdx, graphEdges);
      const validParents = foundParents.filter(val => val >= 0);
      resultArray[currentNodeIdx - 1] = validParents[0];
    } else {
      const defaultSourceValue = 0; // Temporary constant for clarity
      resultArray[currentNodeIdx - 1] = edgeCountForNode > 0 ? currentEdgesForNode[0].from : defaultSourceValue;
    }
  }
  console.log(resultArray.join('\n'));
}

function determineSourceNodes(currentNode, graphData) {
  const pathQueue = [];
  const pathHistory = [currentNode];
  const incomingEdges = graphData[currentNode];

  const potentialSources = incomingEdges.map(edge => edge.from);
  const initialEdgeCount = incomingEdges.length;

  // Initialize pathQueue with copies of the incoming edge lists
  for (let idx = 0; idx < initialEdgeCount; idx++) {
    pathQueue.push([...graphData[incomingEdges[idx].from]]);
  }

  const sourceFoundFlags = new Array(initialEdgeCount).fill(false); // Pre-filled boolean array

  // Continue as long as there's at least one non-empty queue in pathQueue
  while (pathQueue.some(qItem => qItem.length > 0)) {
    for (let queueIndex = 0; queueIndex < initialEdgeCount; queueIndex++) {
      const currentPathSegmentQueue = pathQueue[queueIndex];

      // Skip if this specific path segment queue is empty or source already found for this path
      if (sourceFoundFlags[queueIndex] || currentPathSegmentQueue.length === 0) {
        continue;
      }

      const currentEdgeSegment = currentPathSegmentQueue.shift();
      pathHistory.unshift(currentEdgeSegment.from);

      // Check if the current segment's 'from' node is one of the original potential sources
      const sourceIndex = potentialSources.indexOf(currentEdgeSegment.from);
      if (sourceIndex !== -1) {
        sourceFoundFlags[queueIndex] = true;
        potentialSources[sourceIndex] = -1; // Mark the found source as processed
      }

      // If source not yet found for this path and there are further edges from current segment's 'from' node
      if (!sourceFoundFlags[queueIndex] && graphData[currentEdgeSegment.from]) {
        // Add all edges from the current segment's 'from' node to the current path segment queue
        currentPathSegmentQueue.push(...graphData[currentEdgeSegment.from]);
      }
    }
  }
  return potentialSources;
}

let rawInputData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  rawInputData += dataChunk;
});
process.stdin.on('end', function() {
  const processedInputLines = rawInputData.split('\n');
  processInput(processedInputLines);
});
