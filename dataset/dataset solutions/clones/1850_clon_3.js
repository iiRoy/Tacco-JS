var inputReaderOptions = {
  input: process.stdin,
  output: process.stdout
};
var inputReader = require('readline').createInterface(inputReaderOptions);

var inputProcessor;
var collectedInputLines = [];

inputReader.on('line', function(currentInputLine){
  collectedInputLines.push(currentInputLine);
});

inputReader.on('close', function(){
  inputProcessor = initializeInputProcessor(collectedInputLines);
  logDebugMessage("-----start-----");
  var executionStartTime = new Date();
  runApplicationLogic();
  var executionDurationMs = new Date() - executionStartTime;
  logDebugMessage("----- end -----");
  logDebugMessage("time : " + (executionDurationMs) + "ms");
});

function getNextInt(){ return performTypeConversion(getNextLine(), 1); }
function getNextStrArray(){ return performTypeConversion(getNextLine(), 2); }
function getNextIntArray(){ return performTypeConversion(getNextLine(), 4); }
function getNextCharArray(){ return performTypeConversion(getNextLine(), 6); }

function getNextLine(){ return inputProcessor.next(); }
function hasMoreLines(){ return inputProcessor.hasNext(); }

function initializeInputProcessor(rawInputData){  
  var processorInstance = {};
  processorInstance.dataLines = rawInputData;
  processorInstance.currentLineIndex = 0;
  processorInstance.totalLines = rawInputData.length;

  var outOfBoundsErrorMsg = "ArrayIndexOutOfBoundsException これ以上ないよ";

  processorInstance.hasNext = function(){
    return (this.currentLineIndex < this.totalLines);
  };

  processorInstance.next = function(){
    if(!this.hasNext()){
      throw outOfBoundsErrorMsg;
    } else {
      var currentProcessedLine = this.dataLines[this.currentLineIndex];
      this.currentLineIndex++;
      return currentProcessedLine;
    }
  };
  return processorInstance;
}

function outputResult(content){ console.log(content); }
function logDebugMessage(message){ console.error("debug:" + require("util").inspect(message,false,null)); }

// Conversion modes for performTypeConversion:
// Default: Returns input as is
// 1: Converts to integer
// 2: Splits by half-width space
// 4: Splits by half-width space and converts to number array
// 6: Splits by character
// 7: Splits by character and converts to number array
// 8: Joins array elements with half-width space
// 9: Joins array elements with newline
// 0: Joins array elements without separator
function performTypeConversion(inputValue, conversionMode){
  try {
    switch(conversionMode){
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map(Number);
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map(Number);
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch(e){
    return inputValue; // Return original value on conversion error
  }
}

function runApplicationLogic(){
	var maxDisplayLength = getNextInt();
	var targetString = getNextLine();
	
    var stringLength = targetString.length;
    
	if(stringLength <= maxDisplayLength){
		outputResult(targetString);
	} else {
        const ellipsisSuffix = "...";
        const truncationPrefixLength = 7; 
        var truncatedOutput = targetString.slice(0, truncationPrefixLength) + ellipsisSuffix;
		outputResult(truncatedOutput);
	}
}
