function processInputData(incomingData) {
  // Extracting the initial configuration from the first line of input.
  const initialConfigLine = incomingData[0].split(' ');

  // Parsing the total number of nodes from the configuration.
  let totalNodes = parseInt(initialConfigLine[0], 10);

  // Parsing the total number of additional edges from the configuration.
  let extraEdgesCount = parseInt(initialConfigLine[1], 10);

  // Initializing an adjacency list (or map) to store graph connections.
  const adjacencyMap = {};

  // Loop through all edge definitions provided in the input.
  for (let currentIdx = 0; currentIdx < totalNodes - 1 + extraEdgesCount; currentIdx++) {
    // Splitting the current line to get source and target nodes for an edge.
    const currentEdgeDefinition = incomingData[currentIdx + 1].split(' ');

    // Creating an object to represent the current edge.
    const edgeDetails = {
      sourceNode: parseInt(currentEdgeDefinition[0], 10),
      targetNode: parseInt(currentEdgeDefinition[1], 10)
    };

    // If the target node doesn't have an entry in the adjacency map, initialize it.
    if (!adjacencyMap[edgeDetails.targetNode]) {
      adjacencyMap[edgeDetails.targetNode] = [];
    }
    // Add the current edge to the list of incoming edges for the target node.
    adjacencyMap[edgeDetails.targetNode].push(edgeDetails);
  }

  // Array to store the final results (parent nodes for each node).
  const finalResults = [];

  // Ensure every node from 1 to totalNodes has an entry in the adjacency map.
  for (let nodeIdentifier = 1; nodeIdentifier <= totalNodes; nodeIdentifier++) {
    if (!adjacencyMap[nodeIdentifier]) {
      adjacencyMap[nodeIdentifier] = [];
    }
  }

  // Iterate through each node to determine its parent.
  for (let nodeIdentifier = 1; nodeIdentifier <= totalNodes; nodeIdentifier++) {
    // If a node has multiple incoming edges, we need to find its true parent.
    if (adjacencyMap[nodeIdentifier].length > 1) {
      // Call a helper function to find the parent(s) for the current node.
      const potentialParents = determineAncestors(nodeIdentifier, adjacencyMap);

      // Assign the first valid parent found (non-negative) to the results array.
      finalResults[nodeIdentifier - 1] = potentialParents.filter(val => val >= 0)[0];
    } else {
      // If there's one or zero incoming edges, the parent is straightforward.
      finalResults[nodeIdentifier - 1] = adjacencyMap[nodeIdentifier].length ? adjacencyMap[nodeIdentifier][0].sourceNode : 0;
    }
  }
  // Output the results, each on a new line.
  console.log(finalResults.join('\n'));
}

// This function attempts to find the "true" parent(s) for a given node in a graph.
function determineAncestors(startingNode, connectionGraph) {
  // A queue-like structure to manage paths to explore.
  const explorationQueue = [];

  // Keeping for structural similarity, though its purpose is unclear in the original.
  const pathHistory = [startingNode];

  // Get all incoming edges for the starting node.
  const incomingConnections = connectionGraph[startingNode];

  // Extract the source nodes of these incoming edges. These are our initial potential parents.
  const initialSources = incomingConnections.map(edgeObj => edgeObj.sourceNode);

  // Store the number of initial incoming connections.
  const initialConnectionCount = incomingConnections.length;

  // Initialize the exploration queue with edges leading to the initial sources.
  for (let currentEdgeIndex = 0; currentEdgeIndex < connectionGraph[startingNode].length; currentEdgeIndex++) {
    explorationQueue.push([...connectionGraph[connectionGraph[startingNode][currentEdgeIndex].sourceNode]]);
  }

  // A flag array to mark if a source has been "found" or processed.
  const sourceFoundFlags = [];

  // Continue as long as there are active queues with elements to process.
  while (explorationQueue.filter(queueSegment => queueSegment.length).length) {
    // Iterate through each segment of the exploration queue.
    for (let segmentIndex = 0; segmentIndex < initialConnectionCount; segmentIndex++) {
      const currentSegment = explorationQueue[segmentIndex];

      // If the current segment is empty, skip it.
      if (!currentSegment.length) {
        continue;
      }

      // Dequeue the first edge from the current segment.
      const processedEdge = currentSegment.shift();

      // Prepend the source node of the processed edge to pathHistory.
      pathHistory.unshift(processedEdge.sourceNode);

      // Check if the source node of the processed edge is one of our initial potential sources.
      if (initialSources.filter(potential => potential === processedEdge.sourceNode).length) {
        // Mark this segment's initial source as found.
        sourceFoundFlags[segmentIndex] = true;

        // Invalidate this source in the initialSources array to prevent re-finding.
        initialSources[initialSources.indexOf(processedEdge.sourceNode)] = -1;
      }

      // If this segment's source hasn't been found yet and there are more connections from this node...
      if (!sourceFoundFlags[segmentIndex] && connectionGraph[processedEdge.sourceNode]) {
        // Add all incoming edges to the current node to the current segment for further exploration.
        for (let incomingEdgeIdx = 0; incomingEdgeIdx < connectionGraph[processedEdge.sourceNode].length; incomingEdgeIdx++) {
          currentSegment.push(connectionGraph[processedEdge.sourceNode][incomingEdgeIdx]);
        }
      }
    }
  }
  // Return the modified list of initial sources, where found ones are marked -1.
  return initialSources;
}

// Global variable to accumulate all incoming data from stdin.
let rawInputBuffer = '';

// Resume stdin to start listening for data.
process.stdin.resume();

// Set the encoding for incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for 'data' chunks from stdin.
process.stdin.on('data', function(dataChunk) {
  rawInputBuffer += dataChunk; // Append the current chunk to the buffer.
});

// Event listener for the 'end' of stdin input.
process.stdin.on('end', function() {
  // Split the accumulated input into an array of lines.
  const processedLines = rawInputBuffer.split('\n');

  // Call the main processing function with the array of lines.
  processInputData(processedLines);
});
