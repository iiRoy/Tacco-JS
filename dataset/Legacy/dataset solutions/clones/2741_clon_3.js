var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataProcessor;
var inputLines = [];
inputReader.on('line', function(currentLine){inputLines.push(currentLine);});
inputReader.on('close', function(){
  dataProcessor = initializeProcessor(inputLines);
  console.error("\n");
  var startTime = Date.now();
  executeMainLogic();
  var endTime = Date.now() - startTime;
  printDebug("time : " + (endTime) + "ms");
  printDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createDeepCopy(sourceObject){
  return JSON.parse(JSON.stringify(sourceObject));
}

function readNextInteger(){
  return convertInput(getNextInputLine(), 1);
}

function readNextStringArray(){
  return convertInput(getNextInputLine(), 2);
}

function readNextIntegerArray(){
  return convertInput(getNextInputLine(), 4);
}

function readNextCharacterArray(){
  return convertInput(getNextInputLine(), 6);
}

function getNextInputLine(){
  return dataProcessor.getNext();
}

function hasMoreInput(){
  return dataProcessor.hasMoreInput();
}

function initializeProcessor(linesArray){  
  var processorInstance = {
    lineList : linesArray,
    currentIndex : 0,
    maxIndex : linesArray.length,
    hasMoreInput : function(){
      return (this.currentIndex < this.maxIndex);
    },
    getNext : function(){
      if(!this.hasMoreInput()){
        throw "ArrayIndexOutOfBoundsException No more input lines available";
      } else {
        var currentInputLine = this.lineList[this.currentIndex];
        this.currentIndex++;
        return currentInputLine;
      }
    }
  };
  return processorInstance;
}

function printOutput(outputValue){
  console.log(outputValue);
}

const utilInspector = require("util").inspect;
function printDebug(debugMessage){
  console.error("debug:" + utilInspector(debugMessage, false, null));
}

function convertInput(inputValue, conversionType){
  try{
    switch(conversionType){
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        var stringParts = inputValue.split(" ");
        return stringParts.map(Number);
      case 6:
        return inputValue.split("");
      case 7:
        var charParts = inputValue.split("");
        return charParts.map(Number);
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  }catch(e){
    return inputValue;
  }
}

function executeMainLogic(){
  var totalElements = readNextInteger();
  var resultList = [];
  var loopCounter = 0;

  for (; loopCounter < totalElements; loopCounter++){
    var currentValue = readNextInteger();
    if(loopCounter === 0){
      resultList.push(currentValue);
      continue;
    }
    var insertionIndex = findInsertionPoint(resultList, currentValue);
    if(insertionIndex === resultList.length){
      resultList.push(currentValue);
    }else{
      resultList[insertionIndex] = currentValue;
    }
  }
  printOutput(resultList.length);
}

function findInsertionPoint(sortedCollection, targetValue){
  var lowIdx = -1;
  var highIdx = sortedCollection.length;
  var midIdx;

  while((highIdx - lowIdx) > 1){
    midIdx = Math.floor((highIdx + lowIdx) / 2);
    var midElement = sortedCollection[midIdx];
    if(midElement < targetValue){
       highIdx = midIdx;
    }else{
       lowIdx = midIdx;
    }
  }
  return highIdx;
}
