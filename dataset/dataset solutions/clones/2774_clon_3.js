var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputHandler;
var inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  inputHandler = initializeInputHandler(inputLines);
  console.error('\n↑入力 ↓出力');
  executeMainLogic();
});

function deepCopy(sourceObject){
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function readInt(){ return convertInput(getNextInputLine(), 1); }
function readStrArray(){ return convertInput(getNextInputLine(), 2); }
function readIntArray(){ return convertInput(getNextInputLine(), 4); }
function readCharArray(){ return convertInput(getNextInputLine(), 6); }

function getNextInputLine(){ return inputHandler.next(); }
function hasMoreInput(){ return inputHandler.hasMoreInput(); }

function initializeInputHandler(linesArray){
  const handler = {
    dataLines : linesArray,
    currentIndex : 0,
    maxLines : linesArray.length,
    hasMoreInput : function(){
      return (this.currentIndex < this.maxLines);
    },
    next : function(){
      if(this.hasMoreInput()){
        return this.dataLines[this.currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
  return handler;
}

function printOutput(message){ console.log(message); }
function printDebug(debugMessage){ console.error('debug:' + require('util').inspect(debugMessage,false,null)); }

function convertInput(inputValue, conversionType){
  try {
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
  } catch(e){
    return inputValue;
  }
}

function createNode(nodeId) {
  return {
    child: [],
    no: nodeId,
    count: 0,
    access: false
  };
}

function executeMainLogic(){
  const firstLineData = readIntArray();
  const nodeCount = firstLineData[0];
  const initialColors = firstLineData[1];

  const nodeDataList = new Array(nodeCount);
  for(let i = 0; i < nodeCount; i++){
    nodeDataList[i] = createNode(i);
  }

  for(let i = 0; i < nodeCount - 1; i++){
    const edgePair = readIntArray();
    const nodeAIndex = edgePair[0] - 1;
    const nodeBIndex = edgePair[1] - 1;
    nodeDataList[nodeAIndex].child.push(nodeBIndex);
    nodeDataList[nodeBIndex].child.push(nodeAIndex);
  }

  let finalResult = 1;
  const moduloValue = 1000000007;

  nodeDataList[0].access = true;
  depthFirstSearch(0, initialColors, 0, initialColors);

  for(let i = 0; i < nodeCount; i++){
    finalResult = (finalResult * nodeDataList[i].count) % moduloValue;
  }
  printOutput(finalResult);


  function depthFirstSearch(coloredAncestors, availableColors, currentNodeIndex, totalInitialColors){
    nodeDataList[currentNodeIndex].count = availableColors;

    const effectiveColoredAncestors = (coloredAncestors < 2) ? (coloredAncestors + 1) : 2;

    const adjacentNodes = nodeDataList[currentNodeIndex].child;
    let processedChildrenCount = 0;

    for(let i = 0; i < adjacentNodes.length; i++){
      const adjacentNodeIndex = adjacentNodes[i];
      const childNode = nodeDataList[adjacentNodeIndex];

      if(!childNode.access){
        childNode.access = true;
        const colorsForChild = totalInitialColors - processedChildrenCount - effectiveColoredAncestors;
        depthFirstSearch(effectiveColoredAncestors, colorsForChild, adjacentNodeIndex, totalInitialColors);
        processedChildrenCount++;
      }
    }
  }
}
