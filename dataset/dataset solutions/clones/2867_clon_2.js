var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputProcessor;
var inputLines = [];
inputReader.on('line', function(currentInputLine){inputLines.push(currentInputLine);});
inputReader.on('close', function(){
  inputProcessor = initializeInputHandler(inputLines);
  logDebugMessage("----- execution started -----");
  var startTime = new Date();
  MainAlgorithm();
  var endTime = new Date() - startTime;
  logDebugMessage("----- execution finished -----");
  logDebugMessage("time elapsed : " + (endTime) + "ms");
  logDebugMessage("memory usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function retrieveInteger(){return performTypeConversion(fetchNextLine(),1);} function retrieveStringArray(){return performTypeConversion(fetchNextLine(),2);}
function retrieveIntegerArray(){return performTypeConversion(fetchNextLine(),4);} function retrieveCharacterArray(){return performTypeConversion(fetchNextLine(),6);}
function fetchNextLine(){return inputProcessor.getNext();} function hasMoreLines(){return inputProcessor.checkNext();}
function initializeInputHandler(incomingLines){
  var handlerObject = {
    sourceLines : incomingLines, currentLineIndex : 0, totalLines : incomingLines.length,
    checkNext : function(){return (this.currentLineIndex < this.totalLines);},
    getNext : function(){if(!this.checkNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var currentInputLine = this.sourceLines[this.currentLineIndex];this.currentLineIndex++;return currentInputLine;}}
  };
  return handlerObject;
}
function displayResult(outputValue){console.log(outputValue);}
function logDebugMessage(messageContent){console.error("debug:" + require("util").inspect(messageContent,false,null));}
function performTypeConversion(inputValue, conversionCode){try{switch(conversionCode){case 1:return parseInt(inputValue);case 2:return inputValue.split(" ");case 4:return inputValue.split(" ").map(Number);case 6:return inputValue.split("");case 7:return inputValue.split("").map(Number);case 8:return inputValue.join(" ");case 9:return inputValue.join("\n");case 0:return inputValue.join("");default:return inputValue;}}catch(error){return inputValue;}}

function MainAlgorithm(){
	var dimensions = retrieveIntegerArray();
	var gridHeight = dimensions[0];
	var gridWidth = dimensions[1];
	var characterGrid = new Array(gridHeight);
	var cellDataGrid = new Array(gridHeight);
	for(var rowIdx = 0; rowIdx < gridHeight; rowIdx++){
		characterGrid[rowIdx] = retrieveCharacterArray();
		cellDataGrid[rowIdx] = new Array(gridWidth);
		for(var colIdx = 0; colIdx < gridWidth; colIdx++){
			cellDataGrid[rowIdx][colIdx] = {
				verticalLength : 0,
				horizontalLength : 0
			};
			if(characterGrid[rowIdx][colIdx] == "."){
				if(colIdx == 0){
					cellDataGrid[rowIdx][colIdx].horizontalLength = 1;
				}else{
					cellDataGrid[rowIdx][colIdx].horizontalLength += cellDataGrid[rowIdx][colIdx - 1].horizontalLength + 1;
				}
			}
		}
	}
	for(var colIdx = 0; colIdx < gridWidth; colIdx++){
		for(var rowIdx = 0; rowIdx < gridHeight; rowIdx++){
			if(characterGrid[rowIdx][colIdx] == "."){
				if(rowIdx == 0){
					cellDataGrid[rowIdx][colIdx].verticalLength = 1;
				}else{
					cellDataGrid[rowIdx][colIdx].verticalLength += cellDataGrid[rowIdx - 1][colIdx].verticalLength + 1;
				}
			}
		}
	}
	for(var rowIdx = gridHeight - 1; rowIdx >= 0; rowIdx--){
		for(var colIdx = gridWidth - 1; colIdx >= 0; colIdx--){
			if(characterGrid[rowIdx][colIdx] == "."){
				if(colIdx != gridWidth - 1){
					cellDataGrid[rowIdx][colIdx].horizontalLength = Math.max(cellDataGrid[rowIdx][colIdx].horizontalLength, cellDataGrid[rowIdx][colIdx + 1].horizontalLength);
				}
				if(rowIdx != gridHeight - 1){
					cellDataGrid[rowIdx][colIdx].verticalLength = Math.max(cellDataGrid[rowIdx][colIdx].verticalLength, cellDataGrid[rowIdx + 1][colIdx].verticalLength);
				}
			}
		}
	}
	var maxPathLength = 0;
	for(var rowIdx = 0; rowIdx < gridHeight; rowIdx++){
		for(var colIdx = 0; colIdx < gridWidth; colIdx++){
			maxPathLength = Math.max(maxPathLength, cellDataGrid[rowIdx][colIdx].verticalLength + cellDataGrid[rowIdx][colIdx].horizontalLength - 1);
		}
	}
	displayResult(maxPathLength);
}
