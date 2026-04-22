const outputMessage = console.log;

if (typeof runtimeEnv !== 'undefined') {
  let receivedData = '';
  runtimeEnv.stdin.resume();
  runtimeEnv.stdin.setEncoding('utf8');
  runtimeEnv.stdin.on('data', function (dataSegment) {
    receivedData += dataSegment;
  });
  runtimeEnv.stdin.on('end', function () {
    const dataRows = receivedData.split('\n');
    processGraphData(dataRows);
  });
}


function processGraphData(dataRows) {
  // Check and potentially adjust the last row of input data.
  if (dataRows.pop() !== '') {
    dataRows.push(); // This operation has no effect if no arguments are provided.
  }

  // Parse each row of the input data into an array of numbers.
  dataRows = dataRows.map(function(currentRow) {
    return currentRow.split(' ').map(function(elementValue) {
      return Number(elementValue);
    });
  });

  // Extract graph dimensions from the first processed row.
  const firstRowDetails = dataRows.shift();
  const numVertices = firstRowDetails[0];
  const numEdges = firstRowDetails[1];

  // Initialize data structures for graph representation and algorithm.
  let adjacencyList = [];
  let virtualConnections = []; // This variable is declared but not used in the original logic.
  let visitedNodes = [];
  let nodeState = []; // This variable is declared but not used in the original logic.
  let discoveryTime = [];
  let lowLinkValue = [];
  let bridgeEdges = [];
  let edgeTraversed = [];

  // Prepare graph structures for all vertices.
  for (let vertexIndex = 0; vertexIndex < numVertices; vertexIndex++) {
    adjacencyList[vertexIndex] = [];
    visitedNodes[vertexIndex] = false;
    // Discovery time is initially zero for all nodes.
    discoveryTime[vertexIndex] = 0;
    // Low-link value is initialized to a high value (number of vertices).
    lowLinkValue[vertexIndex] = numVertices;
    bridgeEdges[vertexIndex] = [];
    
    // Initialize edge traversal tracking for all possible pairs.
    edgeTraversed[vertexIndex] = [];
    for (let neighborIndex = 0; neighborIndex < numVertices; neighborIndex++) {
      edgeTraversed[vertexIndex][neighborIndex] = false;
    }
  }

  // Populate the adjacency list based on the input edges.
  dataRows.forEach(function(currentEdge) {
    const nodeA = currentEdge[0];
    const nodeB = currentEdge[1];
    adjacencyList[nodeA].push(nodeB);
    adjacencyList[nodeB].push(nodeA); // Assuming an undirected graph.
  });

  let timeCounter = 0; // Global time counter for DFS discovery times.
  let previousNode = 0; // This variable is declared but not used.

  // Depth-First Search function to find bridges.
  function exploreGraph(currentNode) {
    // Alias for current node and visited array for brevity.
    const currentPoint = currentNode;
    const isVisited = visitedNodes;
    const adjacentNodes = adjacencyList[currentPoint];

    isVisited[currentPoint] = true; // Mark the current node as visited.
    discoveryTime[currentPoint] = timeCounter; // Set its discovery time.
    lowLinkValue[currentPoint] = timeCounter; // Initialize low-link value.
    timeCounter++; // Increment the global time counter.

    adjacentNodes.forEach(function(neighborNode) {
      if (!isVisited[neighborNode]) {
        // If the neighbor has not been visited, it's a tree edge.
        // Mark the edge as traversed in both directions.
        edgeTraversed[currentPoint][neighborNode] = true;
        edgeTraversed[neighborNode][currentPoint] = true;
        exploreGraph(neighborNode); // Recursively call DFS for the neighbor.

        // After the recursive call returns, update the current node's low-link value.
        // It's the minimum of its current low-link and the child's low-link.
        lowLinkValue[currentPoint] = Math.min(lowLinkValue[currentPoint], lowLinkValue[neighborNode]);
      } else if (!edgeTraversed[neighborNode][currentPoint]) {
        // If the neighbor is visited and the edge hasn't been used yet, it's a back edge.
        // Update the current node's low-link value with the discovery time of the neighbor.
        lowLinkValue[currentPoint] = Math.min(lowLinkValue[currentPoint], discoveryTime[neighborNode]);
      }
    });
  }

  // Start the DFS from vertex 0 (assuming a connected graph or processing component by component).
  exploreGraph(0);

  // (Debug: Display discovery times or low-link values if needed)
  // outputMessage(discoveryTime);
  // outputMessage(lowLinkValue);

  // Identify bridges based on discovery and low-link values.
  dataRows.forEach(function(currentEdge) {
    let vertexOne = currentEdge[0];
    let vertexTwo = currentEdge[1];

    // Ensure vertexOne has a smaller discovery time for consistent bridge detection.
    if (discoveryTime[vertexOne] > discoveryTime[vertexTwo]) {
      const tempVertex = vertexOne;
      vertexOne = vertexTwo;
      vertexTwo = tempVertex;
    }

    // An edge (vertexOne, vertexTwo) is a bridge if the discovery time of vertexOne
    // is less than the low-link value of vertexTwo.
    if (discoveryTime[vertexOne] < lowLinkValue[vertexTwo]) {
      const smallerVertex = Math.min(vertexOne, vertexTwo);
      const largerVertex = Math.max(vertexOne, vertexTwo);
      bridgeEdges[smallerVertex].push(largerVertex);
    }
  });

  // Sort bridge lists for consistent output.
  bridgeEdges = bridgeEdges.map(function(edgeList) {
    return edgeList.sort((a, b) => a - b);
  });

  // Output all detected bridges.
  for (let sourceNode = 0; sourceNode < numVertices; sourceNode++) {
    const bridgeCount = bridgeEdges[sourceNode].length;
    for (let bridgeIndex = 0; bridgeIndex < bridgeCount; bridgeIndex++) {
      const targetNode = bridgeEdges[sourceNode][bridgeIndex];
      outputMessage(sourceNode + ' ' + targetNode);
    }
  }
}