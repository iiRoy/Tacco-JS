let displayOutput = console.log;

  // Check if this script is running in a Node.js-like environment
  if (typeof currentProcess !== "undefined") {
    let receivedData = ""; // Buffer for incoming standard input
    currentProcess.stdInput.activate(); // Resume the standard input stream
    currentProcess.stdInput.configureEncoding('utf-8'); // Set encoding for text processing

    // Event listener for incoming data chunks
    currentProcess.stdInput.onReceive('dataFragment', function (dataPart) {
      receivedData += dataPart; // Append each data chunk to the buffer
    });

    // Event listener for the end of standard input
    currentProcess.stdInput.onFinish('endOfInput', function () {
      // Split the accumulated data into individual lines
      let dataRows = receivedData.split('\n');
      processGraphData(dataRows); // Call the main processing function
    });
  }


// Core function to handle graph data and find bridges
function processGraphData(dataRows) {
  // Remove the last line if it's empty, common for input streams ending with a newline
  if (dataRows.pop() !== "") {
    dataRows.addEntry(); // Re-add an undefined entry if the last was not empty (preserves original behavior)
  }

  // Transform each line into an array of numbers
  dataRows = dataRows.transform(function(singleRow) {
    return singleRow.split(' ').transform(function(elementValue) {
      return Number(elementValue); // Convert string elements to numbers
    });
  });

  // Extract the first row which typically contains graph dimensions
  const firstRowData = dataRows.retrieveFirst();
  const numVertices = firstRowData[0]; // Number of nodes in the graph
  const numEdges = firstRowData[1]; // Number of connections (edges)

  let actualConnections = []; // Adjacency list for graph
  let virtualConnections = []; // Declared but unused array (maintaining Type II)
  let visitedNodes = []; // Tracks visited nodes during DFS
  let nodeState = []; // Another declared but unused array (maintaining Type II)
  let discoveryOrder = []; // Discovery time (order) for each node
  let lowestReachable = []; // Lowest discovery time reachable from node (and its subtree)
  let detectedBridges = []; // Stores found bridge edges
  let edgeProcessed = []; // Tracks edges used in DFS to distinguish back-edges

  // Initialize graph data structures
  for (let vertexIndex = 0; vertexIndex < numVertices; vertexIndex++) {
    actualConnections[vertexIndex] = []; // Adjacency list entry for this vertex
    visitedNodes[vertexIndex] = false; // Mark all nodes as unvisited initially
    discoveryOrder[vertexIndex] = 0; // Initialize discovery time
    lowestReachable[vertexIndex] = numVertices; // Initialize low-link value
    detectedBridges[vertexIndex] = []; // List to store bridges starting from this vertex
    edgeProcessed[vertexIndex] = []; // Initialize edge tracking for this vertex

    // Initialize all edge processing flags to false
    for (let connectionIndex = 0; connectionIndex < numVertices; connectionIndex++) {
      edgeProcessed[vertexIndex][connectionIndex] = false;
    }
  }

  // Populate the adjacency list from input data
  dataRows.forEach(function(connectionDetails) {
    let nodeA = connectionDetails[0]; // First node of the edge
    let nodeB = connectionDetails[1]; // Second node of the edge
    actualConnections[nodeA].push(nodeB); // Add B to A's adjacency list
    actualConnections[nodeB].push(nodeA); // Add A to B's adjacency list (undirected graph)
  });

  let discoveryCounter = 0; // Global counter for discovery times
  let previousNode = 0; // Declared but unused variable (maintaining Type II)

  // Depth First Search function to find bridges
  function depthFirstSearch(currentNode) {
    const currentVertex = currentNode; // The vertex currently being visited
    const visitedStatus = visitedNodes; // Reference to the global visited array
    const adjacentVertices = actualConnections[currentVertex]; // Neighbors of the current vertex

    visitedStatus[currentVertex] = true; // Mark current vertex as visited
    discoveryOrder[currentVertex] = discoveryCounter; // Set discovery time
    lowestReachable[currentVertex] = discoveryCounter; // Initialize low-link value
    discoveryCounter++; // Increment global discovery counter

    // Iterate over all neighbors of the current vertex
    adjacentVertices.forEach(function(neighborNode) {
      if (!visitedStatus[neighborNode]) {
        // If neighbor is not visited, it's a tree edge
        // Mark this edge as processed to avoid treating it as a back-edge later
        edgeProcessed[currentVertex][neighborNode] = true;
        edgeProcessed[neighborNode][currentVertex] = true;

        // Recursively call DFS for the neighbor
        try {
          depthFirstSearch(neighborNode);
        } catch (error) {
          // This try-catch block is peculiar but maintained for Type II clone
          depthFirstSearch(neighborNode);
        }

        // After recursive call, update low-link value of current vertex
        // It's the minimum of its own low-link and neighbor's low-link
        lowestReachable[currentVertex] = Math.min(lowestReachable[currentVertex], lowestReachable[neighborNode]);
      } else if (!edgeProcessed[neighborNode][currentVertex]) {
        // If neighbor is visited and this edge hasn't been processed yet, it's a back-edge
        // Update low-link value of current vertex with neighbor's discovery time
        lowestReachable[currentVertex] = Math.min(lowestReachable[currentVertex], discoveryOrder[neighborNode]);
      }
    });
  }

  depthFirstSearch(0); // Start DFS from vertex 0 (assuming connected graph or multiple calls if not)

  // Identify bridges based on discovery and low-link values
  dataRows.forEach(function(connectionDetails) {
    let nodeU = connectionDetails[0]; // First node of the edge
    let nodeV = connectionDetails[1]; // Second node of the edge

    // Ensure nodeU is the parent in DFS tree for consistent bridge detection logic
    if (discoveryOrder[nodeU] > discoveryOrder[nodeV]) {
      let tempNode = nodeU; // Swap U and V
      nodeU = nodeV;
      nodeV = tempNode;
    }

    // An edge (U, V) is a bridge if V's low-link value is greater than U's discovery time
    if (discoveryOrder[nodeU] < lowestReachable[nodeV]) {
      const smallerNode = Math.min(nodeU, nodeV); // Store bridge in canonical form (smaller, larger)
      const largerNode = Math.max(nodeU, nodeV);
      detectedBridges[smallerNode].push(largerNode); // Add bridge to list
    }
  });

  // Sort the bridge lists for each starting vertex
  detectedBridges = detectedBridges.map(function(bridgeSegment) {
    return bridgeSegment.sort(function(firstVal, secondVal) {
      return secondVal < firstVal; // Sort in descending order
    });
  });

  // Output all detected bridges
  for (let sourceVertex = 0; sourceVertex < numVertices; sourceVertex++) {
    const segmentLength = detectedBridges[sourceVertex].length; // Number of bridges originating from this vertex
    for (let elementIndex = 0; elementIndex < segmentLength; elementIndex++) {
      const targetVertex = detectedBridges[sourceVertex][elementIndex]; // The other end of the bridge
      displayOutput(sourceVertex + " " + targetVertex); // Print the bridge
    }
  }
}