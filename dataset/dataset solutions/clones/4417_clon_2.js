var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataHandler;
var collectedLines = [];

// Event listener for each line of input
inputReader.on('line', function(rawInputData){
  collectedLines.push(rawInputData);
});

// Event listener when input stream closes
inputReader.on('close', function(){
  dataHandler = setupInputProcessor(collectedLines);
  debugLog("--- Execution Started ---");
  var operationStartTime = new Date();
  executeSolution();
  var operationDuration = new Date() - operationStartTime;
  debugLog("--- Execution Finished ---");
  debugLog("Time elapsed: " + (operationDuration) + "ms");
  debugLog("Memory usage: " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Utility functions for retrieving different data types
function retrieveNextInteger(){ return performConversion(fetchNextLine(), 1); }
function retrieveNextStringArray(){ return performConversion(fetchNextLine(), 2); }
function retrieveNextIntegerArray(){ return performConversion(fetchNextLine(), 4); }
function retrieveNextCharacterArray(){ return performConversion(fetchNextLine(), 6); }

// Core functions for input handling
function fetchNextLine(){ return dataHandler.getNextItem(); }
function hasMoreInput(){ return dataHandler.checkMoreInput(); }

/**
 * Initializes an object to handle sequential input line retrieval.
 * @param {Array<string>} rawInputData - An array of input strings.
 * @returns {object} An object with methods to check for more input and retrieve the next line.
 */
function setupInputProcessor(rawInputData){  
  var processorInstance = {
    inputLineList : rawInputData,
    currentIndex : 0,
    maximumLines : rawInputData.length,
    checkMoreInput : function(){
      return (this.currentIndex < this.maximumLines);
    },
    getNextItem : function(){
      if(!this.checkMoreInput()){
        throw "InputOutOfBoundsException: No more lines available for processing.";
      } else {
        var currentInputString = this.inputLineList[this.currentIndex];
        this.currentIndex++;
        return currentInputString;
      }
    }
  };
  return processorInstance;
}

// Function to output results to standard output
function outputResult(logMessage){
  console.log(logMessage);
}

// Function to output debug messages to standard error
function debugLog(logMessage){
  console.error("DEBUG_INFO: " + require("util").inspect(logMessage, false, null));
}

/**
 * Converts input values based on a specified type.
 * @param {*} inputValue - The value to convert.
 * @param {number} conversionOption - The type of conversion to perform.
 *   1: Convert to integer.
 *   2: Split by space into string array.
 *   4: Split by space into number array.
 *   6: Split by character into string array.
 *   7: Split by character into number array.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements without separator.
 *   Default: Return input as is.
 * @returns {*} The converted value.
 */
function performConversion(inputValue, conversionOption){
  try {
    switch(conversionOption){
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
    return inputValue; // Return original value on error
  }
}

// Main logic of the program
function executeSolution(){
	var initialParameters = retrieveNextIntegerArray();
	var firstRangeStart = initialParameters[0];
	var firstRangeEnd = initialParameters[1];
	var secondRangeStart = initialParameters[2];
	var secondRangeEnd = initialParameters[3];

	// Create an array to map coverage, assuming max value is 100
	var coverageMap = new Array(101).fill(0);

	// Mark coverage for the first range
	for(var currentPoint = firstRangeStart; currentPoint <= firstRangeEnd; currentPoint++){
		coverageMap[currentPoint] += 1;
	}

	// Mark coverage for the second range
	for(var currentPoint = secondRangeStart; currentPoint <= secondRangeEnd; currentPoint++){
		coverageMap[currentPoint] += 1;
	}

	var overlapCount = 0;
	// Count points covered by both ranges (value 2)
	for(var currentPoint = 0; currentPoint < 101; currentPoint++){
		if(coverageMap[currentPoint] === 2){
			overlapCount++;
		}
	}
	// Output the result, ensuring it's not negative
	outputResult(Math.max(overlapCount - 1, 0));
}
