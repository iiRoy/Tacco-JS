// --- Core System Utilities (Internal, not for external consumption) ---
// This section handles command-line input/output and basic utilities.
// It is designed for competitive programming environments, providing a structured
// way to interact with standard input and output streams.

const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputLines = []; // A buffer to store all lines read from standard input.
let parsedInputData = null; // Manages the state of input token consumption.

// Event listener for each line of input received.
inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

// Event listener for when the input stream closes, indicating all input has been received.
inputReader.on('close', () => {
  // Initialize the input parsing mechanism with all collected lines.
  parsedInputData = initializeInputParser(inputLines);
  console.error("--- Application Execution Log ---"); // Start log marker.
  const executionStartTime = Date.now();

  computeSolution(); // Invoke the main problem-solving logic.

  const executionEndTime = Date.now() - executionStartTime;
  logDebugInfo(`Execution Duration: ${executionEndTime}ms`);
  logDebugInfo(`Memory Footprint: ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
  console.error("--- End of Log ---"); // End log marker.
});

// A utility function to create a deep copy of an object.
// While not directly used in this specific problem's `computeSolution`,
// it's a common helper in similar competitive programming setups.
function duplicateObject(original) {
  return JSON.parse(JSON.stringify(original));
}

// Constants defining various input conversion types for clarity and maintainability.
const CONV_TYPE = {
  INTEGER: 1,
  STRING_ARRAY: 2,
  INTEGER_ARRAY: 4,
  CHAR_ARRAY: 6,
  JOIN_SPACE: 8,
  JOIN_NEWLINE: 9,
  JOIN_NO_SEPARATOR: 0
};

// Public API for retrieving and converting the next input token.
function getNextInteger() { return convertInput(retrieveNextToken(), CONV_TYPE.INTEGER); }
function getNextStringArray() { return convertInput(retrieveNextToken(), CONV_TYPE.STRING_ARRAY); }
function getNextIntegerArray() { return convertInput(retrieveNextToken(), CONV_TYPE.INTEGER_ARRAY); }
function getNextCharacterArray() { return convertInput(retrieveNextToken(), CONV_TYPE.CHAR_ARRAY); }

// Internal functions for managing the input stream's state.
function retrieveNextToken() { return parsedInputData.advanceAndGet(); }
function hasMoreTokens() { return parsedInputData.canAdvance(); }

/**
 * Initializes an object responsible for sequential parsing of input lines.
 * This effectively creates an "input stream" abstraction.
 * @param {string[]} allInputLines - An array of all input lines collected.
 * @returns {object} An object with methods to check for and retrieve next input tokens.
 */
function initializeInputParser(allInputLines) {
  const inputHandler = {
    allSourceLines: allInputLines,
    currentLineIndex: 0,
    totalLines: allInputLines.length,

    /**
     * Checks if there are more input lines available to be read.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    canAdvance: function() {
      return this.currentLineIndex < this.totalLines;
    },

    /**
     * Retrieves the next input line and advances the internal pointer.
     * Throws an error if no more input is available.
     * @returns {string} The next available input line.
     */
    advanceAndGet: function() {
      if (!this.canAdvance()) {
        throw new Error("InputOutOfBoundsException: Attempted to read beyond available input lines.");
      }
      const retrievedLine = this.allSourceLines[this.currentLineIndex];
      this.currentLineIndex++; // Increment index for the next read.
      return retrievedLine;
    }
  };
  return inputHandler;
}

/**
 * Emits the final computed result to standard output.
 * @param {*} outputValue - The value to be printed.
 */
function emitResult(outputValue) {
  console.log(outputValue);
}

/**
 * Logs debugging information to standard error.
 * Uses `util.inspect` for detailed object inspection.
 * @param {*} message - The information to log.
 */
function logDebugInfo(message) {
  console.error(`[DEBUG]: ${require("util").inspect(message, { showHidden: false, depth: null, colors: true })}`);
}

/**
 * Converts an input token based on a specified conversion type.
 * Includes basic error handling for conversion failures.
 * @param {string|string[]} inputToken - The raw input string or array to convert.
 * @param {number} conversionType - A constant from `CONV_TYPE` indicating the desired format.
 * @returns {*} The converted value, or the original token if conversion fails or type is unknown.
 */
function convertInput(inputToken, conversionType) {
  try {
    switch (conversionType) {
      case CONV_TYPE.INTEGER: return parseInt(inputToken, 10);
      case CONV_TYPE.STRING_ARRAY: return inputToken.split(" ");
      case CONV_TYPE.INTEGER_ARRAY: return inputToken.split(" ").map(Number);
      case CONV_TYPE.CHAR_ARRAY: return inputToken.split("");
      case CONV_TYPE.JOIN_SPACE: return inputToken.join(" "); // Assumes inputToken is an array for join operations.
      case CONV_TYPE.JOIN_NEWLINE: return inputToken.join("\n");
      case CONV_TYPE.JOIN_NO_SEPARATOR: return inputToken.join("");
      default: return inputToken; // If conversion type is unknown, return input as is.
    }
  } catch (conversionError) {
    logDebugInfo(`Data conversion issue for token '${inputToken}' with type ${conversionType}: ${conversionError.message}`);
    return inputToken; // Fallback to original input on any conversion error.
  }
}

// --- End of Core System Utilities ---

// --- Main Program Logic ---

/**
 * Represents a node within the graph structure.
 * Encapsulates properties and behaviors related to a single vertex.
 */
class GraphNode {
  /**
   * Constructs a new GraphNode instance.
   * @param {number} id - The unique numeric identifier for this node.
   */
  constructor(id) {
    this.nodeId = id;
    this.connectedNodes = new Set(); // Stores IDs of nodes directly connected from this node. Using a Set for efficient `has` checks.
    this.visited = false; // Flag to track if the node has been visited during graph traversal.
    this.level = 0; // Represents the depth or level of the node in a traversal tree, typically 0-indexed or 1-indexed.
  }

  /**
   * Adds a connection (edge) from this node to a target node.
   * @param {number} targetNodeId - The ID of the node to connect to.
   */
  addConnection(targetNodeId) {
    this.connectedNodes.add(targetNodeId);
  }

  /**
   * Checks if this node has been marked as visited.
   * @returns {boolean} True if visited, false otherwise.
   */
  isVisited() {
    return this.visited;
  }

  /**
   * Marks this node as visited.
   */
  markAsVisited() {
    this.visited = true;
  }

  /**
   * Sets the level (depth) of this node in the context of a graph traversal.
   * @param {number} newLevel - The new level value to assign.
   */
  setNodeLevel(newLevel) {
    this.level = newLevel;
  }

  /**
   * Retrieves the number of nodes directly connected from this node.
   * @returns {number} The count of outgoing connections.
   */
  getConnectedNodeCount() {
    return this.connectedNodes.size;
  }
}


/**
 * The primary function containing the problem's solution logic.
 * This function orchestrates graph construction, traversal, and validation.
 */
function computeSolution() {
  const numberOfNodes = getNextInteger(); // Read the total number of nodes in the graph.

  // Guard clause: Handle cases where the number of nodes is non-positive.
  if (numberOfNodes <= 0) {
    emitResult(-1); // According to problem, -1 is an invalid/unsolvable state.
    return;
  }

  // Initialize the graph structure. An array of GraphNode instances.
  // Each node is created with a unique ID from 0 to numberOfNodes - 1.
  const graphStructure = Array.from({ length: numberOfNodes }, (_, idx) => new GraphNode(idx));

  // Populate graph connections (edges) based on the provided adjacency matrix input.
  // The input is read row by row, where '1' signifies a connection.
  for (let sourceIdx = 0; sourceIdx < numberOfNodes; sourceIdx++) {
    const adjacencyRowChars = getNextCharacterArray(); // Read the row as an array of characters (e.g., ['0', '1', '0']).
    for (let targetIdx = 0; targetIdx < numberOfNodes; targetIdx++) {
      // A node cannot form a self-loop (connect to itself), and '1' indicates an existing edge.
      if (sourceIdx !== targetIdx && adjacencyRowChars[targetIdx] === "1") {
        graphStructure[sourceIdx].addConnection(targetIdx);
      }
    }
  }

  let longestPathLength = -1; // Variable to store the maximum depth encountered during BFS.
  let traversalInitiated = false; // Flag to track if a BFS was successfully started from a valid node.

  // First Pass: Identify a suitable starting node for Breadth-First Search (BFS).
  // A starting node is defined as one having exactly one outgoing connection.
  for (let potentialStartIdx = 0; potentialStartIdx < numberOfNodes; potentialStartIdx++) {
    const currentNode = graphStructure[potentialStartIdx];

    if (currentNode.getConnectedNodeCount() === 1) {
      traversalInitiated = true; // A valid starting point has been identified.
      
      const traversalQueue = [potentialStartIdx]; // Initialize BFS queue with the starting node's index.
      currentNode.markAsVisited(); // Mark the starting node as visited.
      currentNode.setNodeLevel(1); // Set its level to 1 (problem likely uses 1-indexed depth).

      // Perform Breadth-First Search (BFS) to traverse the graph and determine node levels.
      while (traversalQueue.length > 0) {
        const currentVertexIndex = traversalQueue.shift(); // Dequeue the current vertex's index.
        const currentVertex = graphStructure[currentVertexIndex];

        // Iterate over all neighbors (connected nodes) of the current vertex.
        for (const neighborIndex of currentVertex.connectedNodes) {
          const neighborNode = graphStructure[neighborIndex];
          // If the neighbor has not been visited yet, process it.
          if (!neighborNode.isVisited()) {
            neighborNode.markAsVisited(); // Mark neighbor as visited.
            const newLevel = currentVertex.level + 1; // Calculate its level based on the current vertex.
            neighborNode.setNodeLevel(newLevel);
            
            // Update the maximum path length if this new level is deeper than previously recorded.
            longestPathLength = Math.max(longestPathLength, newLevel);
            traversalQueue.push(neighborIndex); // Enqueue the unvisited neighbor for future processing.
          }
        }
      }
      // The original logic implies only the first suitable starting node's BFS is used.
      // Therefore, we break after the first successful BFS.
      break; 
    }
  }

  // If no suitable starting node (with exactly one connection) was found,
  // the problem might be unsolvable in this context, so we output -1.
  if (!traversalInitiated) {
    emitResult(longestPathLength);
    return;
  }

  // Second Pass: Final validation step.
  // This part checks for a specific condition that would invalidate the computed path:
  // If any two distinct nodes are at the same level AND they are directly connected,
  // the result is considered invalid (-1).
  let isPathValid = true; // Flag to track the overall validity of the path.

  // Iterate through all unique pairs of distinct nodes (i, j) where i < j.
  for (let firstNodeIdx = 0; firstNodeIdx < numberOfNodes; firstNodeIdx++) {
    for (let secondNodeIdx = firstNodeIdx + 1; secondNodeIdx < numberOfNodes; secondNodeIdx++) {
      const nodeA = graphStructure[firstNodeIdx];
      const nodeB = graphStructure[secondNodeIdx];

      // Check if both nodes have been assigned a level (meaning they were reached by BFS)
      // AND if their levels are identical
      // AND if there's a direct connection between them (A connects to B OR B connects to A).
      const areNodesConnected = nodeA.connectedNodes.has(secondNodeIdx) || nodeB.connectedNodes.has(firstNodeIdx);

      if (nodeA.level > 0 && nodeA.level === nodeB.level && areNodesConnected) {
        logDebugInfo(`Validation failed: Nodes ${firstNodeIdx} and ${secondNodeIdx} are at the same level (${nodeA.level}) and are mutually connected.`);
        longestPathLength = -1; // Invalidate the result.
        isPathValid = false; // Mark the path as invalid.
        break; // Exit the inner loop as validation has failed.
      }
    }
    if (!isPathValid) {
      break; // Exit the outer loop if validation has already failed.
    }
  }

  emitResult(longestPathLength); // Output the final computed longest path length.
}