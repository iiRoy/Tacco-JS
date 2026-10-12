let rawInputData = "";
let lineIndex = 0;

// Capture incoming data from standard input
process.stdin.on("data", (incomingChunk) => {
  rawInputData += incomingChunk;
});

// Process all input once the stream ends
process.stdin.on("end", function () {
  // Clean up and parse the input into an array of lines
  rawInputData = rawInputData
    .trim()
    .split("\n")
    .map((lineText) => lineText.trim());
  // Begin the main program execution
  primaryExecution();
});

/**
 * Retrieves the next line from the processed input data.
 * @returns {string} The next line of input.
 */
function fetchNextLine() {
  return rawInputData[lineIndex++];
}

/**
 * Main function containing the core logic of the program.
 */
function primaryExecution() {
  // Read the first line to get the total number of people and relationships
  let [numEntities, numRelations] = fetchNextLine()
    .split(" ")
    .map((numStr) => parseInt(numStr, 10));

  // Initialize an adjacency list to represent the graph
  const adjacencyList = {};
  // Keep track of processed pairs to avoid duplicate entries in the graph
  const processedPairs = {};

  // Process each relationship
  while (numRelations--) {
    let [entityA, entityB] = fetchNextLine()
      .split(" ")
      .map((valStr) => parseInt(valStr, 10));

    // Ensure the pair hasn't been added yet (e.g., 1-2 and 2-1 are the same)
    if (!processedPairs[`${entityA}-${entityB}`] && !processedPairs[`${entityB}-${entityA}`]) {
      processedPairs[`${entityA}-${entityB}`] = true; // Mark as seen

      // Add bidirectional edges to the adjacency list
      if (!adjacencyList[entityA]) {
        adjacencyList[entityA] = { [entityB]: true };
      } else {
        adjacencyList[entityA][entityB] = true;
      }

      if (!adjacencyList[entityB]) {
        adjacencyList[entityB] = { [entityA]: true };
      } else {
        adjacencyList[entityB][entityA] = true;
      }
    }
  }

  let largestComponentSize = 0;
  // Keep track of visited nodes during DFS traversal
  let visitedNodes = {};

  // Iterate through all nodes in the graph to find connected components
  for (let nodeKey in adjacencyList) {
    // If a node hasn't been visited, it's part of a new component
    if (!visitedNodes[nodeKey]) {
      // Perform DFS to find the size of this component
      largestComponentSize = Math.max(largestComponentSize, depthFirstSearch(nodeKey));
    }
  }

  // Output the maximum component size found
  console.log(largestComponentSize);

  /**
   * Performs a Depth-First Search starting from a given node
   * to count the number of nodes in its connected component.
   * @param {string} currentNode The starting node for the DFS.
   * @returns {number} The count of nodes in the connected component.
   */
  function depthFirstSearch(currentNode) {
    let componentCount = 0;
    // Mark the current node as visited
    visitedNodes[currentNode] = true;
    componentCount++; // Increment count for the current node

    // Get all connected nodes (neighbors)
    const connectedNodes = adjacencyList[currentNode];
    for (let connectedNode in connectedNodes) {
      // If a neighbor hasn't been visited, recursively call DFS on it
      if (!visitedNodes[connectedNode]) {
        // Mark neighbor as visited before recursive call to prevent cycles
        visitedNodes[connectedNode] = true;
        componentCount += depthFirstSearch(connectedNode);
      }
    }
    return componentCount;
  }
}
