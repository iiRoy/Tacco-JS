var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataProcessor;
var inputLines = [];
inputReader.on('line', function(currentInputLine){inputLines.push(currentInputLine);});
inputReader.on('close', function(){
  dataProcessor = initializeInput(inputLines);
  console.error("\n");
  var startTime = Date.now();
  executeMainLogic();
  var elapsedTime = Date.now() - startTime;
  printDebug("time : " + (elapsedTime) + "ms");
  printDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function createDeepCopy(originalObject){return JSON.parse(JSON.stringify(originalObject));}
function getNextInteger(){return convertInput(fetchNextLine(),1);} function getNextStringArray(){return convertInput(fetchNextLine(),2);}
function getNextIntegerArray(){return convertInput(fetchNextLine(),4);} function getNextCharacterArray(){return convertInput(fetchNextLine(),6);}
function fetchNextLine(){return dataProcessor.next();} function hasMoreLines(){return dataProcessor.hasNext();}
function initializeInput(rawInputLines){  
  var inputHandler = {
    lineList : rawInputLines, currentIndex : 0, totalLines : rawInputLines.length,
    hasNext : function(){return (this.currentIndex < this.totalLines);},
    next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var currentLineContent = this.lineList[this.currentIndex];this.currentIndex++;return currentLineContent;}}
  };
  return inputHandler;
}
function printOutput(outputValue){console.log(outputValue);}
function printDebug(debugMessage){console.error("debug:" + require("util").inspect(debugMessage,false,null));}
// This function handles various input conversions.
// conversionType:
// 1: Convert to integer.
// 2: Split by space into string array.
// 4: Split by space into number array.
// 6: Split by character into string array.
// 7: Split by character into number array.
// 8: Join array elements with space.
// 9: Join array elements with newline.
// 0: Join array elements without separator.
// Default: Return value as is.
function convertInput(valueToConvert,conversionType){try{switch(conversionType){case 1:return parseInt(valueToConvert);case 2:return valueToConvert.split(" ");case 4:return valueToConvert.split(" ").map(Number);case 6:return valueToConvert.split("");case 7:return valueToConvert.split("").map(Number);case 8:return valueToConvert.join(" ");case 9:return valueToConvert.join("\n");case 0:return valueToConvert.join("");default:return valueToConvert;}}catch(errorObject){return valueToConvert;}}

function executeMainLogic(){
	var inputString = fetchNextLine();
	var stringLength = inputString.length;
	var maxSize = 100005;
	var dynamicProgrammingTable = new Array(maxSize);
	for(var idx = 0; idx < maxSize; idx++){
		dynamicProgrammingTable[idx] = new Array(13).fill(0);
	}
	dynamicProgrammingTable[0][0] = 1;
	var moduloValue = 1000000007;
	for(var idx = 0; idx < stringLength; idx++){
		for(var remainderIdx = 0; remainderIdx < 13; remainderIdx++){
			var currentChar = inputString[idx];
			if(currentChar == "?"){
				for(var digitValue = 0; digitValue < 10; digitValue++){
					dynamicProgrammingTable[idx + 1][(remainderIdx * 10 + digitValue) % 13] += dynamicProgrammingTable[idx][remainderIdx];
					dynamicProgrammingTable[idx + 1][(remainderIdx * 10 + digitValue) % 13] %= moduloValue;
				}
			}else{
				var digitValue = convertInput(inputString[idx], 1);
				dynamicProgrammingTable[idx + 1][(remainderIdx * 10 + digitValue) % 13] += dynamicProgrammingTable[idx][remainderIdx];
				dynamicProgrammingTable[idx + 1][(remainderIdx * 10 + digitValue) % 13] %= moduloValue;
			}
		}
	}
	printOutput(dynamicProgrammingTable[stringLength][5]);
}
