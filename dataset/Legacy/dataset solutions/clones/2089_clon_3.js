var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputProcessor;
var rawInputLines = [];

inputReader.on('line', function(lineData){rawInputLines.push(lineData);});
inputReader.on('close', function(){
  inputProcessor = initializeInputProcessor(rawInputLines);
  console.error('\n');
  var startTime = Date.now();
  executeSolution();
  var endTime = Date.now() - startTime;
  logPerformanceMetrics(endTime);
});

function createDeepCopy(sourceObject){
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function readNextInt(){return processInputConversion(fetchNextToken(),1);}
function readNextStrArray(){return processInputConversion(fetchNextToken(),2);}
function readNextIntArray(){return processInputConversion(fetchNextToken(),4);}
function readNextCharArray(){return processInputConversion(fetchNextToken(),6);}

function fetchNextToken(){return inputProcessor.next();}
function hasMoreInputTokens(){return inputProcessor.hasMoreTokens();}

function initializeInputProcessor(inputData){
  return {
    dataList : inputData,
    currentIndex : 0,
    maxIndex : inputData.length,
    hasMoreTokens : function(){return (this.currentIndex < this.maxIndex);},
    next : function(){
      if(this.hasMoreTokens()){
        return this.dataList[this.currentIndex++];
      }else{
        throw new Error('ArrayIndexOutOfBoundsException: No more input available.');
      }
    }
  };
}

function outputResult(data){console.log(data);}
function logDebugMessage(message){console.error('debug:' + require('util').inspect(message,false,null));}

function logPerformanceMetrics(elapsedTime) {
  logDebugMessage('time : ' + elapsedTime + 'ms');
  logDebugMessage('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
}

function processInputConversion(inputItem, conversionType){
  try{
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
  }catch(e){
    return inputItem;
  }
}

function createGraphNode() {
    return {
        depthLevel: null,
        accessed: false,
        neighbors: [],
        assignedValue: -1
    };
}

function runBFSAndCountDepths(graphNodes, startNodeIndex) {
    let bfsTraversalQueue = [startNodeIndex];
    graphNodes[startNodeIndex].accessed = true;
    graphNodes[startNodeIndex].depthLevel = 1;

    let oddDepthNodes = 0;
    let evenDepthNodes = 0;

    while (bfsTraversalQueue.length > 0) {
        let currentIdx = bfsTraversalQueue.shift();
        let currentNode = graphNodes[currentIdx];

        if (currentNode.depthLevel % 2 === 1) {
            oddDepthNodes++;
        } else {
            evenDepthNodes++;
        }

        for (let i = 0; i < currentNode.neighbors.length; i++) {
            let neighborIdx = currentNode.neighbors[i];
            if (!graphNodes[neighborIdx].accessed) {
                graphNodes[neighborIdx].accessed = true;
                graphNodes[neighborIdx].depthLevel = currentNode.depthLevel + 1;
                bfsTraversalQueue.push(neighborIdx);
            }
        }
    }
    return { odd: oddDepthNodes, even: evenDepthNodes };
}

function executeSolution(){
  var totalNodes = readNextInt();
  var nodeGraph = new Array(totalNodes);
  var finalOutputValues = new Array(totalNodes);

  for(var i = 0; i < totalNodes; i++){
    nodeGraph[i] = createGraphNode();
  }

  for(var i = 0; i < totalNodes - 1; i++){
    var currentEdge = readNextIntArray();
    var nodeA_idx = currentEdge[0] - 1;
    var nodeB_idx = currentEdge[1] - 1;
    nodeGraph[nodeA_idx].neighbors.push(nodeB_idx);
    nodeGraph[nodeB_idx].neighbors.push(nodeA_idx);
  }

  var depthCounts = runBFSAndCountDepths(nodeGraph, 0);
  var countOddDepthNodes = depthCounts.odd;
  var countEvenDepthNodes = depthCounts.even;

  var sequenceVal1 = 1;
  var sequenceVal2 = 2;
  var sequenceVal3 = 3;

  var threshold = totalNodes / 3;

  if(countOddDepthNodes > threshold && countEvenDepthNodes > threshold){
    for(var i = 0; i < totalNodes; i++){
      if(nodeGraph[i].depthLevel % 2 === 1){
        if(sequenceVal1 <= totalNodes){
          nodeGraph[i].assignedValue = sequenceVal1;
          sequenceVal1 += 3;
        }
      }else{
        if(sequenceVal2 <= totalNodes){
          nodeGraph[i].assignedValue = sequenceVal2;
          sequenceVal2 += 3;
        }
      }
    }
  }else{
    var assignToOddDepths = (countOddDepthNodes < countEvenDepthNodes);
    for(var i = 0; i < totalNodes; i++){
      var isOddDepth = (nodeGraph[i].depthLevel % 2 === 1);
      if((assignToOddDepths && isOddDepth) || (!assignToOddDepths && !isOddDepth)){
        if(sequenceVal3 <= totalNodes){
          nodeGraph[i].assignedValue = sequenceVal3;
          sequenceVal3 += 3;
        }
      }
    }
  }

  for(var i = 0; i < totalNodes; i++){
    if(nodeGraph[i].assignedValue === -1){
      if(sequenceVal1 <= totalNodes){
        nodeGraph[i].assignedValue = sequenceVal1;
        sequenceVal1 += 3;
      }else if(sequenceVal2 <= totalNodes){
        nodeGraph[i].assignedValue = sequenceVal2;
        sequenceVal2 += 3;
      }else if(sequenceVal3 <= totalNodes){
        nodeGraph[i].assignedValue = sequenceVal3;
        sequenceVal3 += 3;
      }
    }
    finalOutputValues[i] = nodeGraph[i].assignedValue;
  }
  outputResult(processInputConversion(finalOutputValues, 8));
}
