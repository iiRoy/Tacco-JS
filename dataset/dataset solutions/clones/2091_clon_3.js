const terminalInput = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let collectedInputLines = [];
let inputProcessorInstance;

terminalInput.on('line', (currentLine) => {
  collectedInputLines.push(currentLine);
});

terminalInput.on('close', () => {
  inputProcessorInstance = createInputHandler(collectedInputLines);
  solveGraphProblem();
});

/**
 * Initializes an input handler object for sequential access to collected input lines.
 * This handler provides methods to check for more input and retrieve the next line.
 * @param {string[]} sourceLines - An array of strings representing the raw input lines.
 * @returns {object} An object with `hasMoreTokens` and `getNextToken` methods.
 */
function createInputHandler(sourceLines) {
  let currentLineIndex = 0;
  const totalLines = sourceLines.length;

  return {
    hasMoreTokens: function() {
      return currentLineIndex < totalLines;
    },
    getNextToken: function() {
      if (this.hasMoreTokens()) {
        return sourceLines[currentLineIndex++];
      } else {
        throw new Error('InputBufferExhausted: Attempted to read beyond available input lines.');
      }
    }
  };
}

/**
 * Retrieves the next line from the global input processor.
 * @returns {string} The next available input line.
 */
function getLineFromInput() {
  return inputProcessorInstance.getNextToken();
}

/**
 * Reads and parses the next input line as an integer.
 * @returns {number} The parsed integer value.
 */
function readInteger() {
  return parseInputItem(getLineFromInput(), 'integer');
}

/**
 * Reads the next input line and splits it into an array of strings.
 * @returns {string[]} An array of strings.
 */
function readStringArray() {
  return parseInputItem(getLineFromInput(), 'stringArray');
}

/**
 * Reads the next input line, splits it by spaces, and converts parts to numbers.
 * @returns {number[]} An array of numbers.
 */
function readIntegerArray() {
  return parseInputItem(getLineFromInput(), 'integerArray');
}

/**
 * Reads the next input line and splits it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
function readCharacterArray() {
  return parseInputItem(getLineFromInput(), 'charArray');
}

/**
 * Prints the provided data to standard output.
 * @param {*} data - The data to be displayed.
 */
function printResult(data) {
  console.log(data);
}

/**
 * Logs a debug message to standard error, useful for diagnostics.
 * @param {*} message - The message or object to log. Objects are stringified.
 */
function logDebug(message) {
  console.error(`[DEBUG]: ${JSON.stringify(message, null, 2)}`);
}

/**
 * A versatile function for converting and formatting input data based on a specified type.
 * It handles parsing input strings into various data structures or joining arrays into strings.
 * @param {string|string[]} inputData - The data to be processed.
 * @param {string} conversionType - A string indicating the desired conversion (e.g., 'integer', 'joinSpace').
 * @returns {*} The converted or formatted data.
 */
function parseInputItem(inputData, conversionType) {
  try {
    switch (conversionType) {
      case 'integer':
        return parseInt(inputData, 10);
      case 'stringArray':
        return inputData.split(' ');
      case 'integerArray':
        return inputData.split(' ').map(Number);
      case 'charArray':
        return inputData.split('');
      case 'joinSpace':
        return Array.isArray(inputData) ? inputData.join(' ') : inputData;
      case 'joinNewline':
        return Array.isArray(inputData) ? inputData.join('\n') : inputData;
      case 'joinNoSeparator':
        return Array.isArray(inputData) ? inputData.join('') : inputData;
      default:
        return inputData;
    }
  } catch (error) {
    logDebug(`Input conversion error for type "${conversionType}" on data "${inputData}": ${error.message}`);
    return inputData; // Fallback: return original data on error.
  }
}

/**
 * Helper function to determine if a given number is odd.
 * @param {number} num - The number to check.
 * @returns {boolean} True if the number is odd, false otherwise.
 */
const isOdd = (num) => num % 2 !== 0;

/**
 * The main algorithm function that processes graph data.
 * It reads graph structure, performs a Breadth-First Search (BFS) to determine node levels,
 * and then assigns numerical values to nodes based on their level parity and counts,
 * following a specific set of rules.
 */
function solveGraphProblem() {
  const graphSize = readInteger();

  // Initialize all nodes in the graph registry.
  const nodeRegistry = Array.from({
    length: graphSize
  }, () => ({
    nodeLevel: null,
    visited: false,
    neighbors: [],
    assignedNumber: -1
  }));

  // Initialize sequential values for assignment.
  let sequenceA = 1;
  let sequenceB = 2;
  let sequenceC = 3;

  // Populate the graph's adjacency list by reading edge data.
  for (let i = 0; i < graphSize - 1; ++i) {
    const currentEdge = readIntegerArray();
    const nodeU = currentEdge[0] - 1;
    const nodeV = currentEdge[1] - 1;

    nodeRegistry[nodeU].neighbors.push(nodeV);
    nodeRegistry[nodeV].neighbors.push(nodeU);
  }

  // BFS initialization: Start from node 0.
  const processingQueue = [];
  const initialNodeIndex = 0;

  processingQueue.push(initialNodeIndex);
  nodeRegistry[initialNodeIndex].visited = true;
  nodeRegistry[initialNodeIndex].nodeLevel = 1;

  let oddLevelNodesCount = 0;
  let evenLevelNodesCount = 0;

  // Perform BFS to determine node levels and count nodes at odd/even levels.
  while (processingQueue.length > 0) {
    const currentNodeIdentifier = processingQueue.shift();

    if (isOdd(nodeRegistry[currentNodeIdentifier].nodeLevel)) {
      oddLevelNodesCount++;
    } else {
      evenLevelNodesCount++;
    }

    for (const neighborIdx of nodeRegistry[currentNodeIdentifier].neighbors) {
      if (!nodeRegistry[neighborIdx].visited) {
        nodeRegistry[neighborIdx].visited = true;
        nodeRegistry[neighborIdx].nodeLevel = nodeRegistry[currentNodeIdentifier].nodeLevel + 1;
        processingQueue.push(neighborIdx);
      }
    }
  }

  const thresholdForLevels = graphSize / 3;

  // First phase of value assignment based on level counts.
  if (oddLevelNodesCount > thresholdForLevels && evenLevelNodesCount > thresholdForLevels) {
    // Both level types are sufficiently large.
    for (let i = 0; i < graphSize; ++i) {
      const currentNode = nodeRegistry[i];
      if (isOdd(currentNode.nodeLevel)) {
        if (sequenceA <= graphSize) {
          currentNode.assignedNumber = sequenceA;
          sequenceA += 3;
        }
      } else { // Even level
        if (sequenceB <= graphSize) {
          currentNode.assignedNumber = sequenceB;
          sequenceB += 3;
        }
      }
    }
  } else {
    // One or both level types are not large enough.
    // Assign 'sequenceC' to the less frequent level parity.
    const targetParityForC = oddLevelNodesCount < evenLevelNodesCount ? 'odd' : 'even';

    for (let i = 0; i < graphSize; ++i) {
      const currentNode = nodeRegistry[i];
      const currentNodeIsOdd = isOdd(currentNode.nodeLevel);

      if ((targetParityForC === 'odd' && currentNodeIsOdd) ||
        (targetParityForC === 'even' && !currentNodeIsOdd)) {
        if (sequenceC <= graphSize) {
          currentNode.assignedNumber = sequenceC;
          sequenceC += 3;
        }
      }
    }
  }

  const finalAssignmentResult = Array(graphSize);

  // Second phase of value assignment: Fill in any remaining unassigned nodes (-1).
  for (let i = 0; i < graphSize; ++i) {
    const currentNode = nodeRegistry[i];
    if (currentNode.assignedNumber === -1) {
      // Helper to assign the smallest available number from remaining sequences.
      assignNextAvailableValue(currentNode, graphSize, sequenceA, sequenceB, sequenceC);

      // Update the sequence counters based on which value was assigned.
      if (currentNode.assignedNumber === sequenceA) {
        sequenceA += 3;
      } else if (currentNode.assignedNumber === sequenceB) {
        sequenceB += 3;
      } else if (currentNode.assignedNumber === sequenceC) {
        sequenceC += 3;
      }
    }
    finalAssignmentResult[i] = currentNode.assignedNumber;
  }

  // Output the final assignment joined by spaces.
  printResult(parseInputItem(finalAssignmentResult, 'joinSpace'));
}

/**
 * A helper function to assign the next available number from the three sequences
 * (A, B, C) to a node, prioritizing A, then B, then C.
 * @param {object} nodeElement - The node object whose assignedNumber property will be updated.
 * @param {number} maximumPossibleValue - The upper bound for assigned values (graphSize).
 * @param {number} currentSequenceA - The current value for sequence A.
 * @param {number} currentSequenceB - The current value for sequence B.
 * @param {number} currentSequenceC - The current value for sequence C.
 */
function assignNextAvailableValue(nodeElement, maximumPossibleValue, currentSequenceA, currentSequenceB, currentSequenceC) {
  if (currentSequenceA <= maximumPossibleValue) {
    nodeElement.assignedNumber = currentSequenceA;
  } else if (currentSequenceB <= maximumPossibleValue) {
    nodeElement.assignedNumber = currentSequenceB;
  } else if (currentSequenceC <= maximumPossibleValue) {
    nodeElement.assignedNumber = currentSequenceC;
  }
}