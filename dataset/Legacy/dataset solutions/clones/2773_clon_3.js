var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputHandler;
var inputLines = [];

inputReader.on('line', function(lineData){inputLines.push(lineData);});
inputReader.on('close', function(){
  inputHandler = initializeInputProcessor(inputLines);
  console.error('\n↑Input ↓Output');
  solveProblem();
});

function deepCopy(sourceObj){
  return (sourceObj instanceof Set) ? new Set(Array.from(sourceObj)) : JSON.parse(JSON.stringify(sourceObj));
}

function parseInput(data, type){
  switch(type){
    case 1: return parseInt(data);
    case 2: return data.split(' ');
    case 4: return data.split(' ').map(Number);
    case 6: return data.split('');
    case 7: return data.split('').map(Number);
    case 8: return data.join(' ');
    case 9: return data.join('\n');
    case 0: return data.join('');
    default: return data;
  }
}

function readInt(){ return parseInput(getNextToken(), 1); }
function readStringArray(){ return parseInput(getNextToken(), 2); }
function readIntArray(){ return parseInput(getNextToken(), 4); }
function readCharArray(){ return parseInput(getNextToken(), 6); }

function getNextToken(){ return inputHandler.getNext(); }
function hasMoreTokens(){ return inputHandler.hasMore(); }

function initializeInputProcessor(lines){
  return {
    dataLines : lines,
    currentIndex : 0,
    totalLines : lines.length,
    hasMore : function(){ return (this.currentIndex < this.totalLines); },
    getNext : function(){
      if(this.hasMore()){ return this.dataLines[this.currentIndex++]; }
      else{ throw 'InputProcessorException: No more input available'; }
    }
  };
}

function printResult(outputData){ console.log(outputData); }
function debugLog(message){ console.error('debug:' + require('util').inspect(message,false,null)); }

function createGraphNode(id) {
  return {
    adjacencies: [],
    nodeIdentifier: id,
    assignedColor: 0,
    visitedStatus: false
  };
}

function calculateRemainingColorOptions(totalColors, childrenAssigned, parentConstraintLevel) {
  return totalColors - childrenAssigned - parentConstraintLevel;
}

class StackItem {
  constructor(parentConstraint, colorOptions, nodeIdx) {
    this.parentConstraintLevel = parentConstraint;
    this.colorOptions = colorOptions;
    this.nodeIndex = nodeIdx;
  }
}

function solveProblem(){
  const firstLineData = readIntArray();
  const nodeCount = firstLineData[0];
  const maxColors = firstLineData[1];

  const graphNodes = Array.from({ length: nodeCount }, (_, i) => createGraphNode(i));

  for(let idx = 0; idx < nodeCount - 1; idx++){
    const tempEdgeData = readIntArray();
    const nodeA = tempEdgeData[0] - 1;
    const nodeB = tempEdgeData[1] - 1;
    graphNodes[nodeA].adjacencies.push(nodeB);
    graphNodes[nodeB].adjacencies.push(nodeA);
  }

  let finalResult = 1;
  const moduloValue = 1000000007;

  graphNodes[0].visitedStatus = true;

  const processingStack = [new StackItem(0, maxColors, 0)];

  while(processingStack.length > 0){
    const currentStackItem = processingStack.pop();
    let parentConstraintLevel = currentStackItem.parentConstraintLevel;
    const currentColorOption = currentStackItem.colorOptions;
    const currentNodeIndex = currentStackItem.nodeIndex;

    graphNodes[currentNodeIndex].assignedColor = currentColorOption;

    if(parentConstraintLevel < 2){
      parentConstraintLevel++;
    }

    const neighborNodes = graphNodes[currentNodeIndex].adjacencies;
    let assignedChildCount = 0;

    for(let idx = 0; idx < neighborNodes.length; idx++){
      const neighborIdx = neighborNodes[idx];
      if(!graphNodes[neighborIdx].visitedStatus){
        graphNodes[neighborIdx].visitedStatus = true;
        const nextColorOptions = calculateRemainingColorOptions(maxColors, assignedChildCount, parentConstraintLevel);
        processingStack.push(new StackItem(parentConstraintLevel, nextColorOptions, neighborIdx));
        assignedChildCount++;
      }
    }
  }

  for(let idx = 0; idx < nodeCount; idx++){
    finalResult = (finalResult * graphNodes[idx].assignedColor) % moduloValue;
  }

  printResult(finalResult);
}
