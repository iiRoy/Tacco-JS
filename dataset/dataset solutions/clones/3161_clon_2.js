/* This module handles reading and parsing input data */
var INPUT_PROCESSOR = (function() {
  /**
   * Factory function to create a new input reader.
   * @param {string} rawSource The raw input string.
   * @returns {StreamParser} An instance of StreamParser.
   */
  function createReader(rawSource) {
    return new StreamParser(rawSource);
  }

  /**
   * Represents a parser for line-based input data.
   * @class
   */
  function StreamParser(rawText) {
    // Store input lines after trimming and splitting
    this._sourceLines = rawText.trim().split("\n");
    // Initialize line pointer
    this._currentLineIndex = 0;
  }

  /**
   * Reads a single scalar value from the current line.
   * If the line is exhausted, it moves to the next.
   * @param {boolean} returnAsString If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The parsed value.
   */
  StreamParser.prototype.fetchScalar = function(returnAsString) {
    var linesArr = this._sourceLines;
    var linePtr = this._currentLineIndex;
    var parsedValue;

    // If the current line hasn't been split yet, split and reverse it
    // This allows popping elements from the end efficiently
    if (typeof linesArr[linePtr] === "string") {
      linesArr[linePtr] = linesArr[linePtr].split(" ").reverse();
    }

    parsedValue = linesArr[linePtr].pop(); // Get the last element

    // If the current line is now empty, advance to the next line
    if (!linesArr[linePtr].length) {
      this._currentLineIndex++;
    }

    // Return as string or convert to number
    return returnAsString ? parsedValue : +parsedValue;
  };

  /**
   * Reads an entire line of space-separated values.
   * Advances the line pointer.
   * @param {boolean} asStrings If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of parsed values.
   */
  StreamParser.prototype.readLineValues = function(asStrings) {
    var lineData = this._sourceLines[this._currentLineIndex++].split(" ");
    return asStrings ? lineData : lineData.map(valStr => +valStr);
  };

  /**
   * Reads a block of 'numRows' lines, parsing each into an array of values.
   * Advances the line pointer by 'numRows'.
   * @param {number} numRows The number of lines to read.
   * @param {boolean} asStrings If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  StreamParser.prototype.fetchGrid = function(numRows, asStrings) {
    var gridData = this._sourceLines
      .slice(this._currentLineIndex, (this._currentLineIndex += numRows))
      .map(lineStr => lineStr.split(" "));

    return asStrings ?
      gridData :
      gridData.map(row => row.map(cellStr => +cellStr));
  };

  /**
   * Reads a block of 'numLines' raw lines without further splitting.
   * Advances the line pointer by 'numLines'.
   * @param {number} numLines The number of lines to read.
   * @param {boolean} asStrings If true, returns lines as strings; otherwise, attempts conversion to number.
   * @returns {Array<string|number>} An array of raw line content.
   */
  StreamParser.prototype.readRawLines = function(numLines, asStrings) {
    var lineContent = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numLines)
    );
    return asStrings ? lineContent : lineContent.map(content => +content);
  };

  return createReader;
})();

/* Initialize the input parser with data from standard input */
var dataHandler = INPUT_PROCESSOR(
  require("fs").readFileSync("/dev/stdin", "UTF-8")
);

/**
 * Implements a Disjoint Set Union (DSU) data structure with path compression and union by size.
 * @class
 */
function DisjointSet(elementCount) {
  // _parentArray[i] stores the parent of i, or -(size) if i is a root.
  this._parentArray = Array(elementCount + 1).fill(-1);
}

DisjointSet.prototype = {
  /**
   * Finds the representative (root) of the set containing the given element.
   * Applies path compression during traversal.
   * @param {number} itemIndex The index of the element.
   * @returns {number} The representative of the set.
   */
  findRepresentative: function(itemIndex) {
    if (this._parentArray[itemIndex] < 0) {
      return itemIndex;
    }
    // Path compression: set parent directly to the root
    return (this._parentArray[itemIndex] = this.findRepresentative(
      this._parentArray[itemIndex]
    ));
  },

  /**
   * Checks if two elements belong to the same set.
   * @param {number} firstItem The index of the first element.
   * @param {number} secondItem The index of the second element.
   * @returns {boolean} True if they are in the same set, false otherwise.
   */
  areConnected: function(firstItem, secondItem) {
    return (
      this.findRepresentative(firstItem) === this.findRepresentative(secondItem)
    );
  },

  /**
   * Merges the sets containing two given elements.
   * Uses union by size heuristic.
   * @param {number} nodeA The index of the first element.
   * @param {number} nodeB The index of the second element.
   */
  unionSets: function(nodeA, nodeB) {
    // Find representatives of both elements
    nodeA = this.findRepresentative(nodeA);
    nodeB = this.findRepresentative(nodeB);

    // If they are already in the same set, do nothing
    if (nodeA === nodeB) {
      return;
    }

    // Union by size: attach smaller tree to root of larger tree
    if (this._parentArray[nodeA] >= this._parentArray[nodeB]) {
      // nodeA's set is smaller or equal in size (more negative value means larger size)
      this._parentArray[nodeB] += this._parentArray[nodeA]; // Add size of A to B
      this._parentArray[nodeA] = nodeB; // Make B the parent of A
    } else {
      // nodeB's set is smaller
      this._parentArray[nodeA] += this._parentArray[nodeB]; // Add size of B to A
      this._parentArray[nodeB] = nodeA; // Make A the parent of B
    }
  },

  /**
   * Gets the size of the set containing the given element.
   * @param {number} memberIndex The index of an element in the set.
   * @returns {number} The number of elements in the set.
   */
  getSetSize: function(memberIndex) {
    return -this._parentArray[this.findRepresentative(memberIndex)];
  },
};

/* Output the result of the main computation */
console.log(calculateConnectivity());

/**
 * Main function to solve the connectivity problem.
 * Calculates the number of connected pairs in a graph as edges are removed in reverse.
 * @returns {string} The final results joined by newlines.
 */
function calculateConnectivity() {
  // Read number of nodes (vertices) and edges from input
  var numVertices = dataHandler.fetchScalar();
  var numConnections = dataHandler.fetchScalar();

  // Read all edge pairs (u, v)
  var connectionPairs = dataHandler.fetchGrid(numConnections);

  // Array to store the count of connected pairs at each step
  var connectivityResults = Array(numConnections);

  // Initialize a Disjoint Set Union structure for the nodes
  var componentTracker = new DisjointSet(numVertices);

  // Initially, before any edges are "removed" (i.e., all edges are present),
  // the graph is fully connected if it were a complete graph.
  // The problem implies we're calculating connected pairs *after* removing edges in reverse.
  // So, starting from all edges present, the number of connected pairs is numVertices * (numVertices - 1) / 2.
  // The algorithm processes edges from last to first, effectively adding them back.
  // So, connectivityResults[i-1] represents the state *before* edge 'i' was added.
  // The last element (index numConnections-1) corresponds to the state *after* the last edge is added,
  // which means all edges are present.
  connectivityResults[numConnections - 1] =
    (numVertices * (numVertices - 1)) / 2;

  // Iterate through the edges in reverse order (from last to first)
  // This simulates adding edges one by one and calculating connectivity.
  for (var edgeIdx = numConnections - 1; edgeIdx > 0; edgeIdx--) {
    var u = connectionPairs[edgeIdx][0];
    var v = connectionPairs[edgeIdx][1];

    // If the two nodes of the current edge are already in the same component
    if (componentTracker.areConnected(u, v)) {
      // No change in connectivity, so the count remains the same as the previous step
      connectivityResults[edgeIdx - 1] = connectivityResults[edgeIdx];
    } else {
      // If the nodes are in different components, adding this edge will merge them.
      // The number of connected pairs removed by merging is (size of u's component * size of v's component).
      var productOfComponentSizes =
        componentTracker.getSetSize(u) * componentTracker.getSetSize(v);

      // Subtract the newly formed pairs from the total connected pairs
      connectivityResults[edgeIdx - 1] =
        connectivityResults[edgeIdx] - productOfComponentSizes;

      // Perform the union operation to merge the components
      componentTracker.unionSets(u, v);
    }
  }

  // Join the results with newline characters and return
  return connectivityResults.join("\n");
}