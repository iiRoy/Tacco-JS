var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputProcessor;
var inputLines = [];
read.on('line', function(input){inputLines.push(input);});
read.on('close', function(){
  inputProcessor = new InputSource(inputLines);
  console.error("\n");
  var start = Date.now();
  executeGraphLogic();
  var end = Date.now() - start;
  logError("time : " + end + "ms");
  logError("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

class InputSource {
  constructor(lines) {
    this.sourceData = lines;
    this.currentPosition = 0;
  }
  hasMoreData() {
    return this.currentPosition < this.sourceData.length;
  }
  retrieveNext() {
    if (!this.hasMoreData()) {
      throw new Error("Input stream exhausted. No more data available.");
    }
    return this.sourceData[this.currentPosition++];
  }
}

function createDeepCopy(data){return JSON.parse(JSON.stringify(data));}
function obtainInteger(){return convertInput(retrieveNextLine(),1);}
function obtainStringArray(){return convertInput(retrieveNextLine(),2);}
function obtainIntegerArray(){return convertInput(retrieveNextLine(),4);}
function obtainCharSequence(){return convertInput(retrieveNextLine(),6);}
function retrieveNextLine(){return inputProcessor.retrieveNext();}
function hasMoreLines(){return inputProcessor.hasMoreData();}

function emitOutput(s){console.log(s);}
function logError(s){console.error("debug:" + require("util").inspect(s,false,null));}

function convertInput(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

let graphAdjacencyList;
let nodePathDistances;
let totalGraphNodes;

function executeGraphLogic(){
  totalGraphNodes = obtainInteger();

  graphAdjacencyList = Array.from({ length: totalGraphNodes }, () => []);
  nodePathDistances = Array(totalGraphNodes).fill(0);

  for (let i = 0; i < totalGraphNodes; i++) {
    const charMatrixRow = obtainCharSequence();
    for (let j = 0; j < totalGraphNodes; j++) {
      if (i !== j && charMatrixRow[j] === "1") {
        graphAdjacencyList[i].push(j);
      }
    }
  }
  
  let overallLongestPath = -1;
  
  for (let startVertex = 0; startVertex < totalGraphNodes; startVertex++) {
    const currentBFSLongestPath = calculateBFSLongestPath(startVertex);
    if (overallLongestPath < currentBFSLongestPath) {
      overallLongestPath = currentBFSLongestPath;
    }
  }
  
  const hasParityMismatchCycle = Array.from({ length: totalGraphNodes }, (_, i) => i)
    .flatMap(i => Array.from({ length: totalGraphNodes - (i + 1) }, (_, k) => [i, i + 1 + k]))
    .some(([vertexA, vertexB]) => {
      const isMutuallyConnected = graphAdjacencyList[vertexA].includes(vertexB) && graphAdjacencyList[vertexB].includes(vertexA);
      if (isMutuallyConnected) {
        return nodePathDistances[vertexA] % 2 === nodePathDistances[vertexB] % 2;
      }
      return false;
    });

  if (hasParityMismatchCycle) {
    emitOutput(-1);
    return;
  }
  
  emitOutput(overallLongestPath);
}

function calculateBFSLongestPath(startVertex) {
  nodePathDistances.fill(0);
  const visitedNodes = new Set();
  const traversalQueue = [];

  traversalQueue.push({ vertex: startVertex, distance: 1 });
  visitedNodes.add(startVertex);
  nodePathDistances[startVertex] = 1;

  let currentMaxDistance = 0;

  while (traversalQueue.length > 0) {
    const { vertex: currentVertex, distance: currentDistance } = traversalQueue.shift();
    currentMaxDistance = Math.max(currentMaxDistance, currentDistance);

    for (const neighborVertex of graphAdjacencyList[currentVertex]) {
      if (!visitedNodes.has(neighborVertex)) {
        visitedNodes.add(neighborVertex);
        nodePathDistances[neighborVertex] = currentDistance + 1;
        traversalQueue.push({ vertex: neighborVertex, distance: currentDistance + 1 });
      }
    }
  }
  return currentMaxDistance;
}
