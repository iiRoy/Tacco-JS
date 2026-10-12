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
  console.error('\n↑ Input ↓ Output');
  executeMainLogic();
});

function createDeepCopy(originalObject){
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

function getNextInteger(){ return convertInput(fetchNextItem(), 1); }
function getNextStringArray(){ return convertInput(fetchNextItem(), 2); }
function getNextIntegerArray(){ return convertInput(fetchNextItem(), 4); }
function getNextCharacterArray(){ return convertInput(fetchNextItem(), 6); }

function fetchNextItem(){ return dataHandler.fetchNextItem(); }
function hasMoreItems(){ return dataHandler.hasMoreItems(); }

function initializeInputProcessor(rawInput){
  return {
    sourceList : rawInput,
    currentIndex : 0,
    maximumIndex : rawInput.length,
    hasMoreItems : function(){
      return (this.currentIndex < this.maximumIndex);
    },
    fetchNextItem : function(){
      if(this.hasMoreItems()){
        return this.sourceList[this.currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function printResult(outputValue){
  console.log(outputValue);
}

function logDebug(debugData){
  console.error('debug:' + require('util').inspect(debugData, false, null));
}

function convertInput(inputValue, conversionType){
  try{
    switch(conversionType){
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(' ');
      case 4: return inputValue.split(' ').map(Number);
      case 6: return inputValue.split('');
      case 7: return inputValue.split('').map(Number);
      case 8: return inputValue.join(' ');
      case 9: return inputValue.join('\n');
      case 0: return inputValue.join('');
      default: return inputValue;
    }
  } catch(error){
    return inputValue;
  }
}

function executeMainLogic(){
  var firstLineData = getNextIntegerArray();
  var nodeCount = firstLineData[0];
  var initialColors = firstLineData[1];

  var graphNodes = new Array(nodeCount);
  for(var idx = 0; idx < nodeCount; idx++){
    graphNodes[idx] = {
      connectedNodes : [],
      nodeIdentifier : idx,
      colorCount : 0,
      isVisited : false
    };
  }

  for(var idx = 0; idx < nodeCount - 1; idx++){
    var edgeData = getNextIntegerArray();
    graphNodes[edgeData[0] - 1].connectedNodes.push(edgeData[1] - 1);
    graphNodes[edgeData[1] - 1].connectedNodes.push(edgeData[0] - 1);
  }

  var finalResult = 1;
  var moduloValue = 1000000007;
  graphNodes[0].isVisited = true;

  var processingStack = [[0, initialColors, 0]];
  while(processingStack.length > 0){
    var currentStackItem = processingStack.pop();
    var parentVisitedCount = currentStackItem[0];
    var availableColors = currentStackItem[1];
    var currentNodeIndex = currentStackItem[2];
    graphNodes[currentNodeIndex].colorCount = availableColors;

    if(parentVisitedCount < 2){
      parentVisitedCount++;
    }

    var connectedNodes = graphNodes[currentNodeIndex].connectedNodes;
    var successfulChildrenProcessed = 0;
    for(var idx = 0; idx < connectedNodes.length; idx++){
      if(!graphNodes[connectedNodes[idx]].isVisited){
        graphNodes[connectedNodes[idx]].isVisited = true;
        processingStack.push([parentVisitedCount, initialColors - successfulChildrenProcessed - parentVisitedCount, connectedNodes[idx]]);
        successfulChildrenProcessed++;
      }
    }
  }

  for(var idx = 0; idx < nodeCount; idx++){
    finalResult = (finalResult * graphNodes[idx].colorCount) % moduloValue;
  }
  printResult(finalResult);


  function depthFirstSearch(parentVisitedCount, availableColors, currentNodeIndex, initialColorLimit){
    graphNodes[currentNodeIndex].colorCount = availableColors;
    if(parentVisitedCount < 2){
      parentVisitedCount++;
    }
    var connectedNodes = graphNodes[currentNodeIndex].connectedNodes;
    var successfulChildrenProcessed = 0;
    for(var idx = 0; idx < connectedNodes.length; idx++){
      if(!graphNodes[connectedNodes[idx]].isVisited){
        graphNodes[connectedNodes[idx]].isVisited = true;
        depthFirstSearch(parentVisitedCount, initialColorLimit - successfulChildrenProcessed - parentVisitedCount, connectedNodes[idx], initialColorLimit);
        successfulChildrenProcessed++;
      }
    }
  }
}
