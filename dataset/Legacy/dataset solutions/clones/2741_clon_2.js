var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataProcessor;
var inputLines = [];
inputReader.on('line', function(inputLine){
  inputLines.push(inputLine);
});
inputReader.on('close', function(){
  dataProcessor = initializeInputHandler(inputLines);
  console.error("\n");
  var startTime = Date.now();
  executeMainLogic();
  var elapsedTime = Date.now() - startTime;
  logDebugMessage("execution time : " + (elapsedTime) + "ms");
  logDebugMessage("memory usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createDeepCopy(originalObject){
  return JSON.parse(JSON.stringify(originalObject));
}

function retrieveNextInteger(){
  return convertInput(fetchNextLine(), 1);
}

function retrieveNextStringArray(){
  return convertInput(fetchNextLine(), 2);
}

function retrieveNextIntegerArray(){
  return convertInput(fetchNextLine(), 4);
}

function retrieveNextCharacterArray(){
  return convertInput(fetchNextLine(), 6);
}

function fetchNextLine(){
  return dataProcessor.getNextItem();
}

function hasMoreLines(){
  return dataProcessor.checkAvailability();
}

function initializeInputHandler(inputData){  
  var handlerObject = {
    lineBuffer : inputData,
    currentPosition : 0,
    totalLines : inputData.length,
    checkAvailability : function(){
      return (this.currentPosition < this.totalLines);
    },
    getNextItem : function(){
      if(!this.checkAvailability()){
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var currentInputLine = this.lineBuffer[this.currentPosition];
        this.currentPosition++;
        return currentInputLine;
      }
    }
  };
  return handlerObject;
}

function displayResult(outputContent){
  console.log(outputContent);
}

function logDebugMessage(debugInfo){
  console.error("debug_output:" + require("util").inspect(debugInfo, false, null));
}

function convertInput(inputValue, conversionType){
  try {
    switch(conversionType){
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
  } catch(error) {
    return inputValue;
  }
}

function executeMainLogic(){
	var elementCount = retrieveNextInteger();
	var sortedSequence = [];
	for(var loopCounter = 0; loopCounter < elementCount; loopCounter++){
		var currentValue = retrieveNextInteger();
		if(loopCounter === 0){
			sortedSequence.push(currentValue);
			continue;
		}
		var insertionPoint = findInsertionPoint(sortedSequence, currentValue);
		if(insertionPoint === sortedSequence.length){
			sortedSequence.push(currentValue);
		} else {
			sortedSequence[insertionPoint] = currentValue;
		}
	}
	displayResult(sortedSequence.length);
}

function findInsertionPoint(orderedCollection, targetValue){
  // The orderedCollection is assumed to be sorted in ascending order.
  // We treat the right side as the valid area and the left side as the invalid area.
  // The element (index) returned by targetValue will be:
  // positiveBound: minimum value in the valid part, negativeBound: maximum value in the invalid part.
  var negativeBound = -1;
  var positiveBound = orderedCollection.length;
  var midPoint;
  while(Math.abs(positiveBound - negativeBound) > 1){
    midPoint = Math.floor((positiveBound + negativeBound) / 2);
    if(orderedCollection[midPoint] < targetValue){
       positiveBound = midPoint;
    } else {
       negativeBound = midPoint;
    }
  }
  return positiveBound;
}
