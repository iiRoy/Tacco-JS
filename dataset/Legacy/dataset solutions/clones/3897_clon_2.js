var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var receivedLines = [];

// Event listener for each line of input
inputReader.on('line', function(currentLine){
  receivedLines.push(currentLine);
});

// Event listener when input stream closes
inputReader.on('close', function(){
  dataProcessor = initializeParser(receivedLines);
  console.error("\n"); // Output a newline to stderr for formatting
  var startTime = new Date();
  
  executeCoreLogic(); // Invoke the main program logic
  
  var elapsedTime = new Date() - startTime;
  
  logDebug("execution time : " + (elapsedTime) + "ms");
  logDebug("memory usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Helper functions for parsing input
function getNextInteger(){ return transformValue(retrieveNext(), 1); }
function getNextStringArray(){ return transformValue(retrieveNext(), 2); }
function getNextIntegerArray(){ return transformValue(retrieveNext(), 4); }
function getNextCharacterArray(){ return transformValue(retrieveNext(), 6); }

function retrieveNext(){ return dataProcessor.retrieveNext(); }
function hasMoreElements(){ return dataProcessor.hasMoreElements(); }

// Initializes an object for sequential input processing
function initializeParser(inputData){  
  var parserInstance = {
    sourceData : inputData,
    currentPosition : 0,
    totalEntries : inputData.length,
    
    hasMoreElements : function(){
      return (this.currentPosition < this.totalEntries);
    },
    
    retrieveNext : function(){
      if(!this.hasMoreElements()){
        throw "InputBoundaryViolation: No more elements available.";
      } else {
        var currentEntry = this.sourceData[this.currentPosition];
        this.currentPosition++;
        return currentEntry;
      }
    }
  };
  return parserInstance;
}

// Function to print output to stdout
function displayOutput(content){
  console.log(content);
}

// Function to print debug information to stderr
function logDebug(message){
  console.error("debug_info:" + require("util").inspect(message, false, null));
}

// Utility function for type conversions and array manipulations
// conversionType:
//   1: Convert to integer
//   2: Split by space into string array
//   4: Split by space into integer array
//   6: Split by character into string array
//   7: Split by character into integer array
//   8: Join array with space
//   9: Join array with newline
//   0: Join array without separator
//   default: Return input as is
function transformValue(inputValue, conversionType){
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
    return inputValue; // Return original value on error
  }
}

// Main program logic
function executeCoreLogic(){
	var elementCount = getNextInteger();
	var originalNumbers = getNextIntegerArray();
	
	// Create a deep copy of the array for sorting
	var sortedCopy = JSON.parse(JSON.stringify(originalNumbers));
	
	// Sort the copied array numerically
	sortedCopy.sort(function(valA, valB){
		return valA - valB;
	});
	
	logDebug(sortedCopy); // Log the sorted array
	
	var resultArray = new Array(elementCount);
	
	// Determine the two medians based on array size
	var upperMedian = sortedCopy[(elementCount / 2)];
	var lowerMedian = sortedCopy[(elementCount / 2) - 1];
	
	logDebug({upperMedian, lowerMedian}); // Log the calculated medians
	
	// Iterate through the original numbers to populate the result array
	for(var loopIndex = 0; loopIndex < elementCount; loopIndex++){
		if(lowerMedian === upperMedian){
			// If medians are identical, all elements get the same median
			resultArray[loopIndex] = upperMedian;
		} else {
			// If medians differ, compare with the current original number
			if(lowerMedian >= originalNumbers[loopIndex]){
				resultArray[loopIndex] = upperMedian;
			} else {
				resultArray[loopIndex] = lowerMedian;
			}
		}
	}
	
	// Output the result array, joined by newlines
	displayOutput(transformValue(resultArray, 9));
}
