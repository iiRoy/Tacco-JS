"use strict"; // Enforce strict mode for cleaner code practices

// Import necessary modules
const fileSystemModule = require("fs");
const childProcessModule = require("child_process");

// --- Input Parsing Utility Class ---
/**
 * A utility class for parsing tokens from a string input.
 * It encapsulates the input stream and provides methods for sequential reading.
 */
class InputParser {
  #tokens; // Private field to store the tokenized input
  #currentIndex; // Private field to track the current token index

  /**
   * Constructs an InputParser instance.
   * @param {string} rawInput - The raw input string to be tokenized.
   */
  constructor(rawInput) {
    // Tokenize the input by spaces or newlines, filtering out any empty strings
    // that might result from multiple delimiters or leading/trailing whitespace.
    this.#tokens = rawInput.split(/ |\n/).filter(s => s !== '');
    this.#currentIndex = 0; // Initialize token pointer to the beginning
  }

  /**
   * Checks if there are more tokens available to read in the stream.
   * This is a useful guard for preventing 'undefined' reads.
   * @returns {boolean} True if there are more tokens, false otherwise.
   */
  hasMoreTokens() {
    return this.#currentIndex < this.#tokens.length;
  }

  /**
   * Reads the next token from the stream and advances the internal pointer.
   * @param {boolean} [asString=false] - If true, returns the token as a string.
   *                                     Otherwise, attempts to convert it to a number.
   * @returns {string|number} The next token from the input stream.
   * @throws {Error} If an attempt is made to read beyond the end of the token stream.
   */
  getNext(asString = false) {
    if (!this.hasMoreTokens()) {
      throw new Error("InputParser: Attempted to read past the end of the token stream.");
    }
    const token = this.#tokens[this.#currentIndex++]; // Get token and advance index
    return asString ? token : Number(token); // Convert to number if not explicitly requested as string
  }

  /**
   * Reads a specified number of tokens from the stream.
   * @param {number} count - The number of tokens to read.
   * @param {boolean} [asString=false] - If true, returns tokens as strings.
   *                                     Otherwise, attempts to convert them to numbers.
   * @returns {Array<string|number>} An array containing the requested tokens.
   */
  getMultiple(count, asString = false) {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(this.getNext(asString)); // Use getNext for consistent behavior and error checking
    }
    return result;
  }

  /**
   * Reads a matrix of tokens (height rows, width columns) from the input stream.
   * @param {number} height - The number of rows in the matrix.
   * @param {number} width - The number of columns in each row.
   * @param {boolean} [asString=false] - If true, returns tokens as strings.
   *                                     Otherwise, attempts to convert them to numbers.
   * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
   */
  getMatrix(height, width, asString = false) {
    const matrix = [];
    for (let r = 0; r < height; r++) {
      matrix.push(this.getMultiple(width, asString)); // Each row is a call to getMultiple
    }
    return matrix;
  }
}

// --- Multi-dimensional Array Creation Utility ---
/**
 * Creates a multi-dimensional array with a specified default value.
 * This function is a safer alternative to using 'eval' for array initialization.
 * It recursively builds the nested array structure.
 * @param {*} defaultValue - The default value to fill the innermost array elements.
 *                           If it's the string "[]", a new empty array is created for each element.
 * @param {...number} dimensions - The sizes of each dimension, from outermost to innermost.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createNestedArray(defaultValue, ...dimensions) {
  // Base case: if no more dimensions, return the default value (or a new array if specified).
  if (dimensions.length === 0) {
    return typeof defaultValue === 'string' && defaultValue === '[]' ? [] : defaultValue;
  }

  const currentDimensionSize = dimensions[0];
  const remainingDimensions = dimensions.slice(1); // Dimensions for the inner arrays
  const result = new Array(currentDimensionSize);

  for (let i = 0; i < currentDimensionSize; i++) {
    // Recursively call to build the next level of nesting
    result[i] = createNestedArray(defaultValue, ...remainingDimensions);
  }
  return result;
}

// --- Global State Variables for Graph Processing ---
let totalNodes;               // The total number of vertices (nodes) in the graph
let adjacencyList;            // Represents the graph as an array of adjacency lists, where adjList[i] is an array of neighbors of node i.
let nodeDepthsFromRoot;       // Stores the depth (distance from root) for each node. Root is at depth 0.
let parentNodes;              // Stores the direct parent of each node in the DFS traversal tree.
let finalResultArray;         // The array to store the final computed integer assignments for each node.
let nodesGroupedByDepth;      // An array of arrays, where nodesGroupedByDepth[d] contains all nodes that are at depth 'd'.

// --- Depth-First Search (DFS) Implementation ---
/**
 * Performs a Depth-First Search traversal to compute node depths and identify parent nodes
 * within the tree structure. It also groups nodes by their depth level.
 * This function is recursive.
 * @param {number} currentNodeIdentifier - The unique ID (0-indexed) of the node currently being visited.
 * @param {number} parentIdentifier - The ID of the node from which `currentNodeIdentifier` was reached.
 *                                    This helps prevent cycles in tree traversal.
 * @param {number} currentLevelDepth - The depth of `currentNodeIdentifier` from the root node (0-indexed).
 */
function exploreTreeDepths(currentNodeIdentifier, parentIdentifier, currentLevelDepth) {
  // Basic validation: ensures the node ID is within the valid range for the graph.
  // This serves as a guard clause against potential out-of-bounds access due to malformed input.
  if (currentNodeIdentifier < 0 || currentNodeIdentifier >= totalNodes) {
    console.error(`Error: DFS encountered an invalid node ID: ${currentNodeIdentifier}`);
    return; // Abort traversal for this path if node ID is invalid
  }

  // Record the depth and parent for the current node.
  nodeDepthsFromRoot[currentNodeIdentifier] = currentLevelDepth;
  parentNodes[currentNodeIdentifier] = parentIdentifier;
  // Add the current node to the list of nodes at its specific depth level.
  nodesGroupedByDepth[currentLevelDepth].push(currentNodeIdentifier);

  // Iterate through all neighbors of the current node to continue the traversal.
  // Using a traditional for loop for slight variation from original `for...of`.
  for (let i = 0; i < adjacencyList[currentNodeIdentifier].length; i++) {
    const neighborNode = adjacencyList[currentNodeIdentifier][i];
    // Skip if the neighbor is the parent node to avoid traversing back up the tree,
    // which is crucial for correct tree-based DFS.
    if (neighborNode === parentIdentifier) {
      continue;
    }
    // Recursively call DFS for the unvisited neighbor, increasing the depth level.
    exploreTreeDepths(neighborNode, currentNodeIdentifier, currentLevelDepth + 1);
  }
}

// --- Assignment Logic Helper Functions ---
/**
 * Implements the assignment strategy when the count of odd-depth nodes is small enough
 * to allow all of them to be assigned values from the '3 mod 3' sequence.
 * @param {Array<number>} initialParities - An array where `initialParities[i]` is 0 for even depth, 1 for odd depth.
 * @param {number} nodeLimit - The total number of nodes (used as an upper bound for sequence values).
 */
function handleOddDepthSmallCase(initialParities, nodeLimit) {
  // Initialize counters for the three sequences: (1, 4, 7...), (2, 5, 8...), (3, 6, 9...)
  let nextValMod1 = 1;
  let nextValMod2 = 2;
  let nextValMod0 = 3;

  for (let i = 0; i < nodeLimit; i++) {
    if (initialParities[i] === 1) { // If node has an odd depth
      finalResultArray[i] = nextValMod0; // Assign from '3 mod 3' sequence
      nextValMod0 += 3;
    } else { // If node has an even depth
      if (nextValMod1 <= nodeLimit) { // Prioritize '1 mod 3' for even-depth nodes
        finalResultArray[i] = nextValMod1;
        nextValMod1 += 3;
      } else if (nextValMod2 <= nodeLimit) { // Then try '2 mod 3'
        finalResultArray[i] = nextValMod2;
        nextValMod2 += 3;
      } else { // Fallback to '3 mod 3' if other sequences are exhausted
        finalResultArray[i] = nextValMod0;
        nextValMod0 += 3;
      }
    }
  }
}

/**
 * Implements the assignment strategy when the count of even-depth nodes is small enough
 * to allow all of them to be assigned values from the '3 mod 3' sequence.
 * @param {Array<number>} initialParities - An array where `initialParities[i]` is 0 for even depth, 1 for odd depth.
 * @param {number} nodeLimit - The total number of nodes.
 */
function handleEvenDepthSmallCase(initialParities, nodeLimit) {
  let nextValMod1 = 1;
  let nextValMod2 = 2;
  let nextValMod0 = 3;

  for (let i = 0; i < nodeLimit; i++) {
    if (initialParities[i] === 0) { // If node has an even depth
      finalResultArray[i] = nextValMod0; // Assign from '3 mod 3' sequence
      nextValMod0 += 3;
    } else { // If node has an odd depth
      if (nextValMod1 <= nodeLimit) { // Prioritize '1 mod 3' for odd-depth nodes
        finalResultArray[i] = nextValMod1;
        nextValMod1 += 3;
      } else if (nextValMod2 <= nodeLimit) { // Then try '2 mod 3'
        finalResultArray[i] = nextValMod2;
        nextValMod2 += 3;
      } else { // Fallback to '3 mod 3'
        finalResultArray[i] = nextValMod0;
        nextValMod0 += 3;
      }
    }
  }
}

/**
 * Implements the general assignment strategy when neither odd nor even depth groups
 * are small enough to exclusively use '3 mod 3' values.
 * This implies a more balanced distribution.
 * @param {Array<number>} initialParities - An array where `initialParities[i]` is 0 for even depth, 1 for odd depth.
 * @param {number} nodeLimit - The total number of nodes.
 */
function handleGeneralAssignmentCase(initialParities, nodeLimit) {
  let nextValMod1 = 1;
  let nextValMod2 = 2;
  let nextValMod0 = 3;

  for (let i = 0; i < nodeLimit; i++) {
    if (initialParities[i] === 1) { // If node has an odd depth
      if (nextValMod1 <= nodeLimit) { // Prioritize '1 mod 3' for odd-depth nodes
        finalResultArray[i] = nextValMod1;
        nextValMod1 += 3;
      } else { // Fallback to '3 mod 3'
        finalResultArray[i] = nextValMod0;
        nextValMod0 += 3;
      }
    } else { // If node has an even depth
      if (nextValMod2 <= nodeLimit) { // Prioritize '2 mod 3' for even-depth nodes
        finalResultArray[i] = nextValMod2;
        nextValMod2 += 3;
      } else { // Fallback to '3 mod 3'
        finalResultArray[i] = nextValMod0;
        nextValMod0 += 3;
      }
    }
  }
}

// --- Main Execution Logic ---
/**
 * Orchestrates the entire process: reads input, constructs the graph,
 * performs DFS to gather tree properties, applies the specific assignment logic,
 * and returns the final result.
 * @returns {string} The space-separated string of assigned values for each node.
 */
function orchestrateTreeProcessing() {
  // Initialize the InputParser with data read from standard input.
  const parser = new InputParser(fileSystemModule.readFileSync("/dev/stdin", "utf8"));
  totalNodes = parser.getNext(); // Read the total number of nodes (N)

  // Guard clause: Handle cases where node count is invalid (e.g., zero or negative).
  // An empty string implies no valid processing could occur.
  if (totalNodes < 1) {
    return "";
  }

  // Initialize all global data structures based on the 'totalNodes' count.
  adjacencyList = createNestedArray("[]", totalNodes);
  nodeDepthsFromRoot = new Array(totalNodes);
  parentNodes = new Array(totalNodes);
  finalResultArray = new Array(totalNodes);
  nodesGroupedByDepth = createNestedArray("[]", totalNodes); // Max depth is N-1, so N arrays needed.

  // Read N-1 edges to build the adjacency list for the tree.
  // Adjust node indices to be 0-based as is common in programming.
  for (let i = 0; i < totalNodes - 1; i++) {
    const nodeA = parser.getNext() - 1;
    const nodeB = parser.getNext() - 1;
    adjacencyList[nodeA].push(nodeB);
    adjacencyList[nodeB].push(nodeA); // Add edge in both directions for undirected graph
  }

  // Start the Depth-First Search traversal from node 0 (arbitrarily chosen as the root).
  // Initial call sets node 0's parent to -1 (no parent) and its depth to 0.
  exploreTreeDepths(0, -1, 0);

  let countOddDepths = 0;
  let countEvenDepths = 0;
  // Use an intermediate array to store the parity (0 for even, 1 for odd) of each node's depth.
  const depthParities = new Array(totalNodes);

  // Iterate through all nodes to calculate and store their depth parities
  // and count the total number of odd-depth and even-depth nodes.
  for (let i = 0; i < totalNodes; i++) {
    depthParities[i] = nodeDepthsFromRoot[i] % 2; // 0 if even, 1 if odd
    if (depthParities[i] === 1) {
      countOddDepths++;
    } else {
      countEvenDepths++;
    }
  }

  // Determine the threshold for 'small' groups, typically N/3, floored.
  // This is a key part of the problem's assignment logic.
  const targetGroupSizeThreshold = Math.floor(totalNodes / 3);

  // Apply one of three distinct assignment strategies based on the counts of odd/even depth nodes.
  if (countOddDepths <= targetGroupSizeThreshold) {
    // If odd-depth nodes are few, they can all potentially get values from the '3 mod 3' sequence.
    handleOddDepthSmallCase(depthParities, totalNodes);
  } else if (countEvenDepths <= targetGroupSizeThreshold) {
    // If even-depth nodes are few, they can all potentially get values from the '3 mod 3' sequence.
    handleEvenDepthSmallCase(depthParities, totalNodes);
  } else {
    // If neither group is small enough, a more general, balanced assignment is needed.
    handleGeneralAssignmentCase(depthParities, totalNodes);
  }
  
  // Join the final assigned numbers into a single space-separated string for output.
  return finalResultArray.join(" ");
}

// --- Entry Point and Stack Size Management ---
// This conditional block is a common pattern in competitive programming with Node.js.
// It addresses the "Maximum call stack size exceeded" error that can occur
// with deep recursive functions (like DFS on a long path) by relaunching
// the script as a child process with an increased stack memory limit.
if (process.argv.length <= 2) {
  // If the script is run without additional command-line arguments (e.g., `node script.js`),
  // it means it's the initial launch. We re-launch it using `child_process.fork`.
  // The `process.argv[1]` is the path to the current script.
  // We pass ["1"] as an argument to the child process to indicate it's the re-launched instance.
  // `execArgv` allows passing V8-specific flags, like `--stack-size`.
  childProcessModule.fork(process.argv[1], ["1"], { execArgv: ["--stack-size=240000"] });
} else {
  // If `process.argv.length` is greater than 2 (meaning an argument like "1" was passed),
  // it indicates that this is the re-launched child process with the increased stack size.
  // Now, it's safe to execute the main tree processing logic.
  const finalOutput = orchestrateTreeProcessing();
  // Output the result to standard output, ensuring it's not undefined or null.
  if (finalOutput !== undefined && finalOutput !== null) {
    console.log(finalOutput);
  }
}