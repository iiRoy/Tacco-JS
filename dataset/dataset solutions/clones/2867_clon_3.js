var read = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputBuffer;
var inputLines = [];
read.on('line', function(inputLine){inputLines.push(inputLine);});
read.on('close', function(){
  inputBuffer = initializeInputBuffer(inputLines);
  printDebug("-----start-----");
  var startTime = new Date();
  executeMainLogic();
  var endTime = new Date() - startTime;
  printDebug("----- end -----");
  printDebug("time : " + (endTime) + "ms");
  printDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function getNextInt(){return convertInput(getNextToken(),1);}
function getNextStrArray(){return convertInput(getNextToken(),2);}
function getNextIntArray(){return convertInput(getNextToken(),4);}
function getNextCharArray(){return convertInput(getNextToken(),6);}
function getNextToken(){return inputBuffer.getNext();}
function hasMoreTokens(){return inputBuffer.hasMore();}
function initializeInputBuffer(inputData){  
  var bufferObject = {
    dataList : inputData, currentIndex : 0, maxIndex : inputData.length,
    hasMore : function(){return (this.currentIndex < this.maxIndex);},
    getNext : function(){if(!this.hasMore()){throw "ArrayIndexOutOfBoundsException No more input available";}else{var currentInput = this.dataList[this.currentIndex];this.currentIndex++;return currentInput;}}
  };
  return bufferObject;
}
function printOutput(message){console.log(message);}
function printDebug(debugMessage){console.error("debug:" + require("util").inspect(debugMessage,false,null));}
function convertInput(inputValue, conversionType){try{switch(conversionType){case 1:return parseInt(inputValue);case 2:return inputValue.split(" ");case 4:return inputValue.split(" ").map(Number);case 6:return inputValue.split("");case 7:return inputValue.split("").map(Number);case 8:return inputValue.join(" ");case 9:return inputValue.join("\n");case 0:return inputValue.join("");default:return inputValue;}}catch(e){return inputValue;}}

function executeMainLogic(){
	const EMPTY_CELL_CHAR = ".";
	const PATH_OVERLAP_ADJUSTMENT = 1;

	function createPathCellInfo() {
		return { verticalPathLen: 0, horizontalPathLen: 0 };
	}

	var dimensionsInput = getNextIntArray();
	var gridHeight = dimensionsInput[0];
	var gridWidth = dimensionsInput[1];

	var charGrid = new Array(gridHeight);
	var pathInfoGrid = new Array(gridHeight);

	// First pass: Calculate initial horizontal and vertical path lengths
	// (left-to-right, top-to-bottom).
	// Each cell's path length is based on the cell immediately to its left or above.
	for(var rowIdx = 0; rowIdx < gridHeight; rowIdx++){
		charGrid[rowIdx] = getNextCharArray();
		pathInfoGrid[rowIdx] = new Array(gridWidth);

		for(var colIdx = 0; colIdx < gridWidth; colIdx++){
			pathInfoGrid[rowIdx][colIdx] = createPathCellInfo();

			if(charGrid[rowIdx][colIdx] === EMPTY_CELL_CHAR){
				// Calculate horizontal path length ending at current cell
				if(colIdx === 0){
					pathInfoGrid[rowIdx][colIdx].horizontalPathLen = 1;
				}else{
					pathInfoGrid[rowIdx][colIdx].horizontalPathLen = pathInfoGrid[rowIdx][colIdx - 1].horizontalPathLen + 1;
				}

				// Calculate vertical path length ending at current cell
				if(rowIdx === 0){
					pathInfoGrid[rowIdx][colIdx].verticalPathLen = 1;
				}else{
					pathInfoGrid[rowIdx][colIdx].verticalPathLen = pathInfoGrid[rowIdx - 1][colIdx].verticalPathLen + 1;
				}
			}
		}
	}

	// Second pass: Propagate maximum horizontal and vertical path lengths
	// (right-to-left, bottom-to-top).
	// This ensures each cell stores the length of the longest path *containing* it,
	// by considering paths extending to its right or below.
	for(var rowIdx = gridHeight - 1; rowIdx >= 0; rowIdx--){
		for(var colIdx = gridWidth - 1; colIdx >= 0; colIdx--){
			if(charGrid[rowIdx][colIdx] === EMPTY_CELL_CHAR){
				let currentHorizontalLen = pathInfoGrid[rowIdx][colIdx].horizontalPathLen;
				let currentVerticalLen = pathInfoGrid[rowIdx][colIdx].verticalPathLen;

				// Propagate horizontal length from the cell to the right
				if(colIdx < gridWidth - 1){
					currentHorizontalLen = Math.max(currentHorizontalLen, pathInfoGrid[rowIdx][colIdx + 1].horizontalPathLen);
				}
				// Propagate vertical length from the cell below
				if(rowIdx < gridHeight - 1){
					currentVerticalLen = Math.max(currentVerticalLen, pathInfoGrid[rowIdx + 1][colIdx].verticalPathLen);
				}
				pathInfoGrid[rowIdx][colIdx].horizontalPathLen = currentHorizontalLen;
				pathInfoGrid[rowIdx][colIdx].verticalPathLen = currentVerticalLen;
			}
		}
	}

	var maxPathLength = 0;
	// Final pass: Determine the maximum combined path length across all cells.
	for(var rowIdx = 0; rowIdx < gridHeight; rowIdx++){
		for(var colIdx = 0; colIdx < gridWidth; colIdx++){
			// The combined length is the sum of horizontal and vertical lengths
			// minus 1, because the current cell itself is counted in both directions.
			maxPathLength = Math.max(maxPathLength, pathInfoGrid[rowIdx][colIdx].verticalPathLen + pathInfoGrid[rowIdx][colIdx].horizontalPathLen - PATH_OVERLAP_ADJUSTMENT);
		}
	}
	printOutput(maxPathLength);
}
