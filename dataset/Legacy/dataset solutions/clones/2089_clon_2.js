var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var inputLines = [];

// Event listener for each line of input
inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

// Event listener for when input stream closes
inputReader.on('close', function() {
  dataProcessor = initializeInputHandler(inputLines);
  console.error('\n'); // Preserve original blank line error output

  var startTime = Date.now();
  ProcessGraph(); // Execute the main logic
  var endTime = Date.now() - startTime;

  logDebugMessage('time : ' + endTime + 'ms');
  logDebugMessage('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

/**
 * Creates a deep copy of an object or Set.
 * @param {any} originalObject The object to clone.
 * @returns {any} A deep copy of the original object.
 */
function createDeepCopy(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

/**
 * Retrieves and converts the next input item to an integer.
 * @returns {number} The next integer from input.
 */
function retrieveNextInteger() {
  return convertInput(fetchNextItem(), 1);
}

/**
 * Retrieves and converts the next input item to an array of strings.
 * @returns {string[]} The next string array from input.
 */
function retrieveNextStringArray() {
  return convertInput(fetchNextItem(), 2);
}

/**
 * Retrieves and converts the next input item to an array of integers.
 * @returns {number[]} The next integer array from input.
 */
function retrieveNextIntegerArray() {
  return convertInput(fetchNextItem(), 4);
}

/**
 * Retrieves and converts the next input item to an array of characters.
 * @returns {string[]} The next character array from input.
 */
function retrieveNextCharacterArray() {
  return convertInput(fetchNextItem(), 6);
}

/**
 * Fetches the next item from the input handler.
 * @returns {string} The next raw input string.
 */
function fetchNextItem() {
  return dataProcessor.fetchNextItem();
}

/**
 * Checks if there are more items in the input handler.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasMoreItems() {
  return dataProcessor.hasMoreItems();
}

/**
 * Initializes an input handler object.
 * @param {string[]} inputData An array of input strings.
 * @returns {object} An object with methods to manage input.
 */
function initializeInputHandler(inputData) {
  return {
    sourceData: inputData,
    currentPosition: 0,
    maximumLength: inputData.length,
    hasMoreItems: function() {
      return (this.currentPosition < this.maximumLength);
    },
    fetchNextItem: function() {
      if (this.hasMoreItems()) {
        return this.sourceData[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

/**
 * Prints a message to standard output.
 * @param {any} message The message to print.
 */
function printOutput(message) {
  console.log(message);
}

/**
 * Logs a debug message to standard error.
 * @param {any} debugInfo The information to log.
 */
function logDebugMessage(debugInfo) {
  console.error('debug:' + require('util').inspect(debugInfo, false, null));
}

/**
 * Converts input based on a specified format code.
 * @param {string|string[]} inputItem The item to convert.
 * @param {number} conversionType The type of conversion to apply.
 *   1: parseInt
 *   2: split by space
 *   4: split by space and map to Number
 *   6: split by character
 *   7: split by character and map to Number
 *   8: join by space
 *   9: join by newline
 *   0: join with no character
 *   default: return as is
 * @returns {any} The converted item.
 */
function convertInput(inputItem, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputItem);
      case 2:
        return inputItem.split(' ');
      case 4:
        return inputItem.split(' ').map(Number);
      case 6:
        return inputItem.split('');
      case 7:
        return inputItem.split('').map(Number);
      case 8:
        return inputItem.join(' ');
      case 9:
        return inputItem.join('\n');
      case 0:
        return inputItem.join('');
      default:
        return inputItem;
    }
  } catch (error) {
    return inputItem; // Return original on error
  }
}

/**
 * Main function to process the graph and assign values.
 */
function ProcessGraph() {
  var nodeCount = retrieveNextInteger(); // Read the number of nodes
  var nodeDetails = new Array(nodeCount); // Array to store node properties
  var finalResult = new Array(nodeCount); // Array to store the final assigned values

  // Initialize each node's properties
  for (var idx = 0; idx < nodeCount; idx++) {
    nodeDetails[idx] = {
      nodeLevel: null, // Depth/level in the BFS tree
      isVisited: false, // Flag for BFS traversal
      neighbors: [], // List of connected nodes
      assignedValue: -1 // Final assigned value, -1 initially
    };
  }

  // Counters for assigning values (1, 2, 3, 4, 5, 6, ...)
  var firstValue = 1;
  var secondValue = 2;
  var thirdValue = 3;

  // Read edges and build adjacency list
  for (var idx = 0; idx < nodeCount - 1; idx++) {
    var tempEdge = retrieveNextIntegerArray(); // Read an edge (u, v)
    // Adjust to 0-indexed and add to neighbors list
    nodeDetails[tempEdge[0] - 1].neighbors.push(tempEdge[1] - 1);
    nodeDetails[tempEdge[1] - 1].neighbors.push(tempEdge[0] - 1);
  }

  // Perform Breadth-First Search (BFS) starting from node 0
  var processingQueue = [0];
  nodeDetails[0].isVisited = true;
  nodeDetails[0].nodeLevel = 1; // Root is at level 1

  var oddLevelCount = 0; // Count of nodes at odd levels
  var evenLevelCount = 0; // Count of nodes at even levels

  while (processingQueue.length > 0) {
    var currentNodeIndex = processingQueue.shift(); // Dequeue a node

    // Increment count based on node's level parity
    if (nodeDetails[currentNodeIndex].nodeLevel % 2 === 1) {
      oddLevelCount++;
    } else {
      evenLevelCount++;
    }

    var connectedNodes = nodeDetails[currentNodeIndex].neighbors;
    // Explore neighbors
    for (var idx = 0; idx < connectedNodes.length; idx++) {
      var neighborIndex = connectedNodes[idx];
      if (!nodeDetails[neighborIndex].isVisited) {
        nodeDetails[neighborIndex].isVisited = true;
        nodeDetails[neighborIndex].nodeLevel = nodeDetails[currentNodeIndex].nodeLevel + 1;
        processingQueue.push(neighborIndex);
      }
    }
  }

  // Assign values based on the counts of odd/even level nodes
  if (oddLevelCount > (nodeCount / 3) && evenLevelCount > (nodeCount / 3)) {
    // If both odd and even levels have a significant number of nodes
    for (var idx = 0; idx < nodeCount; idx++) {
      if (nodeDetails[idx].nodeLevel % 2 === 1) {
        // Assign values 1, 4, 7... to odd level nodes
        if (firstValue <= nodeCount) {
          nodeDetails[idx].assignedValue = firstValue;
          firstValue += 3;
        }
      } else {
        // Assign values 2, 5, 8... to even level nodes
        if (secondValue <= nodeCount) {
          nodeDetails[idx].assignedValue = secondValue;
          secondValue += 3;
        }
      }
    }
  } else {
    // If one of the level counts is not significant (less than N/3)
    for (var idx = 0; idx < nodeCount; idx++) {
      if (oddLevelCount < evenLevelCount) {
        // If odd levels are fewer, assign 3, 6, 9... to odd level nodes
        if (nodeDetails[idx].nodeLevel % 2 === 1) {
          nodeDetails[idx].assignedValue = thirdValue;
          thirdValue += 3;
        }
      } else {
        // If even levels are fewer or equal, assign 3, 6, 9... to even level nodes
        if (nodeDetails[idx].nodeLevel % 2 === 0) {
          nodeDetails[idx].assignedValue = thirdValue;
          thirdValue += 3;
        }
      }
    }
  }

  // Fill in any remaining unassigned nodes (-1)
  for (var idx = 0; idx < nodeCount; idx++) {
    if (nodeDetails[idx].assignedValue === -1) {
      if (firstValue <= nodeCount) {
        nodeDetails[idx].assignedValue = firstValue;
        firstValue += 3;
      } else if (secondValue <= nodeCount) {
        nodeDetails[idx].assignedValue = secondValue;
        secondValue += 3;
      } else if (thirdValue <= nodeCount) {
        nodeDetails[idx].assignedValue = thirdValue;
        thirdValue += 3;
      }
    }
    finalResult[idx] = nodeDetails[idx].assignedValue;
  }

  // Print the final assigned values, joined by spaces
  printOutput(convertInput(finalResult, 8));
}
