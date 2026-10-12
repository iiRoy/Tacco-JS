var createInputParser = (function () {
  // This constructor initializes the input processor with raw string data.
  // It splits the input into an array of lines and sets the initial line index.
  function InputProcessor(rawInputString) {
    this._sourceLines = rawInputString.trim().split("\n"); // Array of input lines, trimmed.
    this._currentLineIndex = 0; // Index of the current line being processed.
  }

  // This is the factory function returned by the IIFE to create InputProcessor instances.
  function createParser(inputString) {
    return new InputProcessor(inputString);
  }

  // Prototype methods for the InputProcessor class.

  // Reads the next space-separated item from the current line.
  // Items are consumed from the end of the line (after reversing).
  // 'asString' parameter determines if the return value is a string or a number.
  InputProcessor.prototype.nextItem = function (asString) {
    var lineData = this._sourceLines;
    var lineIdx = this._currentLineIndex;
    var resultValue;

    // If the current line is still a single string, split it into items and reverse.
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    // Pop the last item from the (reversed) array, which is the next item in original order.
    resultValue = lineData[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the item, converting to a number if 'asString' is false.
    return asString ? resultValue : +resultValue;
  };

  // Reads the entire next line as an array of space-separated items.
  // 'asString' parameter determines if array elements are strings or numbers.
  InputProcessor.prototype.nextLine = function (asString) {
    // Get the current line, split it, and then increment the line index.
    var lineItems = this._sourceLines[this._currentLineIndex++].split(" ");
    // Map items to numbers if 'asString' is false, otherwise return as strings.
    return asString ? lineItems : lineItems.map((element) => +element);
  };

  // Reads 'count' number of subsequent lines, parsing each into an array of items.
  // This effectively reads a matrix of data.
  // 'asString' parameter determines if matrix elements are strings or numbers.
  InputProcessor.prototype.nextMatrix = function (count, asString) {
    // Slice the relevant lines and map each line string to an array of its items.
    var matrixRows = this._sourceLines
      .slice(this._currentLineIndex, (this._currentLineIndex += count))
      .map((rowString) => rowString.split(" "));
    // If not 'asString', map all elements in the matrix to numbers.
    return asString
      ? matrixRows
      : matrixRows.map((row) => row.map((element) => +element));
  };

  // Reads 'count' number of raw lines without splitting them into items.
  // 'asString' parameter determines if lines are returned as strings or numbers.
  InputProcessor.prototype.nextRawLines = function (count, asString) {
    // Slice the relevant lines and then increment the line index.
    var rawLines = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += count)
    );
    // If not 'asString', map each line to a number.
    return asString ? rawLines : rawLines.map((element) => +element);
  };

  return createParser; // Return the factory function.
})();

// Initialize the input reader by reading data from standard input.
var inputReader = createInputParser(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

// Dynamically creates a multi-dimensional array with specified dimensions and initial value.
// The first argument is the 'initialValue' for the innermost elements.
// Subsequent arguments define the sizes of the dimensions (e.g., initializeMultiDimArray(0, 2, 3) creates a 2x3 array of zeros).
function initializeMultiDimArray(initialValue) {
  var dimensions = arguments; // All arguments passed to the function.
  var dimLength = dimensions.length; // Number of dimensions.
  var arrayCreationString; // String to build the array creation logic.

  // Start building the string from the innermost dimension.
  // `dimLength` is decremented to get the last dimension index.
  arrayCreationString =
    "Array(dimensions[" +
    --dimLength +
    "]).fill(0).map(item => {return " +
    initialValue +
    ";})";

  // Loop backwards through the remaining dimensions, wrapping the inner creation string.
  while (--dimLength) {
    arrayCreationString =
      "Array(dimensions[" + dimLength + "]).fill(0).map(item => " +
      arrayCreationString +
      ")";
  }

  // Use eval to execute the dynamically constructed array creation string.
  return eval(arrayCreationString);
}

// Disjoint Set Union (DSU) data structure implementation.
// 'elementCount' specifies the maximum number of elements in the sets.
function DisjointSetUnion(elementCount) {
  // 'parentOrSize' array:
  // If parentOrSize[i] < 0, 'i' is a root, and its absolute value is the size of the set.
  // If parentOrSize[i] >= 0, parentOrSize[i] is the parent of 'i'.
  this.parentOrSize = Array(elementCount + 1).fill(-1);
}

// Prototype methods for the DisjointSetUnion class.
DisjointSetUnion.prototype = {
  // Finds the root (representative) of the set containing 'index'.
  // Implements path compression for efficiency.
  findRoot: function (index) {
    // If 'index' is a root (value is negative), return itself.
    // Otherwise, recursively find the root and update 'index''s parent to the root.
    return this.parentOrSize[index] < 0
      ? index
      : (this.parentOrSize[index] = this.findRoot(this.parentOrSize[index]));
  },

  // Checks if two elements 'nodeA' and 'nodeB' belong to the same set.
  areConnected: function (nodeA, nodeB) {
    return this.findRoot(nodeA) === this.findRoot(nodeB);
  },

  // Unites the sets containing 'nodeA' and 'nodeB'.
  // Implements union by size (or rank) for efficiency.
  // Returns 1 if a union operation occurred, 0 if they were already in the same set.
  unionSets: function (nodeA, nodeB) {
    nodeA = this.findRoot(nodeA); // Get the root of nodeA's set.
    nodeB = this.findRoot(nodeB); // Get the root of nodeB's set.

    if (nodeA === nodeB) {
      return 0; // Already in the same set, no union needed.
    }

    // Union by size: attach the smaller tree under the root of the larger tree.
    if (this.parentOrSize[nodeB] <= this.parentOrSize[nodeA]) {
      // If nodeB's set is larger or equal, attach nodeA's set to nodeB's.
      this.parentOrSize[nodeB] += this.parentOrSize[nodeA]; // Update size of the new root (nodeB).
      this.parentOrSize[nodeA] = nodeB; // Make nodeB the parent of nodeA's old root.
    } else {
      // If nodeA's set is larger, attach nodeB's set to nodeA's.
      this.parentOrSize[nodeA] += this.parentOrSize[nodeB]; // Update size of the new root (nodeA).
      this.parentOrSize[nodeB] = nodeA; // Make nodeA the parent of nodeB's old root.
    }
    return 1; // Union successfully performed.
  },

  // Returns the size of the set containing 'index'.
  getSetSize: function (index) {
    return -this.parentOrSize[this.findRoot(index)]; // Size is the absolute value of the root's parentOrSize.
  },
};

// Main function to solve the problem logic.
function solveProblem() {
  var numNodes = inputReader.nextItem(); // Read the total number of nodes (N).
  var numEdges = inputReader.nextItem(); // Read the total number of edges (M).

  // If the number of edges is odd, it's impossible to pair them up, so return -1.
  if (numEdges & 1) {
    return -1;
  }

  var edgeList = inputReader.nextMatrix(numEdges); // Read all M edges as a matrix.
  var dsuInstance = new DisjointSetUnion(numNodes); // Initialize DSU structure for N nodes.
  var resultEdges = []; // Array to store the edges that form the final output.

  // Adjacency list to store edges that form cycles (not part of the initial spanning forest).
  var adjacencyList = initializeMultiDimArray("[]", numNodes + 1);
  // Parity tracker for each node: 0 for even, 1 for odd.
  // Used to determine which direction an edge should be oriented in the DFS.
  var nodeParity = initializeMultiDimArray(0, numNodes + 1);

  // Iterate through all given edges.
  for (var edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
    var nodeU = edgeList[edgeIndex][0],
      nodeV = edgeList[edgeIndex][1]; // Extract nodes from the current edge.

    // Attempt to unite the sets of nodeU and nodeV.
    // If unionSets returns 1, it means they were in different sets and are now connected.
    if (dsuInstance.unionSets(nodeU, nodeV)) {
      resultEdges.push(nodeU + " " + nodeV); // This edge is part of the spanning forest.
      nodeParity[nodeU] ^= 1; // Flip the parity of nodeU.
    } else {
      // If unionSets returns 0, they were already connected, meaning this edge forms a cycle.
      // Add this edge to the adjacency list for later DFS traversal.
      adjacencyList[nodeU].push(nodeV);
      adjacencyList[nodeV].push(nodeU);
    }
  }

  // Start a Depth First Search from node 1 (assuming 1-indexed nodes), with no parent (0).
  depthFirstSearch(1, 0);

  // Join all collected edges with newline characters and return the final string.
  return resultEdges.join("\n");

  // Nested Depth First Search function to orient edges in the cycle-forming graph.
  // 'currentNode': The node currently being visited.
  // 'parentNode': The node from which 'currentNode' was visited (to avoid going back).
  function depthFirstSearch(currentNode, parentNode) {
    // Iterate over all neighbors of the current node.
    for (var neighborNode of adjacencyList[currentNode]) {
      // Skip the parent node to prevent infinite loops in an undirected graph.
      if (neighborNode === parentNode) {
        continue;
      }
      // Recursively call DFS for the neighbor.
      depthFirstSearch(neighborNode, currentNode);
    }

    // If the current node is the root of the DFS tree (no parent), simply return.
    if (parentNode === 0) {
      return;
    }

    // Based on the parity of the current node, decide the edge direction.
    if (nodeParity[currentNode]) {
      // If currentNode's parity is 1 (odd), add an edge from currentNode to parentNode.
      resultEdges.push(currentNode + " " + parentNode);
    } else {
      // If currentNode's parity is 0 (even), add an edge from parentNode to currentNode.
      // Also, flip the parity of the parentNode.
      resultEdges.push(parentNode + " " + currentNode);
      nodeParity[parentNode] ^= 1;
    }
  }
}

// This block handles the execution environment.
// If the script is run directly (without arguments), it forks a child process
// with an increased stack size to prevent potential stack overflows from deep recursion.
// The child process then executes the main logic.
// If arguments are present (indicating it's the forked child process),
// it directly calls the solveProblem function and prints its output to the console.
if (process.argv.length < 3) {
  require("child_process").fork("Main.js", ["1"], {
    execArgv: ["--stack-size=240000"],
  });
} else {
  console.log(solveProblem());
}
