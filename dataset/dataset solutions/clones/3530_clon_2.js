var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataProcessor;
var inputLines = [];
inputReader.on('line', function(currentLine){inputLines.push(currentLine);});
inputReader.on('close', function(){
  dataProcessor = initializeInputProcessor(inputLines);
  printDebug("-----start-----");
  var startTime = new Date();
  executeMainLogic();
  var endTime = new Date() - startTime;
  printDebug("----- end -----");
  printDebug("time : " + (endTime) + "ms");
  printDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function getNextInteger(){return convertInput(fetchNextLine(),1);} function getNextStringArray(){return convertInput(fetchNextLine(),2);}
function getNextIntegerArray(){return convertInput(fetchNextLine(),4);} function getNextCharacterArray(){return convertInput(fetchNextLine(),6);}
function fetchNextLine(){return dataProcessor.retrieveNextLine();} function hasMoreLines(){return dataProcessor.checkMoreLines();}
function initializeInputProcessor(inputData){  
  var processorInstance = {
    lineList : inputData, currentIndex : 0, maxIndex : inputData.length,
    checkMoreLines : function(){return (this.currentIndex < this.maxIndex);},
    retrieveNextLine : function(){if(!this.checkMoreLines()){throw "ArrayIndexOutOfBoundsException No more lines available";}else{var currentInputLine = this.lineList[this.currentIndex];this.currentIndex++;return currentInputLine;}}
  };
  return processorInstance;
}
function printOutput(message){console.log(message);}
function printDebug(message){console.error("debug:" + require("util").inspect(message,false,null));}
// Conversion utility:
// [conversionType] handling of elements. Numeric type.
// Unknown value, error: returns argument as is. 1: convert to integer.
// 2: split by space. 4: split by space and convert to number array.
// 6: split by character. 7: split by character and convert to number array.
// 8: join by space. 9: join by newline. 0: join without separator.
function convertInput(inputVal,conversionType){try{switch(conversionType){case 1:return parseInt(inputVal);case 2:return inputVal.split(" ");case 4:return inputVal.split(" ").map(Number);case 6:return inputVal.split("");case 7:return inputVal.split("").map(Number);case 8:return inputVal.join(" ");case 9:return inputVal.join("\n");case 0:return inputVal.join("");default:return inputVal;}}catch(e){return inputVal;}}

function executeMainLogic(){
	var sourceString = fetchNextLine();
	var targetString = fetchNextLine();
	var charIndexMap = {};
	var alphabetChars = "abcdefghijklmnopqrstuvwxyz";
	for(var charPos = 0; charPos < alphabetChars.length; charPos++){
		charIndexMap[alphabetChars[charPos]] = new Set();
	}
	for(var strPos = 0; strPos < sourceString.length; strPos++){
		charIndexMap[sourceString[strPos]].add(strPos);
	}
	for(var strPos = 0; strPos < sourceString.length; strPos++){
		for(var alphaIdx = 0; alphaIdx < alphabetChars.length; alphaIdx++){
			if(charIndexMap[alphabetChars[alphaIdx]].has(strPos) && alphabetChars[alphaIdx] != targetString[strPos]){
				var tempSet = charIndexMap[alphabetChars[alphaIdx]];
				charIndexMap[alphabetChars[alphaIdx]] = charIndexMap[targetString[strPos]];
				charIndexMap[targetString[strPos]] = tempSet;
			}
		}
	}
	var resultArray = new Array(sourceString.length);
	var mapKeys = Object.keys(charIndexMap);
	for(var keyIdx = 0; keyIdx < mapKeys.length; keyIdx++){
		var charIndexes = Array.from(charIndexMap[mapKeys[keyIdx]]);
		for(var indexInSet = 0; indexInSet < charIndexes.length; indexInSet++){
			resultArray[charIndexes[indexInSet]] = mapKeys[keyIdx];
		}
	}
	resultArray = convertInput(resultArray,0);
	printDebug(targetString);
	printDebug(resultArray);
	if(resultArray == targetString){
		printOutput("Yes");
	}else{
		printOutput("No");
	}
}
