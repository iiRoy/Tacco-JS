function performGraphProcessing(dataBuffer) {
  /*
   * This function orchestrates the graph analysis based on the provided input.
   * It parses graph dimensions, builds an adjacency list, and then
   * computes a specific predecessor for each node.
   */

  // Extract graph parameters from the very first line of the input.
  const initialSettings = dataBuffer[0].split(' ');
  const vertexCount = parseInt(initialSettings[0], 10);
  const arcCount = parseInt(initialSettings[1], 10);

  // Initialize a structure to hold the graph's connections (adjacency list).
  const graphMap = {};

  // Process subsequent lines to populate the graph with edge information.
  // The loop runs for a combined total of (vertexCount - 1) + arcCount edge definitions.
  for (let k = 0; k < vertexCount - 1 + arcCount; ++k) {
    const currentLineSegments = dataBuffer[k + 1].split(' ');

    // Create an object representing a single directed edge.
    const edgeObject = {
      source: parseInt(currentLineSegments[0], 10),
      target: parseInt(currentLineSegments[1], 10)
    };

    // If the target node hasn't been encountered yet, initialize its list of incoming edges.
    if (!graphMap[edgeObject.target]) {
      graphMap[edgeObject.target] = [];
    }
    // Add the current edge to the target node's list of incoming edges.
    graphMap[edgeObject.target].push(edgeObject);
  }

  // Prepare an array to store the final computed predecessor for each vertex.
  const outputResults = [];

  // Ensure every node from 1 to vertexCount exists in the graphMap,
  // even if it has no incoming edges, by assigning an empty array.
  for (let vId = 1; vId <= vertexCount; vId++) {
    if (!graphMap[vId]) {
      graphMap[vId] = [];
    }
  }

  // Iterate through each vertex to determine its specific predecessor.
  for (let vId = 1; vId <= vertexCount; vId++) {
    // If a node has more than one incoming edge, a more complex trace is needed.
    if (graphMap[vId].length > 1) {
      const ancestorNodes = determinePredecessors(vId, graphMap);
      // Filter for valid (non-negative) ancestors and pick the first one found.
      outputResults[vId - 1] = ancestorNodes.filter(val => val >= 0)[0];
    } else {
      // If a node has one or no incoming edges, the predecessor is direct or zero.
      outputResults[vId - 1] = graphMap[vId].length ? graphMap[vId][0].source : 0;
    }
  }

  // Output the computed results, with each result on a new line.
  console.log(outputResults.join('\n'));
}

/**
 * Traces backward through the graph from a given node to identify its
 * relevant predecessors, particularly when there are multiple incoming paths.
 * @param {number} currentNodeId The unique identifier of the node to begin the predecessor search from.
 * @param {object} graphData The complete graph represented as an adjacency list.
 * @returns {Array<number>} An array containing the identified predecessors or markers.
 */
function determinePredecessors(currentNodeId, graphData) {
  // A collection of paths currently under exploration, each being an array of edges.
  const searchQueue = [];
  // A list to track nodes visited during the backward traversal (not directly returned).
  const visitedPath = [currentNodeId];

  // Retrieve all edges that lead directly into the currentNodeId.
  const incidentEdges = graphData[currentNodeId];
  // Map these incident edges to their source nodes, which are our initial potential targets.
  const potentialTargets = incidentEdges.map(edgeItem => edgeItem.source);
  const numberOfIncidentEdges = incidentEdges.length;

  // Initialize the searchQueue: for each incident edge, add paths starting from its source node.
  for (let k = 0; k < graphData[currentNodeId].length; ++k) {
    searchQueue.push([...graphData[graphData[currentNodeId][k].source]]);
  }

  // Flags to indicate if a potential target has been successfully traced back to.
  const foundTargetFlags = [];

  // Continue the search as long as there are paths in the queue that are not empty.
  while (searchQueue.filter(pathSegment => pathSegment.length).length) {
    for (let pathIdx = 0; pathIdx < numberOfIncidentEdges; ++pathIdx) {
      const currentPath = searchQueue[pathIdx];
      // Skip if the current path segment is empty.
      if (!currentPath.length) {
        continue;
      }

      // Dequeue the next edge from the current path.
      const dequeuedElement = currentPath.shift();
      visitedPath.unshift(dequeuedElement.source); // Add source of dequeued edge to visited list.

      // Check if the source of the dequeued edge matches one of our initial potential targets.
      if (potentialTargets.filter(targetId => targetId === dequeuedElement.source).length) {
        foundTargetFlags[pathIdx] = true;
        // Mark the found target by changing its value to -1.
        potentialTargets[potentialTargets.indexOf(dequeuedElement.source)] = -1;
      }

      // If this path hasn't found its target yet AND the dequeued element's source node has outgoing edges.
      if (!foundTargetFlags[pathIdx] && graphData[dequeuedElement.source]) {
        // Extend the current path by adding all outgoing edges from the dequeued node's source.
        for (let edgeIdx = 0; edgeIdx < graphData[dequeuedElement.source].length; ++edgeIdx) {
          currentPath.push(graphData[dequeuedElement.source][edgeIdx]);
        }
      }
    }
  }
  // Return the modified list of potential targets.
  return potentialTargets;
}

/*
 * Standard boilerplate for handling input from stdin in Node.js environments.
 * Accumulates data chunks and processes them once all input has been received.
 */
let incomingData = '';

// Begin reading from standard input.
process.stdin.resume();
// Set the character encoding for the input stream.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on('data', function(dataChunk) {
  incomingData += dataChunk;
});

// Event listener for when all input has been received.
process.stdin.on('end', function() {
  // Split the accumulated input into individual lines.
  incomingData = incomingData.split('\n');
  // Invoke the main graph processing function with the prepared input.
  performGraphProcessing(incomingData);
});