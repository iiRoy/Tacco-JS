var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor;
var inputLines = [];

inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

inputReader.on('close', function() {
  inputProcessor = initializeInputHandler(inputLines);
  console.error("\n"); // Add a newline for cleaner debug output separation
  var startTime = Date.now();
  executeAlgorithm();
  var endTime = Date.now() - startTime;
  logDebugMessage("time : " + endTime + "ms");
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Utility function to create a deep copy of an object
function createDeepCopy(originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}

// Helper functions for parsing different input types
function getNextInteger() {
  return convertInput(fetchNextLine(), 1);
}

function getNextStringArray() {
  return convertInput(fetchNextLine(), 2);
}

function getNextIntegerArray() {
  return convertInput(fetchNextLine(), 4);
}

function getNextCharacterArray() {
  return convertInput(fetchNextLine(), 6);
}

function fetchNextLine() {
  return inputProcessor.next();
}

function hasMoreLines() {
  return inputProcessor.hasMoreLines();
}

// Initializes the input handler with provided lines
function initializeInputHandler(inputData) {
  var handlerObject = {
    dataLines: inputData,
    currentLineIndex: 0,
    totalLines: inputData.length,
    hasMoreLines: function() {
      return (this.currentLineIndex < this.totalLines);
    },
    next: function() {
      if (!this.hasMoreLines()) {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      } else {
        var retrievedLine = this.dataLines[this.currentLineIndex++];
        return retrievedLine;
      }
    }
  };
  return handlerObject;
}

// Function to print the final result to standard output
function printResult(dataToPrint) {
  console.log(dataToPrint);
}

// Function to log debug messages to standard error
function logDebugMessage(messageContent) {
  console.error("debug:" + require("util").inspect(messageContent, false, null));
}

// Generic input conversion utility based on a type code
// conversionType:
//   1: Parse as integer
//   2: Split string by spaces
//   4: Split string by spaces and convert parts to numbers
//   6: Split string into individual characters
//   7: Split string into individual characters and convert to numbers
//   8: Join array elements with spaces
//   9: Join array elements with newlines
//   0: Join array elements without any separator
function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map(Number);
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map(Number);
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (error) {
    return inputValue;
  }
}

// Main function containing the algorithm logic
function executeAlgorithm() {
  var firstInputRow = getNextIntegerArray();
  var nodeCount = firstInputRow[0];
  var edgeCount = firstInputRow[1];

  // Initialize graph nodes with properties
  var graphNodes = new Array(nodeCount);
  for (var idx = 0; idx < nodeCount; idx++) {
    graphNodes[idx] = {
      childrenNodes: [],
      parentNodes: new Set(),
      visitedStatus: false,
      pathLength: 0
    };
  }

  // Populate graph edges based on input
  for (var idx = 0; idx < edgeCount; idx++) {
    var tempValues = getNextIntegerArray();
    graphNodes[tempValues[0] - 1].childrenNodes.push(tempValues[1] - 1);
  }

  // Perform Depth-First Search from each node to find parents within 3 steps
  for (var idx = 0; idx < nodeCount; idx++) {
    explorePath(idx, idx, 0);
  }

  // Get the start and target nodes for the BFS
  var tempValues = getNextIntegerArray();
  var startNodeIdx = tempValues[0] - 1;
  var targetNodeIdx = tempValues[1] - 1;

  // Initialize BFS queue and state
  var bfsQueue = [targetNodeIdx];
  graphNodes[targetNodeIdx].visitedStatus = true;
  var shortestPathResult = 0;

  // Execute Breadth-First Search
  while (bfsQueue.length > 0) {
    var currentNodeIdx = bfsQueue.shift();

    if (currentNodeIdx === startNodeIdx) {
      shortestPathResult = graphNodes[currentNodeIdx].pathLength;
      break;
    }

    var currentParents = Array.from(graphNodes[currentNodeIdx].parentNodes);
    for (var childIdx = 0; childIdx < currentParents.length; childIdx++) {
      if (!graphNodes[currentParents[childIdx]].visitedStatus) {
        graphNodes[currentParents[childIdx]].visitedStatus = true;
        graphNodes[currentParents[childIdx]].pathLength = graphNodes[currentNodeIdx].pathLength + 1;
        bfsQueue.push(currentParents[childIdx]);
      }
    }
  }

  // Output the final result
  // logDebugMessage(graphNodes); // Original code had this commented out
  if (shortestPathResult === 0) {
    printResult(-1);
  } else {
    printResult(shortestPathResult);
  }

  // Recursive Depth-First Search helper function
  function explorePath(initialNode, currentNode, currentDepth) {
    // Base case: if the depth limit is reached, add the initial node as a parent
    if (currentDepth === 3) {
      graphNodes[currentNode].parentNodes.add(initialNode);
      return;
    }

    // Recursively visit children nodes
    var childrenOfCurrent = graphNodes[currentNode].childrenNodes;
    for (var childIdx = 0; childIdx < childrenOfCurrent.length; childIdx++) {
      explorePath(initialNode, childrenOfCurrent[childIdx], currentDepth + 1);
    }
    return;
  }
}
