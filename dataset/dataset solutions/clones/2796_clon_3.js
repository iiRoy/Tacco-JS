// Constants for various parsing modes and default values
const PARSE_INT_MODE_VAL = 1;
const PARSE_STRING_ARRAY_MODE_VAL = 2;
const PARSE_INTEGER_ARRAY_MODE_VAL = 4;
const PARSE_CHAR_ARRAY_MODE_VAL = 6;
const PARSE_CHAR_INTEGER_ARRAY_MODE_VAL = 7;
const JOIN_SPACE_MODE_VAL = 8;
const JOIN_NEWLINE_MODE_VAL = 9;
const JOIN_NO_SEPARATOR_MODE_VAL = 0;

// Utility for logging diagnostic information, replaces original 'myerr'
const diagnosticLogger = (diagnosticMessage) => {
  console.error("DIAGNOSTIC_OUTPUT: " + require("util").inspect(diagnosticMessage, false, null));
};

// Input stream processing utility class, replaces 'init' and related 'next*' functions
class InputDataStreamProcessor {
  #dataSourceLines;
  #currentInputLineIndex;
  #totalInputLineCount;

  constructor(initialInputLines) {
    this.#dataSourceLines = initialInputLines;
    this.#currentInputLineIndex = 0;
    this.#totalInputLineCount = initialInputLines.length;
  }

  // Checks if there are additional lines available for processing
  isDataAvailable() {
    return this.#currentInputLineIndex < this.#totalInputLineCount;
  }

  // Retrieves the subsequent raw line from the input stream
  retrieveNextRawLine() {
    if (!this.isDataAvailable()) {
      // Type III: More specific error message and custom error type
      throw new Error("EndOfInputReachedException: All input lines have been processed.");
    }
    return this.#dataSourceLines[this.#currentInputLineIndex++];
  }

  // Type III: Replaced 'myconv' with specific, clearly named methods for each conversion
  parseNextLineAsInteger() {
    return parseInt(this.retrieveNextRawLine(), 10); // Explicit radix for safety
  }

  parseNextLineAsIntegerArray() {
    const lineContent = this.retrieveNextRawLine();
    // Type III: Added robust validation for empty or invalid input lines
    if (typeof lineContent !== 'string' || lineContent.trim() === '') {
      diagnosticLogger("Warning: Encountered an empty or non-string line during integer array parsing.");
      return []; // Returning an empty array for robustness, could also throw
    }
    return lineContent.split(" ").map(Number);
  }

  // Type III: Added more specific parsing methods, even if not all are directly used in the main logic
  parseNextLineAsStringArray() {
    const lineContent = this.retrieveNextRawLine();
    return typeof lineContent === 'string' ? lineContent.split(" ") : [];
  }

  parseNextLineAsCharacterArray() {
    const lineContent = this.retrieveNextRawLine();
    return typeof lineContent === 'string' ? lineContent.split("") : [];
  }
}

// Global function for printing final results, replaces 'myout'
const deliverResult = (finalOutput) => {
  console.log(finalOutput);
};

// Setup for asynchronous input reading using Node.js 'readline' module
let systemInputInterface = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let accumulatedInputData = [];
let dataStreamHandlerInstance; // Will hold an instance of InputDataStreamProcessor

systemInputInterface.on('line', (currentLineOfInput) => {
  accumulatedInputData.push(currentLineOfInput);
});

systemInputInterface.on('close', () => {
  dataStreamHandlerInstance = new InputDataStreamProcessor(accumulatedInputData);
  
  // Type III: Removed extraneous blank error log
  const processingStartTimestamp = Date.now();
  executeGraphPathfinding(); // Renamed 'Main' to a more descriptive name
  const processingDuration = Date.now() - processingStartTimestamp;

  diagnosticLogger(`Operation elapsed time: ${processingDuration} ms`);
  // Type III: Slightly refactored memory usage logging for clarity
  const currentMemoryUsage = process.memoryUsage();
  diagnosticLogger(`Allocated memory (heap total): ${Math.round(currentMemoryUsage.heapTotal / 1024)} KB`);
});

// Constants for graph algorithm parameters
const MAX_DFS_EXPLORATION_DEPTH = 3;
const PATH_NOT_FOUND_INDICATOR = -1; // Value representing an unreachable path

// Main function encapsulating the graph traversal logic, replaces 'Main'
function executeGraphPathfinding() {
  // Retrieve initial graph dimensions (node count and edge count)
  const graphDimensionParameters = dataStreamHandlerInstance.parseNextLineAsIntegerArray();
  const graphNodeCount = graphDimensionParameters[0];
  const graphEdgeCount = graphDimensionParameters[1];

  // Type III: Added preliminary validation for graph dimensions
  if (graphNodeCount <= 0 || graphEdgeCount < 0) {
    diagnosticLogger("Error: Invalid graph dimensions detected (nodeCount non-positive or edgeCount negative).");
    deliverResult(PATH_NOT_FOUND_INDICATOR); // Output error state
    return;
  }

  // Initialize the graph's adjacency list (successors)
  // Renamed 'list' to 'graphAdjacencyList'
  const graphAdjacencyList = new Array(graphNodeCount);
  for (let nodeIdentifier = 0; nodeIdentifier < graphNodeCount; nodeIdentifier++) {
    graphAdjacencyList[nodeIdentifier] = {
      successors: [] // Renamed 'child' to 'successors' for clarity
    };
  }

  // Initialize auxiliary node data for BFS/DFS (parent tracking, visit status, distance)
  // Renamed 'newList' to 'nodeAuxiliaryData'
  const nodeAuxiliaryData = new Array(graphNodeCount);
  for (let nodeIdentifier = 0; nodeIdentifier < graphNodeCount; nodeIdentifier++) {
    nodeAuxiliaryData[nodeIdentifier] = {
      indirectPredecessors: new Set(), // Renamed 'parent' to 'indirectPredecessors'
      bfsVisitedStatus: false, // Renamed 'access' to 'bfsVisitedStatus'
      distanceFromTargetNode: 0 // Renamed 'depth' to 'distanceFromTargetNode'
    };
  }

  // Populate the graph by adding edges based on input
  for (let edgeIndex = 0; edgeIndex < graphEdgeCount; edgeIndex++) {
    const currentEdgeDefinition = dataStreamHandlerInstance.parseNextLineAsIntegerArray();
    const originNode = currentEdgeDefinition[0] - 1;
    const destinationNode = currentEdgeDefinition[1] - 1;

    // Type III: Added boundary checks for node indices
    if (originNode < 0 || originNode >= graphNodeCount || destinationNode < 0 || destinationNode >= graphNodeCount) {
      diagnosticLogger(`Warning: Edge (${originNode + 1}, ${destinationNode + 1}) references nodes outside valid bounds.`);
      continue; // Skip and log invalid edge
    }
    graphAdjacencyList[originNode].successors.push(destinationNode);
  }

  // Perform a Depth-First Search to pre-calculate indirect predecessors within a specified depth
  // Renamed 'dfs' to 'precomputeIndirectPredecessors'
  // Type III: Encapsulate DFS as a nested helper function
  const precomputeIndirectPredecessors = (dfsOriginNode, currentNodeInDFS, currentDfsDepth) => {
    // Type III: Explicit depth limit check
    if (currentDfsDepth >= MAX_DFS_EXPLORATION_DEPTH) {
      nodeAuxiliaryData[currentNodeInDFS].indirectPredecessors.add(dfsOriginNode);
      return;
    }

    const currentSuccessors = graphAdjacencyList[currentNodeInDFS].successors;
    // Type III: Utilize 'for...of' loop for iterating over iterable collections
    for (const successorNode of currentSuccessors) {
      precomputeIndirectPredecessors(dfsOriginNode, successorNode, currentDfsDepth + 1);
    }
    // Type III: Removed redundant 'return' statement for void function
  };

  for (let nodeIdentifier = 0; nodeIdentifier < graphNodeCount; nodeIdentifier++) {
    precomputeIndirectPredecessors(nodeIdentifier, nodeIdentifier, 0);
  }

  // Read the start and target nodes for the Breadth-First Search
  const startAndTargetPair = dataStreamHandlerInstance.parseNextLineAsIntegerArray();
  const startNodeIndex = startAndTargetPair[0] - 1;
  const targetNodeIndex = startAndTargetPair[1] - 1;

  // Type III: Added validation for start and target node indices
  if (startNodeIndex < 0 || startNodeIndex >= graphNodeCount || targetNodeIndex < 0 || targetNodeIndex >= graphNodeCount) {
    diagnosticLogger("Error: Start or target node index is out of graph bounds.");
    deliverResult(PATH_NOT_FOUND_INDICATOR);
    return;
  }

  // Initialize BFS structures
  let bfsQueueFrontPointer = 0; // Replaces 'maeIndex'
  let bfsQueueRearPointer = 0; // Replaces 'atoIndex'
  // Type III: Used a slightly more robust queue size, still a fixed-size array to mimic original style
  const bfsTraversalQueue = new Array(graphNodeCount + 10); // Added a small buffer

  bfsTraversalQueue[bfsQueueRearPointer++] = targetNodeIndex;
  nodeAuxiliaryData[targetNodeIndex].bfsVisitedStatus = true;
  nodeAuxiliaryData[targetNodeIndex].distanceFromTargetNode = 0;

  let computedShortestPathLength = PATH_NOT_FOUND_INDICATOR; // Replaces 'output'

  // Execute Breadth-First Search
  while (bfsQueueFrontPointer !== bfsQueueRearPointer) {
    const currentlyProcessedNode = bfsTraversalQueue[bfsQueueFrontPointer++]; // Dequeue operation
    
    // Type III: Moved path found check to the start of processing the dequeued node
    if (currentlyProcessedNode === startNodeIndex) {
      computedShortestPathLength = nodeAuxiliaryData[currentlyProcessedNode].distanceFromTargetNode;
      break; // Path found, terminate BFS
    }

    // Iterate over pre-calculated indirect predecessors (nodes that can reach 'currentlyProcessedNode' in 3 steps)
    // Type III: Used spread operator for converting Set to Array for iteration, more concise than Array.from()
    const potentialPredecessorNodes = [...nodeAuxiliaryData[currentlyProcessedNode].indirectPredecessors];
    for (const candidatePredecessor of potentialPredecessorNodes) {
      // Type III: Introduced an intermediate variable for clarity in distance calculation
      const distanceToCandidate = nodeAuxiliaryData[currentlyProcessedNode].distanceFromTargetNode + 1;

      // Process only if the candidate predecessor has not been visited in this BFS traversal
      if (!nodeAuxiliaryData[candidatePredecessor].bfsVisitedStatus) {
        nodeAuxiliaryData[candidatePredecessor].bfsVisitedStatus = true;
        nodeAuxiliaryData[candidatePredecessor].distanceFromTargetNode = distanceToCandidate;
        bfsTraversalQueue[bfsQueueRearPointer++] = candidatePredecessor; // Enqueue operation

        // Type III: Added a guard for potential queue overflow, though less likely with dynamic sizing
        if (bfsQueueRearPointer >= bfsTraversalQueue.length) {
            diagnosticLogger("Warning: BFS queue capacity might be insufficient. Consider increasing initial size.");
            // In a production scenario, this might trigger a resize or a more critical error.
        }
      }
    }
  }

  // Type III: Removed original commented-out debug statements
  deliverResult(computedShortestPathLength);
}