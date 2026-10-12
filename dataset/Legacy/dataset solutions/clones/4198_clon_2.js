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
  console.error('\n↑入力 ↓出力'); // This message is critical for behavior
  executeProgram();
});

// Creates a deep copy of an object or Set.
function createDeepCopy(sourceObject){
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

// Helper functions to retrieve and convert input tokens
function retrieveInteger(){
  return performTypeConversion(fetchNextToken(), 1);
}

function retrieveStringArray(){
  return performTypeConversion(fetchNextToken(), 2);
}

function retrieveIntegerArray(){
  return performTypeConversion(fetchNextToken(), 4);
}

function retrieveCharacterArray(){
  return performTypeConversion(fetchNextToken(), 6);
}

function fetchNextToken(){
  return inputProcessor.getNextItem();
}

function hasMoreTokens(){
  return inputProcessor.hasMore();
}

// Sets up the input handling mechanism
function initializeInputHandler(sourceInput){
  return {
    dataStore : sourceInput,
    currentPosition : 0,
    totalItems : sourceInput.length,

    hasMore : function(){
      return (this.currentPosition < this.totalItems);
    },

    getNextItem : function(){
      if(this.hasMore()){
        return this.dataStore[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input'; // Critical error message
      }
    }
  };
}

// Displays the final computed result
function displayResult(resultValue){
  console.log(resultValue);
}

// Logs debug information to stderr
function logDebugMessage(debugInfo){
  console.error('debug:' + require('util').inspect(debugInfo, false, null)); // Critical debug output format
}

// Utility for converting input strings based on a specified format code
// Format codes:
// 1: parseInt
// 2: split by space
// 4: split by space and map to Number
// 6: split by character
// 7: split by character and map to Number
// 8: join by space
// 9: join by newline
// 0: join without separator
function performTypeConversion(inputValue, formatCode){
  try {
    switch(formatCode){
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
  } catch(conversionError){
    return inputValue; // Return original value on error
  }
}

// Main program execution logic
function executeProgram(){
  var firstLineData = retrieveIntegerArray();
  var numEntries = firstLineData[0];
  var capacityLimit = firstLineData[1]; // 'C' is read but not used in this specific problem logic

  // Initialize an array to store frequency changes, sized for potential maximum index + 1
  var frequencyArray = new Array(100005).fill(0);

  // Process N entries to mark start and end points for frequency calculation
  for(var idx = 0; idx < numEntries; idx++){
    var currentRange = retrieveIntegerArray();
    frequencyArray[currentRange[0]]++; // Increment count at start of range
    frequencyArray[currentRange[1] + 1]--; // Decrement count just after end of range
  }

  var maximumOverlap = 1; // Initialize with 1 as per problem constraints or typical base case

  // Calculate prefix sums to find actual frequencies and determine maximum overlap
  for(var idx = 1; idx < 100005; idx++){
    frequencyArray[idx] += frequencyArray[idx - 1]; // Accumulate frequencies
    maximumOverlap = Math.max(maximumOverlap, frequencyArray[idx]); // Update maximum if current frequency is higher
  }

  displayResult(maximumOverlap); // Output the final result
}
