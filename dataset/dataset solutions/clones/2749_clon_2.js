var DATA_ACQUIRER = (function() {

  // This factory function initializes a new content parsing instance.
  function createParser(rawInput) {
    return new ContentInterpreter(rawInput);
  }

  // The ContentInterpreter class is responsible for breaking down raw input
  // into manageable segments (lines) and extracting specific data types.
  function ContentInterpreter(initialString) {
    // Stores the input as an array of lines, after trimming whitespace.
    this.lineBuffer = initialString.trim().split('\n');
    // Keeps track of the current line index being processed.
    this.currentLineIndex = 0.0;
  }

  // Define prototype methods for the ContentInterpreter to handle various parsing needs.
  ContentInterpreter.prototype = {

    /**
     * Extracts a single item from the current line.
     * It has a unique behavior of reversing the word order on a line upon first access.
     * @param {boolean} returnRaw - If true, returns the item as a string; otherwise, converts it to a number.
     * @returns {string|number} The extracted value.
     */
    extractSingleValue: function(returnRaw) {
      var linesArray = this.lineBuffer;
      var indexLine = this.currentLineIndex;
      var resultValue;

      // If the current line is still a single string, split it into words and reverse their order.
      if (typeof(linesArray[indexLine]) == 'string') {
        linesArray[indexLine] = linesArray[indexLine].split(' ').reverse();
      }

      // Retrieve the last word from the (possibly reversed) array of words on the current line.
      resultValue = linesArray[indexLine].pop();

      // If the current line is now empty after popping, advance to the next line.
      if (!linesArray[indexLine].length) {
        this.currentLineIndex++;
      }

      // Return the value, either as its original string form or as a parsed number.
      return returnRaw ? resultValue : +resultValue;
    },

    /**
     * Reads all space-separated values from the current line and advances to the next line.
     * @param {boolean} preserveFormats - If true, returns an array of strings; otherwise, converts items to numbers.
     * @returns {Array<string|number>} An array of values from the line.
     */
    retrieveLineValues: function(preserveFormats) {
      // Fetch the current line, split it by spaces, and then increment the line pointer.
      var lineContent = this.lineBuffer[this.currentLineIndex++].split(' ');
      // Map the array elements to numbers if 'preserveFormats' is false, otherwise return as strings.
      return preserveFormats ? lineContent : lineContent.map(entry => +entry);
    },

    /**
     * Reads a specified number of consecutive lines, treating each as a row in a matrix.
     * Each row is split into space-separated values.
     * @param {number} rowCount - The number of lines (rows) to read for the matrix.
     * @param {boolean} asRawStrings - If true, keeps matrix elements as strings; otherwise, converts to numbers.
     * @returns {Array<Array<string|number>>} A two-dimensional array representing the matrix.
     */
    fetchMatrixRows: function(rowCount, asRawStrings) {
      // Extract a slice of lines from the buffer and advance the line pointer by 'rowCount'.
      var matrixData = this.lineBuffer.slice(this.currentLineIndex, this.currentLineIndex += rowCount).map(row => row.split(' '));
      // Conditionally convert all elements in the matrix to numbers or keep them as strings.
      return asRawStrings ? matrixData : matrixData.map(row => row.map(cell => +cell));
    },

    /**
     * Reads a block of 'numLines' and returns them as an array.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} literalContent - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array containing the requested lines.
     */
    getRawLines: function(numLines, literalContent) {
      // Slice the required number of lines from the buffer and update the current line index.
      var lineBlock = this.lineBuffer.slice(this.currentLineIndex, this.currentLineIndex += numLines);
      // Return the lines as strings or as numbers, based on the 'literalContent' flag.
      return literalContent ? lineBlock : lineBlock.map(lineItem => +lineItem);
    }
  };

  // The IIFE returns the 'createParser' factory function, which is the public interface.
  return createParser;

})();

// Instantiate the input handler by reading the entire content of standard input.
var inputSource = DATA_ACQUIRER(require('node:fs').readFileSync('/dev/stdin', 'utf8'));

/**
 * Dynamically constructs a multi-dimensional array with a specified initial value
 * and dimensions. This function utilizes `eval` for its dynamic array creation.
 * @param {*} initialValue - The value to be placed at the innermost level of the array.
 * @param {...number} dimensions - A variable list of numbers defining the size of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function generateNestedArrays(initialValue) {
  var dimensions = arguments; // Captures all arguments, including the initial value and dimensions.
  var dimCount = dimensions.length;
  // Begin building the JavaScript expression for array creation from the innermost dimension.
  var arrayExpression = "Array(dimensions[" + --dimCount + "]).fill(void 0).map(element => { return " + initialValue + "; })";
  // Iteratively wrap the expression for higher dimensions.
  while (--dimCount) {
    arrayExpression = "Array(dimensions[" + dimCount + "]).fill(void 0).map(item => " + arrayExpression + ")";
  }
  // Execute the constructed string as JavaScript code to create the array.
  return eval(arrayExpression);
}

/**
 * Implements the Disjoint Set Union (DSU) data structure, often used for
 * managing partitions of a set of elements. It supports efficient union and find operations.
 * @param {number} elementCount - The total number of elements to be managed by the Disjoint Set.
 */
function DisjointSet(elementCount) {
  // The parent array: if parentArray[i] is negative, i is a root, and its absolute value is the size of the set.
  this.parentArray = (new Array(elementCount + 1.0)).fill(-1.0);
}

// Define the methods for the DisjointSet prototype.
DisjointSet.prototype = {

  /**
   * Finds the representative (root) of the set to which 'nodeIndex' belongs.
   * Employs path compression for performance optimization.
   * @param {number} nodeIndex - The element whose set representative is to be found.
   * @returns {number} The root element of the set containing 'nodeIndex'.
   */
  findRepresentative: function(nodeIndex) {
    // If 'nodeIndex' is a root (indicated by a negative value in parentArray), return itself.
    // Otherwise, recursively find the root and perform path compression by updating the parent.
    return this.parentArray[nodeIndex] < 0.0 ? nodeIndex : (this.parentArray[nodeIndex] = this.findRepresentative(this.parentArray[nodeIndex]));
  },

  /**
   * Checks if two elements, 'firstNode' and 'secondNode', belong to the same set.
   * @param {number} firstNode - The index of the first element.
   * @param {number} secondNode - The index of the second element.
   * @returns {boolean} True if both elements are in the same set, false otherwise.
   */
  areConnected: function(firstNode, secondNode) {
    return this.findRepresentative(firstNode) === this.findRepresentative(secondNode);
  },

  /**
   * Merges the sets containing 'nodeA' and 'nodeB'.
   * Uses the union-by-size heuristic to maintain a balanced tree structure.
   * @param {number} nodeA - The index of the first element.
   * @param {number} nodeB - The index of the second element.
   * @returns {number|void} Returns 1.0 if the elements were already in the same set, otherwise void 0.
   */
  joinSets: function(nodeA, nodeB) {
    nodeA = this.findRepresentative(nodeA); // Find root of nodeA.
    nodeB = this.findRepresentative(nodeB); // Find root of nodeB.

    if (nodeA === nodeB) {
      // If they are already in the same set, no union is performed.
      return 1.0;
    }

    // Union by size: attach the smaller tree under the root of the larger tree.
    // The parentArray stores the negative size of the set for root nodes.
    if (this.parentArray[nodeB] <= this.parentArray[nodeA]) {
      // If set B is larger or equal in size, merge set A into set B.
      this.parentArray[nodeB] += this.parentArray[nodeA]; // Update size of set B.
      this.parentArray[nodeA] = nodeB; // Make B the parent of A.
    } else {
      // If set A is larger, merge set B into set A.
      this.parentArray[nodeA] += this.parentArray[nodeB]; // Update size of set A.
      this.parentArray[nodeB] = nodeA; // Make A the parent of B.
    }
    // No explicit return value for a successful merge.
  },

  /**
   * Returns the number of elements in the set that contains 'elementId'.
   * @param {number} elementId - The element whose set size is to be determined.
   * @returns {number} The cardinality (size) of the set.
   */
  setCardinality: function(elementId) {
    // The size is stored as the absolute value of the negative number at the set's root.
    return -this.parentArray[this.findRepresentative(elementId)];
  }

};

/**
 * The core logic function that processes graph data to determine edge orientations.
 * It reads graph parameters, constructs a spanning forest, and then uses a DFS
 * to orient remaining edges based on a parity constraint.
 * @returns {string} A string where each line represents an oriented edge (e.g., "u v"),
 *                   or "-1" if a solution is not possible.
 */
function executeProblemSolver() {
  // Read the total number of nodes (vertices) in the graph.
  var nodeCount = inputSource.extractSingleValue();
  // Read the total number of edges in the graph.
  var edgeCount = inputSource.extractSingleValue();

  // If the total number of edges is odd, it's impossible to satisfy the parity condition.
  // Return -1 to indicate no solution.
  if ((edgeCount & 1.0) !== 0.0) {
    return -1.0;
  }

  // Read all edges, where each edge is represented as a pair of connected nodes.
  var edgeList = inputSource.fetchMatrixRows(edgeCount);

  // Initialize the Disjoint Set Union data structure to track connected components.
  var disjointSets = new DisjointSet(nodeCount);

  // This array will store the final list of oriented edges.
  var solutionSequence = [];

  // Initialize an adjacency list to represent the spanning tree (or forest)
  // formed by edges that connect previously disconnected components.
  var treeAdjacency = generateNestedArrays([], nodeCount + 1.0);

  // Initialize a parity tracker for each node. This will be used to ensure
  // that each node has an even number of outgoing edges in the final solution.
  var nodeParity = generateNestedArrays(0.0, nodeCount + 1.0);

  // Iterate through all the input edges.
  for (var currentEdgeIndex = 0.0; currentEdgeIndex < edgeCount; currentEdgeIndex++) {
    var sourceNode = edgeList[currentEdgeIndex][0]; // The first node of the current edge.
    var targetNode = edgeList[currentEdgeIndex][1]; // The second node of the current edge.

    // Attempt to unite the sets containing 'sourceNode' and 'targetNode'.
    // If 'joinSets' returns void 0, it means the union was successful (they were in different sets).
    if (!disjointSets.joinSets(sourceNode, targetNode)) {
      // This edge is part of the spanning tree. Add it to the solution and flip sourceNode's parity.
      solutionSequence.push(sourceNode + " " + targetNode);
      nodeParity[sourceNode] ^= 1.0; // XOR with 1.0 to toggle the parity (0 to 1, 1 to 0).
    } else {
      // If 'joinSets' returned 1.0, the nodes were already connected.
      // This edge forms a cycle and is added to the adjacency list for tree traversal.
      treeAdjacency[sourceNode].push(targetNode);
      treeAdjacency[targetNode].push(sourceNode);
    }
  }

  // Perform a Depth-First Search starting from node 1 (assuming 1-indexed nodes)
  // to orient the remaining edges that form cycles. The parentNode of 0.0 indicates the DFS root.
  exploreComponent(1.0, 0.0);

  // Join all the determined oriented edges into a single string, separated by newline characters.
  return solutionSequence.join('\n');


  /**
   * A nested Depth-First Search function used to orient edges within the spanning tree
   * (and cycle edges added to treeAdjacency) to satisfy parity conditions.
   * @param {number} currentNode - The node currently being visited in the DFS.
   * @param {number} parentNode - The node from which 'currentNode' was reached in the DFS path.
   */
  function exploreComponent(currentNode, parentNode) {
    // Iterate over all neighbors of the 'currentNode' in the 'treeAdjacency' list.
    for (var neighborNode of treeAdjacency[currentNode]) {
      // Skip the parent node to avoid traversing back up the tree immediately.
      if (neighborNode === parentNode) {
        continue;
      }
      // Recursively call DFS for each unvisited neighbor.
      exploreComponent(neighborNode, currentNode);
    }

    // This part executes after all children of 'currentNode' have been visited (post-order traversal).
    // If 'currentNode' is the root of the DFS traversal (no parent), simply return.
    if (parentNode === 0.0) {
      return;
    }

    // Check the parity flag of the 'currentNode'.
    if (nodeParity[currentNode]) {
      // If 'currentNode' has an odd parity, orient the edge from 'currentNode' to its 'parentNode'.
      solutionSequence.push(currentNode + " " + parentNode);
    } else {
      // If 'currentNode' has an even parity, orient the edge from its 'parentNode' to 'currentNode'.
      // Also, flip the parity of the 'parentNode' as an edge is now directed towards 'currentNode' from it.
      solutionSequence.push(parentNode + " " + currentNode);
      nodeParity[parentNode] ^= 1.0; // Toggle parent's parity.
    }
  }
}

// This conditional block handles the execution of the script.
// It checks the number of command-line arguments to decide whether to fork a child process
// with extended stack size or to execute the main logic directly.
if (process.argv.length < 3.0) {
  // If fewer than 3 arguments are provided, it suggests a specific execution context
  // (e.g., for competitive programming platforms that might need a larger stack).
  require('node:child_process').fork('Entrypoint.js', ['child_mode_flag'], {
    execArgv: ['--stack-size=256000'] // Forks a child process with an increased stack size.
  });
} else {
  // Otherwise, execute the primary problem-solving function and print its result to standard output.
  console.log(executeProblemSolver());
}