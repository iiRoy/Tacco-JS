var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataIterator;
var inputLines = [];
inputReader.on('line', function(currentLine){inputLines.push(currentLine);});
inputReader.on('close', function(){
  dataIterator = initializeInputProcessor(inputLines);
  logDebugMessage("-----start-----");
  var startTime = new Date();
  executeMainLogic();
  var endTime = new Date() - startTime;
  logDebugMessage("----- end -----");
  logDebugMessage("time : " + (endTime) + "ms");
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function getNextInteger(){return convertInputData(fetchNextLine(),1);}
function getNextStringArray(){return convertInputData(fetchNextLine(),2);}
function getNextIntegerArray(){return convertInputData(fetchNextLine(),4);}
function getNextCharacterArray(){return convertInputData(fetchNextLine(),6);}
function fetchNextLine(){return dataIterator.next();}
function hasMoreLines(){return dataIterator.hasMoreLines();}
function initializeInputProcessor(rawInput){  
  var processorObject = {
    list : rawInput, currentIdx : 0, totalLines : rawInput.length,
    hasMoreLines : function(){return (this.currentIdx < this.totalLines);},
    next : function(){if(!this.hasMoreLines()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var retrievedInput = this.list[this.currentIdx];this.currentIdx++;return retrievedInput;}}
  };
  return processorObject;
}
function printOutput(outputValue){console.log(outputValue);}
function logDebugMessage(debugContent){console.error("debug:" + require("util").inspect(debugContent,false,null));}
//[no]要素の扱い。数値型
//不明値、異常時:引数そのまま返す 1:数値へ変換
//2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字で分割  7:1文字で分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function convertInputData(inputValue, conversionType){try{switch(conversionType){case 1:return parseInt(inputValue);case 2:return inputValue.split(" ");case 4:return inputValue.split(" ").map(Number);case 6:return inputValue.split("");case 7:return inputValue.split("").map(Number);case 8:return inputValue.join(" ");case 9:return inputValue.join("\n");case 0:return inputValue.join("");default:return inputValue;}}catch(e){return inputValue;}}

function executeMainLogic(){
	var initialInput = getNextIntegerArray();
	var countA = initialInput[0];
	var countB = initialInput[1];

	const GRID_DIMENSION = 100;
	var gridRepresentation = new Array(GRID_DIMENSION);

	// Helper function for initializing a grid row with a specific character
	const initializeGridRow = (fillCharacter) => {
		return new Array(GRID_DIMENSION).fill(fillCharacter);
	};

	// Initialize the grid based on row index
	const HALF_DIMENSION = GRID_DIMENSION / 2;
	for(let rowIdx = 0; rowIdx < GRID_DIMENSION; rowIdx++){
		if(rowIdx < HALF_DIMENSION){
			gridRepresentation[rowIdx] = initializeGridRow("#");
		} else {
			gridRepresentation[rowIdx] = initializeGridRow(".");
		}
	}
	
	// Apply modifications for countA
	const MOD_FACTOR = 2;
	const TARGET_CHAR_A = ".";
	for(let currentIdxA = 0; currentIdxA < countA - 1; currentIdxA++){
		const colPositionA = (currentIdxA * MOD_FACTOR) % GRID_DIMENSION;
		const rowOffsetA = Math.floor(currentIdxA / GRID_DIMENSION) * MOD_FACTOR;
		const rowPositionA = rowOffsetA; // Row position for A starts from 0
		gridRepresentation[rowPositionA][colPositionA] = TARGET_CHAR_A;
	}
	
	// Apply modifications for countB
	const TARGET_CHAR_B = "#";
	const ROW_OFFSET_B_START = 51; // Starting row offset for B modifications
	for(let currentIdxB = 0; currentIdxB < countB - 1; currentIdxB++){
		const colPositionB = (currentIdxB * MOD_FACTOR) % GRID_DIMENSION;
		const rowOffsetB = Math.floor(currentIdxB / GRID_DIMENSION) * MOD_FACTOR;
		const rowPositionB = rowOffsetB + ROW_OFFSET_B_START;
		gridRepresentation[rowPositionB][colPositionB] = TARGET_CHAR_B;
	}

	// Output the grid dimensions
	printOutput(`${GRID_DIMENSION} ${GRID_DIMENSION}`);
	
	// Output the grid content row by row
	for(let outputRowIdx = 0; outputRowIdx < GRID_DIMENSION; outputRowIdx++){
		printOutput(convertInputData(gridRepresentation[outputRowIdx], 0));
	}
}
