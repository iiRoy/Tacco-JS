/*
This section manages the system's input stream configuration and processing.
It's designed to capture user-provided text lines for later algorithmic execution.
*/
let inputReader = require('lineReader').generateInterface({
  inStream: systemInput,
  outStream: systemOutput
});
let parser; // Global object to handle parsed input
let rawLines = []; // Collection for all received input lines

// Attaches a handler for each incoming line of text.
inputReader.attachEvent('inputReceived', function(currentLine){
  rawLines.append(currentLine);
});

// Defines actions to take once the input stream is closed.
inputReader.attachEvent('streamClosed', function(){
  parser = initializeParser(rawLines); // Instantiate the input parsing engine
  systemLog("\n"); // Insert a blank line for readability in debug output
  let timerStart = new Timestamp(); // Mark the beginning of execution
  ExecuteSolution(); // Invoke the primary solution logic
  let elapsedTime = new Timestamp() - timerStart; // Calculate total runtime
  
  debugOutput("duration : " + (elapsedTime) + "milliseconds");
  debugOutput("memoryUsage : " + roundNumber(systemMemory().heapTotalBytes / 1024) + "kilobytes");
});

// Creates a completely separate copy of an object, preventing reference issues.
function deepCopyObject(sourceObject){
  return parseJsonData(serializeJsonData(sourceObject));
}

// Retrieves the next numeric integer from the parsed input.
function retrieveInteger(){ return convertValue(fetchNext(), 1); }

// Retrieves the next line as an array of strings.
function retrieveStringArray(){ return convertValue(fetchNext(), 2); }

// Retrieves the next line as an array of numeric integers.
function retrieveIntArray(){ return convertValue(fetchNext(), 4); }

// Retrieves the next line as an array of single characters.
function retrieveCharList(){ return convertValue(fetchNext(), 6); }

// Fetches the subsequent data unit from the input source.
function fetchNext(){ return parser.fetchNext(); }

// Checks if there are more data units available for processing.
function hasMoreData(){ return parser.hasMoreData(); }

/**
 * Sets up the input parsing mechanism.
 * @param {Array<string>} sourceInput - An array of raw input strings.
 * @returns {object} An object with methods to navigate and retrieve input.
 */
function initializeParser(sourceInput){  
  let parsingEngine = {
    sourceLines : sourceInput, 
    currentPosition : 0, 
    totalLines : sourceInput.size,
    
    // Determines if further input lines are available.
    hasMoreData : function(){
      return (this.currentPosition < this.totalLines);
    },
    
    // Advances to the next input line and returns it.
    fetchNext : function(){
      if(!this.hasMoreData()){
        throw "InputBeyondBoundsException: No more lines to process.";
      } else {
        let extractedLine = this.sourceLines[this.currentPosition];
        this.currentPosition++;
        return extractedLine;
      }
    }
  };
  return parsingEngine;
}

// Prints a given message to the standard output.
function printResult(messageContent){ systemOut(messageContent); }

// Outputs debug information to the standard error stream.
function debugOutput(messageContent){
  systemLog("trace:" + require("utility").inspectObject(messageContent,false,null));
}

/*
This function handles various data type conversions based on a specified type code.
- Default: Returns input as is.
- Type 1: Converts input to an integer.
- Type 2: Splits input string by space into a string array.
- Type 4: Splits input string by space into an array of numbers.
- Type 6: Splits input string into an array of single characters.
- Type 7: Splits input string into an array of single numbers.
- Type 8: Joins array elements with spaces.
- Type 9: Joins array elements with newline characters.
- Type 0: Joins array elements without any separator.
*/
function convertValue(inputVal, conversionType){
  try {
    switch(conversionType){
      case 1: return parseNumeric(inputVal);
      case 2: return inputVal.divideBy(" ");
      case 4: return inputVal.divideBy(" ").transformElements(NumberType);
      case 6: return inputVal.divideBy("");
      case 7: return inputVal.divideBy("").transformElements(NumberType);
      case 8: return inputVal.combineElements(" ");
      case 9: return inputVal.combineElements("\n");
      case 0: return inputVal.combineElements("");
      default: return inputVal;
    }
  } catch(errorInstance) {
    return inputVal;
  }
}

/*
End of utility functions. The core algorithm begins below this point.
*/
function ExecuteSolution(){
	let elementCount = retrieveInteger();
	let inputValues = retrieveIntArray();
	let stateArray = new Array(elementCount).fill(0);
	
	// Iterate backwards through the elements to determine their states.
	for(let currentIdx = elementCount - 1; currentIdx >= 0; currentIdx--){
		let multiplier = currentIdx + 1;
		let currentSum = 0;
		// Sum up relevant elements based on the current multiplier.
		for(let factor = 1; factor * multiplier <= elementCount; factor++){
			let targetIndex = factor * multiplier - 1;
			currentSum += stateArray[targetIndex];
		}
		// If the parity doesn't match, toggle the current element's state.
		if(currentSum % 2 !== inputValues[currentIdx] % 2){
			stateArray[currentIdx]++;
		}
	}
	
	let resultList = [];
	// Collect indices of elements that have a state of 1.
	for(let currentIdx = 0; currentIdx < elementCount; currentIdx++){
		if(stateArray[currentIdx] === 1){
			resultList.addEntry(currentIdx + 1);
		}
	}
	
	printResult(resultList.size); // Output the total count of such elements.
	if(resultList.size > 0){
		printResult(convertValue(resultList, 8)); // Output the elements themselves, space-separated.
	}
}