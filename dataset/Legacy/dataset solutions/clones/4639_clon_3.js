var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataHandler;
var inputLines = [];
inputReader.on('line', function(input){inputLines.push(input);});
inputReader.on('close', function(){
  dataHandler = initializeInputProcessor(inputLines);
  console.error("\n");
  var startTime = new Date();
  executeMainLogic();
  var elapsedTime = new Date() - startTime;
  
  printDebug("time : " + (elapsedTime) + "ms");
  printDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function createDeepCopy(originalObject){return JSON.parse(JSON.stringify(originalObject));}
function readInteger(){return convertInput(getNextLine(),1);} function readStringArray(){return convertInput(getNextLine(),2);}
function readIntegerArray(){return convertInput(getNextLine(),4);} function readCharacterArray(){return convertInput(getNextLine(),6);}
function getNextLine(){return dataHandler.next();} function hasMoreLines(){return dataHandler.hasNext();}
function initializeInputProcessor(sourceLines){  
  var processorInstance = {
    sourceLines : sourceLines, currentLineIndex : 0, totalLines : sourceLines.length,
    hasNext : function(){return (this.currentLineIndex < this.totalLines);},
    next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var currentLineContent = this.sourceLines[this.currentLineIndex];this.currentLineIndex++;return currentLineContent;}}
  };
  return processorInstance;
}
function printOutput(content){console.log(content);}
function printDebug(message){console.error("debug:" + require("util").inspect(message,false,null));}
function convertInput(inputValue,conversionType){try{switch(conversionType){case 1:return parseInt(inputValue);case 2:return inputValue.split(" ");case 4:return inputValue.split(" ").map(Number);case 6:return inputValue.split("");case 7:return inputValue.split("").map(Number);case 8:return inputValue.join(" ");case 9:return inputValue.join("\n");case 0:return inputValue.join("");default:return inputValue;}}catch(e){return inputValue;}}

function executeMainLogic(){
	var firstLineValues = readIntegerArray();
	var [totalElements, minRequired] = firstLineValues;
	var inputNumbers = readIntegerArray();
	var minCost = Math.pow(10,15);
	if(minRequired === 1){
		printOutput(0);
		return;
	}
	const totalSubsets = 1 << totalElements;
	for(let subsetIndex = 0; subsetIndex < totalSubsets; subsetIndex++){
		let currentSubset = [inputNumbers[0]];
		for(let elementIndex = 1; elementIndex < totalElements; elementIndex++){
			const currentBitmask = 1 << elementIndex;
			if((subsetIndex & currentBitmask) !== 0){
				currentSubset.push(inputNumbers[elementIndex]);
			}
		}
		if(currentSubset.length >= minRequired){
			let currentCost = 0;
			const subsetLengthMinusOne = currentSubset.length - 1;
			for(let k = 0; k < subsetLengthMinusOne; k++){
				if(currentSubset[k] >= currentSubset[k + 1]){
					const requiredAdjustment = currentSubset[k] - currentSubset[k + 1] + 1;
					currentCost += requiredAdjustment;
					currentSubset[k + 1] += requiredAdjustment;
				}
			}
			minCost = Math.min(minCost, currentCost);
		}
	}
	printOutput(minCost);
}
