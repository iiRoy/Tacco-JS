var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataHandler;
var inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  dataHandler = initializeInputProcessor(inputLines);
  console.error('\n');
  var startTime = Date.now();
  processMainLogic();
  var elapsedTime = Date.now() - startTime;
  logDebugMessage('time : ' + elapsedTime + 'ms');
  logDebugMessage('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

function createDeepCopy(originalObject){
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

function getNextInteger(){
  return convertInput(fetchNextToken(), 1);
}

function getNextStringArray(){
  return convertInput(fetchNextToken(), 2);
}

function getNextIntegerArray(){
  return convertInput(fetchNextToken(), 4);
}

function getNextCharacterArray(){
  return convertInput(fetchNextToken(), 6);
}

function fetchNextToken(){
  return dataHandler.retrieveNext();
}

function hasMoreTokens(){
  return dataHandler.checkAvailability();
}

function initializeInputProcessor(inputArray){
  return {
    sourceData : inputArray,
    currentPosition : 0,
    maximumLength : inputArray.length,
    checkAvailability : function(){
      return (this.currentPosition < this.maximumLength);
    },
    retrieveNext : function(){
      if(this.checkAvailability()){
        return this.sourceData[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function printOutput(message){
  console.log(message);
}

function logDebugMessage(messageContent){
  console.error('debug:' + require('util').inspect(messageContent, false, null));
}

// The 'conversionType' parameter dictates the transformation:
// - 1: Parse as integer.
// - 2: Split by space.
// - 4: Split by space and parse each as integer.
// - 6: Split into individual characters.
// - 7: Split into individual characters and parse each as integer.
// - 8: Join elements with a space.
// - 9: Join elements with a newline.
// - 0: Join elements without any separator.
// - Default: Return input as is.
function convertInput(inputItem, conversionType){
  try {
    switch(conversionType){
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
  } catch(error){
    return inputItem;
  }
}

function processMainLogic(){
  var nodeCount = getNextInteger();
  var nodeDetails = new Array(nodeCount);
  var resultValues = new Array(nodeCount);

  // Initialize each node's properties
  for(var idx = 0; idx < nodeCount; idx++){
    nodeDetails[idx] = {
      nodeDepth : null,
      visitedStatus : false,
      connectedNodes : [],
      assignedValue : -1
    };
  }

  var firstCounter = 1;
  var secondCounter = 2;
  var thirdCounter = 3;

  // Read edges and build adjacency list
  for(var idx = 0; idx < nodeCount - 1; idx++){
    var tempEdge = getNextIntegerArray();
    nodeDetails[tempEdge[0] - 1].connectedNodes.push(tempEdge[1] - 1);
    nodeDetails[tempEdge[1] - 1].connectedNodes.push(tempEdge[0] - 1);
  }

  var bfsQueue = new Array(nodeCount + 5);
  var queueFront = 0;
  var queueRear = 1;

  // Start BFS from node 0
  bfsQueue[0] = 0;
  nodeDetails[0].visitedStatus = true;
  nodeDetails[0].nodeDepth = 1;

  var oddLevelCount = 0;
  var evenLevelCount = 0;

  // Perform Breadth-First Search
  while(queueFront !== queueRear){
    var currentNodeIdx = bfsQueue[queueFront++];
    if(nodeDetails[currentNodeIdx].nodeDepth % 2 === 1){
      oddLevelCount++;
    } else {
      evenLevelCount++;
    }

    var currentChildren = nodeDetails[currentNodeIdx].connectedNodes;
    for(var idx = 0; idx < currentChildren.length; idx++){
      if(!nodeDetails[currentChildren[idx]].visitedStatus){
        nodeDetails[currentChildren[idx]].visitedStatus = true;
        nodeDetails[currentChildren[idx]].nodeDepth = nodeDetails[currentNodeIdx].nodeDepth + 1;
        bfsQueue[queueRear++] = currentChildren[idx];
      }
    }
  }

  // Assign values based on depth parity and counts
  if(oddLevelCount > (nodeCount / 3) && evenLevelCount > (nodeCount / 3)){
    for(var idx = 0; idx < nodeCount; idx++){
      if(nodeDetails[idx].nodeDepth % 2 === 1){
        if(firstCounter <= nodeCount){
          nodeDetails[idx].assignedValue = firstCounter;
          firstCounter += 3;
        }
      } else {
        if(secondCounter <= nodeCount){
          nodeDetails[idx].assignedValue = secondCounter;
          secondCounter += 3;
        }
      }
    }
  } else {
    for(var idx = 0; idx < nodeCount; idx++){
      if(oddLevelCount < evenLevelCount){
        if(nodeDetails[idx].nodeDepth % 2 === 1){
          nodeDetails[idx].assignedValue = thirdCounter;
          thirdCounter += 3;
        }
      } else {
        if(nodeDetails[idx].nodeDepth % 2 === 0){
          nodeDetails[idx].assignedValue = thirdCounter;
          thirdCounter += 3;
        }
      }
    }
  }

  // Fill in any remaining unassigned values
  for(var idx = 0; idx < nodeCount; idx++){
    if(nodeDetails[idx].assignedValue === -1){
      if(firstCounter <= nodeCount){
        nodeDetails[idx].assignedValue = firstCounter;
        firstCounter += 3;
      } else if(secondCounter <= nodeCount){
        nodeDetails[idx].assignedValue = secondCounter;
        secondCounter += 3;
      } else if(thirdCounter <= nodeCount){
        nodeDetails[idx].assignedValue = thirdCounter;
        thirdCounter += 3;
      }
    }
    resultValues[idx] = nodeDetails[idx].assignedValue;
  }

  printOutput(convertInput(resultValues, 8));
}
