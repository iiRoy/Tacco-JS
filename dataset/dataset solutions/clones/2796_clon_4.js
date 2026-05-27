//Don't have to see. start------------------------------------------
var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var obj; var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  console.error("\n");
  var start = Date.now();
  Main();
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

//Don't have to see. end------------------------------------------
function Main(){
  const dimensions = nextIntArray();
  const nodeCount = dimensions[0];
  const edgeCount = dimensions[1];

  const adjacencyList = new Array(nodeCount);
  const processedNodes = new Array(nodeCount);

  for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
    adjacencyList[nodeIndex] = {
      children: []
    };
    processedNodes[nodeIndex] = {
      predecessors: new Set(),
      visited: false,
      distance: 0
    };
  }

  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    const edgePair = nextIntArray();
    adjacencyList[edgePair[0] - 1].children.push(edgePair[1] - 1);
  }

  for (let startNode = 0; startNode < nodeCount; startNode++) {
    for (const stepOneNode of adjacencyList[startNode].children) {
      for (const stepTwoNode of adjacencyList[stepOneNode].children) {
        for (const stepThreeNode of adjacencyList[stepTwoNode].children) {
          processedNodes[stepThreeNode].predecessors.add(startNode);
        }
      }
    }
  }

  const pathEndpoints = nextIntArray();
  const sourceNode = pathEndpoints[0] - 1;
  const targetNode = pathEndpoints[1] - 1;

  const bfsQueue = [];
  bfsQueue.push(targetNode);
  processedNodes[targetNode].visited = true;

  let minJumps = -1;

  while (bfsQueue.length > 0) {
    const currentVertex = bfsQueue.shift();
    
    if (currentVertex === sourceNode) {
      minJumps = processedNodes[currentVertex].distance;
      break;
    }

    for (const predecessor of processedNodes[currentVertex].predecessors) {
      if (!processedNodes[predecessor].visited) {
        processedNodes[predecessor].visited = true;
        processedNodes[predecessor].distance = processedNodes[currentVertex].distance + 1;
        bfsQueue.push(predecessor);
      }
    }
  }

  myout(minJumps);
}
