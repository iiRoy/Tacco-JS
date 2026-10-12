var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var parsedInput;
var rawInputLines = [];
inputReader.on('line', function(line){rawInputLines.push(line);});
inputReader.on('close', function(){
  parsedInput = initializeInputParser(rawInputLines);
  console.error("\n");
  var startTime = new Date();
  solveGraphColoring();
  var endTime = new Date() - startTime;
  
  logDebug("time : " + (endTime) + "ms");
  logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function deepCopyObject(obj){return JSON.parse(JSON.stringify(obj));}
function readInteger(){return dataTransformer(getNextToken(),1);}
function readStringArray(){return dataTransformer(getNextToken(),2);}
function readIntegerArray(){return dataTransformer(getNextToken(),4);}
function readCharacterArray(){return dataTransformer(getNextToken(),6);}
function getNextToken(){return parsedInput.retrieveNext();}
function hasMoreTokensAvailable(){return parsedInput.checkNext();}
function initializeInputParser(inputData){  
  var inputProcessor = {
    inputSource : inputData, currentIndex : 0, maxIndex : inputData.length,
    checkNext : function(){return (this.currentIndex < this.maxIndex);},
    retrieveNext : function(){if(!this.checkNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var currentInput = this.inputSource[this.currentIndex];this.currentIndex++;return currentInput;}}
  };
  return inputProcessor;
}
function printOutput(content){console.log(content);}
function logDebug(content){console.error("debug:" + require("util").inspect(content,false,null));}
function dataTransformer(value, conversionType){try{switch(conversionType){case 1:return parseInt(value);case 2:return value.split(" ");case 4:return value.split(" ").map(Number);case 6:return value.split("");case 7:return value.split("").map(Number);case 8:return value.join(" ");case 9:return value.join("\n");case 0:return value.join("");default:return value;}}catch(e){return value;}}

function solveGraphColoring(){
	var nodeCount = readInteger();
	var adjacencyList = Array.from({ length: nodeCount }, () => []);
	var edgeColors = new Array(nodeCount - 1).fill(0);
	
	for(var i = 0; i < nodeCount - 1; i++){
		var edgeEndpoints = readIntegerArray();
		var nodeA = edgeEndpoints[0] - 1;
		var nodeB = edgeEndpoints[1] - 1;
		
		adjacencyList[nodeA].push({ neighbor: nodeB, edgeIdentifier: i });
		adjacencyList[nodeB].push({ neighbor: nodeA, edgeIdentifier: i });
	}
	
	var bfsQueue = [{ currentVertex: 0, incomingEdgeColor: 0 }];
	var queuePointer = 0;
	var maximumColor = 0;
	
	while(queuePointer < bfsQueue.length){
		var currentQueueItem = bfsQueue[queuePointer++];
		var currentVertex = currentQueueItem.currentVertex;
		var colorFromParent = currentQueueItem.incomingEdgeColor;
		
		var nextAvailableColor = 1;
		
		for(const incidentEdge of adjacencyList[currentVertex]){
			var connectedVertex = incidentEdge.neighbor;
			var edgeIndex = incidentEdge.edgeIdentifier;
			
			if(edgeColors[edgeIndex] === 0){
				if(nextAvailableColor === colorFromParent){
					nextAvailableColor++;
				}
				edgeColors[edgeIndex] = nextAvailableColor;
				bfsQueue.push({ currentVertex: connectedVertex, incomingEdgeColor: nextAvailableColor });
				maximumColor = Math.max(maximumColor, nextAvailableColor);
				nextAvailableColor++;
			}
		}
	}
	
	printOutput(maximumColor);
	printOutput(dataTransformer(edgeColors, 9));
}
