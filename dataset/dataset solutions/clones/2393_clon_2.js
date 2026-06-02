var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataParser;
var inputBuffer = [];
inputReader.on('line', function(currentLine){inputBuffer.push(currentLine);});
inputReader.on('close', function(){
  dataParser = initializeInputProcessor(inputBuffer);
  console.error("\n");
  var startTime = new Date();
  executeGraphColoring();
  var elapsedTime = new Date() - startTime;
  
  logDebug("time : " + (elapsedTime) + "ms");
  logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function createDeepCopy(originalObject){return JSON.parse(JSON.stringify(originalObject));}
function retrieveInteger(){return convertAndFormat(getNextLine(), 0x1);} function retrieveStringArray(){return convertAndFormat(getNextLine(), 0x2);}
function retrieveIntegerArray(){return convertAndFormat(getNextLine(), 0x4);} function retrieveCharacterArray(){return convertAndFormat(getNextLine(), 0x6);}
function getNextLine(){return dataParser.next();} function hasMoreLines(){return dataParser.hasNext();}
function initializeInputProcessor(linesArray){  
  var processorObject = {
    lineList : linesArray, currentIdx : 0x0, maxLines : linesArray.length,
    hasNext : function(){return (this.currentIdx < this.maxLines);},
    next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var retrievedLine = this.lineList[this.currentIdx];this.currentIdx++;return retrievedLine;}}
  };
  return processorObject;
}
function printResult(outputValue){console.log(outputValue);}
function logDebug(debugMessage){console.error("debug:" + require("util").inspect(debugMessage,false,void 0));}
function convertAndFormat(inputValue, conversionCode){try{switch(conversionCode){case 0x1:return parseInt(inputValue);case 0x2:return inputValue.split(" ");case 0x4:return inputValue.split(" ").map(Number);case 0x6:return inputValue.split("");case 0x7:return inputValue.split("").map(Number);case 0x8:return inputValue.join(" ");case 0x9:return inputValue.join("\n");case 0x0:return inputValue.join("");default:return inputValue;}}catch(error){return inputValue;}}

function executeGraphColoring(){
	var nodeCount = retrieveInteger();
	var adjacencyStructure = Array(nodeCount);
	var edgeProperties = {};
	for(var idx = 0x0; idx < nodeCount; idx++){
		adjacencyStructure[idx] = {
			neighborNodes : []
		};
	}
	var maxAssignedColor = 0x0;
	for(var idx = 0x0; idx < nodeCount - 0x1; idx++){
		var edgeData = retrieveIntegerArray();
		var nodeAIndex = edgeData[0x0] - 0x1;
		var nodeBIndex = edgeData[0x1] - 0x1;
		adjacencyStructure[nodeAIndex].neighborNodes.push(nodeBIndex);
		adjacencyStructure[nodeBIndex].neighborNodes.push(nodeAIndex);
		edgeProperties[nodeAIndex + ":" + nodeBIndex] = {
			originalIndex : idx,
			assignedColor : void 0
		};
	}
	
	var bfsTraversalQueue = [[0x0,0x0]];
	while(bfsTraversalQueue.length > 0x0){
		var currentQueueItem = bfsTraversalQueue.shift();
		var currentNodeIdentifier = currentQueueItem[0x0];
		var incomingEdgeColor = currentQueueItem[0x1];
		var neighborNodes = adjacencyStructure[currentNodeIdentifier].neighborNodes;
		var nextAvailableColor = 0x1;
		for(var idx = 0x0; idx < neighborNodes.length; idx++){
			var neighborNodeIdentifier = neighborNodes[idx];
			var smallerNode;
			var largerNode;
			if(currentNodeIdentifier > neighborNodeIdentifier){
				smallerNode = neighborNodeIdentifier;
				largerNode = currentNodeIdentifier;
			}else{
				smallerNode = currentNodeIdentifier;
				largerNode = neighborNodeIdentifier;
			}
			if(edgeProperties[smallerNode + ":" + largerNode].assignedColor === void 0){
				if(nextAvailableColor === incomingEdgeColor){
					nextAvailableColor++;
				}
				edgeProperties[smallerNode + ":" + largerNode].assignedColor = nextAvailableColor;
				bfsTraversalQueue.push([neighborNodeIdentifier, nextAvailableColor]);
				maxAssignedColor = Math.max(nextAvailableColor, maxAssignedColor);
				nextAvailableColor++;
				
			}
		}
	}
	
	printResult(maxAssignedColor);
	var finalEdgeColors = Array(nodeCount - 0x1);
	var sortedEdgeDetails = Array(nodeCount - 0x1);
	var edgeKeys = Object.keys(edgeProperties);
	for(var idx = 0x0; idx < edgeKeys.length; idx++){
		sortedEdgeDetails[idx] = edgeProperties[edgeKeys[idx]];
	}
	sortedEdgeDetails.sort(function(detailA,detailB){
		return detailA.originalIndex - detailB.originalIndex;
	});
	for(var idx = 0x0; idx < nodeCount - 0x1; idx++){
		finalEdgeColors[idx] = sortedEdgeDetails[idx].assignedColor;
	}
	printResult(convertAndFormat(finalEdgeColors,0x9));
}
