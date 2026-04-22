var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var obj; var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  console.error("\n");
  var start = Date.now();
  executeGraphAnalysis();
  var end = Date.now() - start;
  myerr("time : " + end + "ms");
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init(input){  
  var returnObj = {
    list : input, index : 0, max : input.length,
    hasNext : function(){return (this.index < this.max);},
    next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException ‚There is no more input";}else{var returnInput = this.list[this.index++];return returnInput;}}
  };
  return returnObj;
}
function myout(s){console.log(s);}
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

function generateThreeStepConnectivity(totalNodes, originalConnections) {
    let threeStepAdjacency = new Array(totalNodes).fill(null).map(() => new Set());

    for (let currentStartNode = 0; currentStartNode < totalNodes; currentStartNode++) {
        let firstLevelNodes = originalConnections[currentStartNode];

        let secondLevelNodes = new Set();
        for (let nodeA of firstLevelNodes) {
            for (let nodeB of originalConnections[nodeA]) {
                secondLevelNodes.add(nodeB);
            }
        }

        for (let nodeB of Array.from(secondLevelNodes)) {
            for (let nodeC of originalConnections[nodeB]) {
                threeStepAdjacency[currentStartNode].add(nodeC);
            }
        }
    }
    return threeStepAdjacency.map(s => Array.from(s));
}

function findShortestJumpPath(pathStart, pathEnd, jumpNetwork, graphSize) {
    let distances = new Array(graphSize).fill(-1);
    let processingQueue = [];

    processingQueue.push(pathStart);
    distances[pathStart] = 0;

    let queueHead = 0;
    while (queueHead < processingQueue.length) {
        let currentPosition = processingQueue[queueHead++];
        if (currentPosition === pathEnd) {
            return distances[currentPosition];
        }

        for (let nextJumpTarget of jumpNetwork[currentPosition]) {
            if (distances[nextJumpTarget] === -1) {
                distances[nextJumpTarget] = distances[currentPosition] + 1;
                processingQueue.push(nextJumpTarget);
            }
        }
    }
    return -1;
}

function executeGraphAnalysis() {
  let initialParameters = nextIntArray();
  let vertexCount = initialParameters[0];
  let edgeCount = initialParameters[1];

  let baseGraph = new Array(vertexCount).fill(null).map(() => []);

  for (let i = 0; i < edgeCount; i++) {
    let currentEdge = nextIntArray();
    baseGraph[currentEdge[0] - 1].push(currentEdge[1] - 1);
  }

  let jumpGraphStructure = generateThreeStepConnectivity(vertexCount, baseGraph);

  let queryNodes = nextIntArray();
  let startNodeIdx = queryNodes[0] - 1;
  let endNodeIdx = queryNodes[1] - 1;

  let finalResult = findShortestJumpPath(startNodeIdx, endNodeIdx, jumpGraphStructure, vertexCount);
  
  myout(finalResult);
}