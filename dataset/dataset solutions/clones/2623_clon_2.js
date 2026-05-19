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
  console.error('\n↑入力 ↓出力'); // Debug message for input/output direction
  executePrimaryLogic();
});

// Utility function to create a deep copy of an object or Set
function createDeepCopy(originalObject){
  return (originalObject instanceof Set)
    ? new Set(Array.from(originalObject))
    : JSON.parse(JSON.stringify(originalObject));
}

// Helper functions for retrieving different types of input
function retrieveNextInteger(){
  return performConversion(fetchNextToken(), 1);
}

function retrieveNextStringArray(){
  return performConversion(fetchNextToken(), 2);
}

function retrieveNextIntegerArray(){
  return performConversion(fetchNextToken(), 4);
}

function retrieveNextCharacterArray(){
  return performConversion(fetchNextToken(), 6);
}

function fetchNextToken(){
  return inputProcessor.fetchNextToken();
}

function hasMoreTokens(){
  return inputProcessor.hasMoreTokens();
}

// Initializes the input handler object
function initializeInputHandler(allInputLines){
  return {
    dataLines : allInputLines,
    currentPosition : 0,
    totalLines : allInputLines.length,

    hasMoreTokens : function(){
      return (this.currentPosition < this.totalLines);
    },

    fetchNextToken : function(){
      if(this.hasMoreTokens()){
        return this.dataLines[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

// Function to print results to standard output
function printResult(outputContent){
  console.log(outputContent);
}

// Function to log debug messages to standard error
function logDebugMessage(debugInfo){
  console.error('debug:' + require('util').inspect(debugInfo, false, null));
}

/*
  Converts input based on the specified type.
  'conversionType' parameter:
  - 1: Parse as integer.
  - 2: Split by space.
  - 4: Split by space and map to numbers.
  - 6: Split by character.
  - 7: Split by character and map to numbers.
  - 8: Join array elements with space.
  - 9: Join array elements with newline.
  - 0: Join array elements without separator.
  - Default: Return input as is.
*/
function performConversion(inputValue, conversionType){
  try {
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
  } catch(error) {
    return inputValue; // Return original value on conversion error
  }
}

// Main program logic
function executePrimaryLogic(){
  var countElements = retrieveNextInteger();

  for(var firstIndex = 0; firstIndex < countElements - 1; firstIndex++){
    for(var secondIndex = firstIndex + 1; secondIndex < countElements; secondIndex++){
      var differenceMarkers = [];
      for(var bitPosition = 0; bitPosition < 10; bitPosition++){
        // Check if the k-th bit differs between firstIndex and secondIndex
        if(((firstIndex >> bitPosition) & 1) !== ((secondIndex >> bitPosition) & 1)){
          differenceMarkers.push(bitPosition + 1);
        }
      }
      printResult(performConversion(differenceMarkers, 8));
    }
  }
}
