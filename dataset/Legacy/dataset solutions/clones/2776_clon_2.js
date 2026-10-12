var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor;
var inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  inputProcessor = initializeInputHandler(inputLines);
  console.error('\n↑Input ↓Output'); // Critical string, must be identical
  executeMainLogic();
});

// Utility to create a deep copy of an object or Set
function createDeepCopy(originalObject){
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

// Functions for fetching and converting input tokens
function retrieveInteger(){ return convertInputData(fetchNextToken(), 1); }
function retrieveStringArray(){ return convertInputData(fetchNextToken(), 2); }
function retrieveIntegerArray(){ return convertInputData(fetchNextToken(), 4); }
function retrieveCharacterArray(){ return convertInputData(fetchNextToken(), 6); }

function fetchNextToken(){ return inputProcessor.getNextLine(); }
function hasMoreTokens(){ return inputProcessor.hasMoreData(); }

// Sets up the input handler object
function initializeInputHandler(dataInput){
  return {
    dataLines : dataInput,
    currentPosition : 0,
    totalLines : dataInput.length,
    hasMoreData : function(){
      return (this.currentPosition < this.totalLines);
    },
    getNextLine : function(){
      if(this.hasMoreData()){
        return this.dataLines[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input'; // Critical string
      }
    }
  };
}

// Prints the final result to standard output
function printResult(outputValue){
  console.log(outputValue);
}

// Logs debug messages to standard error
function logDebugMessage(debugContent){
  console.error('debug:' + require('util').inspect(debugContent, false, null)); // Critical string
}

// Converts input based on a specified format code
// Format codes:
// 1: Parse as integer
// 2: Split by space
// 4: Split by space and parse as integers
// 6: Split into individual characters
// 7: Split into individual characters and parse as integers
// 8: Join array elements with space
// 9: Join array elements with newline
// 0: Join array elements without separator
// Default: Return input as is
function convertInputData(inputItem, formatCode){
  try {
    switch(formatCode){
      case 1: return parseInt(inputItem);
      case 2: return inputItem.split(' ');
      case 4: return inputItem.split(' ').map(Number);
      case 6: return inputItem.split('');
      case 7: return inputItem.split('').map(Number);
      case 8: return inputItem.join(' ');
      case 9: return inputItem.join('\n');
      case 0: return inputItem.join('');
      default: return inputItem;
    }
  } catch(error) {
    return inputItem;
  }
}

// Main program execution starts here
function executeMainLogic(){
  var firstInput = retrieveIntegerArray();
  var nodeCount = firstInput[0];
  var colorLimit = firstInput[1];

  var nodeRegistry = new Array(nodeCount);
  for(var idx = 0; idx < nodeCount; idx++){
    nodeRegistry[idx] = {
      connections : [],
      nodeIdentifier : idx,
      assignedColorCount : 0,
      isVisited : false
    };
  }

  for(var idx = 0; idx < nodeCount - 1; idx++){
    var tempValues = retrieveIntegerArray();
    nodeRegistry[tempValues[0] - 1].connections.push(tempValues[1] - 1);
    nodeRegistry[tempValues[1] - 1].connections.push(tempValues[0] - 1);
  }

  var finalProduct = 1;
  var moduloValue = 1000000007;

  nodeRegistry[0].isVisited = true;

  // Iterative traversal using a stack (similar to BFS/DFS)
  var processingStack = [[0, colorLimit, 0]]; // [parent_count, available_colors, current_node_index]

  while(processingStack.length > 0){
    var currentProcessingState = processingStack.pop();
    var parentVisitedCount = currentProcessingState[0];
    var availableColors = currentProcessingState[1];
    var currentNodeIndex = currentProcessingState[2];

    nodeRegistry[currentNodeIndex].assignedColorCount = availableColors;

    if(parentVisitedCount < 2){
      parentVisitedCount++;
    }

    var connectedNodes = nodeRegistry[currentNodeIndex].connections;
    var processedChildrenCount = 0;

    for(var idx = 0; idx < connectedNodes.length; idx++){
      if(!nodeRegistry[connectedNodes[idx]].isVisited){
        nodeRegistry[connectedNodes[idx]].isVisited = true;
        processingStack.push([parentVisitedCount, colorLimit - processedChildrenCount - parentVisitedCount, connectedNodes[idx]]);
        processedChildrenCount++;
      }
    }
  }

  // Calculate the final product modulo `moduloValue`
  for(var idx = 0; idx < nodeCount; idx++){
    finalProduct *= nodeRegistry[idx].assignedColorCount;
    finalProduct %= moduloValue;
    if(finalProduct === 0){
      break;
    }
  }

  printResult(finalProduct);

  // This recursive function is defined but not used in the Main logic.
  // It's kept for structural equivalence.
  function recursiveTraversal(parentPathLength, remainingColors, currentVertex, initialColorLimit){
    nodeRegistry[currentVertex].assignedColorCount = remainingColors;
    if(parentPathLength < 2){
      parentPathLength++;
    }
    var adjacentVertices = nodeRegistry[currentVertex].connections;
    var successfulExpansions = 0;
    for(var idx = 0; idx < adjacentVertices.length; idx++){
      if(!nodeRegistry[adjacentVertices[idx]].isVisited){
        nodeRegistry[adjacentVertices[idx]].isVisited = true;
        recursiveTraversal(parentPathLength, initialColorLimit - successfulExpansions - parentPathLength, adjacentVertices[idx], initialColorLimit);
        successfulExpansions++;
      }
    }
  }
}
