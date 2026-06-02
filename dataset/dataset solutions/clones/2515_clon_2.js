var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor;
var inputLines = [];

// Event listener for each line of input received
inputReader.on('line', function(currentInputLine) {
  inputLines.push(currentInputLine);
});

// Event listener when the input stream closes
inputReader.on('close', function() {
  inputProcessor = initializeInputProcessor(inputLines);
  console.error("\n"); // Output a newline to stderr for formatting

  var startTime = Date.now(); // Record start time
  executeMainLogic(); // Execute the primary algorithm logic
  var endTime = Date.now() - startTime; // Calculate elapsed time

  printDebug("time : " + endTime + "ms"); // Output execution time to stderr
  printDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB"); // Output memory usage to stderr
});

// Function to create a deep copy of an object
function createDeepCopy(originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}

// Utility functions to read various types of input from the processed lines
function readInteger() {
  return convertInput(getNextLine(), 1);
}

function readStringArray() {
  return convertInput(getNextLine(), 2);
}

function readIntegerArray() {
  return convertInput(getNextLine(), 4);
}

function readCharacterArray() {
  return convertInput(getNextLine(), 6);
}

// Retrieves the next available line from the input processor
function getNextLine() {
  return inputProcessor.getNext();
}

// Checks if there are more lines remaining to be read
function hasMoreLines() {
  return inputProcessor.hasMoreLines();
}

// Initializes an object responsible for managing input lines
function initializeInputProcessor(linesData) {
  var processorInstance = {
    dataLines: linesData, // Array containing all input lines
    currentLineIndex: 0, // Current position in the input lines array
    totalLines: linesData.length, // Total number of input lines

    // Method to determine if more input lines are available
    hasMoreLines: function() {
      return (this.currentLineIndex < this.totalLines);
    },

    // Method to retrieve the next input line, advancing the index
    getNext: function() {
      if (!this.hasMoreLines()) {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input"; // Error if no more input
      } else {
        var retrievedLine = this.dataLines[this.currentLineIndex++];
        return retrievedLine;
      }
    }
  };
  return processorInstance;
}

// Prints a given message to standard output
function printOutput(message) {
  console.log(message);
}

// Prints a debug message to standard error, including inspection details
function printDebug(debugMessage) {
  console.error("debug:" + require("util").inspect(debugMessage, false, null));
}

// Generic function to convert input based on a specified conversion type
// Conversion types:
// 1: Parse as an integer.
// 2: Split by spaces into an array of strings.
// 4: Split by spaces and map to an array of numbers.
// 6: Split into an array of individual characters.
// 7: Split into characters and map to an array of numbers.
// 8: Join array elements with a space.
// 9: Join array elements with a newline.
// 0: Join array elements without any separator.
// Default: Return the input value as is.
function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map(Number);
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map(Number);
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (error) {
    return inputValue; // In case of conversion error, return original value
  }
}

// --------------------------------------------------------------------------
// End of boilerplate and utility functions.

// Main function containing the core algorithm logic.
function executeMainLogic() {
  var nodeCount = readInteger(); // Read the total number of nodes

  // Initialize an array to hold data for each node in the graph
  var nodeData = Array(nodeCount);
  for (var idxA = 0; idxA < nodeCount; idxA++) {
    nodeData[idxA] = {
      connectedNodes: [], // Stores indices of nodes directly connected to this node
      visitedStatus: false, // Flag to track if this node has been visited during BFS
      nodeLevel: 1 // Stores the depth/level of this node from the BFS start point
    };
  }

  // Populate the connectedNodes list for each node based on the adjacency matrix input
  for (var idxA = 0; idxA < nodeCount; idxA++) {
    var charMatrixRow = readCharacterArray(); // Read a row representing connections
    for (var idxB = 0; idxB < nodeCount; idxB++) {
      // If nodes are distinct and there's a connection indicated by '1'
      if (idxA !== idxB && charMatrixRow[idxB] === "1") {
        nodeData[idxA].connectedNodes.push(idxB); // Add the connection
      }
    }
  }

  var resultValue = -1; // Initialize the variable to store the final output result

  // Perform the first Breadth-First Search starting from node 0
  // This finds one of the farthest nodes from node 0.
  var farthestNodeIndex = breadthFirstSearch(0);

  // Reset the visited status and depth for all nodes before the second BFS
  for (var idxA = 0; idxA < nodeCount; idxA++) {
    nodeData[idxA].visitedStatus = false;
    nodeData[idxA].nodeLevel = 1;
  }

  // Perform the second BFS, starting from the farthest node found in the first BFS
  // This helps determine the diameter of the graph (or a related property).
  var finalFarthestNode = breadthFirstSearch(farthestNodeIndex);

  // Check conditions based on node depths and connections to determine the final result
  for (var idxA = 0; idxA < nodeCount - 1; idxA++) {
    for (var idxB = idxA + 1; idxB < nodeCount; idxB++) {
      // If two distinct nodes have the same depth AND are directly connected
      if (nodeData[idxA].nodeLevel === nodeData[idxB].nodeLevel &&
        (nodeData[idxA].connectedNodes.indexOf(idxB) !== -1 || nodeData[idxB].connectedNodes.indexOf(idxA) !== -1)) {
        printOutput(-1); // Output -1 and terminate if this condition is met
        return;
      } else {
        // Otherwise, update the maximum depth encountered so far
        resultValue = Math.max(resultValue, nodeData[idxA].nodeLevel);
      }
    }
  }
  printOutput(resultValue); // Output the calculated final result

  // Breadth-First Search (BFS) algorithm implementation
  function breadthFirstSearch(startNodeIdx) {
    var processingQueue = [startNodeIdx]; // Initialize the queue with the starting node
    nodeData[startNodeIdx].visitedStatus = true; // Mark the starting node as visited

    var maximumLevel = 0; // Variable to keep track of the maximum depth reached during this BFS

    // Continue as long as there are nodes in the queue to process
    while (processingQueue.length > 0) {
      var currentNodeIdx = processingQueue.shift(); // Dequeue the next node to process
      var currentConnectedNodes = nodeData[currentNodeIdx].connectedNodes; // Get its neighbors

      // Iterate through all connected nodes (neighbors) of the current node
      for (var idxC = 0; idxC < currentConnectedNodes.length; idxC++) {
        var neighborNodeIdx = currentConnectedNodes[idxC];
        // If the neighbor has not been visited yet
        if (!nodeData[neighborNodeIdx].visitedStatus) {
          nodeData[neighborNodeIdx].visitedStatus = true; // Mark the neighbor as visited
          nodeData[neighborNodeIdx].nodeLevel = nodeData[currentNodeIdx].nodeLevel + 1; // Set its depth
          maximumLevel = Math.max(maximumLevel, nodeData[currentNodeIdx].nodeLevel + 1); // Update the overall maximum depth
          processingQueue.push(neighborNodeIdx); // Enqueue the neighbor for future processing
        }
      }
    }

    var returnedNodeIdx = -1; // Initialize the index of the node to be returned
    // Find the first node that has the maximum depth reached during this BFS
    for (var idxA = 0; idxA < nodeCount; idxA++) {
      if (nodeData[idxA].nodeLevel === maximumLevel) {
        returnedNodeIdx = idxA;
        break; // Found the first node at max depth, no need to search further
      }
    }
    return returnedNodeIdx; // Return the index of the farthest node found
  }
}
