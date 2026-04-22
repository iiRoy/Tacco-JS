let inputReader;
let capturedLines = [];

// Initializes input reading from standard input
require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
}).on('line', (currentLine) => {
  // Stores each line as it's received
  capturedLines.push(currentLine);
}).on('close', () => {
  // Once all input is received, initialize the input processor
  inputProcessor = initializeInputProcessor(capturedLines);
  console.error("DEBUG_INFO: Initiating graph analysis routine...");
  const startTime = Date.now(); // Record start time for performance metrics
  executeGraphAnalysis(); // Execute the main graph analysis logic
  const durationMs = Date.now() - startTime; // Calculate execution duration
  logDebugInfo(`Execution time: ${durationMs} ms`);
  logDebugInfo(`Memory usage: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB heap total`);
});

/**
 * Creates a robust deep copy of an object, primarily for plain data objects.
 * Note: This method has limitations for complex types (functions, Dates, undefined, circular references).
 * @param {object} sourceObject - The object to be duplicated.
 * @returns {object} A new object that is a deep copy of the source.
 */
function deepCopyObject(sourceObject) {
  if (typeof sourceObject !== 'object' || sourceObject === null) {
      return sourceObject; // Primitives and null are returned directly
  }
  return JSON.parse(JSON.stringify(sourceObject));
}

/**
 * Reads the next available input line and attempts to parse it as an integer.
 * @returns {number} The parsed integer value.
 */
function readInteger() {
  return transformInput(getNextInputLine(), 1);
}

/**
 * Reads the next input line and splits it into an array of strings based on space delimiters.
 * @returns {string[]} An array containing the split string components.
 */
function readStringArray() {
  return transformInput(getNextInputLine(), 2);
}

/**
 * Reads the next input line, splits it by spaces, and converts each part into a number.
 * @returns {number[]} An array of numbers.
 */
function readIntegerArray() {
  return transformInput(getNextInputLine(), 4);
}

/**
 * Reads the next input line and converts it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
function readCharacterArray() {
  return transformInput(getNextInputLine(), 6);
}

/**
 * Fetches the next sequential input line from the global input processor.
 * @returns {string} The next line of input.
 * @throws {Error} If there are no more lines to read.
 */
function getNextInputLine() {
  return inputProcessor.getNextLine();
}

/**
 * Checks if there are any remaining input lines to be processed.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasMoreInput() {
  return inputProcessor.hasMoreLines();
}

/**
 * Initializes an object responsible for managing sequential access to input lines.
 * @param {string[]} linesArray - An array of strings representing all input lines.
 * @returns {{sourceLines: string[], currentLineIndex: number, totalLines: number, hasMoreLines: function, getNextLine: function}} An input processor object.
 */
function initializeInputProcessor(linesArray) {
  const processorObject = {
    sourceLines: linesArray,
    currentLineIndex: 0,
    totalLines: linesArray.length,

    /**
     * Determines if there are more lines left in the input buffer.
     * @returns {boolean} True if `currentLineIndex` is less than `totalLines`.
     */
    hasMoreLines: function() {
      return (this.currentLineIndex < this.totalLines);
    },

    /**
     * Retrieves the line at the `currentLineIndex` and increments the index.
     * @returns {string} The line of input.
     * @throws {Error} If an attempt is made to read beyond the last available line.
     */
    getNextLine: function() {
      if (!this.hasMoreLines()) {
        throw new Error("InputOutOfBoundsException: Attempted to read past the end of available input.");
      }
      const extractedLine = this.sourceLines[this.currentLineIndex];
      this.currentLineIndex++;
      return extractedLine;
    }
  };
  return processorObject;
}

/**
 * Outputs a given piece of data to the standard console output.
 * @param {*} data - The data to be displayed.
 */
function displayResult(data) {
  console.log(data);
}

/**
 * Logs detailed debug information to the standard error stream.
 * The output includes a "DEBUG_INFO:" prefix and uses `util.inspect` for structured logging.
 * @param {*} debugData - The data to be logged for debugging purposes.
 */
function logDebugInfo(debugData) {
  console.error(`DEBUG_INFO: ${require("util").inspect(debugData, { showHidden: false, depth: null, colors: true })}`);
}

/**
 * Transforms an input value based on a specified operation code.
 * This function handles various common input parsing and formatting tasks.
 *
 * @param {*} inputData - The data to be transformed (can be string or array).
 * @param {number} operationCode - A numerical code indicating the desired transformation:
 *   1: Parse input as an integer (base 10).
 *   2: Split input string by spaces into an array of strings.
 *   4: Split input string by spaces and convert each part to a number.
 *   6: Split input string into an array of individual characters.
 *   7: Split input string into characters and convert each to a number.
 *   8: Join an array of strings/numbers with spaces.
 *   9: Join an array of strings/numbers with newline characters.
 *   0: Join an array of strings/numbers with no separator.
 *   Default: Returns the input data unchanged.
 * @returns {*} The transformed data, or the original data if an error occurs or operationCode is unknown.
 */
function transformInput(inputData, operationCode) {
  try {
    switch (operationCode) {
      case 1:
        return parseInt(inputData, 10); // Explicitly use base 10
      case 2:
        return String(inputData).split(" "); // Ensure input is a string before splitting
      case 4:
        return String(inputData).split(" ").map(Number);
      case 6:
        return String(inputData).split("");
      case 7:
        return String(inputData).split("").map(Number);
      case 8:
        return Array.isArray(inputData) ? inputData.join(" ") : inputData; // Only join if input is an array
      case 9:
        return Array.isArray(inputData) ? inputData.join("\n") : inputData;
      case 0:
        return Array.isArray(inputData) ? inputData.join("") : inputData;
      default:
        logDebugInfo(`Unhandled transform operation code: ${operationCode} for input: ${inputData}`);
        return inputData; // Return original data for unknown codes
    }
  } catch (error) {
    logDebugInfo(`Error during input transformation (code ${operationCode}): ${error.message}`);
    return inputData; // Return original input on any transformation error
  }
}

/**
 * @typedef {object} GraphNode
 * @property {number[]} adjacentNodes - An array of indices representing nodes directly connected to this node.
 * @property {boolean} visited - A flag indicating if this node has been processed during a traversal.
 * @property {number} level - The distance (number of edges) from the starting node of a BFS, where the start node is level 1.
 */

/**
 * Resets the traversal-specific properties (`visited` and `level`) for all nodes in a graph.
 * This is crucial before performing a new BFS traversal on the same graph structure.
 * @param {GraphNode[]} nodes - The array of graph node objects to reset.
 */
function resetGraphTraversalState(nodes) {
  for (let nodeIdx = 0; nodeIdx < nodes.length; nodeIdx++) {
    nodes[nodeIdx].visited = false;
    nodes[nodeIdx].level = 1; // Reset all nodes to base level 1 (or 0 if preferred, but 1 matches original intent)
  }
}

/**
 * Executes a Breadth-First Search (BFS) traversal starting from a specified node.
 * This function calculates and updates the `level` (depth) and `visited` status for nodes
 * reachable from the `startNodeIndex` within the `nodesArray`.
 * It returns the index of a node found at the maximum depth during this traversal.
 *
 * @param {number} startNodeIndex - The index of the node from which the BFS should begin.
 * @param {number} totalNodes - The total number of nodes in the graph, used for validation.
 * @param {GraphNode[]} nodesArray - The array of graph node objects representing the graph.
 * @returns {number} The index of a node that is one of the farthest nodes from `startNodeIndex` in terms of BFS level. Returns -1 if inputs are invalid.
 */
function performBreadthFirstSearch(startNodeIndex, totalNodes, nodesArray) {
  // Validate input parameters for robustness
  if (startNodeIndex < 0 || startNodeIndex >= totalNodes || !nodesArray || nodesArray.length !== totalNodes) {
    logDebugInfo(`Invalid parameters for BFS: startNodeIndex=${startNodeIndex}, totalNodes=${totalNodes}, nodesArray valid: ${!!nodesArray}`);
    return -1; // Indicate an error or invalid state
  }

  const traversalQueue = [startNodeIndex]; // Initialize queue with the starting node
  nodesArray[startNodeIndex].visited = true;
  nodesArray[startNodeIndex].level = 1; // The starting node is considered at level 1

  let maximumReachedLevel = 1; // Tracks the highest level discovered during this BFS
  let extremeNodeIndex = startNodeIndex; // Tracks a node (the first one found) at the maximumReachedLevel

  while (traversalQueue.length > 0) {
    const currentNodeIdx = traversalQueue.shift(); // Dequeue the current node

    // Iterate through all neighbors of the current node
    for (const neighborNodeId of nodesArray[currentNodeIdx].adjacentNodes) { // Using for...of for cleaner iteration
      // Basic validation for neighbor index
      if (neighborNodeId < 0 || neighborNodeId >= totalNodes) {
          logDebugInfo(`BFS encountered an out-of-bounds neighbor index: ${neighborNodeId} for node ${currentNodeIdx}. Skipping.`);
          continue;
      }

      if (!nodesArray[neighborNodeId].visited) {
        nodesArray[neighborNodeId].visited = true;
        nodesArray[neighborNodeId].level = nodesArray[currentNodeIdx].level + 1; // Increment level for visited neighbor

        // Update maximum level and the node associated with it
        if (nodesArray[neighborNodeId].level > maximumReachedLevel) {
            maximumReachedLevel = nodesArray[neighborNodeId].level;
            extremeNodeIndex = neighborNodeId; // Update the farthest node found so far
        }
        traversalQueue.push(neighborNodeId); // Enqueue the newly visited neighbor
      }
    }
  }

  // After the BFS, iterate through all nodes to find the *first* node (smallest index)
  // that achieved the maximum depth. This matches the original code's behavior.
  let finalFarthestNodeIndex = -1;
  for (let nodeIdx = 0; nodeIdx < totalNodes; nodeIdx++) {
    if (nodesArray[nodeIdx].level === maximumReachedLevel) {
      finalFarthestNodeIndex = nodeIdx;
      break; // Found the first node at max depth, exit loop
    }
  }

  // Fallback: If no node reached a higher level than 1 (e.g., disconnected graph or single node),
  // the start node itself is considered the "farthest" at level 1.
  if (finalFarthestNodeIndex === -1 && totalNodes > 0) {
      finalFarthestNodeIndex = startNodeIndex;
  }

  return finalFarthestNodeIndex; // Return the index of the farthest node from the start
}


/**
 * The main function orchestrating the graph analysis to find its diameter.
 * It uses two BFS traversals to determine the diameter, which is the longest
 * shortest path between any two nodes in the graph.
 */
function executeGraphAnalysis() {
  const nodeCount = readInteger(); // Read the total number of nodes (N)

  // Guard clause for invalid graph sizes
  if (nodeCount <= 0) {
    displayResult(0); // For 0 or negative nodes, diameter is 0 (or undefined depending on definition, 0 is safer here)
    logDebugInfo("Graph has zero or negative nodes. No analysis performed.");
    return;
  }

  /** @type {GraphNode[]} */
  const graphNodes = Array.from({ length: nodeCount }, () => ({
    adjacentNodes: [], // Stores indices of neighbors
    visited: false,    // Flag for BFS traversal
    level: 1           // Depth/level from BFS start point (initialized to 1)
  }));

  // Populate the graph's adjacency lists based on the input adjacency matrix
  for (let currentNodeIdx = 0; currentNodeIdx < nodeCount; currentNodeIdx++) {
    const adjacencyMatrixRow = readCharacterArray(); // Read a row of the adjacency matrix
    for (let neighborIdx = 0; neighborIdx < nodeCount; neighborIdx++) {
      // Add an edge if it's not a self-loop and the matrix indicates a connection ('1')
      if (currentNodeIdx !== neighborIdx && adjacencyMatrixRow[neighborIdx] === "1") {
        graphNodes[currentNodeIdx].adjacentNodes.push(neighborIdx);
      }
    }
  }

  // Step 1: Perform BFS from an arbitrary starting node (node 0)
  // This finds one endpoint of a potential diameter path.
  const farthestNodeFromInitial = performBreadthFirstSearch(0, nodeCount, graphNodes);
  logDebugInfo(`First BFS completed. Farthest node from starting node 0 is: ${farthestNodeFromInitial}`);

  // Reset the visited and level states of all nodes before the second BFS
  resetGraphTraversalState(graphNodes);

  // Step 2: Perform BFS from the node found in Step 1
  // The maximum level reached in this BFS will represent the graph's diameter.
  const farthestNodeFromFarthest = performBreadthFirstSearch(farthestNodeFromInitial, nodeCount, graphNodes);
  logDebugInfo(`Second BFS completed. Farthest node from ${farthestNodeFromInitial} is: ${farthestNodeFromFarthest}`);

  // The diameter is the level of the farthest node found in the second BFS.
  // Since levels start at 1, this directly gives the max depth.
  let calculatedDiameter = graphNodes[farthestNodeFromFarthest].level;

  // Final validation loop: Check for specific graph properties that might invalidate
  // the simple diameter calculation (e.g., non-bipartite graphs or odd cycles).
  // If two connected nodes have the same level, it indicates such a property.
  for (let nodeAIdx = 0; nodeAIdx < nodeCount; nodeAIdx++) {
    for (let nodeBIdx = nodeAIdx + 1; nodeBIdx < nodeCount; nodeBIdx++) {
      // Determine if nodeA and nodeB are connected
      const areConnected = graphNodes[nodeAIdx].adjacentNodes.includes(nodeBIdx) ||
                           graphNodes[nodeBIdx].adjacentNodes.includes(nodeAIdx);

      // If connected nodes are found at the same level, the graph might not be a tree
      // or bipartite, leading to an invalid diameter result for this problem's context.
      if (areConnected && graphNodes[nodeAIdx].level === graphNodes[nodeBIdx].level) {
        displayResult(-1); // Output -1 as per original problem logic for this condition
        logDebugInfo(`Graph structure invalid: Nodes ${nodeAIdx} and ${nodeBIdx} are connected and at the same level (${graphNodes[nodeAIdx].level}). Exiting.`);
        return; // Terminate execution early
      }
      // The original code had an `else` branch here to update `output = Math.max(output, list[i].depth);`.
      // This is redundant because `calculatedDiameter` already holds the maximum level from the second BFS,
      // which is the intended diameter value if the graph is valid. Therefore, this `else` branch is removed.
    }
  }

  // If no invalid conditions were met, display the calculated diameter.
  displayResult(calculatedDiameter);
}