// This initial segment prepares the environment for input acquisition.
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var contentHolder;
var receivedStrings = [];

inputReader.on('line', function(currentLine){
  receivedStrings.push(currentLine);
});

inputReader.on('close', function(){
  contentHolder = initializeData(receivedStrings);
  console.error('\n▲ Input ▼ Output'); // Visual separator for debugging
  executeProgram();
});

// A utility function to create a deep copy of an object or a Set.
function duplicateObject(sourceObject){
  return (sourceObject instanceof Set)
    ? new Set(Array.from(sourceObject))
    : JSON.parse(JSON.stringify(sourceObject));
}

// Functions to retrieve and convert input data based on various types.
function retrieveInteger(){return dataConverter(fetchNext(), 1);}
function retrieveStringArray(){return dataConverter(fetchNext(), 2);}
function retrieveIntegerArray(){return dataConverter(fetchNext(), 4);}
function retrieveCharacterArray(){return dataConverter(fetchNext(), 6);}

// Functions to interact with the global content holder for input.
function fetchNext(){return contentHolder.getNextItem();}
function hasMoreData(){return contentHolder.hasMoreData();}

// This function constructs an object to manage the input lines.
function initializeData(rawInputArray){
  return {
    dataList : rawInputArray,
    currentIndex : 0,
    maximumCount : rawInputArray.length,
    hasMoreData : function(){
      return (this.currentIndex < this.maximumCount);
    },
    getNextItem : function(){
      if(this.hasMoreData()){
        return this.dataList[this.currentIndex++];
      } else {
        throw 'InputExhaustedError: No further input elements are available.';
      }
    }
  };
}

// Outputs a string to the console.
function displayOutput(outputString){
  console.log(outputString);
}

// Logs debug information to the error console.
function logDebugMessage(debugContent){
  console.error('Debug Info: ' + require('util').inspect(debugContent, false, null));
}

// This function handles various input string transformations based on a provided type code.
// The 'conversionType' parameter dictates the operation:
// - Default/Unknown: Returns the input value unchanged.
// - 1: Parses the input as an integer.
// - 2: Splits the input string by spaces into an array of strings.
// - 4: Splits by spaces and converts each part to a number.
// - 6: Splits the input string into an array of individual characters.
// - 7: Splits by characters and converts each to a number.
// - 8: Joins array elements with spaces.
// - 9: Joins array elements with newlines.
// - 0: Joins array elements without any separator.
function dataConverter(inputValue, conversionType){
  try{
    switch(conversionType){
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(' ');
      case 4: return inputValue.split(' ').map(Number);
      case 6: return inputValue.split('');
      case 7: return inputValue.split('').map(Number);
      case 8: return inputValue.join(' ');
      case 9: return inputValue.join('\n');
      case 0: return inputValue.join('');
      default: return inputValue;
    }
  } catch(exceptionError){
    return inputValue; // In case of error, return original value
  }
}

// This marks the end of the input processing and utility functions.
// The primary program logic resides below.
function executeProgram(){
  var targetSum = retrieveInteger();
  var dynamicProgrammingArray = new Array(2001).fill(0);
  var moduloValue = 1000000007;

  for(var outerLoopCounter = 3; outerLoopCounter <= targetSum; outerLoopCounter++){
    dynamicProgrammingArray[outerLoopCounter]++;
    for(var innerLoopCounter = 3; innerLoopCounter <= outerLoopCounter - 3; innerLoopCounter++){
      dynamicProgrammingArray[outerLoopCounter] += dynamicProgrammingArray[innerLoopCounter];
      dynamicProgrammingArray[outerLoopCounter] %= moduloValue;
    }
  }
  displayOutput(dynamicProgrammingArray[targetSum]);
}