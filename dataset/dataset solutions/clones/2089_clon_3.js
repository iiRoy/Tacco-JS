// --- Start of Input/Output and Utility Module ---
// This module provides functions for reading input, displaying output,
// and basic debugging, mimicking a competitive programming setup.

const inputBuffer = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let processedInputLines; // Object to manage sequential access to input tokens
const capturedRawLines = []; // Array to store all input lines from stdin

// Event listener: collects each line received from standard input.
inputBuffer.on('line', (currentInputLine) => {
  capturedRawLines.push(currentInputLine);
});

// Event listener: triggered when the input stream ends.
// This is where the main processing logic begins.
inputBuffer.on('close', () => {
  processedInputLines = setupInputProcessor(capturedRawLines);

  // Print a blank line to standard error for visual separation in debug logs.
  console.error('\n');

  // Record the starting time to measure execution duration.
  const operationStartTime = Date.now();

  // Invoke the primary algorithm function.
  executeGraphNodeAssignment();

  // Calculate and log performance metrics.
  const totalExecutionTimeMs = Date.now() - operationStartTime;
  const currentMemoryUsageKB = Math.round(process.memoryUsage().heapTotal / 1024);

  outputDiagnosticMessage(`Execution Duration: ${totalExecutionTimeMs} ms`);
  outputDiagnosticMessage(`Memory Footprint: ${currentMemoryUsageKB} KB`);
});

/**
 * Creates an input processing utility for sequential access to lines.
 * @param {string[]} rawLines - An array of raw string lines from input.
 * @returns {object} An object with methods to read and check input status.
 */
function setupInputProcessor(rawLines) {
  let currentTokenIndex = 0; // Internal pointer for the current line being read
  const totalAvailableLines = rawLines.length; // Total number of lines provided

  return {
    lineStorage: rawLines,
    activeTokenIndex: currentTokenIndex,
    maxTokenCount: totalAvailableLines,

    /**
     * Checks if there are more lines (tokens) available to be read.
     * @returns {boolean} True if more tokens exist, false otherwise.
     */
    canReadNextToken: function() {
      return this.activeTokenIndex < this.maxTokenCount;
    },

    /**
     * Retrieves the next input line and advances the internal pointer.
     * Throws an error if no more input is available.
     * @returns {string} The next raw input line.
     */
    retrieveNextToken: function() {
      if (this.canReadNextToken()) {
        return this.lineStorage[this.activeTokenIndex++];
      } else {
        throw new Error('EndOfInputException: Attempted to read beyond available input tokens.');
      }
    }
  };
}

/**
 * Fetches the next raw input string from the global input processor.
 * @returns {string} The next raw input string.
 */
function getNextRawInput() {
  return processedInputLines.retrieveNextToken();
}

// Enumeration for various input parsing and output formatting operations.
const ConversionOperation = {
  TO_INTEGER: 1,
  SPLIT_BY_SPACE_STRINGS: 2,
  SPLIT_BY_SPACE_INTEGERS: 4,
  SPLIT_BY_CHAR_STRINGS: 6,
  SPLIT_BY_CHAR_INTEGERS: 7,
  JOIN_WITH_SPACE: 8,
  JOIN_WITH_NEWLINE: 9,
  JOIN_WITHOUT_DELIMITER: 0
};

/**
 * Applies a specified conversion or formatting operation to an input item.
 * @param {string | string[]} inputData - The data to operate on.
 * @param {number} operationType - The type of conversion/formatting to perform.
 * @returns {any} The result of the operation.
 */
function applyDataConversion(inputData, operationType) {
  try {
    switch (operationType) {
      case ConversionOperation.TO_INTEGER:
        return parseInt(inputData, 10); // Always specify radix for parseInt
      case ConversionOperation.SPLIT_BY_SPACE_STRINGS:
        return inputData.split(' ');
      case ConversionOperation.SPLIT_BY_SPACE_INTEGERS:
        return inputData.split(' ').map(Number);
      case ConversionOperation.SPLIT_BY_CHAR_STRINGS:
        return inputData.split('');
      case ConversionOperation.SPLIT_BY_CHAR_INTEGERS:
        return inputData.split('').map(Number);
      case ConversionOperation.JOIN_WITH_SPACE:
        return Array.isArray(inputData) ? inputData.join(' ') : String(inputData);
      case ConversionOperation.JOIN_WITH_NEWLINE:
        return Array.isArray(inputData) ? inputData.join('\n') : String(inputData);
      case ConversionOperation.JOIN_WITHOUT_DELIMITER:
        return Array.isArray(inputData) ? inputData.join('') : String(inputData);
      default:
        // For unknown operation types, return the input as is.
        return inputData;
    }
  } catch (conversionError) {
    // Log any errors during conversion but return the original data to prevent crashes.
    outputDiagnosticMessage(`Data conversion error (type ${operationType}): ${conversionError.message}`);
    return inputData;
  }
}

/**
 * Reads the next input token and parses it as an integer.
 * @returns {number} The parsed integer value.
 */
function readNextInteger() {
  return applyDataConversion(getNextRawInput(), ConversionOperation.TO_INTEGER);
}

/**
 * Reads the next input token and parses it as an array of integers,
 * assuming space-separated values.
 * @returns {number[]} An array of parsed integers.
 */
function readNextIntegerArray() {
  return applyDataConversion(getNextRawInput(), ConversionOperation.SPLIT_BY_SPACE_INTEGERS);
}

/**
 * Outputs a given result to the standard output stream.
 * @param {string | number | object} resultData - The data to be displayed.
 */
function emitResult(resultData) {
  console.log(resultData);
}

/**
 * Logs a diagnostic message to the standard error stream.
 * Utilizes Node.js's `util.inspect` for detailed object representation.
 * @param {any} debugMessage - The message or object to log for debugging.
 */
function outputDiagnosticMessage(debugMessage) {
  console.error(`[DIAGNOSTIC]: ${require('util').inspect(debugMessage, false, null, true)}`);
}

// --- End of Input/Output and Utility Module ---


// --- Main Algorithm Implementation ---

/**
 * @typedef {object} GraphNodeStructure
 * @property {number | null} traversalDepth - The depth of this node from the starting point in BFS.
 * @property {boolean} hasBeenVisited - Flag indicating if this node has been processed by BFS.
 * @property {number[]} connectedNodes - An array of indices of nodes directly connected to this one.
 * @property {number} finalAssignedValue - The computed value assigned to this node, -1 if unassigned.
 */

/**
 * Implements the core logic for assigning values to nodes in a graph.
 * This function performs a Breadth-First Search (BFS) to determine node depths,
 * then applies a conditional assignment strategy based on the distribution of
 * odd and even depth nodes.
 */
function executeGraphNodeAssignment() {
  const totalNodes = readNextInteger(); // Read N, the total number of nodes in the graph

  // Handle edge case: empty graph
  if (totalNodes === 0) {
    emitResult(""); // Output an empty string for an empty graph
    return;
  }

  // Initialize an array of node objects, each with default properties.
  /** @type {GraphNodeStructure[]} */
  const graphNodesCollection = Array.from({ length: totalNodes }, () => ({
    traversalDepth: null,
    hasBeenVisited: false,
    connectedNodes: [],
    finalAssignedValue: -1 // Sentinel value indicating no assignment yet
  }));

  // Initialize counters for the three distinct value sequences (1, 4, 7...; 2, 5, 8...; 3, 6, 9...)
  let sequenceA_currentValue = 1;
  let sequenceB_currentValue = 2;
  let sequenceC_currentValue = 3;

  // Read N-1 edges to construct the graph's adjacency list.
  for (let edgeCounter = 0; edgeCounter < totalNodes - 1; edgeCounter++) {
    const edgeEndpoints = readNextIntegerArray();

    // Basic validation for edge data format
    if (!Array.isArray(edgeEndpoints) || edgeEndpoints.length < 2) {
      outputDiagnosticMessage(`Skipping malformed edge data at index ${edgeCounter}: ${JSON.stringify(edgeEndpoints)}`);
      continue;
    }

    const [nodeIndex1_raw, nodeIndex2_raw] = edgeEndpoints;
    // Convert 1-based input indices to 0-based array indices
    const u_idx = nodeIndex1_raw - 1;
    const v_idx = nodeIndex2_raw - 1;

    // Validate that converted indices are within the valid range.
    const isValidU = u_idx >= 0 && u_idx < totalNodes;
    const isValidV = v_idx >= 0 && v_idx < totalNodes;

    if (isValidU && isValidV) {
      // Add connections for an undirected graph
      graphNodesCollection[u_idx].connectedNodes.push(v_idx);
      graphNodesCollection[v_idx].connectedNodes.push(u_idx);
    } else {
      outputDiagnosticMessage(`Edge indices out of bounds: (${nodeIndex1_raw}, ${nodeIndex2_raw}) for graph with ${totalNodes} nodes.`);
    }
  }

  // --- Breadth-First Search (BFS) for Node Depths ---
  const bfsProcessingQueue = [0]; // Start BFS from node 0 (assuming connected graph, 0-indexed)
  graphNodesCollection[0].hasBeenVisited = true;
  graphNodesCollection[0].traversalDepth = 1; // Assign depth 1 to the starting node

  let countOddDepthNodes = 0;
  let countEvenDepthNodes = 0;

  while (bfsProcessingQueue.length > 0) {
    const activeNodeIndex = bfsProcessingQueue.shift(); // Dequeue the next node to process

    // Categorize node based on depth parity
    if (graphNodesCollection[activeNodeIndex].traversalDepth % 2 === 1) {
      countOddDepthNodes++;
    } else {
      countEvenDepthNodes++;
    }

    // Iterate over all neighbors of the current node
    for (const neighborNodeIndex of graphNodesCollection[activeNodeIndex].connectedNodes) {
      // If a neighbor hasn't been visited, mark it, set its depth, and enqueue it.
      if (!graphNodesCollection[neighborNodeIndex].hasBeenVisited) {
        graphNodesCollection[neighborNodeIndex].hasBeenVisited = true;
        graphNodesCollection[neighborNodeIndex].traversalDepth = graphNodesCollection[activeNodeIndex].traversalDepth + 1;
        bfsProcessingQueue.push(neighborNodeIndex);
      }
    }
  }

  // --- Conditional Value Assignment Logic ---
  const nodeCountThreshold = Math.floor(totalNodes / 3); // Calculate N/3 threshold once

  // Helper function to attempt assigning a value from a given counter.
  // The counter is passed as an object to allow modification by reference.
  const tryAssignValueFromCounter = (node, counterObject) => {
    if (counterObject.value <= totalNodes) {
      node.finalAssignedValue = counterObject.value;
      counterObject.value += 3; // Increment by 3 for the next available value
      return true; // Assignment successful
    }
    return false; // No value assigned (counter exceeded totalNodes)
  };

  // Wrap primitive counters in objects for pass-by-reference behavior
  const counterWrapperA = { value: sequenceA_currentValue };
  const counterWrapperB = { value: sequenceB_currentValue };
  const counterWrapperC = { value: sequenceC_currentValue };

  if (countOddDepthNodes > nodeCountThreshold && countEvenDepthNodes > nodeCountThreshold) {
    // Strategy 1: Both odd and even depth groups are sufficiently large.
    // Assign values from sequence A to odd-depth nodes, sequence B to even-depth nodes.
    for (let currentIdx = 0; currentIdx < totalNodes; currentIdx++) {
      const currentNode = graphNodesCollection[currentIdx];
      if (currentNode.traversalDepth % 2 === 1) {
        tryAssignValueFromCounter(currentNode, counterWrapperA);
      } else {
        tryAssignValueFromCounter(currentNode, counterWrapperB);
      }
    }
  } else {
    // Strategy 2: One or both depth groups are not sufficiently large.
    // Assign values from sequence C to the smaller depth group (or odd if counts are equal).
    const targetParityForSequenceC = (countOddDepthNodes < countEvenDepthNodes) ? 1 : 0; // 1 for odd, 0 for even

    for (let currentIdx = 0; currentIdx < totalNodes; currentIdx++) {
      const currentNode = graphNodesCollection[currentIdx];
      const isCurrentNodeOddDepth = currentNode.traversalDepth % 2 === 1;

      if ((isCurrentNodeOddDepth && targetParityForSequenceC === 1) || (!isCurrentNodeOddDepth && targetParityForSequenceC === 0)) {
        tryAssignValueFromCounter(currentNode, counterWrapperC);
      }
    }
  }

  // Update original counter variables from their wrapper objects after the main assignment phase.
  sequenceA_currentValue = counterWrapperA.value;
  sequenceB_currentValue = counterWrapperB.value;
  sequenceC_currentValue = counterWrapperC.value;

  // --- Final Pass: Fill in any remaining unassigned nodes ---
  // Use a prioritized list of counters (A, then B, then C) to fill gaps.
  const prioritizedCounters = [
    { name: 'A', valueRef: { value: sequenceA_currentValue } },
    { name: 'B', valueRef: { value: sequenceB_currentValue } },
    { name: 'C', valueRef: { value: sequenceC_currentValue } }
  ];

  for (let currentIdx = 0; currentIdx < totalNodes; currentIdx++) {
    const currentNode = graphNodesCollection[currentIdx];
    if (currentNode.finalAssignedValue === -1) { // If node is still unassigned
      let successfullyAssigned = false;
      for (const counterEntry of prioritizedCounters) {
        if (counterEntry.valueRef.value <= totalNodes) {
          currentNode.finalAssignedValue = counterEntry.valueRef.value;
          counterEntry.valueRef.value += 3;
          successfullyAssigned = true;
          break; // Move to the next node once a value is assigned
        }
      }
      if (!successfullyAssigned) {
        outputDiagnosticMessage(`Warning: Node ${currentIdx} could not be assigned a value. This might indicate an issue with N or assignment logic.`);
      }
    }
  }

  // Extract only the final assigned values into a new array for output.
  const resultingValuesArray = graphNodesCollection.map(node => node.finalAssignedValue);

  // Format the output array into a space-separated string and display it.
  const formattedOutputString = applyDataConversion(resultingValuesArray, ConversionOperation.JOIN_WITH_SPACE);
  emitResult(formattedOutputString);
}