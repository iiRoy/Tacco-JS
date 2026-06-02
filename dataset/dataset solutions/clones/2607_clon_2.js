var acquireInput=(function(){
  // Factory function to create an input reader instance.
  function createInputReader(sourceText){
    return new InputProcessor(sourceText);
  }

  // Constructor for the input processor.
  function InputProcessor(sourceText){
    this.sourceLines = sourceText.trim().split("\n"); // Store lines of input.
    this.currentLineIndex = 0; // Current line being processed.
  }

  // Reads the next token from the current line.
  InputProcessor.prototype.readNextToken=function(returnAsString){
    var lineData = this.sourceLines;
    var currentIndex = this.currentLineIndex;
    var resultValue;

    // If the current line hasn't been split into tokens yet, do it.
    if(typeof lineData[currentIndex] === "string") {
      lineData[currentIndex] = lineData[currentIndex].split(" ").reverse();
    }

    resultValue = lineData[currentIndex].pop(); // Get the last token.

    // If the current line is exhausted, move to the next line.
    if(!lineData[currentIndex].length) {
      this.currentLineIndex++;
    }

    // Return as string or number.
    return returnAsString ? resultValue : +resultValue;
  };

  // Reads all tokens from the current line.
  InputProcessor.prototype.readLineTokens=function(returnAsString){
    var tokens = this.sourceLines[this.currentLineIndex++].split(" ");
    return returnAsString ? tokens : tokens.map(item => +item);
  };

  // Reads a matrix of 'numLines' lines.
  InputProcessor.prototype.readMatrix=function(numLines, returnAsString){
    var matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex += numLines).map(item => item.split(" "));
    return returnAsString ? matrixRows : matrixRows.map(item => item.map(item => +item));
  };

  // Reads 'numLines' lines as individual strings or numbers.
  InputProcessor.prototype.readRows=function(numLines, returnAsString){
    var rows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex += numLines);
    return returnAsString ? rows : rows.map(item => +item);
  };

  return createInputReader;
})();

var inputHandler = acquireInput(require("fs").readFileSync("/dev/stdin", "utf8"));

// Dynamically creates a multi-dimensional array with a specified initial value.
function createMultiDimArray(initialValue) {
  var dimensions = arguments;
  var dimCount = dimensions.length;
  var arrayCreationString = "Array(dimensions[" + --dimCount + "]).fill(0).map(element => { return " + initialValue + "; })";
  while (--dimCount) {
    arrayCreationString = "Array(dimensions[" + dimCount + "]).fill(0).map(element => " + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

console.log(executeSolution());

function executeSolution() {
  var numElements = inputHandler.readNextToken(); // Read the number of elements.
  // Initialize a graph structure for n*(n-1)/2 potential edges.
  var dependencyGraph = createMultiDimArray("{from:[],to:[]}", numElements * (numElements - 1) / 2);

  // Process input lines to build the graph.
  for (var outerLoopIndex = 0; outerLoopIndex < numElements; outerLoopIndex++) {
    var currentLineValues = inputHandler.readLineTokens(); // Read a line of tokens.
    var prevNodeIndex = calculateEdgeIndex(currentLineValues[0] - 1, outerLoopIndex); // Calculate initial edge index.

    // Iterate through the rest of the line to establish dependencies.
    for (var innerLoopIndex = 1; innerLoopIndex < numElements - 1; innerLoopIndex++) {
      var currNodeIndex = calculateEdgeIndex(currentLineValues[innerLoopIndex] - 1, outerLoopIndex);
      dependencyGraph[prevNodeIndex].to.push(currNodeIndex); // Add 'to' dependency.
      dependencyGraph[currNodeIndex].from.push(prevNodeIndex); // Add 'from' dependency.
      prevNodeIndex = currNodeIndex; // Update previous node for next iteration.
    }
  }

  // Perform topological sort on the constructed graph.
  var sortedResult = performTopologicalSort(dependencyGraph);

  // Check if a cycle was detected (indicated by -1).
  if (sortedResult === -1) {
    return -1;
  }

  // Return the maximum depth found in the topological sort, plus one.
  return sortedResult[sortedResult.length - 1][1] + 1;
}

// Helper function to calculate a unique index for an edge between two nodes.
function calculateEdgeIndex(nodeA, nodeB) {
  var maxValue = Math.max(nodeA, nodeB);
  // This formula maps pairs (a,b) to a unique integer, often used for triangular numbers.
  return (maxValue * (maxValue - 1) >> 1) + Math.min(nodeA, nodeB);
}

// Performs a topological sort on the given graph and calculates depths.
function performTopologicalSort(inputGraph) {
  var graphSize = inputGraph.length;
  var inDegreeCounts = Array(graphSize).fill(0); // Stores the number of incoming edges for each node.
  var depthLevels = Array(graphSize).fill(0); // Stores the depth of each node in the topological order.
  var processingQueue = []; // Queue for nodes ready to be processed.

  // Initialize in-degrees and populate the queue with nodes having no incoming edges.
  for (var loopCounter = 0; loopCounter < graphSize; loopCounter++) {
    if (inputGraph[loopCounter].from.length) {
      inDegreeCounts[loopCounter] = inputGraph[loopCounter].from.length;
    } else {
      processingQueue.push([loopCounter, 0]); // Node, depth
    }
  }

  // Process nodes in topological order.
  for (loopCounter = 0; loopCounter < processingQueue.length; loopCounter++) {
    var currentNode = processingQueue[loopCounter][0]; // Get the current node from the queue.

    // Iterate through all neighbors of the current node.
    for (var neighborIndex = 0; neighborIndex < inputGraph[currentNode].to.length; neighborIndex++) {
      var neighborNode = inputGraph[currentNode].to[neighborIndex];

      // Update the depth of the neighbor node.
      if (depthLevels[neighborNode] <= depthLevels[currentNode]) {
        depthLevels[neighborNode] = depthLevels[currentNode] + 1;
      }

      // Decrement in-degree of the neighbor. If it becomes zero, add to queue.
      if (--inDegreeCounts[neighborNode] === 0) {
        processingQueue.push([neighborNode, depthLevels[neighborNode]]);
      }
    }
  }

  // If the number of processed nodes is less than the total, a cycle exists.
  return processingQueue.length < graphSize ? -1 : processingQueue;
}
