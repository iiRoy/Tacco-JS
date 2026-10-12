var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  dataProcessor = initializeInputHandler(inputLines);
  console.error("\n");
  var startTime = Date.now();
  executeGraphAnalysis();
  var endTime = Date.now() - startTime;
  logDebugMessage("time : " + endTime + "ms");
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 0b10000000000) + "KB"); // 1024
});

// This function creates a deep copy of an object.
function createDeepCopy(originalObject){
  return JSON.parse(JSON.stringify(originalObject));
}

// Retrieves the next integer from the input stream.
function getNextInteger(){
  return convertInput(fetchNextLine(), 0b1);
}

// Retrieves the next line as an array of strings, split by spaces.
function getNextStringArray(){
  return convertInput(fetchNextLine(), 0b10);
}

// Retrieves the next line as an array of integers, split by spaces.
function getNextIntegerArray(){
  return convertInput(fetchNextLine(), 0b100);
}

// Retrieves the next line as an array of individual characters.
function getNextCharacterArray(){
  return convertInput(fetchNextLine(), 0b110);
}

// Fetches the next raw line of input from the processor.
function fetchNextLine(){
  return dataProcessor.next();
}

// Checks if there are more lines available for processing.
function hasMoreLines(){
  return dataProcessor.hasNext();
}

// Initializes the input handler with the provided array of lines.
function initializeInputHandler(rawInputArray){
  var handlerObject = {
    lineBuffer : rawInputArray,
    currentLineIndex : +[], // 0
    totalLines : rawInputArray.length,
    // Method to check for more input.
    hasNext : function(){
      return (this.currentLineIndex < this.totalLines);
    },
    // Method to get the next input line.
    next : function(){
      if(!this.hasNext()){
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      } else {
        var currentInputLine = this.lineBuffer[this.currentLineIndex++];
        return currentInputLine;
      }
    }
  };
  return handlerObject;
}

// Prints the given message to standard output.
function printOutput(messageContent){
  console.log(messageContent);
}

// Logs a debug message to standard error, inspecting the content.
function logDebugMessage(debugInfo){
  console.error("debug_info:" + require("util").inspect(debugInfo, !1, null)); // !1 is false
}

// Utility function to convert input based on a specified type.
// conversionType:
// 1: Parse as integer.
// 2: Split by spaces.
// 4: Split by spaces and convert to numbers.
// 6: Split into individual characters.
// 7: Split into individual characters and convert to numbers.
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without any separator.
function convertInput(inputValue, conversionType){
  try {
    switch(conversionType){
      case 0b1: return parseInt(inputValue);
      case 0b10: return inputValue.split(" ");
      case 0b100: return inputValue.split(" ").map(Number);
      case 0b110: return inputValue.split("");
      case 0b111: return inputValue.split("").map(Number);
      case 0b1000: return inputValue.join(" ");
      case 0b1001: return inputValue.join("\n");
      case 0b0: return inputValue.join("");
      default: return inputValue;
    }
  } catch(error){
    return inputValue;
  }
}

// Main function encapsulating the graph analysis algorithm.
function executeGraphAnalysis(){
  var nodeCount = getNextInteger();
  var graphNodes = new Array(nodeCount);

  // Initialize each node object with default properties.
  for(var idxA = +[]; idxA < nodeCount; idxA++){
    graphNodes[idxA] = {
      nodeIdentifier : idxA,
      adjacentNodes : [],
      visitedStatus : !1, // false
      nodeDepth : 0b1     // 1
    };
  }

  // Populate adjacency lists based on the input matrix.
  for(var idxA = +[]; idxA < nodeCount; idxA++){
    var adjacencyRow = getNextCharacterArray();
    for(var idxB = +[]; idxB < nodeCount; idxB++){
      if(idxA !== idxB && adjacencyRow[idxB] === "1"){
        graphNodes[idxA].adjacentNodes.push(idxB);
      }
    }
  }

  var finalResult = ~0; // -1
  var overallMaxDepth = ~0; // -1
  var preservedGraphState; // This variable is assigned but never used.

  // Perform BFS from each node to determine the maximum depth reachable.
  for(var idxA = +[]; idxA < nodeCount; idxA++){
    var currentDepth = breadthFirstSearch(idxA);
    if(overallMaxDepth < currentDepth){
      preservedGraphState = graphNodes; // Unused assignment.
      overallMaxDepth = currentDepth;
    }
  }

  // Check for parity condition for mutually connected nodes.
  for(var idxA = +[]; idxA < nodeCount - 0b1; idxA++){ // N - 1
    for(var idxB = idxA + 0b1; idxB < nodeCount; idxB++){ // j = i + 1
      // If nodes idxA and idxB are mutually connected.
      if(graphNodes[idxA].adjacentNodes.indexOf(idxB) !== ~0 && graphNodes[idxB].adjacentNodes.indexOf(idxA) !== ~0){ // -1
        // If their depths have the same parity (both even or both odd).
        if(graphNodes[idxA].nodeDepth % 0b10 === graphNodes[idxB].nodeDepth % 0b10){ // % 2
          printOutput(~0); // Output -1 and terminate.
          return;
        }
      }
    }
  }

  printOutput(overallMaxDepth); // Output the calculated maximum depth.

  // Breadth-First Search algorithm implementation.
  function breadthFirstSearch(startNodeIndex){
    // Reset visited status and depth for all nodes before starting a new BFS.
    for(var idxC = +[]; idxC < nodeCount; idxC++){
      graphNodes[idxC].visitedStatus = !1; // false
      graphNodes[idxC].nodeDepth = 0b1; // 1
    }

    var bfsQueue = [startNodeIndex];
    graphNodes[startNodeIndex].visitedStatus = !0; // Mark the starting node as visited.

    var currentMaxDepth = +[]; // 0

    // Process nodes in the queue until it's empty.
    while(bfsQueue.length > +[]){ // while queue is not empty
      var currentNodeIndex = bfsQueue.shift(); // Dequeue the front node.
      var currentChildren = graphNodes[currentNodeIndex].adjacentNodes; // Get its adjacent nodes.

      currentMaxDepth = graphNodes[currentNodeIndex].nodeDepth; // Update the maximum depth found in this BFS.

      // Iterate through the children of the current node.
      for(var idxC = +[]; idxC < currentChildren.length; idxC++){
        // If a child node has not been visited yet.
        if(!graphNodes[currentChildren[idxC]].visitedStatus){
          graphNodes[currentChildren[idxC]].visitedStatus = !0; // Mark as visited.
          graphNodes[currentChildren[idxC]].nodeDepth = graphNodes[currentNodeIndex].nodeDepth + 0b1; // Set its depth.
          bfsQueue.push(currentChildren[idxC]); // Enqueue the child for further processing.
        }
      }
    }
    return currentMaxDepth; // Return the maximum depth reached from the startNodeIndex.
  }
}
