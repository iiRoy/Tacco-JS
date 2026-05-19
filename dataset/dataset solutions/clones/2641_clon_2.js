// This section contains utility functions for input/output and debugging.
// It's generally not part of the core algorithm logic.
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataProcessor;
var inputLines = [];
inputReader.on('line', function(currentLine){inputLines.push(currentLine);});
inputReader.on('close', function(){
  dataProcessor = initializeInput(inputLines);
  console.error("\n"); // Print a newline to stderr for formatting
  var startTime = Date.now();
  executeMainLogic();
  var endTime = Date.now() - startTime;
  printDebug("time : " + (endTime) + "ms");
  printDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Creates a deep copy of an object using JSON serialization.
function createDeepCopy(originalObject){
  return JSON.parse(JSON.stringify(originalObject));
}

// Helper functions to fetch and convert input data.
function getNextInteger(){
  return convertInput(fetchNextLine(), 1);
}
function getNextStringArray(){
  return convertInput(fetchNextLine(), 2);
}
function getNextIntegerArray(){
  return convertInput(fetchNextLine(), 4);
}
function getNextCharacterArray(){
  return convertInput(fetchNextLine(), 6);
}
function fetchNextLine(){
  return dataProcessor.fetchNextLine();
}
function hasMoreLines(){
  return dataProcessor.hasMoreLines();
}

// Initializes the input processing object.
function initializeInput(rawInput){  
  var processorInstance = {
    lineCollection : rawInput,
    currentLineIndex : 0,
    totalLines : rawInput.length,
    hasMoreLines : function(){
      return (this.currentLineIndex < this.totalLines);
    },
    fetchNextLine : function(){
      if(!this.hasMoreLines()){
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var currentInputLine = this.lineCollection[this.currentLineIndex];
        this.currentLineIndex++;
        return currentInputLine;
      }
    }
  };
  return processorInstance;
}

// Prints output to standard output.
function printOutput(message){
  console.log(message);
}

// Prints debug messages to standard error.
function printDebug(debugMessage){
  console.error("debug:" + require("util").inspect(debugMessage,false,null));
}

// Input conversion utility.
// conversionType:
// 1: Convert to integer
// 2: Split by space into string array
// 4: Split by space into integer array
// 6: Split by character into string array
// 7: Split by character into integer array
// 8: Join array elements with space
// 9: Join array elements with newline
// 0: Join array elements without separator
// Default: Return input as is
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

// End of utility functions.
//---------------------------------------------------------------------------

function executeMainLogic(){
	var sourceString = fetchNextLine();
	var targetString = fetchNextLine();
	var charIndexMap = {};
	var resultPosition = 0;

	// Populate the map with character indices from the source string.
	for(var charIterator = 0; charIterator < sourceString.length; charIterator++){
		if(charIndexMap[sourceString[charIterator]] == null){
			charIndexMap[sourceString[charIterator]] = [];
		}
		charIndexMap[sourceString[charIterator]].push(charIterator);
	}

	var previousMatchIndex = -1;
	var cycleCount = 0;

	// Iterate through the target string to find character positions.
	for(var charIterator = 0; charIterator < targetString.length; charIterator++){
		// If a character from the target string is not found in the source string, output -1.
		if(charIndexMap[targetString[charIterator]] == null){
			printOutput(-1);
			return;
		}

		if(charIterator == 0){
			// For the first character, the position is simply the first occurrence's index + 1.
			resultPosition = charIndexMap[targetString[charIterator]][0] + 1;
			previousMatchIndex = charIndexMap[targetString[charIterator]][0];
		} else {
			// Find the next suitable index using binary search.
			var foundIndex = performBinarySearch(charIndexMap[targetString[charIterator]], previousMatchIndex);

			// If no suitable index is found in the current cycle or the found index is the same as previous,
			// increment cycle count and reset index to the beginning of the list.
			if(foundIndex == charIndexMap[targetString[charIterator]].length || charIndexMap[targetString[charIterator]][foundIndex] == previousMatchIndex){
				cycleCount++;
				foundIndex = 0;
			}
			// Calculate the total position considering cycles and the current character's index.
			resultPosition = (cycleCount * sourceString.length) + charIndexMap[targetString[charIterator]][foundIndex] + 1;
			previousMatchIndex = charIndexMap[targetString[charIterator]][foundIndex];
		}
	}
	printOutput(resultPosition);
}

// Performs a binary search on a sorted array to find the smallest element
// that is greater than or equal to the search value.
function performBinarySearch(sortedArray, searchValue){
  // The 'sortedArray' is assumed to be sorted in ascending order.
  // 'positiveBound' will store the smallest index of an element >= 'searchValue'.
  // 'negativeBound' will store the largest index of an element < 'searchValue'.
  var negativeBound = -1;
  var positiveBound = sortedArray.length;
  var midPoint;

  // Continue searching while there's a gap between the bounds.
  while(Math.abs(positiveBound - negativeBound) > 1){
    midPoint = Math.floor((positiveBound + negativeBound) / 2);
    if(sortedArray[midPoint] >= searchValue){
       positiveBound = midPoint; // This element is a potential candidate or better.
    } else {
       negativeBound = midPoint; // This element is too small, discard it and everything to its left.
    }
  }
  return positiveBound; // Return the index of the first element >= searchValue.
}
