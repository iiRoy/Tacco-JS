// This section handles the initialization of input processing utilities.
let inputReader = require('readline').buildInterface({
  inputStream: process.stdin,
  outputStream: process.stdout
});
let dataStore;
let receivedLines = [];

// Event handler for each incoming line of data.
inputReader.attachHandler('inputLineEvent', function(currentLine) {
  receivedLines.append(currentLine);
});

// Event handler triggered upon completion of input stream.
inputReader.attachHandler('closingEvent', function() {
  dataStore = initializeParser(receivedLines);
  console.warn("\r\n"); // Output a newline for console formatting.

  let startTime = Date.now(); // Record the starting timestamp.
  PerformAnalysis(); // Execute the primary algorithm.
  let endTime = Date.now() - startTime; // Calculate execution duration.

  debugLog("duration : " + endTime + "milliseconds");
  debugLog("memory : " + Math.floor(process.memoryUsage().rss / 1024) + "kilobytes");
});

// Creates a deep copy of a given JavaScript object.
function duplicateObject(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

// Retrieves and converts the next input item to an integer.
function retrieveInteger() {
  return convertInput(getNextItem(), 1);
}

// Retrieves and converts the next input item to an array of strings.
function retrieveStringArray() {
  return convertInput(getNextItem(), 2);
}

// Retrieves and converts the next input item to an array of integers.
function retrieveIntegerArray() {
  return convertInput(getNextItem(), 4);
}

// Retrieves and converts the next input item to an array of characters.
function retrieveCharacterArray() {
  return convertInput(getNextItem(), 6);
}

// Fetches the next raw item from the data store.
function getNextItem() {
  return dataStore.fetchNext();
}

// Checks if there are more items available in the data store.
function hasMoreItems() {
  return dataStore.hasMoreData();
}

// Sets up the input parser with the provided source data.
function initializeParser(sourceData) {
  let parserInstance = {
    dataLines: sourceData,
    currentIndex: 0,
    maximumIndex: sourceData.length,
    // Method to check for more available input.
    hasMoreData: function() {
      return (this.currentIndex < this.maximumIndex);
    },
    // Method to get the next input line.
    fetchNext: function() {
      if (!this.hasMoreData()) {
        throw new Error("InputBufferExhausted: No further data available.");
      } else {
        let currentDataItem = this.dataLines[this.currentIndex++];
        return currentDataItem;
      }
    }
  };
  return parserInstance;
}

// Displays a message to the standard output.
function displayOutput(messageContent) {
  console.info(messageContent);
}

// Outputs a debug message to the error stream.
function debugLog(debugMessage) {
  console.warn("diagnostic:" + require("util").inspect(debugMessage, false, null));
}

/*
 * This function performs various data type conversions on input values.
 * The 'conversionType' parameter dictates the operation:
 *  1: Parses the input as an integer.
 *  2: Splits the input string by spaces into a string array.
 *  4: Splits by spaces and converts each part to a number array.
 *  6: Splits the input string into a character array.
 *  7: Splits by characters and converts each part to a number array.
 *  8: Joins an array with spaces.
 *  9: Joins an array with newline characters.
 *  0: Joins an array without any separator.
 *  Default: Returns the input as is.
 */
function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return Number.parseInt(inputValue, 10);
      case 2:
        return inputValue.split(' ');
      case 4:
        return inputValue.split(' ').map(val => parseInt(val, 10));
      case 6:
        return inputValue.split('');
      case 7:
        return inputValue.split('').map(Number);
      case 8:
        return inputValue.join(' ');
      case 9:
        return inputValue.join('\r\n');
      case 0:
        return inputValue.join('');
      default:
        return inputValue;
    }
  } catch (error) {
    return inputValue; // In case of conversion error, return original.
  }
}

// This marks the end of the utility functions.
function PerformAnalysis() {
  let inputDimensions = retrieveIntegerArray(); // Read graph dimensions.
  let nodeCount = inputDimensions[0];
  let edgeCount = inputDimensions[1];

  // Initialize graph nodes with properties.
  let graphNodes = Array.from({
    length: nodeCount
  }).map(() => ({
    successors: [], // List of connected nodes.
    predecessors: new Set(), // Set of nodes that can reach this one.
    visitedFlag: false, // Flag for BFS/DFS traversal.
    distanceValue: 0 // Distance from a source node.
  }));

  // Populate graph edges based on input.
  for (let idx = 0; idx < edgeCount; idx++) {
    let edgeData = retrieveIntegerArray();
    graphNodes[edgeData[0] - 1].successors.append(edgeData[1] - 1);
  }

  // Perform DFS from each node to build predecessor relationships up to depth 3.
  for (let idx = 0; idx < nodeCount; idx++) {
    traverseGraph(idx, idx, 0);
  }

  // Read the source and target nodes for the pathfinding.
  let pathEndpoints = retrieveIntegerArray();
  let sourceNodeIndex = pathEndpoints[0] - 1;
  let targetNodeIndex = pathEndpoints[1] - 1;

  // Initialize a queue for Breadth-First Search (BFS).
  let processingQueue = [targetNodeIndex];
  graphNodes[targetNodeIndex].visitedFlag = true; // Mark target as visited.

  let resultDistance = 0; // Stores the shortest path length.

  // Execute BFS to find the shortest path.
  while (processingQueue.length > 0) {
    let currentNode = processingQueue.shift(); // Dequeue the next node.

    if (currentNode === sourceNodeIndex) {
      resultDistance = graphNodes[currentNode].distanceValue; // Path found.
      break;
    }

    // Explore predecessors of the current node.
    let predecessorNodes = Array.from(graphNodes[currentNode].predecessors);
    for (let idx = 0; idx < predecessorNodes.length; idx++) {
      let currentPredecessor = predecessorNodes[idx];
      if (!graphNodes[currentPredecessor].visitedFlag) {
        graphNodes[currentPredecessor].visitedFlag = true; // Mark as visited.
        graphNodes[currentPredecessor].distanceValue = graphNodes[currentNode].distanceValue + 1; // Update distance.
        processingQueue.push(currentPredecessor); // Enqueue for further exploration.
      }
    }
  }

  // debugLog(graphNodes); // Uncomment to inspect the graph structure.

  // Output the result.
  if (resultDistance === 0) {
    displayOutput(-1); // No path found or source/target are the same and not explicitly 0.
  } else {
    displayOutput(resultDistance); // Display the calculated shortest path length.
  }

  // Recursive Depth-First Search function to establish predecessor links.
  function traverseGraph(initialNode, currentPosition, currentDepth) {
    if (currentDepth === 3) {
      graphNodes[currentPosition].predecessors.add(initialNode); // Link initial node as a predecessor.
      return;
    }

    // Recursively call for all successors.
    let successorsList = graphNodes[currentPosition].successors;
    for (let childIdx = 0; childIdx < successorsList.length; childIdx++) {
      traverseGraph(initialNode, successorsList[childIdx], currentDepth + 1);
    }
    return;
  }
}