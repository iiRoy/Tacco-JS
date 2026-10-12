var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  dataProcessor = initializeInputHandler(inputLines);
  console.error("\n");
  var startTime = Date.now();
  executeCalculation();
  var duration = Date.now() - startTime;
  logDebug("time : " + (duration) + "ms");
  logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createDeepCopy(originalObject){
  return JSON.parse(JSON.stringify(originalObject));
}

function retrieveInteger(){
  return convertInput(getNextToken(), 1);
}

function retrieveStringArray(){
  return convertInput(getNextToken(), 2);
}

function retrieveIntegerArray(){
  return convertInput(getNextToken(), 4);
}

function retrieveCharacterArray(){
  return convertInput(getNextToken(), 6);
}

function getNextToken(){
  return dataProcessor.fetchNextEntry();
}

function hasMoreTokens(){
  return dataProcessor.hasMoreEntries();
}

function initializeInputHandler(inputData){
  return {
    sourceData : inputData,
    currentPosition : 0,
    maximumEntries : inputData.length,
    hasMoreEntries : function(){
      return (this.currentPosition < this.maximumEntries);
    },
    fetchNextEntry : function(){
      if(this.hasMoreEntries()){
        return this.sourceData[this.currentPosition++];
      } else {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
    }
  };
}

function printResult(outputValue){
  console.log(outputValue);
}

function logDebug(debugMessage){
  console.error("debug:" + require("util").inspect(debugMessage, false, null));
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

function executeCalculation(){
  var totalElements = retrieveInteger();
  var elementValues = retrieveIntegerArray();
  var redCounter = 1;
  var blueCounter = 0;
  var greenCounter = 0;
  var finalProduct = 3;
  var moduloValue = 1000000007;

  if(elementValues[0] !== 0){
    printResult(0);
    return;
  }

  for(var loopIndex = 1; loopIndex < totalElements; loopIndex++){
    var matchCount = 0;
    var wasAdded = false;

    if(elementValues[loopIndex] === redCounter){
      matchCount++;
      redCounter++;
      wasAdded = true;
    }

    if(elementValues[loopIndex] === blueCounter){
      matchCount++;
      if(!wasAdded){
        blueCounter++;
        wasAdded = true;
      }
    }

    if(elementValues[loopIndex] === greenCounter){
      matchCount++;
      if(!wasAdded){
        greenCounter++;
        wasAdded = true;
      }
    }

    finalProduct *= matchCount;
    finalProduct %= moduloValue;
  }
  printResult(finalProduct);
}
