var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataIterator;
var inputLines = [];

inputReader.on('line', function(rawInput){
  inputLines.push(rawInput);
});

inputReader.on('close', function(){
  dataIterator = initializeInputProcessor(inputLines);
  console.error("\n");

  var startTime = Date.now();
  executeMainLogic();
  var elapsedTime = Date.now() - startTime;

  logDebugMessage("time : " + (elapsedTime) + "ms");
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function duplicateObject(sourceObj){
  return JSON.parse(JSON.stringify(sourceObj));
}

function getNextInteger(){
  return convertInputData(fetchNextLine(), 1);
}

function getNextStringArray(){
  return convertInputData(fetchNextLine(), 2);
}

function getNextIntegerArray(){
  return convertInputData(fetchNextLine(), 4);
}

function getNextCharacterArray(){
  return convertInputData(fetchNextLine(), 6);
}

function fetchNextLine(){
  return dataIterator.fetchNextLine();
}

function hasMoreLines(){
  return dataIterator.hasMoreLines();
}

function initializeInputProcessor(rawInputList){
  var processorInstance = {
    sourceList : rawInputList,
    currentIdx : 0,
    maxCount : rawInputList.length,

    hasMoreLines : function(){
      return (this.currentIdx < this.maxCount);
    },

    fetchNextLine : function(){
      if(!this.hasMoreLines()){
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var currentInputLine = this.sourceList[this.currentIdx];
        this.currentIdx++;
        return currentInputLine;
      }
    }
  };
  return processorInstance;
}

function printOutput(messageContent){
  console.log(messageContent);
}

function logDebugMessage(messageContent){
  console.error("debug:" + require("util").inspect(messageContent, false, null));
}

function convertInputData(valueToConvert, conversionType){
  try{
    switch(conversionType){
      case 1: return parseInt(valueToConvert);
      case 2: return valueToConvert.split(" ");
      case 4: return valueToConvert.split(" ").map(Number);
      case 6: return valueToConvert.split("");
      case 7: return valueToConvert.split("").map(Number);
      case 8: return valueToConvert.join(" ");
      case 9: return valueToConvert.join("\n");
      case 0: return valueToConvert.join("");
      default: return valueToConvert;
    }
  } catch(conversionError){
    return valueToConvert;
  }
}

function executeMainLogic(){
	var firstLineData = getNextIntegerArray();
	var paramM = firstLineData[0];
	var paramK = firstLineData[1];

	if(paramK === 0){
		var resultSequence = new Array(Math.pow(2, paramM + 1));
		for(var idx = 0; idx < Math.pow(2, paramM); idx++){
			resultSequence[idx * 2] = idx;
			resultSequence[idx * 2 + 1] = idx;
		}
		printOutput(convertInputData(resultSequence, 8));
	} else {
		printOutput(-1);
	}
}
