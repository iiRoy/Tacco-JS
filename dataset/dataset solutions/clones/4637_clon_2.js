var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataProcessor;
var inputLines = [];
inputReader.on('line', function(incomingLine){inputLines.push(incomingLine);});
inputReader.on('close', function(){
  dataProcessor = initializeInputHandler(inputLines);
  console.error("\n");
  var startTime = new Date();
  executeAlgorithm();
  var endTime = new Date() - startTime;

  logDebugMessage("time : " + (endTime) + "ms");
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function deepCopyObject(originalObject){
  return JSON.parse(JSON.stringify(originalObject));
}

function retrieveInteger(){
  return convertInputData(getNextLine(),1);
}

function retrieveStringArray(){
  return convertInputData(getNextLine(),2);
}

function retrieveIntegerArray(){
  return convertInputData(getNextLine(),4);
}

function retrieveCharacterArray(){
  return convertInputData(getNextLine(),6);
}

function getNextLine(){
  return dataProcessor.next();
}

function hasMoreLines(){
  return dataProcessor.hasNext();
}

function initializeInputHandler(sourceData){
  var handlerObject = {
    sourceLines : sourceData,
    currentIdx : 0,
    maxLines : sourceData.length,
    hasNext : function(){
      return (this.currentIdx < this.maxLines);
    },
    next : function(){
      if(!this.hasNext()){
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var currentLine = this.sourceLines[this.currentIdx];
        this.currentIdx++;
        return currentLine;
      }
    }
  };
  return handlerObject;
}

function printOutput(outputValue){
  console.log(outputValue);
}

function logDebugMessage(messageContent){
  console.error("debug:" + require("util").inspect(messageContent,false,null));
}

// This function handles various input conversions.
// 1: Convert to integer
// 2: Split by space into string array
// 4: Split by space into number array
// 6: Split by character into string array
// 7: Split by character into number array
// 8: Join array with space
// 9: Join array with newline
// 0: Join array without separator
// Default: Return input as is
function convertInputData(inputValue, conversionType){
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
  } catch(conversionError){
    return inputValue;
  }
}

function executeAlgorithm(){
  var firstLineData = retrieveIntegerArray();
  var totalElements = firstLineData[0];
  var targetCount = firstLineData[1];
  var initialNumbers = retrieveIntegerArray();
  var minimumCost = Math.pow(10,16);

  if(targetCount === 1){
    printOutput(0);
    return;
  }

  for(var bitmaskIterator = 0; bitmaskIterator < (1 << totalElements); bitmaskIterator++){
    var chosenElements = [initialNumbers[0]];
    for(var elementIterator = 1; elementIterator < totalElements; elementIterator++){
      if((bitmaskIterator & (1 << elementIterator)) !== 0){
        chosenElements.push(initialNumbers[elementIterator]);
      }
    }

    if(chosenElements.length === targetCount){
      var currentCost = 0;
      for(var elementIterator = 0; elementIterator < chosenElements.length - 1; elementIterator++){
        if(chosenElements[elementIterator] >= chosenElements[elementIterator + 1]){
          currentCost += chosenElements[elementIterator] - chosenElements[elementIterator + 1] + 1;
          chosenElements[elementIterator + 1] += chosenElements[elementIterator] - chosenElements[elementIterator + 1] + 1;
        }
      }
      minimumCost = Math.min(minimumCost, currentCost);
    }
  }
  printOutput(minimumCost);
}
