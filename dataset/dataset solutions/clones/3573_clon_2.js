var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var inputLinesBuffer = [];

// Event listener for each line of input
inputReader.on('line', function(currentLine){
  inputLinesBuffer.push(currentLine);
});

// Event listener for end of input
inputReader.on('close', function(){
  dataProcessor = initializeInputProcessor(inputLinesBuffer);
  logDebug("-----begin execution-----");
  var startTime = new Date();
  performCalculation();
  var endTime = new Date() - startTime;
  logDebug("----- execution finished -----");
  logDebug("duration : " + (endTime) + "ms");
  logDebug("memory_usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Helper functions for retrieving different data types
function retrieveInteger(){ return convertInput(getNextItem(), 1); }
function retrieveStringArray(){ return convertInput(getNextItem(), 2); }
function retrieveIntegerArray(){ return convertInput(getNextItem(), 4); }
function retrieveCharacterArray(){ return convertInput(getNextItem(), 6); }

// Core functions to interact with the input data processor
function getNextItem(){ return dataProcessor.getNextItem(); }
function hasMoreItems(){ return dataProcessor.hasMoreItems(); }

/**
 * Initializes an object to process input lines.
 * @param {Array<string>} rawInputData - An array of raw input strings.
 * @returns {object} An object with methods to navigate and retrieve input.
 */
function initializeInputProcessor(rawInputData){
  var processorObject = {
    dataList : rawInputData,
    currentIndex : 0,
    maximumIndex : rawInputData.length,

    hasMoreItems : function(){
      return (this.currentIndex < this.maximumIndex);
    },

    getNextItem : function(){
      if(!this.hasMoreItems()){
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var currentDataItem = this.dataList[this.currentIndex];
        this.currentIndex++;
        return currentDataItem;
      }
    }
  };
  return processorObject;
}

/**
 * Prints the final result to standard output.
 * @param {*} outputValue - The value to be printed.
 */
function printResult(outputValue){
  console.log(outputValue);
}

/**
 * Logs debug messages to standard error.
 * @param {*} debugMessage - The message or object to debug.
 */
function logDebug(debugMessage){
  console.error("debug:" + require("util").inspect(debugMessage, false, null));
}

/**
 * Converts input based on a specified type.
 * @param {*} inputValue - The input value to convert.
 * @param {number} conversionType - The type of conversion to perform.
 *   1: Convert to integer.
 *   2: Split by space into string array.
 *   4: Split by space into integer array.
 *   6: Split by character into string array.
 *   7: Split by character into integer array.
 *   8: Join array with space.
 *   9: Join array with newline.
 *   0: Join array without separator.
 * @returns {*} The converted value or original input if conversion fails/type is unknown.
 */
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

// Main program logic starts here
function performCalculation(){
  var inputParameters = retrieveIntegerArray();
  var limitValue = inputParameters[0];
  var divisorValue = inputParameters[1];
  var finalResult = 0;

  // Special case for divisorValue = 1
  if(divisorValue === 1){
    printResult(Math.pow(limitValue, 3));
    return;
  }

  var iterationCounter = 1;
  var evenMultiples = [];
  var oddMultiples = [];

  // Populate evenMultiples and oddMultiples based on divisorValue parity
  if(divisorValue % 2 === 0){
    // If divisorValue is even, populate evenMultiples with multiples of divisorValue
    while(divisorValue * iterationCounter <= limitValue){
      evenMultiples.push(divisorValue * iterationCounter);
      iterationCounter++;
    }
    // Reset counter for oddMultiples (multiples of divisorValue/2 that are not multiples of divisorValue)
    let secondCounter = 0;
    while((divisorValue / 2) + divisorValue * secondCounter <= limitValue){
      oddMultiples.push((divisorValue / 2) + divisorValue * secondCounter);
      secondCounter++;
    }
  } else {
    // If divisorValue is odd, populate oddMultiples with multiples of divisorValue
    while(divisorValue * iterationCounter <= limitValue){
      oddMultiples.push(divisorValue * iterationCounter);
      iterationCounter++;
    }
  }

  // Calculate the final result by iterating from 1 to limitValue
  for(var currentNumber = 1; currentNumber <= limitValue; currentNumber++){
    if(divisorValue % 2 === 0){
      // If divisorValue is even
      if(currentNumber % divisorValue === 0){
        finalResult += evenMultiples.length * evenMultiples.length;
      } else if(currentNumber % (divisorValue / 2) === 0){
        finalResult += oddMultiples.length * oddMultiples.length;
      }
    } else {
      // If divisorValue is odd
      if(currentNumber % divisorValue === 0){
        finalResult += oddMultiples.length * oddMultiples.length;
      }
    }
  }

  printResult(finalResult);
}
