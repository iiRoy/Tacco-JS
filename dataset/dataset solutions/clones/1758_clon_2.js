var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var collectedInputLines = [];

// Collect all input lines as they arrive
inputReader.on('line', function(inputLine){
  collectedInputLines.push(inputLine);
});

// Once all input is received and the stream closes, process it
inputReader.on('close', function(){
  dataProcessor = initializeDataProcessor(collectedInputLines); // Set up the input handler
  logDiagnosticMessage("-----start-----"); // Mark the beginning of execution
  var operationStartTime = new Date(); // Capture the start timestamp
  executePrimaryLogic(); // Run the main application logic
  var operationDuration = new Date() - operationStartTime; // Calculate total execution time
  logDiagnosticMessage("----- end -----"); // Mark the end of execution
  logDiagnosticMessage("time : " + (operationDuration) + "ms"); // Report execution time
  logDiagnosticMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB"); // Report memory usage
});

// Helper functions to parse different data types from the input stream
function parseNextInteger(){ return performTypeConversion(retrieveNextLine(), 1); }
function parseNextStringArray(){ return performTypeConversion(retrieveNextLine(), 2); }
function parseNextIntegerArray(){ return performTypeConversion(retrieveNextLine(), 4); }
function parseNextCharacterArray(){ return performTypeConversion(retrieveNextLine(), 6); }

// Functions to interact with the data processor
function retrieveNextLine(){ return dataProcessor.fetchNextItem(); }
function checkHasMoreLines(){ return dataProcessor.hasRemainingItems(); }

/**
 * Sets up an object to manage and provide input lines sequentially.
 * @param {Array<string>} rawInputCollection - An array of strings representing all input lines.
 * @returns {object} An object with methods to check for and retrieve input lines.
 */
function initializeDataProcessor(rawInputCollection){
  var processorInstance = {
    sourceDataList : rawInputCollection, // The complete list of input lines
    currentPosition : 0, // The current index for reading
    maximumPosition : rawInputCollection.length, // The total number of input lines

    // Checks if there are more lines available to read
    hasRemainingItems : function(){
      return (this.currentPosition < this.maximumPosition);
    },

    // Fetches the next line from the input list
    fetchNextItem : function(){
      if(!this.hasRemainingItems()){
        throw "ArrayIndexOutOfBoundsException これ以上ないよ"; // Error if no more input
      } else {
        var retrievedItem = this.sourceDataList[this.currentPosition];
        this.currentPosition++; // Advance the position for the next read
        return retrievedItem;
      }
    }
  };
  return processorInstance;
}

// Function to output results to the console
function displayOutput(messageContent){
  console.log(messageContent);
}

// Function to output debug information to the error stream
function logDiagnosticMessage(messageContent){
  console.error("debug:" + require("util").inspect(messageContent, false, null));
}

/**
 * Converts an input value based on a specified conversion code.
 * @param {*} inputVal - The value to be converted.
 * @param {number} conversionCode - A numeric code indicating the desired conversion.
 * @returns {*} The converted value, or the original value if conversion fails or is not defined.
 */
function performTypeConversion(inputVal, conversionCode){
  try {
    switch(conversionCode){
      case 1: return parseInt(inputVal); // Convert to an integer
      case 2: return inputVal.split(" "); // Split string by space into an array of strings
      case 4: return inputVal.split(" ").map(Number); // Split by space and convert elements to numbers
      case 6: return inputVal.split(""); // Split string into an array of characters
      case 7: return inputVal.split("").map(Number); // Split by character and convert elements to numbers
      case 8: return inputVal.join(" "); // Join array elements with a space
      case 9: return inputVal.join("\n"); // Join array elements with a newline
      case 0: return inputVal.join(""); // Join array elements without any separator
      default: return inputVal; // Return the input as is if no matching code
    }
  } catch(conversionErr) {
    return inputVal; // In case of an error during conversion, return the original value
  }
}

// --------------------------------------------------------------------------
// Main program logic starts here.

/**
 * Determines the smallest positive integer 'iterationCounter' such that
 * 'initialValue' multiplied by 'iterationCounter' is a multiple of 360.
 */
function executePrimaryLogic(){
	var initialValue = parseNextInteger(); // Read the input number
	var iterationCounter = 0; // Initialize a counter for iterations
	var cumulativeSum = 0; // Initialize a variable to hold the running sum

	// Loop indefinitely until the condition is met
	while(true){
		cumulativeSum += initialValue; // Add the initial value to the sum
		iterationCounter++; // Increment the iteration counter

		// Check if the cumulative sum is perfectly divisible by 360
		if(cumulativeSum % 360 === 0){
			displayOutput(iterationCounter); // Output the number of iterations
			return; // Exit the function as the condition is met
		}
	}
}
