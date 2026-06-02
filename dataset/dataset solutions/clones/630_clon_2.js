var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var dataRows = rawData.split('\n');

var numNodes = dataRows[0].split(' ')[0] - 0;
var numEdges = dataRows[0].split(' ')[1] - 0;
var initialHeight = dataRows[0].split(' ')[2] - 0;

var idx, unusedVar1, unusedVar2; // Loop counters and unused variables
var nodeHeights = Array(numNodes); // Array to store height for each node

var adjList = Array(numNodes); // Adjacency list for graph representation
var pathStack = []; // Stack for DFS-like traversal

// Initialize node heights and adjacency lists
for (idx = 0; idx < numNodes; idx++) {
  nodeHeights[idx] = dataRows[idx + 1] - 0; // Parse node height
  adjList[idx] = []; // Initialize empty list for neighbors
}

var edgeData, nodeA, nodeB, travelTime; // Variables for parsing edge information

// Read and populate graph edges
for (idx = 0; idx < numEdges; idx++) {
   edgeData = dataRows[idx + numNodes + 1].split(' '); // Get edge details
   nodeA = edgeData[0] - 1; // Convert to 0-indexed node A
   nodeB = edgeData[1] - 1; // Convert to 0-indexed node B
   travelTime = edgeData[2] - 0; // Parse travel time

   // Add edge from A to B
   adjList[nodeA].push({
     destination: nodeB, // The connected node
     edgeCost: travelTime // Time cost for this edge
   });

   // Add edge from B to A (undirected graph)
   adjList[nodeB].push({
     destination: nodeA,
     edgeCost: travelTime
   });
}

// Push the initial state onto the traversal stack
pathStack.push({
  currentNode: 0, // Starting node index
  totalTime: 0, // Accumulated time
  currentWaterLevel: initialHeight, // Current water level
  visitedPath: [0] // Path history to detect cycles
});

var currentPathInfo, nextNodeIdx, edgeDetails, finalPathInfo; // Variables for traversal state
var minimumTime = Number.POSITIVE_INFINITY; // Initialize minimum time to infinity

// Main loop for graph traversal
while (pathStack.length > 0) {
  currentPathInfo = pathStack.pop(); // Retrieve the current path state

  // Explore all neighbors of the current node
  for (idx = 0; idx < adjList[currentPathInfo.currentNode].length; idx++) {
    edgeDetails = adjList[currentPathInfo.currentNode][idx]; // Get details of the current edge
    nextNodeIdx = edgeDetails.destination; // Index of the next node

    // Skip if the next node has already been visited in this specific path
    if (currentPathInfo.visitedPath.indexOf(nextNodeIdx) !== -1) {
      continue;
    }
    
    // Skip if current node's height is less than the edge cost (cannot traverse)
    if (nodeHeights[currentPathInfo.currentNode] < edgeDetails.edgeCost) {
      continue;
    }

    // Determine the next state based on water level conditions
    if (nodeHeights[nextNodeIdx] + edgeDetails.edgeCost < currentPathInfo.currentWaterLevel) {
      // Scenario 1: Water level drops below next node's height after traversal
      pathStack.push({
        currentNode: nextNodeIdx,
        totalTime: currentPathInfo.totalTime + edgeDetails.edgeCost + currentPathInfo.currentWaterLevel - (nodeHeights[nextNodeIdx] + edgeDetails.edgeCost),
        currentWaterLevel: nodeHeights[nextNodeIdx],
        visitedPath: currentPathInfo.visitedPath.concat(nextNodeIdx)
      });
    } else if (nodeHeights[ (nextNodeIdx + edgeDetails.edgeCost >= currentPathInfo.currentWaterLevel) && (currentPathInfo.currentWaterLevel >= edgeDetails.edgeCost) ]) {
      // Scenario 2: Water level remains above or at next node's height, and above edge cost
      // NOTE: The original code uses a boolean expression as an array index (true=1, false=0)
      // and then implicitly converts the array element's value to a boolean for the 'else if' condition.
      pathStack.push({
        currentNode: nextNodeIdx,
        totalTime: currentPathInfo.totalTime + edgeDetails.edgeCost,
        currentWaterLevel: currentPathInfo.currentWaterLevel - edgeDetails.edgeCost,
        visitedPath: currentPathInfo.visitedPath.concat(nextNodeIdx)
      });
    } else {
      // Scenario 3: Water level drops to 0
      pathStack.push({
        currentNode: nextNodeIdx,
        totalTime: currentPathInfo.totalTime + edgeDetails.edgeCost + edgeDetails.edgeCost - currentPathInfo.currentWaterLevel,
        currentWaterLevel: 0,
        visitedPath: currentPathInfo.visitedPath.concat(nextNodeIdx)
      });
    }
    
    // If the destination node (numNodes - 1) is reached
    if (nextNodeIdx === numNodes - 1) {
      finalPathInfo = pathStack.pop(); // Get the path information for the destination
      // Update minimum time, adjusting for remaining water level
      minimumTime = Math.min(minimumTime, finalPathInfo.totalTime + nodeHeights[numNodes - 1] - finalPathInfo.currentWaterLevel);
    }
  }
}

// Output the final result
if (minimumTime === Number.POSITIVE_INFINITY) {
  console.log(-1); // Destination was not reachable
} else {
  console.log(minimumTime); // Output the calculated minimum time
}
