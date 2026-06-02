var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputBuffer = [];
var inputHandler;
inputReader.on('line', function(inputLine){inputBuffer.push(inputLine);});
inputReader.on('close', function(){
  inputHandler = createInputHandler(inputBuffer);
  console.error("\n");
  const startTime = Date.now();
  Main();
  logPerformanceMetrics(startTime);
});

function getNextInt(){return processInputConversion(getNextLine(),1);}
function getNextStrArray(){return processInputConversion(getNextLine(),2);}
function getNextIntArray(){return processInputConversion(getNextLine(),4);}
function getNextCharArray(){return processInputConversion(getNextLine(),6);}
function getNextLine(){return inputHandler.next();}
function hasMoreInput(){return inputHandler.hasNext();}

class InputHandler {
    constructor(sourceLines) {
        this.sourceLines = sourceLines;
        this.currentLineIdx = 0;
        this.totalLineCount = sourceLines.length;
    }

    hasNext() {
        return this.currentLineIdx < this.totalLineCount;
    }

    next() {
        if (!this.hasNext()) {
            throw "ArrayIndexOutOfBoundsException ‚There is no more input";
        }
        const currentLineValue = this.sourceLines[this.currentLineIdx];
        this.currentLineIdx++;
        return currentLineValue;
    }
}

function createInputHandler(input) {
    return new InputHandler(input);
}

function outputResult(s){console.log(s);}
function debugLog(s){console.error("debug:" + require("util").inspect(s,false,null));}

const conversionFunctionsMap = {
    1: (str) => parseInt(str),
    2: (str) => str.split(" "),
    4: (str) => str.split(" ").map(Number),
    6: (str) => str.split(""),
    7: (str) => str.split("").map(Number),
    8: (arr) => arr.join(" "),
    9: (arr) => arr.join("\n"),
    0: (arr) => arr.join(""),
    default: (val) => val
};

function processInputConversion(inputVal, conversionMode) {
    try {
        const converter = conversionFunctionsMap[conversionMode] || conversionFunctionsMap.default;
        return converter(inputVal);
    } catch (e) {
        return inputVal;
    }
}

function logPerformanceMetrics(startTime) {
    const endTime = Date.now() - startTime;
    debugLog("time : " + endTime + "ms");
    debugLog("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
}

function resetGraphNodeStates(nodesCollection) {
    for (let i = 0; i < nodesCollection.length; i++) {
        nodesCollection[i].visitedStatus = false;
        nodesCollection[i].nodeLevel = 1;
    }
}

function performBfsTraversal(startNodeId, graphNodesCollection, totalNodesCount) {
    resetGraphNodeStates(graphNodesCollection);

    const bfsTraversalQueue = [startNodeId];
    graphNodesCollection[startNodeId].visitedStatus = true;
    let currentBfsMaxLevel = 0;

    while (bfsTraversalQueue.length > 0) {
        const currentNode = bfsTraversalQueue.shift();
        const currentNodeData = graphNodesCollection[currentNode];
        const currentNeighbors = currentNodeData.connectedNodes;
        currentBfsMaxLevel = currentNodeData.nodeLevel;

        for (let neighborIndex = 0; neighborIndex < currentNeighbors.length; neighborIndex++) {
            const neighborId = currentNeighbors[neighborIndex];
            const neighborNode = graphNodesCollection[neighborId];
            if (!neighborNode.visitedStatus) {
                neighborNode.visitedStatus = true;
                neighborNode.nodeLevel = currentNodeData.nodeLevel + 1;
                bfsTraversalQueue.push(neighborId);
            }
        }
    }
    return currentBfsMaxLevel;
}

function createGraphNode(nodeId) {
    return {
        nodeIdentifier: nodeId,
        connectedNodes: [],
        visitedStatus: false,
        nodeLevel: 1
    };
}

function Main(){
  const numNodes = getNextInt();
  const graphNodes = new Array(numNodes);

  for(let i = 0; i < numNodes; i++){
    graphNodes[i] = createGraphNode(i);
  }

  for(let i = 0; i < numNodes; i++){
    const adjacencyMatrixRow = getNextCharArray();
    const currentNode = graphNodes[i];
    for(let j = 0; j < numNodes; j++){
      if(i !== j && adjacencyMatrixRow[j] === "1"){
        currentNode.connectedNodes.push(j);
      }
    }
  }
  
  let overallMaxGraphDepth = -1;
  for(let i = 0; i < numNodes; i++){
    const currentBfsDepth = performBfsTraversal(i, graphNodes, numNodes);
    if(overallMaxGraphDepth < currentBfsDepth){
      overallMaxGraphDepth = currentBfsDepth;
    }
  }
  
  for(let i = 0; i < numNodes - 1; i++){
    for(let j = i + 1; j < numNodes; j++){
      const nodeA = graphNodes[i];
      const nodeB = graphNodes[j];

      const isConnectedAtoB = nodeA.connectedNodes.includes(j);
      const isConnectedBtoA = nodeB.connectedNodes.includes(i);

      if(isConnectedAtoB && isConnectedBtoA){
        if(nodeA.nodeLevel % 2 === nodeB.nodeLevel % 2){
          outputResult(-1);
          return;
        }
      }
    }
  }
  outputResult(overallMaxGraphDepth);
}
