var read = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputProcessor;
var inputBuffer = [];
read.on('line', function(inputLine){
  inputBuffer.push(inputLine);
});
read.on('close', function(){
  inputProcessor = new InputHandler(inputBuffer);
  console.error("\n");
  var startTime = new Date();
  executeMainLogic();
  var endTime = new Date() - startTime;
  
  logError("time : " + (endTime) + "ms");
  logError("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function createDeepClone(sourceObj){return JSON.parse(JSON.stringify(sourceObj));}
function getNextInt(){return dataConverter(inputProcessor.next(),1);} function getNextStrArray(){return dataConverter(inputProcessor.next(),2);}
function getNextIntArray(){return dataConverter(inputProcessor.next(),4);} function getNextCharArray(){return dataConverter(inputProcessor.next(),6);}
function getNextLine(){return inputProcessor.next();} function hasMoreInput(){return inputProcessor.hasNext();}

class InputHandler {
  constructor(lines) {
    this.lineList = lines;
    this.currentIndex = 0;
    this.maxLines = lines.length;
  }

  hasNext() {
    return (this.currentIndex < this.maxLines);
  }

  next() {
    if (!this.hasNext()) {
      throw "ArrayIndexOutOfBoundsException これ以上ないよ";
    }
    const currentInputLine = this.lineList[this.currentIndex];
    this.currentIndex++;
    return currentInputLine;
  }
}

function printOutput(message){console.log(message);}
function logError(debugMessage){console.error("debug:" + require("util").inspect(debugMessage,false,null));}

function dataConverter(inputValue, conversionType){
  try{
    switch(conversionType){
      case 1:return parseInt(inputValue);
      case 2:return inputValue.split(" ");
      case 4:return inputValue.split(" ").map(Number);
      case 6:return inputValue.split("");
      case 7:return inputValue.split("").map(Number);
      case 8:return inputValue.join(" ");
      case 9:return inputValue.join("\n");
      case 0:return inputValue.join("");
      default:return inputValue;
    }
  }catch(e){
    return inputValue;
  }
}

function executeMainLogic(){
  const nodeCount = getNextInt();
  
  const graphNodes = Array.from({ length: nodeCount }, () => ({
    adjacentNodes: []
  }));

  const edgeDataMap = {};
  let maxColorUsed = 0;

  const numEdges = nodeCount - 1;
  for(let i = 0; i < numEdges; i++){
    const [nodeU, nodeV] = getNextIntArray();
    const uIndex = nodeU - 1;
    const vIndex = nodeV - 1;

    graphNodes[uIndex].adjacentNodes.push(vIndex);
    graphNodes[vIndex].adjacentNodes.push(uIndex);
    
    const edgeKey = getEdgeIdentifier(uIndex, vIndex);
    edgeDataMap[edgeKey] = {
      originalEdgeIndex: i,
      assignedEdgeColor: null
    };
  }
  
  function getEdgeIdentifier(n1, n2) {
    return `${Math.min(n1, n2)}:${Math.max(n1, n2)}`;
  }

  const traversalQueue = [[0, 0]];
  while(traversalQueue.length > 0){
    const [currentNode, parentEdgeColor] = traversalQueue.shift();
    const neighbors = graphNodes[currentNode].adjacentNodes;
    
    let currentAvailableColor = 1;
    
    for(let i = 0; i < neighbors.length; i++){
      const neighborNode = neighbors[i];
      
      const minNodeId = Math.min(currentNode, neighborNode);
      const maxNodeId = Math.max(currentNode, neighborNode);
      
      const edgeKey = getEdgeIdentifier(minNodeId, maxNodeId);
      const edgeInfo = edgeDataMap[edgeKey];

      if(edgeInfo.assignedEdgeColor === null){
        if(currentAvailableColor === parentEdgeColor){
          currentAvailableColor++;
        }
        
        edgeInfo.assignedEdgeColor = currentAvailableColor;
        traversalQueue.push([neighborNode, currentAvailableColor]);
        
        maxColorUsed = Math.max(maxColorUsed, currentAvailableColor);
        currentAvailableColor++;
      }
    }
  }
  
  printOutput(maxColorUsed);
  
  const outputColors = new Array(numEdges);
  const orderedEdges = Object.values(edgeDataMap);

  orderedEdges.sort((a, b) => a.originalEdgeIndex - b.originalEdgeIndex);
  
  for(let i = 0; i < numEdges; i++){
    outputColors[i] = orderedEdges[i].assignedEdgeColor;
  }
  
  printOutput(dataConverter(outputColors, 9));
}
