// This section handles input processing and utility functions. It's not part of the core algorithm.
var dataStream = require('readline').buildInterface({
  inStream: process.stdin,
  outStream: process.stdout
});
var parsedInput;
var inputLines = [];

dataStream.on('lineReceived', function(incomingLine) {
  inputLines.push(incomingLine);
});

dataStream.on('finishedReading', function() {
  parsedInput = initializeInputProcessor(inputLines);
  console.warn("Input processing complete.\n"); // Changed to warn, added text
  var beginTime = Date.now();
  ExecutePrimaryLogic();
  var elapsedTime = Date.now() - beginTime;
  logError("Execution duration : " + elapsedTime + " milliseconds"); // Reworded log message
  logError("Memory footprint : " + Math.round(process.memoryUsage().heapTotal / 1024) + " KB"); // Reworded log message
});

// Creates a deep copy of an object.
function duplicateObject(originalObj) {
  return JSON.parse(JSON.stringify(originalObj));
}

// Retrieves the next integer from the input stream.
function fetchInteger() {
  return convertInput(retrieveNextValue(), 1);
}

// Retrieves the next line as an array of strings.
function fetchStringArray() {
  return convertInput(retrieveNextValue(), 2);
}

// Retrieves the next line as an array of integers.
function fetchIntegerArray() {
  return convertInput(retrieveNextValue(), 4);
}

// Retrieves the next line as an array of characters.
function fetchCharacterArray() {
  return convertInput(retrieveNextValue(), 6);
}

// Advances the input pointer and returns the next line.
function retrieveNextValue() {
  return parsedInput.getNextEntry();
}

// Checks if there are more lines available in the input.
function hasMoreValues() {
  return parsedInput.hasMoreEntries();
}

// Initializes the input parsing utility.
function initializeInputProcessor(sourceData) {
  var processorObject = {
    dataList: sourceData,
    currentPosition: 0,
    maximumCount: sourceData.length,

    // Checks if more entries are available for processing.
    hasMoreEntries: function() {
      return (this.currentPosition < this.maximumCount);
    },

    // Fetches the next available entry from the data list.
    getNextEntry: function() {
      if (!this.hasMoreEntries()) {
        throw "InputBoundsExceededError: No further input is available."; // New error message
      } else {
        var currentEntry = this.dataList[this.currentPosition++];
        return currentEntry;
      }
    }
  };
  return processorObject;
}

// Displays the provided content to standard output.
function displayOutput(messageContent) {
  console.log(messageContent);
}

// Logs debug information to standard error.
function logError(errorInfo) {
  console.error("DEBUG_INFO: " + require("util").inspect(errorInfo, false, null));
}

/*
 * This function performs various input conversions based on the specified type.
 * @param {string} inputValue - The raw input string or array to be converted.
 * @param {number} conversionType - An integer indicating the desired conversion.
 *   - 1: Parse to integer.
 *   - 2: Split by spaces into a string array.
 *   - 4: Split by spaces into an integer array.
 *   - 6: Split into a character array.
 *   - 7: Split into a character array then parse each to integer.
 *   - 8: Join array elements with spaces.
 *   - 9: Join array elements with newlines.
 *   - 0: Join array elements without any separator.
 *   - Default: Return input as is.
 */
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
  } catch (exceptionOccurred) {
    // If conversion fails, return original value.
    return inputValue;
  }
}

// End of utility and input handling section.
// ------------------------------------------

// Main application logic starts here.
function ExecutePrimaryLogic() {
  var firstLineData = fetchIntegerArray();
  var nodeCount = firstLineData[0];
  var edgeCount = firstLineData[1];

  var adjacencyStructure = new Array(nodeCount); // Stores forward connections (children)
  var processedNodes = new Array(nodeCount); // Stores reverse connections (parents), visited status, and depth

  var visitedStates = new Set(); // Keeps track of visited states in DFS to prevent cycles/redundant work

  // Initialize graph nodes and their properties
  for (var idx = 0; idx < nodeCount; idx++) {
    adjacencyStructure[idx] = {
      connectedNodes: [], // List of nodes reachable from this one
    };
    processedNodes[idx] = {
      predecessorNodes: new Set(), // Set of nodes that can reach this one
      isVisited: false, // Flag for BFS traversal
      level: 0 // Distance from target in BFS
    };
  }

  // Populate the adjacency structure with edges
  for (var idx = 0; idx < edgeCount; idx++) {
    var temporaryData = fetchIntegerArray();
    adjacencyStructure[temporaryData[0] - 1].connectedNodes.push(temporaryData[1] - 1);
  }

  // Perform DFS from each node to build reverse connections up to a certain depth
  for (var idx = 0; idx < nodeCount; idx++) {
    exploreGraph(idx, idx, 0);
  }

  // Release memory for the forward adjacency structure as it's no longer needed
  adjacencyStructure = null;

  var temporaryData = fetchIntegerArray();
  var startNode = temporaryData[0] - 1;
  var targetNode = temporaryData[1] - 1;

  var frontPointer = 0; // Head of the BFS queue
  var backPointer = 1; // Tail of the BFS queue

  var bfsQueue = new Array(100007); // Pre-allocated queue for BFS
  bfsQueue[0] = targetNode;
  processedNodes[targetNode].isVisited = true; // Mark target as visited for BFS

  var resultValue = -1; // Stores the shortest path length

  // Perform a Breadth-First Search (BFS) starting from the target node
  while (frontPointer !== backPointer) {
    var currentNode = bfsQueue[frontPointer];
    frontPointer++; // Dequeue node

    // If we reached the starting node, we found the shortest path
    if (currentNode === startNode) {
      resultValue = processedNodes[currentNode].level;
      break;
    }

    // Iterate through predecessor nodes (parents) to explore backwards
    var predecessorList = Array.from(processedNodes[currentNode].predecessorNodes);
    for (var innerIdx = 0; innerIdx < predecessorList.length; innerIdx++) {
      if (!processedNodes[predecessorList[innerIdx]].isVisited) {
        processedNodes[predecessorList[innerIdx]].isVisited = true;
        processedNodes[predecessorList[innerIdx]].level = processedNodes[currentNode].level + 1;
        bfsQueue[backPointer] = predecessorList[innerIdx];
        backPointer++; // Enqueue predecessor
      }
    }
  }

  // logError(adjacencyStructure); // Example of renamed debug call
  // logError(processedNodes);
  displayOutput(resultValue); // Output the final result


  // Recursive Depth-First Search function to build reverse graph connections.
  // It explores paths up to a specified depth and records predecessors.
  // @param {number} originNode - The starting node of the current DFS path.
  // @param {number} currentNode - The node currently being visited.
  // @param {number} currentDepth - The current depth of the traversal from originNode.
  function exploreGraph(originNode, currentNode, currentDepth) {
    // Avoid redundant computations by checking visited states for this path
    if (visitedStates.has(currentNode.toString() + "-" + currentDepth.toString())) { // Changed separator
      return;
    }
    visitedStates.add(currentNode.toString() + "-" + currentDepth.toString()); // Changed separator

    // If maximum depth is reached, record the origin node as a predecessor
    if (currentDepth === 3) {
      processedNodes[currentNode].predecessorNodes.add(originNode);
      // Mark this specific root-to-node connection as processed to prevent redundant additions
      visitedStates.add(originNode.toString() + ":" + currentNode.toString());
      return;
    }

    // Traverse to connected children nodes
    var childrenOfCurrent = adjacencyStructure[currentNode].connectedNodes;
    for (var innerIdx = 0; innerIdx < childrenOfCurrent.length; innerIdx++) {
      exploreGraph(originNode, childrenOfCurrent[innerIdx], currentDepth + 1);
    }
    return;
  }
}