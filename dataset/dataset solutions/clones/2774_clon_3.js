const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputSourceManager;
const rawInputLines = [];

inputReader.on('line', (lineContent) => {
  rawInputLines.push(lineContent);
});

inputReader.on('close', () => {
  inputSourceManager = initializeInputProcessor(rawInputLines);
  console.error('\n--- Input Processing Complete. Initiating Solution Execution ---');
  executeColoringProblem();
});

/**
 * Creates an input manager object to sequentially access lines of input.
 * This abstracts the raw input array into a token-based access mechanism.
 * @param {string[]} lines An array of strings, where each string is a line from the input.
 * @returns {object} An object with methods to check for and retrieve input tokens.
 */
function initializeInputProcessor(lines) {
  let currentLineIndex = 0;
  const totalLines = lines.length;

  return {
    /**
     * Checks if there are more lines available for processing.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    hasMoreTokens: function() {
      return currentLineIndex < totalLines;
    },
    /**
     * Retrieves the next available line (token) from the input.
     * @returns {string} The next input line.
     * @throws {Error} If no more input lines are available.
     */
    getNextToken: function() {
      if (this.hasMoreTokens()) {
        return lines[currentLineIndex++];
      } else {
        throw new Error('EndOfInputException: Attempted to read beyond available input lines.');
      }
    }
  };
}

/**
 * Converts an input string token into a desired data type or structure.
 * This function supports parsing integers, and splitting strings into arrays.
 * @param {string} token The input string to convert.
 * @param {number} conversionType A numeric code indicating the target type (1: parseInt, 4: split by space and map to Number).
 * @returns {any} The converted value, or the original token if conversion fails or type is unknown.
 */
function convertInputToken(token, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(token, 10);
      case 4: return token.split(' ').map(Number);
      default: return token;
    }
  } catch (err) {
    console.warn(`Warning: Input conversion failed for token "${token}" with type ${conversionType}. Error: ${err.message}`);
    return token;
  }
}

// Convenient wrappers for common input operations.
const readInteger = () => convertInputToken(inputSourceManager.getNextToken(), 1);
const readIntegerArray = () => convertInputToken(inputSourceManager.getNextToken(), 4);

// Function to output the final result.
const printResult = (outputValue) => console.log(outputValue);

// Debugging utility to log messages to standard error.
const logDebug = (debugValue) => console.error(`[DEBUG]: ${JSON.stringify(debugValue)}`);

// ---------------------------------------------------------------------------------------------------

/**
 * Implements the main logic for a tree coloring problem.
 * This function determines the number of ways to color a tree's nodes
 * such that specific adjacency and sibling constraints are met,
 * and calculates the product of coloring options modulo a large prime.
 */
function executeColoringProblem() {
  const problemParameters = readIntegerArray();
  const nodeCount = problemParameters[0];
  const availableColors = problemParameters[1];

  // Early exit for trivial or invalid input cases.
  if (nodeCount <= 0 || availableColors <= 0) {
    printResult(0);
    return;
  }

  // Initialize an array of node objects. Each object represents a node in the tree
  // and stores its connections, calculated coloring options, and traversal state.
  const graphNodes = Array.from({ length: nodeCount }, (_, index) => ({
    adjacentNodes: [], // List of connected node indices
    nodeIdentifier: index, // Original 0-based index of the node
    coloringOptions: 0, // Number of ways this specific node can be colored
    isVisited: false // Flag to track if node has been processed during DFS
  }));

  // Construct the graph (adjacency list) from the input edges.
  // Since it's a tree, there will be N-1 edges.
  for (let i = 0; i < nodeCount - 1; ++i) {
    const edgeData = readIntegerArray();
    const node1Index = edgeData[0] - 1; // Convert to 0-indexed
    const node2Index = edgeData[1] - 1; // Convert to 0-indexed

    // Add bidirectional connections for an undirected graph.
    graphNodes[node1Index].adjacentNodes.push(node2Index);
    graphNodes[node2Index].adjacentNodes.push(node1Index);
  }

  let totalWaysToColor = 1; // Accumulator for the final product of coloring options
  const moduloConstant = 1_000_000_007; // A large prime for modulo arithmetic

  // Mark the starting node (root, typically node 0) as visited.
  graphNodes[0].isVisited = true;

  // Initiate the Depth-First Search traversal from the root node.
  // Parameters for the initial call:
  //   - currentNodeIdx: 0 (the root node)
  //   - parentForbiddenCount: 0 (the root has no parent or grandparent to constrain its color)
  //   - siblingConstraintCount: 0 (the root has no siblings to constrain its color)
  //   - totalColorPaletteSize: availableColors (the total number of distinct colors K)
  traverseAndColor(0, 0, 0, availableColors);

  // If at any point during the DFS, a node could not be colored (options <= 0),
  // totalWaysToColor would have been set to 0, indicating no valid coloring.
  if (totalWaysToColor === 0) {
      printResult(0);
      return;
  }

  // Calculate the final product of all nodes' coloring options, applying modulo.
  for (const node of graphNodes) {
    totalWaysToColor = (totalWaysToColor * node.coloringOptions) % moduloConstant;
    // Optimization: if product becomes 0, no need to continue.
    if (totalWaysToColor === 0) break;
  }

  printResult(totalWaysToColor);

  /**
   * Recursively performs a Depth-First Search to determine and store the number of
   * valid coloring options for each node in the tree. The coloring rules account for:
   * 1. The total number of available colors (K).
   * 2. Colors forbidden by the node's parent.
   * 3. Colors forbidden by the node's grandparent.
   * 4. Colors forbidden by siblings that have already been processed in the parent's loop.
   *
   * @param {number} currentNodeIdx The index of the node currently being processed.
   * @param {number} parentForbiddenCount The number of distinct colors 'taken' by the parent and grandparent.
   *                                      - 0 for the root.
   *                                      - 1 for children of the root (root's color).
   *                                      - 2 for grandchildren and deeper nodes (parent's and grandparent's colors).
   * @param {number} siblingConstraintCount This node's position (0-indexed) among its siblings
   *                                      that have already been processed by its parent's DFS loop.
   *                                      This accounts for sibling-specific color constraints.
   * @param {number} totalColorPaletteSize The overall number of available colors (K) for the problem.
   */
  function traverseAndColor(currentNodeIdx, parentForbiddenCount, siblingConstraintCount, totalColorPaletteSize) {
    // Calculate the coloring options for the current node based on all constraints.
    const currentNodesValidOptions = totalColorPaletteSize - parentForbiddenCount - siblingConstraintCount;
    graphNodes[currentNodeIdx].coloringOptions = currentNodesValidOptions;

    // If a node has zero or fewer valid coloring options, then no complete valid coloring exists for the tree.
    // Propagate this failure by setting the global total to 0 and stopping further exploration in this branch.
    if (currentNodesValidOptions <= 0) {
        totalWaysToColor = 0;
        return;
    }

    // Determine the 'forbidden count' value to pass down to the children of the current node.
    // This value reflects the constraints imposed by the current node and its parent,
    // effectively capping at 2 (parent and grandparent colors).
    const nextLevelForbiddenCount = Math.min(2, parentForbiddenCount + 1);

    let childrenProcessedInThisBranch = 0; // Counter for children of `currentNodeIdx` that have been visited.
                                         // This will serve as `siblingConstraintCount` for subsequent children.

    // Iterate through all neighbors of the current node. If a neighbor hasn't been visited,
    // it's considered a child in the DFS tree and will be processed recursively.
    for (const neighborIdx of graphNodes[currentNodeIdx].adjacentNodes) {
      // Early exit: If `totalWaysToColor` has already become 0 from a previous branch,
      // there's no need to continue exploring.
      if (totalWaysToColor === 0) return;

      if (!graphNodes[neighborIdx].isVisited) {
        // Mark the child node as visited to prevent cycles and ensure it's processed only once.
        graphNodes[neighborIdx].isVisited = true;

        // Recursively call `traverseAndColor` for the child node.
        // The `childrenProcessedInThisBranch` value is passed as `siblingConstraintCount`
        // for the child, reflecting its position among its siblings.
        traverseAndColor(
          neighborIdx,
          nextLevelForbiddenCount,
          childrenProcessedInThisBranch,
          totalColorPaletteSize
        );
        childrenProcessedInThisBranch++; // Increment after processing this child for the next sibling
      }
    }
  }
}