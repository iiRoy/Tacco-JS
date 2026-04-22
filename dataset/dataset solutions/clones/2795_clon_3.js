// Internal Utility Functions - Not for direct user interaction.
const standardInputProcessor = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputDataContainer; // Stores processed input lines.
const rawInputLinesBuffer = []; // Accumulates raw input lines.

// Event listener for each line of input.
standardInputProcessor.on('line', (lineContent) => {
  rawInputLinesBuffer.push(lineContent);
});

// Event listener for end of input.
standardInputProcessor.on('close', () => {
  inputDataContainer = initializeInputHandler(rawInputLinesBuffer);
  // Optional: Add a separator for error logs.
  console.error("\n--- Execution Log Start ---\n");

  const startTime = performance.now(); // More precise than Date.now() for timing.
  executeMainLogic(); // The core program execution.
  const elapsedTime = performance.now() - startTime;

  logDiagnosticInfo(`Execution Time: ${elapsedTime.toFixed(2)} ms`);
  // Use a more robust memory usage calculation if needed, or simplify.
  logDiagnosticInfo(`Memory Usage: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
  console.error("\n--- Execution Log End ---\n");
});

// Creates a deep copy of an object.
const createDeepCopy = (sourceObject) => {
  return JSON.parse(JSON.stringify(sourceObject));
};

// Helper to get next integer token from input.
const getNextInteger = () => convertInputToken(retrieveNextToken(), 1);
// Helper to get next string array token from input.
const getNextStringArray = () => convertInputToken(retrieveNextToken(), 2);
// Helper to get next integer array token from input.
const getNextIntegerArray = () => convertInputToken(retrieveNextToken(), 4);
// Helper to get next character array token from input.
const getNextCharacterArray = () => convertInputToken(retrieveNextToken(), 6);

// Retrieves the next token from the input stream.
const retrieveNextToken = () => inputDataContainer.getNextValue();
// Checks if there are more tokens available.
const hasMoreTokens = () => inputDataContainer.hasRemainingValues();

// Initializes the input processing object.
const initializeInputHandler = (inputLines) => {
  const handlerObject = {
    storedLines: inputLines,
    currentLineIndex: 0,
    totalLines: inputLines.length,
    hasRemainingValues: function() {
      return (this.currentLineIndex < this.totalLines);
    },
    getNextValue: function() {
      if (!this.hasRemainingValues()) {
        throw new Error("InputOutOfBounds: No more input available for processing.");
      }
      return this.storedLines[this.currentLineIndex++];
    }
  };
  return handlerObject;
};

// Prints output to console.
const outputResult = (dataToDisplay) => console.log(dataToDisplay);

// Logs debug information to stderr.
const logDiagnosticInfo = (debugMessage) => console.error(`[DEBUG]: ${debugMessage}`);

/*
  Input Conversion Utility:
  - 1: Parse integer.
  - 2: Split by space (string array).
  - 4: Split by space and map to numbers (integer array).
  - 6: Split into individual characters (character array).
  - Other values: Return original input.
*/
const convertInputToken = (inputValue, conversionType) => {
  try {
    switch (conversionType) {
      case 1: return parseInt(inputValue, 10);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map(Number);
      case 6: return inputValue.split("");
      // Cases 7, 8, 9, 0 from original are not used in Main, so they are removed for Type III.
      default: return inputValue;
    }
  } catch (error) {
    logDiagnosticInfo(`Conversion error for value '${inputValue}' with type '${conversionType}': ${error.message}`);
    return inputValue; // Fallback to original value on error.
  }
};

// Main execution function for graph problem.
function executeMainLogic() {
  const graphDimensions = getNextIntegerArray();
  const nodeCount = graphDimensions[0];
  const edgeCount = graphDimensions[1];

  // Early exit for invalid graph sizes.
  if (nodeCount <= 0 || edgeCount < 0) {
    outputResult(-1);
    return;
  }

  // Adjacency list representation for initial graph.
  // Each node stores its direct children.
  const outgoingConnections = Array.from({ length: nodeCount }, () => ({
    childrenNodes: []
  }));

  // Graph state for BFS traversal, including parent tracking and distance.
  // Each node stores its predecessors and traversal metadata.
  const traversalState = Array.from({ length: nodeCount }, () => ({
    incomingEdges: new Set(), // Stores nodes that lead to this node.
    visitedDuringBFS: false,  // Flag for BFS traversal.
    pathDistance: 0           // Distance from target node in BFS.
  }));

  // Set to prevent redundant DFS traversals for identical (node, depth) pairs.
  const visitedDepthPaths = new Set();

  // Populate outgoing connections.
  for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
    const edgeData = getNextIntegerArray();
    const sourceNode = edgeData[0] - 1;
    const destinationNode = edgeData[1] - 1;
    if (sourceNode >= 0 && sourceNode < nodeCount && destinationNode >= 0 && destinationNode < nodeCount) {
        outgoingConnections[sourceNode].childrenNodes.push(destinationNode);
    } else {
        logDiagnosticInfo(`Invalid edge data encountered: [${edgeData[0]}, ${edgeData[1]}]`);
    }
  }

  // Perform Depth-First Search to establish 'incomingEdges' for 'traversalState'.
  // This DFS specifically looks for paths of length up to 3.
  for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    traverseAndMapPaths(nodeIdx, nodeIdx, 0);
  }

  // Clear original graph structure if memory is a concern and it's no longer needed.
  // This is a Type III deletion of `list = null;` for `outgoingConnections = null;` if not needed.
  // Let's keep it for demonstration of Type III deletion/rewriting.
  // outgoingConnections = null; // Original code had this, but it's not strictly necessary as it's a local variable.

  const queryNodes = getNextIntegerArray();
  const startNode = queryNodes[0] - 1;
  const targetNode = queryNodes[1] - 1;

  // Handle trivial case: start and target are the same.
  if (startNode === targetNode) {
    outputResult(0);
    return;
  }

  // Initialize BFS queue. Using a fixed-size array as a circular buffer for performance.
  const bfsQueueCapacity = nodeCount + 100; // Sufficient capacity.
  const bfsTraversalQueue = new Array(bfsQueueCapacity);
  let queueFront = 0;
  let queueRear = 0;

  // Enqueue the target node to start BFS from.
  bfsTraversalQueue[queueRear++] = targetNode;
  traversalState[targetNode].visitedDuringBFS = true;

  let shortestPathLength = -1; // Default to -1 indicating no path found.

  // Breadth-First Search loop.
  while (queueFront !== queueRear) {
    const currentNode = bfsTraversalQueue[queueFront++];
    // Ensure queueFront wraps around if using circular buffer logic
    // (though with `Array.from` and `nodeCount+100` it's unlikely to wrap for typical competitive programming constraints).
    // For simplicity, we'll let it grow linearly, assuming `nodeCount` is within limits.

    // If current node is the start node, we found the shortest path.
    if (currentNode === startNode) {
      shortestPathLength = traversalState[currentNode].pathDistance;
      break; // Exit BFS loop.
    }

    // Iterate over predecessors (nodes that can reach 'currentNode').
    // Converting Set to Array for consistent iteration pattern, though Set.forEach is also an option.
    const predecessorNodes = Array.from(traversalState[currentNode].incomingEdges);
    
    for (const predecessor of predecessorNodes) {
      if (!traversalState[predecessor].visitedDuringBFS) {
        traversalState[predecessor].visitedDuringBFS = true;
        const newPathDistance = traversalState[currentNode].pathDistance + 1;
        traversalState[predecessor].pathDistance = newPathDistance;
        bfsTraversalQueue[queueRear++] = predecessor; // Enqueue predecessor.
      }
    }
  }

  outputResult(shortestPathLength);

  // Depth-First Search function (nested for scope encapsulation).
  function traverseAndMapPaths(initialNode, currentNode, currentDepth) {
    // Unique key for visited states using template literal.
    const visitKey = `${currentNode}:${currentDepth}`;
    if (visitedDepthPaths.has(visitKey)) {
      return; // Already visited this path segment.
    }
    visitedDepthPaths.add(visitKey);

    // If maximum depth (3) is reached, add initialNode as a predecessor to currentNode.
    if (currentDepth >= 3) { // Changed `== 3` to `>= 3` to be slightly more robust, though problem implies exactly 3.
      traversalState[currentNode].incomingEdges.add(initialNode);
      // Removed the second `used.add` as it was redundant/incorrect in the original context.
      return;
    }

    const currentChildren = outgoingConnections[currentNode].childrenNodes;

    // Guard clause for nodes without children.
    if (!currentChildren || currentChildren.length === 0) {
      return;
    }

    // Recursively explore children.
    for (const childNode of currentChildren) {
      traverseAndMapPaths(initialNode, childNode, currentDepth + 1);
    }
  }
}