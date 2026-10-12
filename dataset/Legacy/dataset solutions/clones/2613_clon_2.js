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
  console.error('\n↑入力 ↓出力');
  executePrimaryLogic();
});

// This function generates a deep copy of an object or a Set.
function createDeepCopy(originalObject){
  return (originalObject instanceof Set)
    ? new Set(Array.from(originalObject))
    : JSON.parse(JSON.stringify(originalObject));
}

// Helper to get the next input line as an integer.
function retrieveInteger(){
  return performTypeConversion(getNextInput(), 1);
}

// Helper to get the next input line as an array of strings.
function retrieveStringArray(){
  return performTypeConversion(getNextInput(), 2);
}

// Helper to get the next input line as an array of numbers.
function retrieveIntegerArray(){
  return performTypeConversion(getNextInput(), 4);
}

// Helper to get the next input line as an array of characters.
function retrieveCharacterArray(){
  return performTypeConversion(getNextInput(), 6);
}

// Retrieves the subsequent input entry.
function getNextInput(){
  return dataProcessor.fetchNextItem();
}

// Determines if additional input entries are available.
function hasMoreInput(){
  return dataProcessor.checkAvailability();
}

// Initializes the input handling object.
function initializeInputHandler(incomingData){
  return {
    sourceData : incomingData,
    currentPosition : 0,
    maximumLength : incomingData.length,

    checkAvailability : function(){
      return (this.currentPosition < this.maximumLength);
    },

    fetchNextItem : function(){
      if(this.checkAvailability()){
        return this.sourceData[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

// Outputs the given value to the console.
function displayResult(valueToOutput){
  console.log(valueToOutput);
}

// Logs a debug message to the error stream.
function logDebugMessage(debugContent){
  console.error('debug:' + require('util').inspect(debugContent, false, null));
}

// This utility function converts input based on the specified conversion type.
// conversionType values:
// 1: Parse as an integer.
// 2: Split by spaces into an array of strings.
// 4: Split by spaces and convert each part to a number.
// 6: Split into an array of individual characters.
// 7: Split into individual characters and convert each to a number.
// 8: Join array elements with a space.
// 9: Join array elements with a newline.
// 0: Join array elements without any separator.
// Default: Return the input as is.
function performTypeConversion(inputItem, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(inputItem);
      case 2: return inputItem.split(' ');
      case 4: return inputItem.split(' ').map(Number);
      case 6: return inputItem.split('');
      case 7: return inputItem.split('').map(Number);
      case 8: return inputItem.join(' ');
      case 9: return inputItem.join('\n');
      case 0: return inputItem.join('');
      default: return inputItem;
    }
  } catch(conversionError) {
    return inputItem;
  }
}

// The primary function containing the problem's core logic.
function executePrimaryLogic(){
  var firstLineData = retrieveIntegerArray();
  var maxMonth = firstLineData[0];
  var maxDay = firstLineData[1];
  var resultCount = 0;

  // Iterate through each month from 1 up to maxMonth.
  for(var currentMonth = 1; currentMonth <= maxMonth; currentMonth++){
    // Iterate through each day, starting from 22 up to maxDay.
    for(var currentDay = 22; currentDay <= maxDay; currentDay++){
      var tensDigit = Math.floor(currentDay / 10);
      var unitsDigit = currentDay % 10;

      // Check if both digits are at least 2 and their product equals the current month.
      if(tensDigit >= 2 && unitsDigit >= 2 && tensDigit * unitsDigit === currentMonth){
        resultCount++;
      }
    }
  }
  displayResult(resultCount);
}
