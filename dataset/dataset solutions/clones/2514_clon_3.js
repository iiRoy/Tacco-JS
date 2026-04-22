const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputProcessor; // Manages reading and parsing input tokens
const capturedLines = []; // Stores all lines read from standard input

// Event listener for each line of input
inputReader.on('line', (currentLine) => {
  capturedLines.push(currentLine);
});

// Event listener for when input stream closes
inputReader.on('close', () => {
  inputProcessor = setupInputProcessor(capturedLines); // Initialize the input parsing object
  console.error("\n"); // Add a newline for cleaner debug output separation

  const executionStartTime = Date.now(); // Record start time for performance measurement
  ProcessGraphData(); // Execute the main application logic
  const executionDuration = Date.now() - executionStartTime; // Calculate execution time

  logDebugInfo(`Execution Time: ${executionDuration} ms`);
  logDebugInfo(`Memory Usage: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
});

// Utility function for creating a deep copy of an object
function createDeepCopy(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

// Input reading utilities
function readInteger() { return dataConverter(fetchNextItem(), 1); }
function readStringArray() { return dataConverter(fetchNextItem(), 2); }
function readIntegerArray() { return dataConverter(fetchNextItem(), 4); }
function readCharacterArray() { return dataConverter(fetchNextItem(), 6); }

function fetchNextItem() { return inputProcessor.getNextValue(); }
function hasMoreItems() { return inputProcessor.hasRemainingValues(); }

// Initializes an object responsible for parsing input lines sequentially
function setupInputProcessor(linesOfInput) {
  return {
    inputBuffer: linesOfInput, // Array of input strings
    currentIndex: 0,           // Current position in the buffer
    maxIndex: linesOfInput.length, // Total number of lines

    // Checks if there are more lines to process
    hasRemainingValues: function() {
      return (this.currentIndex < this.maxIndex);
    },

    // Retrieves the next line from the input buffer
    getNextValue: function() {
      if (!this.hasRemainingValues()) {
        throw new Error("InputBufferExhausted: No more input values available.");
      }
      return this.inputBuffer[this.currentIndex++];
    }
  };
}

// Function to output results to standard output
function displayResult(outputValue) {
  console.log(outputValue);
}

// Function to output debug information to standard error
function logDebugInfo(message) {
  console.error("DEBUG_INFO:", require("util").inspect(message, { colors: true, depth: null }));
}

// Helper function for converting input data based on a specified format code
// Format codes:
// 1: Parse as integer
// 2: Split string by space into an array of strings
// 4: Split string by space into an array of numbers
// 6: Split string into an array of characters
// 7: Split string into an array of characters and convert each to number
// 8: Join array elements with space
// 9: Join array elements with newline
// 0: Join array elements without separator
// Default: Return input as is
function dataConverter(inputValue, formatCode) {
  try {
    switch (formatCode) {
      case 1: return parseInt(inputValue, 10);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map(Number);
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map(Number);
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch (error) {
    logDebugInfo(`Conversion error for value: ${inputValue}, format: ${formatCode}. Error: ${error.message}`);
    return inputValue; // Return original value on error
  }
}

// Main application logic for graph processing
function ProcessGraphData() {
  const numVertices = readInteger(); // Get the number of vertices from input

  // Helper to create a new graph node object with initial state
  const createGraphNode = (id) => ({
    vertexId: id,
    adjacentVertices: [],      // List of connected vertex identifiers
    isDiscovered: false,       // Flag for BFS traversal (renamed from 'access')
    pathDistance: -1,          // Shortest distance from the BFS starting node (renamed from 'depth')
    parentVertex: null         // Added for potential path reconstruction (Type III addition)
  });

  // Initialize the array of graph nodes
  const graphStructure = Array.from({ length: numVertices }, (_, i) => createGraphNode(i));

  // Build adjacency list from the input matrix representation
  for (let i = 0; i < numVertices; ++i) {
    const adjacencyRowChars = readCharacterArray(); // Read row as array of characters ('0' or '1')
    for (let j = 0; j < numVertices; ++j) {
      // Add an edge if it's not a self-loop and the character indicates a connection
      if (i !== j && adjacencyRowChars[j] === '1') {
        graphStructure[i].adjacentVertices.push(j);
      }
    }
  }

  let overallLongestShortestPath = -1; // Stores the maximum distance found across all BFS runs

  // Iterate through each node, performing BFS to find the longest shortest path from it
  for (let startVertexIndex = 0; startVertexIndex < numVertices; ++startVertexIndex) {
    const currentTraversalMaxDistance = findMaxDistanceBFS(startVertexIndex, graphStructure, numVertices);

    // Update the overall maximum if a longer path is found
    if (currentTraversalMaxDistance > overallLongestShortestPath) {
      overallLongestShortestPath = currentTraversalMaxDistance;
      // The original `maeList = list;` was unused and potentially problematic due to reference.
      // It has been removed. The bipartite check will now use the state of `graphStructure`
      // after the *last* BFS run, mirroring the original's implicit behavior.
    }
  }

  // Perform a specific graph property check (similar to bipartite check)
  // This check looks for adjacent nodes whose path distances from the last BFS source have the same parity.
  // If such a pair exists, it implies a certain graph condition is not met.
  const isConditionViolated = checkAdjacencyParityCondition(graphStructure, numVertices);
  if (isConditionViolated) {
    displayResult(-1); // Output -1 if the condition is violated
    return;
  }

  displayResult(overallLongestShortestPath); // Output the determined longest shortest path length
}

// Helper function to check the adjacency parity condition
function checkAdjacencyParityCondition(verticesArray, count) {
  for (let i = 0; i < count - 1; ++i) {
    for (let j = i + 1; j < count; ++j) {
      // Check if there's an undirected edge between vertex i and vertex j
      const iToJHasEdge = verticesArray[i].adjacentVertices.includes(j);
      const jToIHasEdge = verticesArray[j].adjacentVertices.includes(i);

      if (iToJHasEdge && jToIHasEdge) {
        // If an edge exists, check if their path distances from the BFS source have the same parity
        if ((verticesArray[i].pathDistance % 2) === (verticesArray[j].pathDistance % 2)) {
          return true; // Condition violated
        }
      }
    }
  }
  return false; // Condition not violated
}

// Performs a Breadth-First Search starting from a given vertex
// Returns the maximum distance found from the startVertex within this specific traversal.
function findMaxDistanceBFS(startVertex, allVertices, totalVertexCount) {
  // Guard clause for invalid input parameters
  if (!allVertices || totalVertexCount <= 0 || startVertex < 0 || startVertex >= totalVertexCount) {
    logDebugInfo(`BFS Error: Invalid input parameters for startVertex ${startVertex}`);
    return 0;
  }

  // Reset traversal state for all nodes before starting a new BFS (Type III addition: helper function)
  resetAllVertexStates(allVertices, totalVertexCount);

  const explorationQueue = []; // Queue for BFS traversal
  const initialNode = allVertices[startVertex];

  initialNode.isDiscovered = true;
  initialNode.pathDistance = 0; // Distance from source to itself is 0
  explorationQueue.push(startVertex);

  let currentMaxDistanceInTraversal = 0; // Tracks the max distance found in *this* BFS run

  // BFS core loop: continue as long as there are nodes to explore
  while (explorationQueue.length > 0) {
    const activeVertexIndex = explorationQueue.shift(); // Dequeue the next vertex to process
    const activeVertex = allVertices[activeVertexIndex];

    // Update the maximum distance encountered so far in this traversal
    currentMaxDistanceInTraversal = Math.max(currentMaxDistanceInTraversal, activeVertex.pathDistance);

    // Explore all neighbors of the active vertex
    for (const neighborId of activeVertex.adjacentVertices) {
      const neighborNode = allVertices[neighborId];
      // If the neighbor hasn't been discovered yet
      if (!neighborNode.isDiscovered) {
        neighborNode.isDiscovered = true;
        const newDistance = activeVertex.pathDistance + 1; // Calculate new distance
        neighborNode.pathDistance = newDistance;
        neighborNode.parentVertex = activeVertexIndex; // Set parent (Type III addition)
        explorationQueue.push(neighborId); // Enqueue the newly discovered neighbor
      }
    }
  }
  return currentMaxDistanceInTraversal;
}

// Helper function to reset the traversal state of all graph vertices (Type III addition)
function resetAllVertexStates(vertices, count) {
  for (let i = 0; i < count; ++i) {
    vertices[i].isDiscovered = false;
    vertices[i].pathDistance = -1; // Reset distance to unvisited state
    vertices[i].parentVertex = null; // Clear parent reference
  }
}