// Input handling setup - Start of boilerplate code
var inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor; // Custom object for managing input lines
var bufferedLines = []; // Array to store all input lines

inputHandler.on('line', function(currentLine){
  bufferedLines.push(currentLine);
});

inputHandler.on('close', function(){
  inputProcessor = initializeInputReader(bufferedLines);
  console.error('\n↑入力 ↓出力'); // Critical output, must not change
  executeCalculation(); // Call the main logic function
});

// Utility function for deep cloning objects or Sets
function deepCopyObject(originalItem){
  return (originalItem instanceof Set) ? new Set(Array.from(originalItem)) : JSON.parse(JSON.stringify(originalItem));
}

// Input parsing helpers
function fetchNextInt(){ return convertInputData(advanceAndGet(), 1); }
function fetchNextStringArray(){ return convertInputData(advanceAndGet(), 2); }
function fetchNextIntArray(){ return convertInputData(advanceAndGet(), 4); }
function fetchNextCharArr(){ return convertInputData(advanceAndGet(), 6); }

// Core input retrieval functions
function advanceAndGet(){ return inputProcessor.retrieveNext(); }
function checkHasNext(){ return inputProcessor.hasMoreData(); }

// Initializes the custom input reader object
function initializeInputReader(inputData){
  return {
    sourceLines : inputData,
    currentPosition : 0,
    totalLines : inputData.length,
    hasMoreData : function(){
      return (this.currentPosition < this.totalLines);
    },
    retrieveNext : function(){
      if(this.hasMoreData()){
        return this.sourceLines[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input'; // Critical error message
      }
    }
  };
}

// Output functions
function printResult(outputValue){
  console.log(outputValue);
}

function logDebugInfo(debugContent){
  console.error('debug:' + require('util').inspect(debugContent, false, null)); // Critical debug output
}

// Universal input conversion utility
// Parameter 'conversionType' determines the conversion logic:
// 1: Parse as integer
// 2: Split by space into string array
// 4: Split by space and parse each as number
// 6: Split into character array
// 7: Split into character array and parse each as number
// 8: Join array elements with space
// 9: Join array elements with newline
// 0: Join array elements without separator
// Default: Return input as is
function convertInputData(inputValue, conversionType){
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
  } catch(e) {
    return inputValue; // Fallback in case of conversion error
  }
}

// Input handling setup - End of boilerplate code

// Main program logic starts here
function executeCalculation(){
  // Read the single line of integer values
  var initialValues = fetchNextIntArray();

  // Assign values to distinct variables
  var countA = initialValues[0];
  var countO = initialValues[1];
  var countT = initialValues[2];
  var countJ = initialValues[3];
  var countL = initialValues[4];
  var countS = initialValues[5];
  var countZ = initialValues[6];

  // Calculate the first potential result based on even counts
  var resultOptionOne = Math.floor(countA / 2) * 2 + Math.floor(countJ / 2) * 2 + Math.floor(countL / 2) * 2;

  // Calculate the second potential result, considering odd counts and an additional 3
  var resultOptionTwo = Math.floor((countA - 1) / 2) * 2 + Math.floor((countJ - 1) / 2) * 2 + Math.floor((countL - 1) / 2) * 2 + 3;

  // Output the maximum of the two options, plus the 'O' count
  printResult(Math.max(resultOptionOne, resultOptionTwo) + countO);
}
