var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataHandler;
var inputLines = [];
inputReader.on('line', function(currentLine){inputLines.push(currentLine);});
inputReader.on('close', function(){
  dataHandler = initializeInputProcessor(inputLines);
  logDebug("-----start-----");
  var startTime = new Date();
  executeLogic();
  var endTime = new Date() - startTime;
  logDebug("----- end -----");
  logDebug("time : " + (endTime) + "ms");
  logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function getNextInt(){return convertInput(getNextToken(),1);}
function getNextStrArray(){return convertInput(getNextToken(),2);}
function getNextIntArray(){return convertInput(getNextToken(),4);}
function getNextCharArray(){return convertInput(getNextToken(),6);}
function getNextToken(){return dataHandler.next();}
function hasMoreTokens(){return dataHandler.hasNext();}
function initializeInputProcessor(inputData){  
  var processorObject = {
    lineList : inputData, currentIdx : 0, maxLines : inputData.length,
    hasNext : function(){return (this.currentIdx < this.maxLines);},
    next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var currentInputLine = this.lineList[this.currentIdx];this.currentIdx++;return currentInputLine;}}
  };
  return processorObject;
}
function printResult(outputValue){console.log(outputValue);}
function logDebug(debugMessage){console.error("debug:" + require("util").inspect(debugMessage,false,null));}
//[no]要素の扱い。数値型
//不明値、異常時:引数そのまま返す 1:数値へ変換
//2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字で分割  7:1文字で分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function convertInput(inputValue, conversionType){try{switch(conversionType){case 1:return parseInt(inputValue);case 2:return inputValue.split(" ");case 4:return inputValue.split(" ").map(Number);case 6:return inputValue.split("");case 7:return inputValue.split("").map(Number);case 8:return inputValue.join(" ");case 9:return inputValue.join("\n");case 0:return inputValue.join("");default:return inputValue;}}catch(e){return inputValue;}}

// Helper function to increment counts within a specified range
function incrementRangeCounts(targetArray, startVal, endVal) {
    for (let currentIdx = startVal; currentIdx <= endVal; currentIdx++) {
        targetArray[currentIdx] = targetArray[currentIdx] + 1;
    }
}

// Helper function to calculate the count of elements matching a specific value
function calculateOverlapCount(dataArray, requiredOverlapValue) {
    let currentOverlapCount = 0;
    for (let arrayIndex = 0; arrayIndex < dataArray.length; arrayIndex++) {
        if (dataArray[arrayIndex] === requiredOverlapValue) {
            currentOverlapCount++;
        }
    }
    return currentOverlapCount;
}

function executeLogic(){
	const ARRAY_MAX_INDEX = 101;
	const OVERLAP_TARGET_VALUE = 2;

	var inputParameters = getNextIntArray();
	var rangeAStart = inputParameters[0];
	var rangeAEnd = inputParameters[1];
	var rangeBStart = inputParameters[2];
	var rangeBEnd = inputParameters[3];
	
	var frequencyArray = new Array(ARRAY_MAX_INDEX).fill(0);
	
	incrementRangeCounts(frequencyArray, rangeAStart, rangeAEnd);
	incrementRangeCounts(frequencyArray, rangeBStart, rangeBEnd);
	
	var totalOverlap = calculateOverlapCount(frequencyArray, OVERLAP_TARGET_VALUE);
	
	var finalResult = Math.max(totalOverlap - 1, 0);
	printResult(finalResult);
}
