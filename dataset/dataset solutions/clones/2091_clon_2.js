// Internal utility methods for processing input.
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataStore;
const capturedLines = [];

inputReader.on('line', function(currentLine) {
  capturedLines.push(currentLine);
});

inputReader.on('close', function() {
  dataStore = initializeParser(capturedLines);
  console.error('\n'); // Separator for debug output

  const startTime = Date.now();
  executeGraphProcessing();
  const elapsedTime = Date.now() - startTime;

  logDebugMessage('execution_time : ' + elapsedTime + 'ms');
  logDebugMessage('memory_usage : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

/**
 * Creates a deep copy of an object or a Set.
 * @param {any} sourceObject The object to copy.
 * @returns {any} A deep copy of the object.
 */
function deepCopy(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

// Functions to retrieve parsed input tokens
function retrieveInteger() { return transformInput(getNextToken(), 1); }
function retrieveStringArray() { return transformInput(getNextToken(), 2); }
function retrieveIntegerArray() { return transformInput(getNextToken(), 4); }
function retrieveCharacterArray() { return transformInput(getNextToken(), 6); }

// Core input stream navigation
function getNextToken() { return dataStore.next(); }
function hasMoreTokens() { return dataStore.hasMoreTokens(); }

/**
 * Initializes the input parser with an array of lines.
 * @param {string[]} lineInputs An array of input strings.
 * @returns {object} An object with methods to navigate the input.
 */
function initializeParser(lineInputs) {
  return {
    sourceLines: lineInputs,
    currentPosition: 0,
    maximumPosition: lineInputs.length,
    hasMoreTokens: function() {
      return (this.currentPosition < this.maximumPosition);
    },
    next: function() {
      if (this.hasMoreTokens()) {
        return this.sourceLines[this.currentPosition++];
      } else {
        throw 'InputEndException : No more input lines available';
      }
    }
  };
}

/**
 * Displays output to the console.
 * @param {string} message The message to display.
 */
function displayOutput(message) {
  console.log(message);
}

/**
 * Logs a debug message to the error stream.
 * @param {any} content The content to log.
 */
function logDebugMessage(content) {
  console.error('debug_info:' + require('util').inspect(content, false, null));
}

/**
 * Converts or transforms input based on a specified type.
 * Conversion types:
 *  - 1: Parse as integer.
 *  - 2: Split by space into string array.
 *  - 4: Split by space and parse each as integer.
 *  - 6: Split into character array.
 *  - 7: Split into character array and parse each as integer.
 *  - 8: Join array elements with space.
 *  - 9: Join array elements with newline.
 *  - 0: Join array elements with no character.
 *  - Default: Return input as is.
 * @param {any} inputValue The input value to transform.
 * @param {number} conversionType The type of transformation to apply.
 * @returns {any} The transformed value.
 */
function transformInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(' ');
      case 4:
        return inputValue.split(' ').map(Number);
      case 6:
        return inputValue.split('');
      case 7:
        return inputValue.split('').map(Number);
      case 8:
        return inputValue.join(' ');
      case 9:
        return inputValue.join('\n');
      case 0:
        return inputValue.join('');
      default:
        return inputValue;
    }
  } catch (e) {
    return inputValue; // Fallback in case of error during transformation
  }
}

// End of input/output utility section.
/**
 * Main function to process graph data and assign values.
 */
function executeGraphProcessing() {
  const nodeCount = retrieveInteger();
  const graphNodes = new Array(nodeCount);
  const resultArray = new Array(nodeCount);

  // Initialize graph nodes with default properties
  for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
    graphNodes[nodeIndex] = {
      level: null,
      visited: false,
      neighbors: [],
      assignedValue: -1
    };
  }

  // Counters for value assignment sequences
  let firstSequence = 1;
  let secondSequence = 2;
  let thirdSequence = 3;

  // Read edges and build adjacency list
  for (let edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
    const edgeData = retrieveIntegerArray();
    graphNodes[edgeData[0] - 1].neighbors.push(edgeData[1] - 1);
    graphNodes[edgeData[1] - 1].neighbors.push(edgeData[0] - 1);
  }

  // Breadth-First Search (BFS) for level and visitation tracking
  const bfsQueue = new Array(nodeCount + 5);
  let queueFront = 0;
  let queueRear = 1;

  bfsQueue[0] = 0; // Start BFS from node 0
  graphNodes[0].visited = true;
  graphNodes[0].level = 1;

  let oddLevelsCount = 0;
  let evenLevelsCount = 0;

  while (queueFront !== queueRear) {
    const currentNodeId = bfsQueue[queueFront++];
    if (graphNodes[currentNodeId].level % 2 === 1) { // Check for odd level
      oddLevelsCount++;
    } else { // Even level
      evenLevelsCount++;
    }

    const currentNeighbors = graphNodes[currentNodeId].neighbors;
    for (let neighborIndex = 0; neighborIndex < currentNeighbors.length; neighborIndex++) {
      const adjacentNodeId = currentNeighbors[neighborIndex];
      if (!graphNodes[adjacentNodeId].visited) {
        graphNodes[adjacentNodeId].visited = true;
        graphNodes[adjacentNodeId].level = graphNodes[currentNodeId].level + 1;
        bfsQueue[queueRear++] = adjacentNodeId;
      }
    }
  }

  // Assign values based on level counts
  if (oddLevelsCount > (nodeCount / 3) && evenLevelsCount > (nodeCount / 3)) {
    for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
      if (graphNodes[nodeIndex].level % 2 === 1) {
        if (firstSequence <= nodeCount) {
          graphNodes[nodeIndex].assignedValue = firstSequence;
          firstSequence += 3;
        }
      } else {
        if (secondSequence <= nodeCount) {
          graphNodes[nodeIndex].assignedValue = secondSequence;
          secondSequence += 3;
        }
      }
    }
  } else {
    for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
      if (oddLevelsCount < evenLevelsCount) {
        if (graphNodes[nodeIndex].level % 2 === 1) {
          graphNodes[nodeIndex].assignedValue = thirdSequence;
          thirdSequence += 3;
        }
      } else {
        if (graphNodes[nodeIndex].level % 2 === 0) {
          graphNodes[nodeIndex].assignedValue = thirdSequence;
          thirdSequence += 3;
        }
      }
    }
  }

  // Fill in any unassigned values
  for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
    if (graphNodes[nodeIndex].assignedValue === -1) {
      if (firstSequence <= nodeCount) {
        graphNodes[nodeIndex].assignedValue = firstSequence;
        firstSequence += 3;
      } else if (secondSequence <= nodeCount) {
        graphNodes[nodeIndex].assignedValue = secondSequence;
        secondSequence += 3;
      } else if (thirdSequence <= nodeCount) {
        graphNodes[nodeIndex].assignedValue = thirdSequence;
        thirdSequence += 3;
      }
    }
    resultArray[nodeIndex] = graphNodes[nodeIndex].assignedValue;
  }

  // Output the final result
  displayOutput(transformInput(resultArray, 8));
}