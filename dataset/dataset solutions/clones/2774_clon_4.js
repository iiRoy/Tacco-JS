var inputHandler = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputSource; var rawLines = [];
inputHandler.on('line', function(inputLine){rawLines.push(inputLine);});
inputHandler.on('close', function(){
  inputSource = initializeInput(rawLines);
  console.error('\n↑入力 ↓出力');
  executeProgram();
});

function readInt(){return dataTransformer(readNext(),1);}
function readStrArr(){return dataTransformer(readNext(),2);}
function readIntArr(){return dataTransformer(readNext(),4);}
function readCharArr(){return dataTransformer(readNext(),6);}
function readNext(){return inputSource.readNextLine();}
function hasMore(){return inputSource.hasMoreLines();}

function initializeInput(inputData){  
  return {
    lineList : inputData, currentIdx : 0, maxLines : inputData.length,
    hasMoreLines : function(){return (this.currentIdx < this.maxLines);},
    readNextLine : function(){if(this.hasMoreLines()){return this.lineList[this.currentIdx++];}else{throw 'InputExhaustedException ‚No more input available';}}
  };
}
function outputResult(s){console.log(s);}
function debugLog(s){console.error('debug:' + require('util').inspect(s,false,null));}

function dataTransformer(inputVal, transformType){
  try{
    switch(transformType){
      case 1:return parseInt(inputVal);
      case 2:return inputVal.split(' ');
      case 4:return inputVal.split(' ').map(Number);
      case 6:return inputVal.split('');
      case 7:return inputVal.split('').map(Number);
      case 8:return inputVal.join(' ');
      case 9:return inputVal.join('\n');
      case 0:return inputVal.join('');
      default:return inputVal;
    }
  }catch(e){
    return inputVal;
  }
}

function executeProgram(){
  var firstLineData = readIntArr();
  var nodeCount = firstLineData[0];
  var colorLimit = firstLineData[1];
  
  var graphNodes = new Array(nodeCount);
  for(var idx = 0; idx < nodeCount; idx++){
    graphNodes[idx] = {
      connectedNodes : [],
      identifier : idx,
      colorOptions : 0,
      visited : false
    };
  }
  
  for(var idx = 0; idx < nodeCount - 1; idx++){
    var edgeData = readIntArr();
    graphNodes[edgeData[0] - 1].connectedNodes.push(edgeData[1] - 1);
    graphNodes[edgeData[1] - 1].connectedNodes.push(edgeData[0] - 1);
  }
  
  var finalProduct = 1;
  var moduloValue = 1000000007;
  
  var nodeQueue = [];
  
  nodeQueue.push([0, -1, 0]); // [currentNodeId, parentNodeId, depth]
  graphNodes[0].visited = true;
  graphNodes[0].colorOptions = colorLimit; // Root node (depth 0) gets K colors
  
  var queueHead = 0;
  while(queueHead < nodeQueue.length){
    var [currentNodeId, parentNodeId, depth] = nodeQueue[queueHead++];
    
    // This value represents the number of non-sibling adjacent nodes
    // that are already colored, which constrain the children of currentNodeId.
    // Equivalent to 'parentNodeCount' passed to children in original DFS.
    // Depth 0 (root) -> children have 1 constraint (parent)
    // Depth 1 (child of root) -> children have 2 constraints (parent, grandparent)
    // Depth >= 2 -> children have 2 constraints (parent, grandparent/sibling of parent)
    var constraintsForChildren = Math.min(depth + 1, 2); 
    
    var processedSiblingsCount = 0;
    for(var idx = 0; idx < graphNodes[currentNodeId].connectedNodes.length; idx++){
      var neighborId = graphNodes[currentNodeId].connectedNodes[idx];
      
      if(neighborId === parentNodeId){
        continue; 
      }
      
      if(!graphNodes[neighborId].visited){
        graphNodes[neighborId].visited = true;
        
        // Calculate color options for the neighbor (child node)
        // K - (constraints from ancestors/parent) - (constraints from siblings already processed)
        graphNodes[neighborId].colorOptions = colorLimit - constraintsForChildren - processedSiblingsCount;
        
        nodeQueue.push([neighborId, currentNodeId, depth + 1]);
        processedSiblingsCount++;
      }
    }
  }
  
  for(var idx = 0; idx < nodeCount; idx++){
    finalProduct = (finalProduct * graphNodes[idx].colorOptions) % moduloValue;
  }
  
  outputResult(finalProduct);
}
