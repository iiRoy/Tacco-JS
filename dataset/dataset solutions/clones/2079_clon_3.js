var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var dataHandler;
var inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  dataHandler = initializeInputHandler(inputLines);
  console.error("\n");

  var startTime = Date.now();
  executeMainLogic();
  var endTime = Date.now();
  var elapsedTime = endTime - startTime;

  printDebugError("time : " + (elapsedTime) + "ms");

  var heapMemoryUsage = process.memoryUsage().heapTotal;
  var heapMemoryKB = Math.round(heapMemoryUsage / 1024);
  printDebugError("memory : " + heapMemoryKB + "KB");
});

function createDeepCopy(originalObject){
  return JSON.parse(JSON.stringify(originalObject));
}

// Helper functions for input conversion logic
function parseInteger(str) { return parseInt(str); }
function splitStringBySpace(str) { return str.split(" "); }
function splitStringAndParseNumbers(str) { return str.split(" ").map(Number); }
function splitStringByChar(str) { return str.split(""); }
function splitStringByCharAndParseNumbers(str) { return str.split("").map(Number); }
function joinArrayBySpace(arr) { return arr.join(" "); }
function joinArrayByNewline(arr) { return arr.join("\n"); }
function joinArrayNoSeparator(arr) { return arr.join(""); }

function getNextInteger(){ return convertInput(fetchNextInput(), 1); }
function getNextStringArray(){ return convertInput(fetchNextInput(), 2); }
function getNextIntegerArray(){ return convertInput(fetchNextInput(), 4); }
function getNextCharacterArray(){ return convertInput(fetchNextInput(), 6); }

function fetchNextInput(){ return dataHandler.next(); }
function hasMoreInput(){ return dataHandler.hasMoreInput(); }

function initializeInputHandler(rawInputData){
  var handlerInstance = {};
  handlerInstance.sourceLines = rawInputData;
  handlerInstance.currentLineIndex = 0;
  handlerInstance.totalLines = rawInputData.length;

  handlerInstance.hasMoreInput = function(){
    return (this.currentLineIndex < this.totalLines);
  };

  handlerInstance.next = function(){
    if (!this.hasMoreInput()) {
      throw "ArrayIndexOutOfBoundsException ‚There is no more input";
    }
    var nextLine = this.sourceLines[this.currentLineIndex];
    this.currentLineIndex++;
    return nextLine;
  };
  return handlerInstance;
}

function printOutput(messageContent){
  console.log(messageContent);
}

function printDebugError(messageContent){
  console.error("debug:" + require("util").inspect(messageContent,false,null));
}

//param "conversionType" is
//unknown or outlier : return inputValue. 1: parseInt.
//2: split space. 4: split space and parseInt.
//6: split 1 character. 7: split 1 character and parseInt.
//8: join space. 9: join nextline. 0: join no character.
function convertInput(inputValue, conversionType){
  try{
    var resultValue;
    switch(conversionType){
      case 1: resultValue = parseInteger(inputValue); break;
      case 2: resultValue = splitStringBySpace(inputValue); break;
      case 4: resultValue = splitStringAndParseNumbers(inputValue); break;
      case 6: resultValue = splitStringByChar(inputValue); break;
      case 7: resultValue = splitStringByCharAndParseNumbers(inputValue); break;
      case 8: resultValue = joinArrayBySpace(inputValue); break;
      case 9: resultValue = joinArrayByNewline(inputValue); break;
      case 0: resultValue = joinArrayNoSeparator(inputValue); break;
      default: resultValue = inputValue;
    }
    return resultValue;
  }catch(e){
    return inputValue;
  }
}

function executeMainLogic(){
  const outputSequence = ["aaa", "aab", "aba", "abb", "abc"];
  for (let i = 0; i < outputSequence.length; i++) {
    printOutput(outputSequence[i]);
  }
}
