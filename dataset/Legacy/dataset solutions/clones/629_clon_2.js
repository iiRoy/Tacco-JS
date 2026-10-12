var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var dataRows = rawData.split('\n');

var numNodes = dataRows[0].split(' ')[0] - 0;
var numEdges = dataRows[0].split(' ')[1] - 0;
var initialHeight = dataRows[0].split(' ')[2] - 0;

var idx1, idx2, idx3; // Loop counters
var nodeHeights = Array(numNodes); // Stores height for each node

var adjList = Array(numNodes); // Adjacency list for graph
var processingQueue = []; // Stack for DFS-like traversal

// Initialize node heights and adjacency list structure
for(idx1 = 0; idx1 < numNodes; idx1++) {
  nodeHeights[idx1] = dataRows[idx1 + 1] - 0; // Parse height from input
  adjList[idx1] = []; // Initialize empty array for neighbors
}

var edgeParts, nodeA, nodeB, travelTime;
// Populate the adjacency list with edges
for(idx1 = 0; idx1 < numEdges; idx1++) {
   edgeParts = dataRows[idx1 + numNodes + 1].split(' ');
   nodeA = edgeParts[0] - 1; // Adjust to 0-indexed
   nodeB = edgeParts[1] - 1; // Adjust to 0-indexed
   travelTime = edgeParts[2] - 0; // Parse travel time

   // Add edge for nodeA to nodeB
   adjList[nodeA].push({
     targetNode: nodeB,
     duration: travelTime
   });
   // Add edge for nodeB to nodeA (undirected graph)
   adjList[nodeB].push({
     targetNode: nodeA,
     duration: travelTime
   });
}

// Push initial state to the processing queue
processingQueue.push({
  currentPosition: 0, // Starting node index
  accumulatedTime: 0, // Time elapsed so far
  currentWaterLevel: initialHeight, // Current water level
  visitedPath:[0] // Path taken to reach this state
});

var currentNode, nextNodeIdx, edgeInfo, finalPath;
var minimumTime = Infinity; // Initialize minimum time to a very large value

// Process states from the queue
while (processingQueue.length > 0){
  currentNode = processingQueue.pop(); // Get the last state from the queue

  // Iterate through all neighbors of the current node
  for (idx1 = 0; idx1 < adjList[currentNode.currentPosition].length; idx1++) {
    edgeInfo = adjList[currentNode.currentPosition][idx1];
    nextNodeIdx = edgeInfo.targetNode;

    // Skip if the next node has already been visited in this path
    if (currentNode.visitedPath.indexOf(nextNodeIdx) !== -1) {
      continue;
    }
    
    // Skip if current node's height is less than edge travel time
    if (nodeHeights[currentNode.currentPosition] < edgeInfo.duration) {
      continue;
    }

    // Calculate new state based on water level changes
    if (nodeHeights[nextNodeIdx] + edgeInfo.duration < currentNode.currentWaterLevel ) {
      // Case 1: Water level drops below next node's height + travel time
      processingQueue.push({
        currentPosition: nextNodeIdx,
        accumulatedTime: currentNode.accumulatedTime + edgeInfo.duration + currentNode.currentWaterLevel - (nodeHeights[nextNodeIdx] + edgeInfo.duration),
        currentWaterLevel: nodeHeights[nextNodeIdx],
        visitedPath: currentNode.visitedPath.concat(nextNodeIdx)
      });
    } else if (nodeHeights[nextNodeIdx] + edgeInfo.duration >= currentNode.currentWaterLevel && currentNode.currentWaterLevel >= edgeInfo.duration) {
      // Case 2: Water level stays above or at next node's height + travel time, and above travel time
      processingQueue.push({
        currentPosition: nextNodeIdx,
        accumulatedTime: currentNode.accumulatedTime + edgeInfo.duration,
        currentWaterLevel: currentNode.currentWaterLevel - edgeInfo.duration,
        visitedPath: currentNode.visitedPath.concat(nextNodeIdx)
      });
    } else {
      // Case 3: Water level drops to 0
      processingQueue.push({
        currentPosition: nextNodeIdx,
        accumulatedTime: currentNode.accumulatedTime + edgeInfo.duration + edgeInfo.duration - currentNode.currentWaterLevel,
        currentWaterLevel: 0,
        visitedPath: currentNode.visitedPath.concat(nextNodeIdx)
      });
    }
    
    // If the next node is the destination (n-1)
    if(nextNodeIdx === numNodes - 1) {
      finalPath = processingQueue.pop(); // Get the newly added state for the destination
      // Update minimum time, considering the remaining water level at the destination
      minimumTime = Math.min(minimumTime, finalPath.accumulatedTime + nodeHeights[numNodes - 1] - finalPath.currentWaterLevel);
    }
  }
}

// Output the calculated minimum time
console.log(minimumTime);
