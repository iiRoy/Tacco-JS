var InputProcessor = (function() {
  // Factory function to create an input reader instance.
  function createInputReader(sourceString) {
    return new InputReader(sourceString);
  }

  // Constructor for the InputReader object.
  function InputReader(sourceString) {
    this.sourceLines = sourceString.trim().split("\n"); // Stores input lines, trimmed and split.
    this.currentLineIndex = 0; // Pointer to the current line being processed.
  }

  // Reads the next token from the current line.
  // If 'asString' is true, returns the token as a string; otherwise, as a number.
  InputReader.prototype.readNextToken = function(asString) {
    var lines = this.sourceLines;
    var linePointer = this.currentLineIndex;
    var tokenValue;

    // If the current line hasn't been tokenized yet, split it.
    if (typeof lines[linePointer] === "string") {
      lines[linePointer] = lines[linePointer].split(" ").reverse(); // Split and reverse for efficient popping.
    }

    tokenValue = lines[linePointer].pop(); // Retrieve the last token.

    // If the current line is now empty, advance to the next line.
    if (!lines[linePointer].length) {
      this.currentLineIndex++;
    }

    return asString ? tokenValue : +tokenValue; // Return as string or convert to number.
  };

  // Reads all tokens from the current line.
  // If 'asString' is true, returns an array of strings; otherwise, an array of numbers.
  InputReader.prototype.readLineTokens = function(asString) {
    var tokens = this.sourceLines[this.currentLineIndex++].split(" ");
    return asString ? tokens : tokens.map(value => +value);
  };

  // Reads a matrix of 'numRows' rows.
  // If 'asString' is true, returns a matrix of strings; otherwise, a matrix of numbers.
  InputReader.prototype.readMatrix = function(numRows, asString) {
    var matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex += numRows)
                                     .map(line => line.split(" "));
    return asString ? matrixRows : matrixRows.map(row => row.map(item => +item));
  };

  // Reads 'numRows' raw lines.
  // If 'asString' is true, returns an array of strings; otherwise, an array of numbers.
  InputReader.prototype.readRawLines = function(numRows, asString) {
    var rawLines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex += numRows);
    return asString ? rawLines : rawLines.map(line => +line);
  };

  return createInputReader;
})();

// Initialize the input reader with data from standard input.
var inputData = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Helper function to create multi-dimensional arrays with an initial value.
function multiDimArray(initialValue) {
  var functionArgs = arguments;
  var argumentCount = functionArgs.length;
  var arrayCreationExpression = "Array(functionArgs[" + --argumentCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
  while (--argumentCount) {
    arrayCreationExpression = "Array(functionArgs[" + argumentCount + "]).fill(0).map(x=>" + arrayCreationExpression + ")";
  }
  return eval(arrayCreationExpression);
}

// Disjoint Set Union (Union-Find) data structure implementation.
function DisjointSet(elementCount) {
  this.parentOrSize = Array(elementCount + 1).fill(-1); // Stores parent index or negative size if root.
}

DisjointSet.prototype = {
  // Finds the representative (root) of the set containing element 'idx'.
  // Applies path compression for efficiency.
  findRoot: function(idx) {
    if (this.parentOrSize[idx] < 0) {
      return idx; // 'idx' is the root of its set.
    }
    // Recursively find root and apply path compression.
    return this.parentOrSize[idx] = this.findRoot(this.parentOrSize[idx]);
  },

  // Checks if two elements 'elemX' and 'elemY' belong to the same set.
  areConnected: function(elemX, elemY) {
    return this.findRoot(elemX) === this.findRoot(elemY);
  },

  // Unites the sets containing 'elemX' and 'elemY'.
  // Returns 1 if 'elemX' and 'elemY' were already in the same set, otherwise undefined.
  unionSets: function(elemX, elemY) {
    elemX = this.findRoot(elemX);
    elemY = this.findRoot(elemY);

    if (elemX === elemY) {
      return 1; // Elements are already in the same set.
    }

    // Union by size heuristic: attach smaller tree under root of larger tree.
    if (this.parentOrSize[elemY] <= this.parentOrSize[elemX]) {
      this.parentOrSize[elemY] += this.parentOrSize[elemX]; // Update size of the new root.
      this.parentOrSize[elemX] = elemY; // Make elemY the parent of elemX.
    } else {
      this.parentOrSize[elemX] += this.parentOrSize[elemY]; // Update size of the new root.
      this.parentOrSize[elemY] = elemX; // Make elemX the parent of elemY.
    }
  },

  // Returns the size of the set containing element 'idx'.
  getSetSize: function(idx) {
    return -this.parentOrSize[this.findRoot(idx)];
  },
};

// Execute the main problem-solving logic and print the result to console.
console.log(solveProblem());

// Main function encapsulating the problem's solution logic.
function solveProblem() {
  var nodeCount = inputData.readNextToken(); // Read the number of nodes.
  var edgeCount = inputData.readNextToken(); // Read the number of edges.

  // If the total number of edges is odd, it's impossible to orient them
  // such that all nodes have an even out-degree.
  if (edgeCount & 1) {
    return -1;
  }

  var edgeList = inputData.readMatrix(edgeCount); // Read all edge pairs.
  var disjointSets = new DisjointSet(nodeCount); // Initialize DSU structure.
  var resultEdges = []; // Array to store the final oriented edges.
  var adjList = multiDimArray("[]", nodeCount + 1); // Adjacency list for the spanning forest.
  var parityTracker = multiDimArray(0, nodeCount + 1); // Tracks parity for each node (0 or 1).

  // Iterate through all given edges.
  for (var idx = 0; idx < edgeCount; idx++) {
    var nodeA = edgeList[idx][0];
    var nodeB = edgeList[idx][1];

    // Attempt to unite the sets containing nodeA and nodeB.
    // If unionSets returns 1, it means they were already connected (this edge closes a cycle).
    if (disjointSets.unionSets(nodeA, nodeB)) {
      // This is a back-edge (non-tree edge). Add it directly to the result.
      resultEdges.push(nodeA + " " + nodeB);
      parityTracker[nodeA] ^= 1; // Flip parity for nodeA.
    } else {
      // This is a tree edge (connects two previously disconnected components).
      // Add it to the adjacency list for the spanning forest.
      adjList[nodeA].push(nodeB);
      adjList[nodeB].push(nodeA);
    }
  }

  // Perform Depth-First Search on the spanning forest to orient tree edges.
  traverseGraph(1, 0); // Start DFS from node 1, with 0 as a dummy parent.

  return resultEdges.join("\n"); // Return the oriented edges as a newline-separated string.

  // Depth-First Search function to orient edges in the spanning forest.
  function traverseGraph(currentNode, parentNode) {
    // Recursively visit all neighbors (children) of the current node.
    for (var neighborNode of adjList[currentNode]) {
      if (neighborNode === parentNode) {
        continue; // Skip the parent to avoid going back up the tree.
      }
      traverseGraph(neighborNode, currentNode); // Recurse on child.
    }

    // If this is the root of the DFS (dummy parent 0), no edge needs to be oriented upwards.
    if (parentNode === 0) {
      return;
    }

    // After visiting all children, check the parity of the current node.
    if (parityTracker[currentNode]) {
      // If parity is 1 (odd), orient the edge from current node to its parent.
      resultEdges.push(currentNode + " " + parentNode);
    } else {
      // If parity is 0 (even), orient the edge from parent to current node.
      resultEdges.push(parentNode + " " + currentNode);
      parityTracker[parentNode] ^= 1; // Flip parent's parity as it now has an outgoing edge.
    }
  }
}
