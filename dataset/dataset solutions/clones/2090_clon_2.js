"use strict";
// This script processes input to assign values to tree nodes based on depth parity.

// Standard input reading setup
const fileSystem = require("fs");
const inputData = fileSystem.readFileSync("/dev/stdin", "utf8");

// Tokenization of input string
const tokenStream = inputData.split(/ |\n/);
let tokenIndex = 0x0; // Current position in the token stream

/**
 * Reads the next token from the input stream.
 * @param {boolean} isString - If true, returns the token as a string; otherwise, converts to a number.
 * @returns {string|number} The next token.
 */
function readNextToken(isString) {
  return isString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Reads multiple tokens from the input stream.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function readMultipleTokens(count, asStrings) {
  const tokens = tokenStream.slice(tokenIndex, tokenIndex + count);
  tokenIndex += count;
  return asStrings ? tokens : tokens.map(val => +val);
}

/**
 * Reads a matrix of tokens from the input stream.
 * @param {number} height - The number of rows.
 * @param {number} width - The number of columns per row.
 * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function readMatrixTokens(height, width, asStrings) {
  const matrixRows = [];
  for (let rowIdx = 0x0; rowIdx < height; rowIdx++) {
    const rowTokens = tokenStream.slice(tokenIndex, tokenIndex + width);
    tokenIndex += width;
    matrixRows.push(asStrings ? rowTokens : rowTokens.map(val => +val));
  }
  return matrixRows;
}

/**
 * Creates a multi-dimensional array initialized with a given expression.
 * @param {string} initialValueExpr - The string expression to initialize inner arrays (e.g., "[]").
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValueExpr) {
  const args = arguments;
  let argCount = args.length;
  let arrayCreationString = `Array(args[${--argCount}]).fill().map(x=>{return ${initialValueExpr};})`;
  while (--argCount) {
    arrayCreationString = `Array(args[${argCount}]).fill().map(x=>${arrayCreationString})`;
  }
  return eval(arrayCreationString);
}

// Global variables for tree structure and results
let nodeCount; // Total number of nodes in the tree
let adjacencyList; // Adjacency list representation of the tree
let nodeDepths; // Stores the depth of each node from the root
let nodesByDepth; // Stores nodes grouped by their depth
let parentNodes; // Stores the parent of each node
let finalResult; // The array to store the final assigned values for each node

/**
 * Main function to execute the solution logic.
 * @returns {string} The space-separated string of final assigned values.
 */
function executeSolution() {
  nodeCount = readNextToken(); // Read the total number of nodes

  // Initialize data structures
  adjacencyList = createMultiDimArray("[]", nodeCount);
  nodeDepths = new Array(nodeCount);
  nodesByDepth = createMultiDimArray("[]", nodeCount);
  parentNodes = new Array(nodeCount);
  finalResult = new Array(nodeCount);

  // Read tree edges and build the adjacency list
  for (let edgeIdx = 0x1; edgeIdx < nodeCount; edgeIdx++) {
    const nodeA = readNextToken() - 0x1; // Adjust to 0-indexed
    const nodeB = readNextToken() - 0x1; // Adjust to 0-indexed
    adjacencyList[nodeA].push(nodeB);
    adjacencyList[nodeB].push(nodeA);
  }

  // Perform Depth First Search starting from node 0 (root)
  performDFS(0x0, -0x1, 0x0); // (current_node, parent_node, current_depth)

  let oddDepthCount = 0x0;
  let evenDepthCount = 0x0;

  // Calculate depth parity and counts
  for (let k = 0x0; k < nodeCount; k++) {
    finalResult[k] = nodeDepths[k] % 0x2; // 0 for even depth, 1 for odd depth
    if (finalResult[k]) {
      oddDepthCount++;
    } else {
      evenDepthCount++;
    }
  }

  // Determine group sizes for assignment strategy
  const groupOneSize = Math.ceil(nodeCount / 0x3);
  const groupThreeSize = Math.floor(nodeCount / 0x3);
  const groupTwoSize = nodeCount - groupOneSize - groupThreeSize; // This variable is unused but kept for structural similarity

  // Initialize counters for values 1, 2, 3 (multiples of 3)
  let valOne = 0x1;
  let valTwo = 0x2;
  let valThree = 0x3;

  // Assign values based on depth parity and group sizes
  if (oddDepthCount <= groupThreeSize) {
    // If odd-depth nodes are few, assign them multiples of 3
    for (let currIdx = 0x0; currIdx < nodeCount; currIdx++) {
      if (finalResult[currIdx]) { // If node has odd depth
        finalResult[currIdx] = valThree;
        valThree += 0x3;
      } else { // If node has even depth
        if (valOne <= nodeCount) {
          finalResult[currIdx] = valOne;
          valOne += 0x3;
        } else if (valTwo <= nodeCount) {
          finalResult[currIdx] = valTwo;
          valTwo += 0x3;
        } else {
          finalResult[currIdx] = valThree;
          valThree += 0x3;
        }
      }
    }
  } else if (evenDepthCount <= groupThreeSize) {
    // If even-depth nodes are few, assign them multiples of 3
    for (let currIdx = 0x0; currIdx < nodeCount; currIdx++) {
      if (finalResult[currIdx] === 0x0) { // If node has even depth
        finalResult[currIdx] = valThree;
        valThree += 0x3;
      } else { // If node has odd depth
        if (valOne <= nodeCount) {
          finalResult[currIdx] = valOne;
          valOne += 0x3;
        } else if (valTwo <= nodeCount) {
          finalResult[currIdx] = valTwo;
          valTwo += 0x3;
        } else {
          finalResult[currIdx] = valThree;
          valThree += 0x3;
        }
      }
    }
  } else {
    // Both odd and even depth nodes are numerous
    for (let currIdx = 0x0; currIdx < nodeCount; currIdx++) {
      if (finalResult[currIdx]) { // If node has odd depth
        if (valOne <= nodeCount) {
          finalResult[currIdx] = valOne;
          valOne += 0x3;
        } else {
          finalResult[currIdx] = valThree;
          valThree += 0x3;
        }
      } else { // If node has even depth
        if (valTwo <= nodeCount) {
          finalResult[currIdx] = valTwo;
          valTwo += 0x3;
        } else {
          finalResult[currIdx] = valThree;
          valThree += 0x3;
        }
      }
    }
  }
  
  return finalResult.join(" "); // Return the results as a space-separated string
}

/**
 * Performs a Depth First Search traversal of the tree.
 * @param {number} currentNode - The current node being visited.
 * @param {number} parentNode - The parent of the current node.
 * @param {number} currentDepth - The depth of the current node from the root.
 */
function performDFS(currentNode, parentNode, currentDepth) {
  nodeDepths[currentNode] = currentDepth; // Store the depth of the current node
  nodesByDepth[currentDepth].push(currentNode); // Add current node to list of nodes at this depth
  parentNodes[currentNode] = parentNode; // Store the parent of the current node

  // Iterate over neighbors of the current node
  for (let neighborNode of adjacencyList[currentNode]) {
    neighborNode = +neighborNode; // Ensure neighbor is a number
    if (neighborNode === parentNode) {
      continue; // Skip if the neighbor is the parent (to avoid going back up)
    }
    // Recursively call DFS for unvisited neighbors
    performDFS(neighborNode, currentNode, currentDepth + 0x1);
  }
}

// Entry point for execution, handling potential stack overflow for large inputs
if (process.argv.length <= 0x2) {
  // If executed without arguments, re-fork with increased stack size
  require("child_process").fork("Main.js", ["0x1"], { execArgv: ["--stack-size=240000"] });
} else {
  // If executed with arguments (or re-forked), run the main solution
  const programOutput = executeSolution();
  if (programOutput !== undefined) {
    console.log(programOutput); // Print the result to standard output
  }
}
