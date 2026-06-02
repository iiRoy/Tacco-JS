var INPUT_PARSER = (function () {
  // This function acts as a factory for creating an InputReader instance.
  function createParser(sourceText) {
    return new InputReader(sourceText);
  }

  // The InputReader class handles parsing various types of input from a string.
  function InputReader(initialString) {
    // Store the input string, trimmed and split into individual lines.
    this.processedLines = initialString.trim().split("\n");
    // Keep track of the current line being processed.
    this.currentLineIndex = 0;
  }

  // Method to read a single value from the current line.
  // If the line is exhausted, it moves to the next line.
  // 'asString' flag determines if the value should be returned as a string or number.
  InputReader.prototype.readSingleValue = function (asString) {
    var lineData = this.processedLines;
    var lineIdx = this.currentLineIndex;
    var extractedValue;

    // If the current line hasn't been processed into an array of values yet, do so.
    // Values are reversed to allow efficient popping from the end.
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    // Pop the last value from the current line's array.
    extractedValue = lineData[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineData[lineIdx].length) {
      this.currentLineIndex++;
    }

    // Return the value, converting to a number if 'asString' is false.
    return asString ? extractedValue : +extractedValue;
  };

  // Method to read an entire line and return its space-separated values.
  // 'asString' flag determines if values should be returned as strings or numbers.
  InputReader.prototype.readLineValues = function (asString) {
    // Get the current line, split it by spaces, and advance the line index.
    var lineContent = this.processedLines[this.currentLineIndex++].split(" ");
    // Return values, converting to numbers if 'asString' is false.
    return asString ? lineContent : lineContent.map((val) => +val);
  };

  // Method to read 'numRows' lines, where each line contains space-separated values,
  // forming a 2D array (matrix).
  // 'asString' flag determines if values should be returned as strings or numbers.
  InputReader.prototype.readMatrix = function (numRows, asString) {
    // Extract the specified number of lines.
    var matrixRows = this.processedLines.slice(
      this.currentLineIndex,
      (this.currentLineIndex += numRows)
    );
    // Split each line by space.
    // Convert values to numbers if 'asString' is false.
    return asString
      ? matrixRows.map((row) => row.split(" "))
      : matrixRows.map((row) => row.split(" ").map((val) => +val));
  };

  // Method to read 'numRows' lines as a 1D array of values.
  // 'asString' flag determines if values should be returned as strings or numbers.
  InputReader.prototype.readLines = function (numRows, asString) {
    // Extract the specified number of lines.
    var rawRows = this.processedLines.slice(
      this.currentLineIndex,
      (this.currentLineIndex += numRows)
    );
    // Convert values to numbers if 'asString' is false.
    return asString ? rawRows : rawRows.map((val) => +val);
  };

  return createParser;
})();

// Initialize the input source by reading from standard input.
var inputSource = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Output the result of the main problem-solving function.
console.log(solveProblem());

// The primary function containing the problem's logic.
function solveProblem() {
  // Read the total number of nodes (N).
  var nodeCount = inputSource.readSingleValue();
  // Read the total number of edges (M).
  var edgeCount = inputSource.readSingleValue();
  // Read all M edges, where each edge is a pair [source, destination].
  var edgeList = inputSource.readMatrix(edgeCount);

  // 'isRootCandidate' array:
  // Initially, all nodes are considered potential roots (value 1).
  // If a node is a source of an edge, it's marked 0, meaning it's not a root.
  var isRootCandidate = Array(nodeCount + 1).fill(1);

  // 'incomingEdgesMap' array:
  // An adjacency list where incomingEdgesMap[destination] stores a list of sources
  // that have an edge pointing to 'destination'.
  var incomingEdgesMap = Array(nodeCount + 1)
    .fill(0)
    .map((_) => []);

  // Process each edge to populate 'isRootCandidate' and 'incomingEdgesMap'.
  for (var idx = 0; idx < edgeCount; idx++) {
    var sourceNode = edgeList[idx][0];
    var destinationNode = edgeList[idx][1];

    // Mark the source node as not a root candidate.
    isRootCandidate[sourceNode] = 0;
    // Add the source node to the list of nodes pointing to the destination.
    incomingEdgesMap[destinationNode].push(sourceNode);
  }

  // 'resultSteps' will store the final answer, initialized to -1.
  var resultSteps = -1;
  // 'currentLayerNodes' will hold nodes being processed in the current step/layer.
  var currentLayerNodes = [];

  // Identify initial root nodes (nodes that are not sources of any edge).
  for (idx = 1; idx <= nodeCount; idx++) {
    if (isRootCandidate[idx]) {
      currentLayerNodes.push(idx);
    }
  }

  // Main loop: continues as long as there are nodes to process in the current layer.
  while (currentLayerNodes.length) {
    // 'nextLayerNodes' will collect nodes for the subsequent layer.
    var nextLayerNodes = [];
    // 'visitedInLayer' tracks nodes processed within the current layer iteration.
    // It's reset for each new layer.
    var visitedInLayer = Array(nodeCount + 1).fill(0);

    // Increment the step counter for each new layer.
    resultSteps++;

    // Iterate through all nodes in the current layer.
    for (idx = 0; idx < currentLayerNodes.length; idx++) {
      var currentNode = currentLayerNodes[idx];

      // If this node has already been processed in this layer, skip it.
      if (visitedInLayer[currentNode]) {
        continue;
      }
      // Mark the current node as visited for this layer.
      visitedInLayer[currentNode] = 1;

      // Add all nodes that point to 'currentNode' into 'nextLayerNodes'.
      // This effectively traverses the graph in reverse.
      nextLayerNodes.push(...incomingEdgesMap[currentNode]);
    }
    // Update 'currentLayerNodes' to be the nodes found for the next layer.
    currentLayerNodes = nextLayerNodes;
  }

  // Return the total number of steps/layers.
  return resultSteps;
}
