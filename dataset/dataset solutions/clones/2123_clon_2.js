var dataLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var inputHandler = {
  lineBuffer: dataLines,
  currentPosition: 0,
  totalLines: dataLines.length,

  getNextLine: function() {
    if (!this.hasMoreLines()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    var retrievedLine = this.lineBuffer[this.currentPosition];
    this.currentPosition++;
    return retrievedLine;
  },

  hasMoreLines: function() {
    return (this.currentPosition < this.totalLines);
  }
};

// Execute the main processing function
processSolution();

// Helper function to get the next line from input
function retrieveNext() {
  return inputHandler.getNextLine();
}

// Helper function to check if there are more lines
function checkMore() {
  return inputHandler.hasMoreLines();
}

// Standard output function
function displayOutput(content) {
  console.log(content);
}

// Standard error logging function
function logError(message) {
  console.error(message);
}

/**
 * Converts input data based on a specified type.
 * @param {string|Array} inputVal - The input value to convert.
 * @param {number} conversionType - The type of conversion to perform.
 *   1: Convert to integer.
 *   2: Split by space.
 *   4: Split by space and convert elements to numbers.
 *   6: Split by character.
 *   7: Split by character and convert elements to numbers.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements without separator.
 *   Default: Return input as is.
 * @returns {any} The converted value.
 */
function dataConverter(inputVal, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputVal);
      case 2:
        return inputVal.split(" ");
      case 4:
        return inputVal.split(" ").map((item) => Number(item));
      case 6:
        return inputVal.split("");
      case 7:
        return inputVal.split("").map((item) => Number(item));
      case 8:
        return inputVal.join(" ");
      case 9:
        return inputVal.join("\n");
      case 0:
        return inputVal.join("");
      default:
        return inputVal;
    }
  } catch (err) {
    return inputVal; // In case of error, return original input
  }
}

function processSolution() {
  // Read the first line containing N, M, K
  var firstLineData = dataConverter(retrieveNext(), 4);
  var numNodes = firstLineData[0]; // N
  var numEdges = firstLineData[1]; // M
  var numQueries = firstLineData[2]; // K

  // Initialize a list to store information about each node
  var nodeInfoList = new Array(numNodes);
  var loopCounter;

  // Populate initial node information
  for (loopCounter = 0; loopCounter < numNodes; loopCounter++) {
    nodeInfoList[loopCounter] = {
      connectedPeers: [], // List of directly connected friends
      clusterId: null // ID of the connected component this node belongs to
    };
  }

  // Read M lines for friend connections
  for (loopCounter = 0; loopCounter < numEdges; loopCounter++) {
    var edgeData = dataConverter(retrieveNext(), 4);
    // Adjust to 0-based indexing
    var nodeA = edgeData[0] - 1;
    var nodeB = edgeData[1] - 1;
    nodeInfoList[nodeA].connectedPeers.push(nodeB);
    nodeInfoList[nodeB].connectedPeers.push(nodeA);
  }

  // Array to store sets of nodes for each connected component
  var connectedComponents = [];

  // Perform BFS to find connected components and assign cluster IDs
  for (loopCounter = 0; loopCounter < numNodes; loopCounter++) {
    exploreComponent(loopCounter);
  }

  // logError(nodeInfoList); // Debugging output for node information

  /**
   * Performs a Breadth-First Search (BFS) starting from a given node
   * to identify its connected component and assign a cluster ID.
   * @param {number} nodeIndex - The starting node's index.
   */
  function exploreComponent(nodeIndex) {
    // If the node already has a cluster ID, it has been visited
    if (nodeInfoList[nodeIndex].clusterId !== null) {
      return;
    }

    // Start a new connected component
    connectedComponents.push(new Set());
    var traversalQueue = [nodeInfoList[nodeIndex]]; // Queue for BFS, storing node objects

    while (traversalQueue.length > 0) {
      var currentNode = traversalQueue.shift(); // Get the next node from the queue

      // If this node already has a cluster ID, skip it (already processed)
      if (currentNode.clusterId !== null) {
        continue;
      }

      // Assign the current component's ID to the node
      currentNode.clusterId = connectedComponents.length - 1;

      // Add all unvisited neighbors to the queue
      for (var neighborIdx = 0; neighborIdx < currentNode.connectedPeers.length; neighborIdx++) {
        var neighborNode = nodeInfoList[currentNode.connectedPeers[neighborIdx]];
        traversalQueue.push(neighborNode);
      }
    }
  }

  // After BFS, populate the connectedComponents sets with actual node indices
  for (loopCounter = 0; loopCounter < numNodes; loopCounter++) {
    connectedComponents[nodeInfoList[loopCounter].clusterId].add(loopCounter);
  }

  // logError(connectedComponents); // Debugging output for connected components

  // Initialize an array to store the final counts for each node
  var resultCounts = new Array(numNodes);

  // Calculate initial counts: (size of component - 1 - number of direct friends)
  for (loopCounter = 0; loopCounter < numNodes; loopCounter++) {
    resultCounts[loopCounter] = connectedComponents[nodeInfoList[loopCounter].clusterId].size - 1 - nodeInfoList[loopCounter].connectedPeers.length;
  }

  // Process K queries for "unfriend" pairs
  for (loopCounter = 0; loopCounter < numQueries; loopCounter++) {
    var queryPair = dataConverter(retrieveNext(), 4);
    // Adjust to 0-based indexing
    var queryNodeA = queryPair[0] - 1;
    var queryNodeB = queryPair[1] - 1;

    // If the two nodes are not in the same connected component, skip
    if (nodeInfoList[queryNodeA].clusterId !== nodeInfoList[queryNodeB].clusterId) {
      continue;
    }

    // Decrement counts for both nodes as they cannot be friends
    resultCounts[queryNodeA]--;
    resultCounts[queryNodeB]--;
  }

  // Output the final results, joined by spaces
  displayOutput(dataConverter(resultCounts, 8));
}
