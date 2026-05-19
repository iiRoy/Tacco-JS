var inputProcessor = setupInputReader();

processGraphData();

// Function to read an integer from the input stream
function fetchInteger() {
  return transformInput(getLineFromBuffer(), 1);
}

// Function to read a string array (space-separated values)
function fetchStringArray() {
  return transformInput(getLineFromBuffer(), 2);
}

// Function to read an integer array (space-separated values, converted to numbers)
function fetchIntegerArray() {
  return transformInput(getLineFromBuffer(), 4);
}

// Function to read a character array (single characters)
function fetchCharacterArray() {
  return transformInput(getLineFromBuffer(), 6);
}

// Retrieves the next available line from the input buffer
function getLineFromBuffer() {
  return inputProcessor.retrieveNext();
}

// Checks if there are more lines remaining in the input buffer
function hasMoreInput() {
  return inputProcessor.checkAvailability();
}

// Reads all input from standard input, trims whitespace, and splits by newline
function readAllStdin() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

// Initializes and returns an object for managing input lines
function setupInputReader() {
  var rawInputLines = readAllStdin(); // Fetch all lines from stdin
  var readerObject = {
    "lineBuffer": rawInputLines,
    "currentLineIndex": 0,
    "totalLines": rawInputLines.length,
    "checkAvailability": function() {
      return (this.currentLineIndex < this.totalLines);
    },
    "retrieveNext": function() {
      if (!this.checkAvailability()) {
        throw "InputBufferExhausted: No more lines to process.";
      } else {
        var lineContent = this.lineBuffer[this.currentLineIndex];
        this.currentLineIndex++;
        return lineContent;
      }
    }
  };
  return readerObject;
}

// Outputs a message to standard output
function displayResult(message) {
  console.log(message);
}

// Outputs an error message to standard error
function displayError(errorMessage) {
  console.error(errorMessage);
}

// Utility function to convert input based on a specified type code
// Type codes: 1=parseInt, 2=split by space, 4=split by space and map to Number,
// 6=split by char, 7=split by char and map to Number, 8=join by space,
// 9=join by newline, 0=join without separator. Default returns input as is.
function transformInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((itemValue) => Number(itemValue));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((itemValue) => Number(itemValue));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (err) {
    return inputValue; // In case of conversion error, return original value
  }
}

// Main function to execute the graph processing algorithm
function processGraphData() {
  // Read the first line which contains the number of nodes (N) and edges (M)
  var initialConfig = fetchIntegerArray();
  var numNodes = initialConfig[0];
  var numEdges = initialConfig[1];

  // Initialize two adjacency matrices: one for shortest paths, one for original edge weights
  var shortestPathDistances = new Array(numNodes);
  var initialEdgeWeights = new Array(numNodes);
  var largeConstant = 1000000007; // Represents an unreachable path or infinity

  // Populate matrices with initial values: infinity for all paths, 0 for self-loops
  for (var nodeIdxA = 0; nodeIdxA < numNodes; nodeIdxA++) {
    shortestPathDistances[nodeIdxA] = new Array(numNodes).fill(largeConstant);
    shortestPathDistances[nodeIdxA][nodeIdxA] = 0; // Distance from a node to itself is zero

    initialEdgeWeights[nodeIdxA] = new Array(numNodes).fill(largeConstant);
    initialEdgeWeights[nodeIdxA][nodeIdxA] = 0; // Original weight from a node to itself is zero
  }

  // Read edge data and update the matrices
  for (var edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
    var edgeDetails = fetchIntegerArray();
    var sourceNode = edgeDetails[0] - 1; // Adjust to 0-indexed
    var destNode = edgeDetails[1] - 1;   // Adjust to 0-indexed
    var weight = edgeDetails[2];

    // For an undirected graph, update both directions
    shortestPathDistances[sourceNode][destNode] = weight;
    shortestPathDistances[destNode][sourceNode] = weight;

    initialEdgeWeights[sourceNode][destNode] = weight;
    initialEdgeWeights[destNode][sourceNode] = weight;
  }

  // Apply the Floyd-Warshall algorithm to compute all-pairs shortest paths
  for (var intermediateNode = 0; intermediateNode < numNodes; intermediateNode++) {
    for (var nodeIdxA = 0; nodeIdxA < numNodes; nodeIdxA++) {
      for (var nodeIdxB = 0; nodeIdxB < numNodes; nodeIdxB++) {
        // If a path through 'intermediateNode' is shorter than the current path
        if (shortestPathDistances[nodeIdxA][nodeIdxB] > shortestPathDistances[nodeIdxA][intermediateNode] + shortestPathDistances[intermediateNode][nodeIdxB]) {
          shortestPathDistances[nodeIdxA][nodeIdxB] = shortestPathDistances[nodeIdxA][intermediateNode] + shortestPathDistances[intermediateNode][nodeIdxB];
        }
      }
    }
  }

  // Count the number of edges that are not part of any shortest path
  var redundantEdgesCount = 0;
  for (var nodeIdxA = 0; nodeIdxA < numNodes; nodeIdxA++) {
    for (var nodeIdxB = 0; nodeIdxB < numNodes; nodeIdxB++) {
      // An edge is considered redundant if it existed in the original graph (not infinity)
      // AND its original weight is greater than the shortest path distance found by Floyd-Warshall
      if (initialEdgeWeights[nodeIdxA][nodeIdxB] !== largeConstant && initialEdgeWeights[nodeIdxA][nodeIdxB] !== shortestPathDistances[nodeIdxA][nodeIdxB]) {
        redundantEdgesCount++;
      }
    }
  }
  // Since each redundant edge is counted twice (e.g., A->B and B->A), divide the total by 2
  displayResult(redundantEdgesCount / 2);
}
