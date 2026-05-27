var INPUT_PARSER = (function() {
  // This function serves as the entry point for creating an input parser instance.
  function createParser(sourceText) {
    return new InputSource(sourceText);
  }

  // The InputSource class manages the parsing of input lines.
  function InputSource(rawInputString) {
    this._sourceLines = rawInputString.trim().split("\n"); // Store input lines, trimmed and split.
    this._currentLineIndex = 0; // Keep track of the current line being processed.
  }

  // Prototype methods for InputSource.
  InputSource.prototype = {
    // Reads a single item from the current line.
    readNextItem: function(returnAsString) {
      var lineData = this._sourceLines;
      var lineIdx = this._currentLineIndex;
      var extractedData;

      // If the current line hasn't been processed into individual items yet,
      // reverse it and split by space. This allows popping from the end.
      if (typeof lineData[lineIdx] === "string") {
        lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
      }

      extractedData = lineData[lineIdx].pop(); // Get the last item.

      // If the current line is now empty, advance to the next line.
      if (!lineData[lineIdx].length) {
        this._currentLineIndex++;
      }

      // Return as string or convert to number.
      return returnAsString ? extractedData : +extractedData;
    },

    // Reads an entire line and splits it into items.
    readLineItems: function(returnAsString) {
      var lineContent = this._sourceLines[this._currentLineIndex++]; // Get line and advance index.
      var items = lineContent.split(" ");

      // Return as strings or convert all items to numbers.
      return returnAsString ? items : items.map(valStr => +valStr);
    },

    // Reads 'count' lines, splitting each into items, forming a matrix.
    readMatrix: function(count, returnAsString) {
      var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);
      var processedMatrix = matrixRows.map(rowStr => rowStr.split(" "));

      // Return as strings or convert all inner items to numbers.
      return returnAsString ? processedMatrix : processedMatrix.map(row => row.map(itemStr => +itemStr));
    },

    // Reads 'count' lines, returning each line as a single item.
    readLinesAsNumbers: function(count, returnAsString) {
      var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);

      // Return as strings or convert each line to a number.
      return returnAsString ? rawLines : rawLines.map(lineStr => +lineStr);
    }
  };

  return createParser; // Expose the factory function.
})();

// Initialize the input reader with content from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Disjoint Set Union (Union-Find) data structure.
function DisjointSet(elementCount) {
  // Initialize parent array: -1 indicates a root, and its absolute value is the size of the set.
  this.parentOrSize = Array(elementCount + 0x1).fill(-0x1);
}

DisjointSet.prototype = {
  // Finds the root of the set containing 'elementIdx' with path compression.
  findRoot: function(elementIdx) {
    if (this.parentOrSize[elementIdx] < 0) {
      return elementIdx; // 'elementIdx' is a root.
    }
    // Path compression: set parent directly to the root.
    return this.parentOrSize[elementIdx] = this.findRoot(this.parentOrSize[elementIdx]);
  },

  // Checks if two elements 'nodeA' and 'nodeB' are in the same set.
  areConnected: function(nodeA, nodeB) {
    return this.findRoot(nodeA) === this.findRoot(nodeB);
  },

  // Unites the sets containing 'nodeA' and 'nodeB'.
  unionSets: function(nodeA, nodeB) {
    nodeA = this.findRoot(nodeA); // Get root of nodeA's set.
    nodeB = this.findRoot(nodeB); // Get root of nodeB's set.

    if (nodeA === nodeB) {
      return; // Already in the same set, nothing to do.
    }

    // Union by size/rank heuristic. Attach smaller tree under larger tree.
    if (this.parentOrSize[nodeA] >= this.parentOrSize[nodeB]) {
      // nodeB's tree is larger or equal (more negative value means larger size).
      this.parentOrSize[nodeB] += this.parentOrSize[nodeA]; // Update size of new root.
      this.parentOrSize[nodeA] = nodeB; // Make nodeB the parent of nodeA.
    } else {
      // nodeA's tree is larger.
      this.parentOrSize[nodeA] += this.parentOrSize[nodeB]; // Update size of new root.
      this.parentOrSize[nodeB] = nodeA; // Make nodeA the parent of nodeB.
    }
  },

  // Returns the size of the set containing 'elementIdx'.
  getSetSize: function(elementIdx) {
    return -this.parentOrSize[this.findRoot(elementIdx)]; // Size is the negative of the root's value.
  }
};

// Output the result of the main problem-solving function.
console.log(solveProblem());

// Main function to solve the connectivity problem.
function solveProblem() {
  var numElements = inputReader.readNextItem(); // Read N, the number of elements.
  var numOperations = inputReader.readNextItem(); // Read M, the number of operations (edges).
  var operationPairs = inputReader.readMatrix(numOperations); // Read M pairs of elements.

  var resultArray = Array(numOperations); // Array to store the number of unconnected pairs at each step.
  var disjointSetInstance = new DisjointSet(numElements); // Initialize Disjoint Set Union structure.

  // The initial number of unconnected pairs before any operations are considered.
  // This is for the state *before* the last operation is removed.
  resultArray[numOperations - 0b1] = numElements * (numElements - 0x1) / 0x2;

  // Iterate backwards through the operations (edges).
  // This simulates adding edges one by one, starting from an empty graph.
  for (var opIndex = numOperations - 0x1; opIndex > 0x0; opIndex--) {
    var currentPair = operationPairs[opIndex];
    var firstNode = currentPair[0x0];
    var secondNode = currentPair[0x1];

    // Check if the two nodes are already connected in the current DSU state.
    if (disjointSetInstance.areConnected(firstNode, secondNode)) {
      // If they are already connected, adding this edge doesn't change the number of unconnected pairs.
      resultArray[opIndex - 0x1] = resultArray[opIndex];
    } else {
      // If they are not connected, uniting them will reduce the number of unconnected pairs.
      var sizeOfSetA = disjointSetInstance.getSetSize(firstNode);
      var sizeOfSetB = disjointSetInstance.getSetSize(secondNode);
      var productOfSizes = sizeOfSetA * sizeOfSetB;

      // The number of unconnected pairs decreases by (sizeA * sizeB) when these two sets merge.
      resultArray[opIndex - 0x1] = resultArray[opIndex] - productOfSizes;

      // Perform the union operation.
      disjointSetInstance.unionSets(firstNode, secondNode);
    }
  }

  // Join the results with newline characters for output.
  return resultArray.join("\n");
}
