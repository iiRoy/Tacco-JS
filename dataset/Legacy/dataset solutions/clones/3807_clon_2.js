var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputProcessor;
var inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  inputProcessor = initializeInputHandler(inputLines);
  console.error("\n");
  var startTime = Date.now();
  executeMainLogic();
  var elapsedTime = Date.now() - startTime;
  logDebugMessage("time : " + (elapsedTime) + "ms");
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createDeepCopy(originalObject){
  return JSON.parse(JSON.stringify(originalObject));
}

function retrieveNextInteger(){
  return convertInputData(fetchNextLine(), 1);
}

function retrieveNextStringArray(){
  return convertInputData(fetchNextLine(), 2);
}

function retrieveNextIntegerArray(){
  return convertInputData(fetchNextLine(), 4);
}

function retrieveNextCharacterArray(){
  return convertInputData(fetchNextLine(), 6);
}

function fetchNextLine(){
  return inputProcessor.fetchNextLine();
}

function hasMoreLines(){
  return inputProcessor.hasMoreLines();
}

function initializeInputHandler(sourceData){
  var handlerObject = {
    sourceLines : sourceData,
    currentLineIndex : 0,
    totalLines : sourceData.length,
    hasMoreLines : function(){
      return (this.currentLineIndex < this.totalLines);
    },
    fetchNextLine : function(){
      if(!this.hasMoreLines()){
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      } else {
        var currentInputLine = this.sourceLines[this.currentLineIndex++];
        return currentInputLine;
      }
    }
  };
  return handlerObject;
}

function displayResult(outputValue){
  console.log(outputValue);
}

function logDebugMessage(messageContent){
  console.error("debug:" + require("util").inspect(messageContent, false, null));
}

// The 'conversionType' parameter dictates the parsing method:
// 1: Parse as integer.
// 2: Split by space.
// 4: Split by space and parse each part as number.
// 6: Split into individual characters.
// 7: Split into individual characters and parse each as number.
// 8: Join array elements with space.
// 9: Join array elements with newline.
// 0: Join array elements without separator.
// Default: Return input as is.
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
  } catch(error){
    return inputValue;
  }
}

function executeMainLogic(){
  var arraySize = retrieveNextInteger();
  var numberSequence = retrieveNextIntegerArray();
  var totalCount = 0;
  var leftPointer = 0;
  var rightPointer = 0;
  var currentXorSum = numberSequence[0];

  while(leftPointer < arraySize || rightPointer < arraySize){
    // Advance the right pointer as long as the XOR sum property holds.
    // The 'totalCount' increases by the current subarray length.
    // If the property fails, we adjust the left pointer.
    // Then repeat the process.
    // logDebugMessage("current XOR state : " + currentXorSum);
    // logDebugMessage({leftPointer, rightPointer});

    if(currentXorSum + numberSequence[rightPointer + 1] === (currentXorSum ^ numberSequence[rightPointer + 1])){
      // logDebugMessage("condition met");
      // logDebugMessage(rightPointer - leftPointer + 1);
      totalCount += rightPointer - leftPointer + 1;
      rightPointer++;
      currentXorSum += numberSequence[rightPointer];
    } else {
      // logDebugMessage("condition not met");
      currentXorSum -= numberSequence[leftPointer];
      leftPointer++;
      if(rightPointer < leftPointer){
        rightPointer = leftPointer;
        currentXorSum = numberSequence[rightPointer];
      }
    }
    // logDebugMessage("next XOR state : " + currentXorSum);
    // logDebugMessage({leftPointer, rightPointer});
  }
  displayResult(totalCount + arraySize);
}
