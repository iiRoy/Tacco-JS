var INPUT_PARSER = (function () {
  // This function serves as the factory for creating input source objects.
  function createParser(sourceContent) {
    return new InputSource(sourceContent);
  }

  // The InputSource class manages reading data from the provided string.
  function InputSource(rawString) {
    this._sourceLines = rawString.trim().split("\n"); // Store lines, trimmed and split.
    this._currentLineIndex = 0; // Keep track of the current line being processed.
  }

  // Reads a single item from the current line. Items are space-separated.
  // If 'asStrings' is true, returns the item as a string; otherwise, as a number.
  // The line is processed from right to left (popping from a reversed array).
  InputSource.prototype.readSingleItem = function (asStrings) {
    var lineData = this._sourceLines;
    var lineIdx = this._currentLineIndex;
    var resultVal;

    // If the current line hasn't been split into items yet, do so and reverse it.
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    resultVal = lineData[lineIdx].pop(); // Get the next item.

    // If the current line is exhausted, advance to the next line.
    if (!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }

    return asStrings ? resultVal : +resultVal; // Convert to number if not requested as string.
  };

  // Reads an entire line and splits it into items.
  // If 'asStrings' is true, returns items as strings; otherwise, as numbers.
  InputSource.prototype.readLineItems = function (asStrings) {
    var items = this._sourceLines[this._currentLineIndex++].split(" ");
    return asStrings ? items : items.map((item) => +item); // Convert all items to numbers.
  };

  // Reads 'numLines' lines and parses them into a 2D array (matrix).
  // If 'asStrings' is true, returns items as strings; otherwise, as numbers.
  InputSource.prototype.readMatrix = function (numLines, asStrings) {
    var matrixRows = this._sourceLines
      .slice(this._currentLineIndex, (this._currentLineIndex += numLines))
      .map((line) => line.split(" "));

    return asStrings
      ? matrixRows
      : matrixRows.map((row) => row.map((item) => +item)); // Convert all items to numbers.
  };

  // Reads 'numLines' lines and parses them into a 1D array.
  // If 'asStrings' is true, returns items as strings; otherwise, as numbers.
  InputSource.prototype.readLinesAsArray = function (numLines, asStrings) {
    var lineArray = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numLines)
    );

    return asStrings ? lineArray : lineArray.map((item) => +item); // Convert all items to numbers.
  };

  return createParser; // Return the factory function.
})();

// Initialize the input reader with data from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Helper function to create multi-dimensional arrays with an initial value.
// Uses eval for dynamic array creation based on provided dimensions.
function createMultiDimArray(initialValue) {
  var dimensions = arguments;
  var dimCount = dimensions.length;
  var arrayCreationString =
    "Array(dimensions[" +
    --dimCount +
    "]).fill(0).map(_element_ => {return " +
    initialValue +
    ";})";

  while (--dimCount) {
    arrayCreationString =
      "Array(dimensions[" +
      dimCount +
      "]).fill(0).map(_element_ => " +
      arrayCreationString +
      ")";
  }
  return eval(arrayCreationString);
}

// Execute the main graph processing logic and print the result.
console.log(processGraph());

// Main function to solve the graph problem.
function processGraph() {
  var nodeCount = inputReader.readSingleItem(); // Read the number of nodes.
  var adjacencyLists = createMultiDimArray("new Set()", nodeCount); // Create an array of Sets for adjacency lists.
  var activeNodes = new Set(); // Set to keep track of nodes that are still part of the graph.

  activeNodes.add(0); // Add the first node to the active set.

  // Read edges and build the adjacency list.
  for (var nodeIndex = 1; nodeIndex < nodeCount; nodeIndex++) {
    var edgeData = inputReader.readLineItems();
    var nodeA = edgeData[0] - 1; // Adjust to 0-indexed.
    var nodeB = edgeData[1] - 1; // Adjust to 0-indexed.

    adjacencyLists[nodeA].add(nodeB);
    adjacencyLists[nodeB].add(nodeA);
    activeNodes.add(nodeIndex); // Add current node to active set.
  }

  // Read the values to be assigned to nodes and sort them.
  var sortedValues = inputReader.readLineItems().sort((val1, val2) => val1 - val2);

  var valueIndex = 0; // Index for `sortedValues`.
  var totalSum = 0; // Accumulator for the sum of assigned values.
  var assignedValues = Array(nodeCount); // Array to store the final assigned values for each node.

  // Main loop: continues until all nodes have been processed.
  while (valueIndex < nodeCount) {
    var nodesToProcess = []; // Temporary list for nodes to be processed in this iteration.

    // Identify nodes with degree 1 (or 0 if isolated, though not expected in this problem context).
    for (var currentNode of activeNodes) {
      if (adjacencyLists[currentNode].size > 1) {
        continue; // Skip nodes with more than one neighbor.
      }
      nodesToProcess.push(currentNode); // Add "leaf-like" node to the list.
      assignedValues[currentNode] = sortedValues[valueIndex++]; // Assign the next smallest value.
      totalSum += assignedValues[currentNode]; // Add to the total sum.
    }

    // Remove processed nodes and their edges from the graph.
    for (var processedNode of nodesToProcess) {
      for (var neighborNode of adjacencyLists[processedNode]) {
        adjacencyLists[neighborNode].delete(processedNode); // Remove edge from neighbor's list.
      }
      activeNodes.delete(processedNode); // Remove node from the active set.
    }
  }

  // The problem asks for a specific sum calculation: totalSum minus the largest value.
  console.log(totalSum - sortedValues[nodeCount - 1]);

  // Return the assigned values as a space-separated string.
  return assignedValues.join(" ");
}
