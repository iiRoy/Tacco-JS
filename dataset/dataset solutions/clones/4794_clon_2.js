// This section handles input processing and utility functions.
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor;
var inputLinesBuffer = [];

inputReader.on('line', function(currentLine){
  inputLinesBuffer.push(currentLine);
});

inputReader.on('close', function(){
  inputProcessor = initializeInputHandler(inputLinesBuffer);
  console.error('\n↑入力 ↓出力');
  executeMainLogic();
});

/**
 * Creates a deep copy of an object or Set.
 * @param {any} sourceObject - The object to copy.
 * @returns {any} A deep copy of the sourceObject.
 */
function createDeepCopy(sourceObject){
  return (sourceObject instanceof Set)
    ? new Set(Array.from(sourceObject))
    : JSON.parse(JSON.stringify(sourceObject));
}

function fetchInteger(){
  return performConversion(getNextItem(), 1);
}

function fetchStringArray(){
  return performConversion(getNextItem(), 2);
}

function fetchIntegerArray(){
  return performConversion(getNextItem(), 4);
}

function fetchCharacterArray(){
  return performConversion(getNextItem(), 6);
}

function getNextItem(){
  return inputProcessor.retrieveNextEntry();
}

function checkHasNext(){
  return inputProcessor.hasMoreEntries();
}

/**
 * Initializes an input handler object from an array of strings.
 * @param {string[]} rawInputData - An array of input strings.
 * @returns {object} An object with methods to access input.
 */
function initializeInputHandler(rawInputData){
  return {
    dataList : rawInputData,
    currentPosition : 0,
    maximumLength : rawInputData.length,
    hasMoreEntries : function(){
      return (this.currentPosition < this.maximumLength);
    },
    retrieveNextEntry : function(){
      if(this.hasMoreEntries()){
        return this.dataList[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

/**
 * Prints a value to standard output.
 * @param {any} outputValue - The value to print.
 */
function printResult(outputValue){
  console.log(outputValue);
}

/**
 * Logs debug information to standard error.
 * @param {any} debugMessage - The message to log.
 */
function logDebugInfo(debugMessage){
  console.error('debug:' + require('util').inspect(debugMessage, false, null));
}

/**
 * Performs various conversions on input values based on a type code.
 * @param {any} inputValue - The value to convert.
 * @param {number} conversionType - The type of conversion to perform.
 * @returns {any} The converted value.
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
  } catch(conversionError) {
    return inputValue;
  }
}

// Main program logic starts here.
function executeMainLogic(){
  var firstLineData = fetchIntegerArray();

  var valA = firstLineData[0];
  var valO = firstLineData[1];
  var valT = firstLineData[2];
  var valJ = firstLineData[3];
  var valL = firstLineData[4];
  var valS = firstLineData[5];
  var valZ = firstLineData[6];

  // Calculate the first possible result based on pairs.
  var resultOne = Math.floor(valA / 2) * 2 + Math.floor(valJ / 2) * 2 + Math.floor(valL / 2) * 2;

  var resultTwo; // Declare variable without immediate assignment

  // Check for a specific condition to calculate the second result.
  if (valA >= 1 && valJ >= 1 && valL >= 1) {
    resultTwo = Math.floor((valA - 1) / 2) * 2 + Math.floor((valJ - 1) / 2) * 2 + Math.floor((valL - 1) / 2) * 2 + 3;
  } else {
    resultTwo = 0;
  }

  // Output the maximum of the two results, plus valO.
  printResult(Math.max(resultOne, resultTwo) + valO);
}
