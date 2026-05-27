var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputHandler;
var inputBuffer = [];

inputReader.on('line', function(lineContent){inputBuffer.push(lineContent);});
inputReader.on('close', function(){
  inputHandler = createInputHandler(inputBuffer);
  console.error("\n");
  var startTime = Date.now();
  executeMainLogic();
  var endTime = Date.now() - startTime;
  debugLog("time : " + endTime + "ms");
  debugLog("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function deepCopyObject(sourceObj){return JSON.parse(JSON.stringify(sourceObj));}
function readNextInt(){return processInputConversion(fetchNextLine(), 1);}
function readStringArray(){return processInputConversion(fetchNextLine(), 2);}
function readIntegerArray(){return processInputConversion(fetchNextLine(), 4);}
function readCharacterArray(){return processInputConversion(fetchNextLine(), 6);}
function fetchNextLine(){return inputHandler.getNextInputLine();}
function hasMoreLines(){return inputHandler.hasMoreInput();}

function createInputHandler(sourceLines){  
  let currentLineIndex = 0;
  const totalLines = sourceLines.length;

  const processorInstance = {
    sourceLines : sourceLines,
    currentLineIndex : currentLineIndex,
    totalLines : totalLines,
    hasMoreInput : function(){return (this.currentLineIndex < this.totalLines);},
    getNextInputLine : function(){
      if(!this.hasMoreInput()){
        throw new Error("ArrayIndexOutOfBoundsException: No more input lines available.");
      }
      var currentLineContent = this.sourceLines[this.currentLineIndex++];
      return currentLineContent;
    }
  };
  return processorInstance;
}

function outputResult(message){console.log(message);}
function debugLog(message){console.error("debug:" + require("util").inspect(message,false,null));}

const inputConversionHandlers = {
    1: (val) => parseInt(val, 10),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (arr) => arr.join(" "),
    9: (arr) => arr.join("\n"),
    0: (arr) => arr.join("")
};

function processInputConversion(inputValue, conversionType){
    try{
        const handler = inputConversionHandlers[conversionType];
        return handler ? handler(inputValue) : inputValue;
    }catch(e){
        return inputValue;
    }
}

function breadthFirstSearch(startNodeIndex, graphNodes, nodeCount) {
    const bfsQueue = [startNodeIndex];
    graphNodes[startNodeIndex].isVisited = true;
    let maxDepthReached = 0;

    while (bfsQueue.length > 0) {
        const currentNodeIndex = bfsQueue.shift();
        const currentNeighbors = graphNodes[currentNodeIndex].neighbors;

        for (let neighborIdx = 0; neighborIdx < currentNeighbors.length; neighborIdx++) {
            const neighborNode = currentNeighbors[neighborIdx];
            if (!graphNodes[neighborNode].isVisited) {
                graphNodes[neighborNode].isVisited = true;
                graphNodes[neighborNode].nodeDepth = graphNodes[currentNodeIndex].nodeDepth + 1;
                maxDepthReached = Math.max(maxDepthReached, graphNodes[currentNodeIndex].nodeDepth + 1);
                bfsQueue.push(neighborNode);
            }
        }
    }

    let farthestNodeInBfs = -1;
    for (let i = 0; i < nodeCount; i++) {
        if (graphNodes[i].nodeDepth === maxDepthReached) {
            farthestNodeInBfs = i;
            break;
        }
    }
    return farthestNodeInBfs;
}

function resetGraphTraversalState(graphNodes, nodeCount) {
    for (let i = 0; i < nodeCount; i++) {
        graphNodes[i].isVisited = false;
        graphNodes[i].nodeDepth = 1;
    }
}

function executeMainLogic(){
  const nodeCount = readNextInt();
  const graphNodes = new Array(nodeCount);

  for(let i = 0; i < nodeCount; i++){
    graphNodes[i] = {
      neighbors : [],
      isVisited : false,
      nodeDepth : 1
    };
  }

  for(let i = 0; i < nodeCount; i++){
    const adjacencyRow = readCharacterArray();
    for(let j = 0; j < nodeCount; j++){
      if(i !== j && adjacencyRow[j] === "1"){
        graphNodes[i].neighbors.push(j);
      }
    }
  }
  
  const farthestNodeFromStart = breadthFirstSearch(0, graphNodes, nodeCount);

  resetGraphTraversalState(graphNodes, nodeCount);

  const diameterEndpoint = breadthFirstSearch(farthestNodeFromStart, graphNodes, nodeCount);
  
  let invalidGraphStructure = false;
  let maxDepthFromSecondBfs = 0;

  for(let i = 0; i < nodeCount; i++){
      maxDepthFromSecondBfs = Math.max(maxDepthFromSecondBfs, graphNodes[i].nodeDepth);

      if (!invalidGraphStructure) {
          for(let j = i + 1; j < nodeCount; j++){
              if(graphNodes[i].nodeDepth === graphNodes[j].nodeDepth &&
                 (graphNodes[i].neighbors.includes(j) || graphNodes[j].neighbors.includes(i))){
                  invalidGraphStructure = true;
                  break;
              }
          }
      }
      if (invalidGraphStructure) {
          break;
      }
  }

  if (invalidGraphStructure) {
      outputResult(-1);
  } else {
      outputResult(maxDepthFromSecondBfs);
  }
}
