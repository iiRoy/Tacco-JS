"use strict";

// Define constants for file paths and special node values
const INPUT_SOURCE_PATH = "/dev/stdin";
const ZERO_NODE_ID = 0;

// Read raw input data from the specified source
const rawInputData = require("fs").readFileSync(INPUT_SOURCE_PATH, "utf8");

// Prepare a stream of tokens by splitting the input by any whitespace
const tokenStream = rawInputData.split(/\s+/).filter(Boolean); // Filter out empty strings from multiple spaces
let currentTokenIndex = 0; // Pointer for the token stream

// Helper function to safely parse a string into a number
const parseNumericToken = (tokenString) => Number(tokenString);

// Retrieves the next integer from the token stream
function getNextInteger() {
  if (currentTokenIndex >= tokenStream.length) {
    throw new Error("Attempted to read past end of token stream.");
  }
  return parseNumericToken(tokenStream[currentTokenIndex++]);
}

// Retrieves a specified number of numeric tokens from the stream
function getNumericTokens(count) {
  const tokens = [];
  for (let i = 0; i < count; i++) {
    if (currentTokenIndex >= tokenStream.length) {
      throw new Error(`Insufficient tokens: Expected ${count}, got ${i}.`);
    }
    tokens.push(parseNumericToken(tokenStream[currentTokenIndex++]));
  }
  return tokens;
}

// Dynamically creates a multi-dimensional array initialized with a given value
// Example: createMultiDimArray(0, 3, 4) creates a 3x4 array filled with 0s
function createMultiDimArray(initialFillValue) {
  const dimensions = Array.from(arguments).slice(1);
  if (dimensions.length === 0) {
    return initialFillValue;
  }

  // Construct a string representing nested Array.map calls to create the structure
  let arrayConstructionString = `Array(dimensions[${dimensions.length - 1}]).fill().map(() => ${initialFillValue})`;
  for (let i = dimensions.length - 2; i >= 0; i--) {
    arrayConstructionString = `Array(dimensions[${i}]).fill().map(() => ${arrayConstructionString})`;
  }
  // Use eval to execute the dynamically generated array creation code
  return eval(arrayConstructionString);
}

// Execute the main program logic and store its result
const finalProgramOutput = executeMainProgram();

// If the program returned a value, print it to console
if (finalProgramOutput !== undefined) {
  console.log(String(finalProgramOutput));
}

/**
 * Main function encapsulating the dynamic programming solution.
 * It computes the maximum path value based on given node connections.
 * @returns {number} The final calculated maximum value.
 */
function executeMainProgram() {
  const totalNodes = getNextInteger(); // Read the total number of nodes (N)
  let dpTable = createMultiDimArray(-1, totalNodes + 1, totalNodes + 1); // DP table initialized with -1
  let currentOffset = 0; // Accumulator for certain conditions

  // Queue to store updates for the DP table during processing
  let pendingUpdatesQueue = [];

  // --- Nested Helper Functions for DP Table Updates ---

  /**
   * Enqueues a potential DP table update if the new value is greater.
   * Pushes (target_row, target_col, new_value) to the queue.
   * @param {number} targetRowIndex - Row index for the DP table.
   * @param {number} targetColIndex - Column index for the DP table.
   * @param {number} sourceRowIndex - Source row index for value retrieval.
   * @param {number} sourceColIndex - Source column index for value retrieval.
   */
  function enqueueMaxUpdate(targetRowIndex, targetColIndex, sourceRowIndex, sourceColIndex) {
    const sourceValue = dpTable[sourceRowIndex][sourceColIndex];
    if (dpTable[targetRowIndex][targetColIndex] < sourceValue) {
      pendingUpdatesQueue.push(targetRowIndex, targetColIndex, sourceValue);
    }
  }

  /**
   * Enqueues a potential DP table update with an incremented source value.
   * Pushes (target_row, target_col, source_value + 1) to the queue.
   * @param {number} targetRowIndex - Row index for the DP table.
   * @param {number} targetColIndex - Column index for the DP table.
   * @param {number} sourceRowIndex - Source row index for value retrieval.
   * @param {number} sourceColIndex - Source column index for value retrieval.
   */
  function enqueueMaxUpdateIncrement(targetRowIndex, targetColIndex, sourceRowIndex, sourceColIndex) {
    const incrementedSourceValue = dpTable[sourceRowIndex][sourceColIndex] + 1;
    if (dpTable[targetRowIndex][targetColIndex] < incrementedSourceValue) {
      pendingUpdatesQueue.push(targetRowIndex, targetColIndex, incrementedSourceValue);
    }
  }

  // --- Node Processing Functions ---

  /**
   * Processes a single node for DP table updates.
   * @param {number} focusNode - The node currently being processed.
   */
  function processSingleNode(focusNode) {
    enqueueMaxUpdateIncrement(ZERO_NODE_ID, ZERO_NODE_ID, focusNode, focusNode);
    for (let loopVar = 0; loopVar < focusNode; loopVar++) {
      enqueueMaxUpdate(loopVar, focusNode, ZERO_NODE_ID, loopVar);
    }
    for (let loopVar = focusNode; loopVar <= totalNodes; loopVar++) {
      enqueueMaxUpdate(focusNode, loopVar, ZERO_NODE_ID, loopVar);
    }
  }

  /**
   * Processes a pair of nodes for DP table updates.
   * @param {number} nodeAlpha - The first node in the pair.
   * @param {number} nodeBeta - The second node in the pair.
   */
  function processPairNodes(nodeAlpha, nodeBeta) {
    enqueueMaxUpdate(nodeAlpha, nodeBeta, ZERO_NODE_ID, ZERO_NODE_ID);
    enqueueMaxUpdateIncrement(ZERO_NODE_ID, nodeBeta, nodeAlpha, nodeAlpha);
    if (nodeAlpha < nodeBeta) {
      enqueueMaxUpdateIncrement(ZERO_NODE_ID, nodeAlpha, nodeBeta, nodeBeta);
    } else { // nodeAlpha >= nodeBeta
      for (let loopVar = 0; loopVar < nodeAlpha; loopVar++) {
        enqueueMaxUpdateIncrement(ZERO_NODE_ID, loopVar, loopVar, nodeAlpha);
      }
      for (let loopVar = nodeAlpha; loopVar <= totalNodes; loopVar++) {
        enqueueMaxUpdateIncrement(ZERO_NODE_ID, loopVar, nodeAlpha, loopVar);
      }
    }
  }

  /**
   * Processes a triple of nodes for DP table updates.
   * @param {number} nodeX - The first node.
   * @param {number} nodeY - The second node.
   * @param {number} nodeZ - The third node.
   */
  function processTripleNodes(nodeX, nodeY, nodeZ) {
    enqueueMaxUpdateIncrement(nodeY, nodeZ, nodeX, nodeX);
    if (nodeX < nodeY) {
      enqueueMaxUpdateIncrement(nodeX, nodeZ, nodeY, nodeY);
      if (nodeY < nodeZ) {
        enqueueMaxUpdateIncrement(nodeX, nodeY, nodeZ, nodeZ);
      } else { // nodeY === nodeZ
        for (let loopVar = 0; loopVar < nodeX; loopVar++) {
          enqueueMaxUpdateIncrement(loopVar, nodeX, loopVar, nodeZ);
        }
        for (let loopVar = nodeX; loopVar < nodeZ; loopVar++) {
          enqueueMaxUpdateIncrement(nodeX, loopVar, loopVar, nodeZ);
        }
        for (let loopVar = nodeZ; loopVar <= totalNodes; loopVar++) {
          enqueueMaxUpdateIncrement(nodeX, loopVar, nodeZ, loopVar);
        }
      }
    } else { // nodeX >= nodeY
      enqueueMaxUpdateIncrement(nodeX, nodeX, nodeZ, nodeZ);
      for (let loopVar = 0; loopVar < nodeX; loopVar++) {
        enqueueMaxUpdateIncrement(loopVar, nodeZ, loopVar, nodeX);
      }
      for (let loopVar = nodeX; loopVar < nodeZ; loopVar++) {
        enqueueMaxUpdateIncrement(loopVar, nodeZ, nodeX, loopVar);
      }
      for (let loopVar = nodeZ; loopVar <= totalNodes; loopVar++) {
        enqueueMaxUpdateIncrement(nodeZ, loopVar, nodeX, loopVar);
      }
    }
  }

  /**
   * Orchestrates the processing of a given triple of nodes (u, v, w).
   * It applies various DP update rules based on the relationships between u, v, w.
   * @param {number} uNode - The first node.
   * @param {number} vNode - The second node.
   * @param {number} wNode - The third node.
   */
  function processNodeTriple(uNode, vNode, wNode) {
    // If the first and third nodes are identical, increment offset and return early
    if (uNode === wNode) {
      currentOffset++;
      return;
    }

    // Clear the update queue for this iteration
    pendingUpdatesQueue = [];

    // Apply single-node processing rules
    processSingleNode(uNode);
    if (uNode < vNode) processSingleNode(vNode);
    if (vNode < wNode) processSingleNode(wNode);

    // Apply pair-node processing rules
    processPairNodes(uNode, vNode);
    if (vNode < wNode) processPairNodes(uNode, wNode);
    if (uNode < vNode) processPairNodes(vNode, wNode);

    // Apply triple-node processing rules
    processTripleNodes(uNode, vNode, wNode);

    // Apply all pending updates from the queue to the DP table
    while (pendingUpdatesQueue.length > 0) {
      const valueToSet = pendingUpdatesQueue.pop(); // Value
      const targetCol = pendingUpdatesQueue.pop();  // Column index
      const targetRow = pendingUpdatesQueue.pop();   // Row index

      if (dpTable[targetRow][targetCol] < valueToSet) {
        dpTable[targetRow][targetCol] = valueToSet;
      }
    }
  }

  // --- Initial DP Table Setup ---
  // Read the first pair of nodes
  const initialNodes = getNumericTokens(2);
  const firstInitialNode = initialNodes[0];
  const secondInitialNode = initialNodes[1];

  // Initialize DP table entries for the first set of nodes
  dpTable[ZERO_NODE_ID][ZERO_NODE_ID] = ZERO_NODE_ID;
  dpTable[ZERO_NODE_ID][firstInitialNode] = ZERO_NODE_ID;
  dpTable[ZERO_NODE_ID][secondInitialNode] = ZERO_NODE_ID;
  dpTable[firstInitialNode][secondInitialNode] = ZERO_NODE_ID;

  // --- Main Loop for Processing Node Triples ---
  for (let iterationCount = 1; iterationCount < totalNodes; iterationCount++) {
    // Read the next three nodes and sort them for consistent processing
    const currentNodes = getNumericTokens(3).sort((nodeA, nodeB) => nodeA - nodeB);
    processNodeTriple(...currentNodes);
  }

  // --- Final Result Calculation ---
  const finalQueryNode = getNextInteger(); // Read the last node for final calculation

  // Calculate the two potential maximum values
  const valueFromZeroZero = dpTable[ZERO_NODE_ID][ZERO_NODE_ID];
  const valueFromFinalNode = dpTable[finalQueryNode][finalQueryNode] + 1;

  // Return the maximum of these two values, adjusted by the accumulated offset
  return Math.max(valueFromZeroZero, valueFromFinalNode) + currentOffset;
}