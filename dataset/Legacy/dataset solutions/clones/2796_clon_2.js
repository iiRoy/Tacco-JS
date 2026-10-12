// This section handles input/output operations.
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor; // Will hold the utility for processing input lines.
var bufferedLines = []; // Stores all lines read from stdin.

inputReader.on('line', function(currentLine){
  bufferedLines.push(currentLine);
});

inputReader.on('close', function(){
  inputProcessor = initializeInputHandler(bufferedLines);
  console.error("\n"); // Prints a newline to stderr for formatting.

  var startTime = Date.now();
  executeProgram(); // Call the main logic function.
  var elapsedTime = Date.now() - startTime;

  logDebug("time : " + elapsedTime + "ms");
  logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Utility function to create a deep copy of an object.
function duplicateObject(originalObj){
  return JSON.parse(JSON.stringify(originalObj));
}

// Input parsing functions.
function retrieveInteger(){
  return convertInput(fetchNextItem(), 1);
}

function retrieveStringArray(){
  return convertInput(fetchNextItem(), 2);
}

function retrieveIntegerArray(){
  return convertInput(fetchNextItem(), 4);
}

function retrieveCharacterArray(){
  return convertInput(fetchNextItem(), 6);
}

// Core input retrieval functions.
function fetchNextItem(){
  return inputProcessor.getNextLine();
}

function hasMoreItems(){
  return inputProcessor.checkAvailability();
}

// Initializes the input handling object.
function initializeInputHandler(dataLines){
  var handlerInstance = {
    lineCollection : dataLines,
    currentPosition : 0,
    totalLines : dataLines.length,

    checkAvailability : function(){
      return (this.currentPosition < this.totalLines);
    },

    getNextLine : function(){
      if(!this.checkAvailability()){
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      } else {
        var extractedLine = this.lineCollection[this.currentPosition++];
        return extractedLine;
      }
    }
  };
  return handlerInstance;
}

// Output function for results.
function printResult(content){
  console.log(content);
}

// Debug logging function.
function logDebug(message){
  console.error("debug:" + require("util").inspect(message, false, null));
}

// Input conversion utility.
// 'conversionType' parameter:
// 1: parseInt
// 2: split by space
// 4: split by space and map to Number
// 6: split by character
// 7: split by character and map to Number
// 8: join by space
// 9: join by newline
// 0: join with no character
// default: return as is
function convertInput(inputVal, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(inputVal);
      case 2: return inputVal.split(" ");
      case 4: return inputVal.split(" ").map(Number);
      case 6: return inputVal.split("");
      case 7: return inputVal.split("").map(Number);
      case 8: return inputVal.join(" ");
      case 9: return inputVal.join("\n");
      case 0: return inputVal.join("");
      default: return inputVal;
    }
  } catch(e) {
    return inputVal;
  }
}

// Main program logic starts here.
function executeProgram(){
  var firstLineData = retrieveIntegerArray();
  var nodeCount = firstLineData[0];
  var edgeCount = firstLineData[1];

  var graphStructure = new Array(nodeCount);
  var processedGraph = new Array(nodeCount);

  for(var idx = 0; idx < nodeCount; idx++){
    graphStructure[idx] = {
      successors : []
    };
    processedGraph[idx] = {
      predecessors : new Set(),
      visitedFlag : false,
      levelValue : 0
    };
  }

  for(var idx = 0; idx < edgeCount; idx++){
    var tempValues = retrieveIntegerArray();
    graphStructure[tempValues[0] - 1].successors.push(tempValues[1] - 1);
  }

  // Perform DFS for each node as root to populate 'predecessors' based on depth 3 paths.
  for(var idx = 0; idx < nodeCount; idx++){
    performDfs(idx, idx, 0);
  }

  var tempValues = retrieveIntegerArray();
  var startNodeIdx = tempValues[0] - 1;
  var targetNodeIdx = tempValues[1] - 1;

  var queueFront = 0;
  var queueRear = 1;
  var bfsQueue = new Array(100007); // Pre-allocate a large array for the queue.

  bfsQueue[0] = targetNodeIdx;
  processedGraph[targetNodeIdx].visitedFlag = true;

  var finalDistance = -1;

  // BFS traversal to find the shortest path from targetNodeIdx to startNodeIdx
  // using the 'predecessors' (which are actually nodes that can reach 'now' in 3 steps).
  while(queueFront !== queueRear){
    var currentNode = bfsQueue[queueFront];
    queueFront++;

    if(currentNode === startNodeIdx){
      finalDistance = processedGraph[currentNode].levelValue;
      break;
    }

    var parentNodes = Array.from(processedGraph[currentNode].predecessors);
    for(var idx = 0; idx < parentNodes.length; idx++){
      if(!processedGraph[parentNodes[idx]].visitedFlag){
        processedGraph[parentNodes[idx]].visitedFlag = true;
        processedGraph[parentNodes[idx]].levelValue = processedGraph[currentNode].levelValue + 1;
        bfsQueue[queueRear] = parentNodes[idx];
        queueRear++;
      }
    }
  }

  // logDebug(graphStructure); // Original graph structure (commented out debug)
  // logDebug(processedGraph); // Transformed graph structure (commented out debug)
  printResult(finalDistance);


  // Nested DFS function to build the 'predecessors' set in processedGraph.
  // It finds nodes 'originNode' that can reach 'currentNodeDfs' in exactly 3 steps.
  function performDfs(originNode, currentNodeDfs, currentDepth){
    if(currentDepth === 3){
      processedGraph[currentNodeDfs].predecessors.add(originNode);
      return;
    }

    var childrenNodes = graphStructure[currentNodeDfs].successors;
    for(var childIdx = 0; childIdx < childrenNodes.length; childIdx++){
      performDfs(originNode, childrenNodes[childIdx], currentDepth + 1);
    }
    return;
  }
}
