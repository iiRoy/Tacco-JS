const fileSystemModule = require('fs'); // Import the file system module.

// Determine the byte size of the standard input stream.
let fileSizeInBytes = fileSystemModule.fstatSync(process.stdin.fd).size;

// Create a data buffer of the determined size.
let dataBuffer = new Buffer(fileSizeInBytes);

// Read the entire standard input into the buffer.
let actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, fileSizeInBytes, 0);

// Convert the buffer content to a UTF-8 string and split it into an array of lines.
let lineInputs = dataBuffer.toString('utf-8', 0, actualBytesRead).split('\x0A');

// Initiate the primary graph processing routine.
processGraphData();

function processGraphData() {
  // Extract graph dimensions (number of nodes and edges) from the first input line.
  let currentLineParts = lineInputs.shift().split(' ');
  let nodeCount = currentLineParts[0];
  let edgeCount = currentLineParts[1];

  // Declare and initialize arrays for graph representation and dynamic programming.
  let allEdges = []; // Stores all edges as [source, target] pairs.
  let adjacencyList = []; // Represents the graph with forward connections.
  let reverseAdjacencyList = []; // Represents the graph with backward connections.
  let longestPathLengths = []; // Stores the maximum path length ending at each node.

  let idx, subIdx; // General-purpose loop counters.
  let currentLength; // Stores the length of an array for loop bounds.
  let sourceNode, targetNode; // Variables to hold edge endpoints.

  // Initialize graph structures and DP array for each node.
  for (idx = 0; idx < nodeCount; idx++) {
    adjacencyList[idx] = [];
    reverseAdjacencyList[idx] = [];
    longestPathLengths[idx] = 0; // All path lengths initially zero.
  }

  // Process each edge from the input.
  for (idx = 0; idx < edgeCount; idx++) {
    let edgeData = lineInputs[idx].split(' ');
    sourceNode = edgeData[0] - 1; // Convert to 0-indexed node identifier.
    targetNode = edgeData[1] - 1; // Convert to 0-indexed node identifier.

    allEdges[idx] = [sourceNode, targetNode]; // Record the edge.
    adjacencyList[sourceNode].push(targetNode); // Add to forward adjacency list.
    reverseAdjacencyList[targetNode].push(sourceNode); // Add to reverse adjacency list.
  }

  // Compute the longest path length to each node using dynamic programming.
  for (idx = 0; idx < nodeCount; idx++) {
    for (subIdx = 0, currentLength = adjacencyList[idx].length; subIdx < currentLength; subIdx++) {
      // If a longer path to the adjacent node is found, update its longestPathLengths value.
      if (longestPathLengths[adjacencyList[idx][subIdx]] < longestPathLengths[idx] + 1) {
        longestPathLengths[adjacencyList[idx][subIdx]] = longestPathLengths[idx] + 1;
      }
    }
  }

  // Determine the overall maximum path length found in the graph.
  let maximumPathLength = Math.max.apply(void 0, longestPathLengths);

  // Initialize arrays to identify critical nodes and count paths at specific levels.
  let criticalNodes = []; // Boolean array indicating if a node is part of a longest path.
  let pathCountsAtLevel = []; // Counts how many critical paths pass through a specific DP level.

  // Mark nodes that achieve the maximum path length and initialize level counts.
  for (idx = 0; idx < nodeCount; idx++) {
    criticalNodes[idx] = (maximumPathLength === longestPathLengths[idx]);
    pathCountsAtLevel[idx] = 0;
  }

  // Traverse nodes in reverse order to propagate critical node status and count unique paths.
  for (idx = nodeCount - 1; idx >= 0; idx--) {
    if (criticalNodes[idx]) { // If the current node is part of a longest path.
      for (subIdx = 0, currentLength = reverseAdjacencyList[idx].length; subIdx < currentLength; subIdx++) {
        // Check if a predecessor node contributes to a longest path ending at the current node.
        if (longestPathLengths[reverseAdjacencyList[idx][subIdx]] + 1 === longestPathLengths[idx]) {
          criticalNodes[reverseAdjacencyList[idx][subIdx]] = !0; // Mark the predecessor as critical.
          pathCountsAtLevel[longestPathLengths[reverseAdjacencyList[idx][subIdx]]]++; // Increment path count for its DP level.
        }
      }
    }
  }

  // Iterate through all original edges to find and output specific critical edges.
  for (idx = 0; idx < edgeCount; idx++) {
    let currentSource = allEdges[idx][0];
    let currentTarget = allEdges[idx][1];

    // An edge is considered critical if both its source and target are critical nodes,
    // and there is only one critical path passing through the source node's DP level.
    if (criticalNodes[currentSource] && criticalNodes[currentTarget] && pathCountsAtLevel[longestPathLengths[currentSource]] === 1) {
      console.log(idx + 1); // Output the 1-indexed number of the critical edge.
    }
  }
}
