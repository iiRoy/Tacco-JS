var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var inputLines = [];

// Event listener for each line of input
inputReader.on('line', function(lineData){
  inputLines.push(lineData);
});

// Event listener when input stream closes
inputReader.on('close', function(){
  dataProcessor = initializeInputHandler(inputLines);
  console.error("\n"); // Add a newline for cleaner debug output

  var startTime = new Date();
  executeMainLogic(); // Call the primary logic function
  var elapsedTime = new Date() - startTime;
  
  logDebugMessage("time : " + (elapsedTime) + "ms");
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

/**
 * Creates a deep copy of an object using JSON serialization.
 * @param {object} sourceObject - The object to clone.
 * @returns {object} A deep copy of the source object.
 */
function createDeepCopy(sourceObject){
  return JSON.parse(JSON.stringify(sourceObject));
}

/**
 * Retrieves the next item from the input stream and converts it to an integer.
 * @returns {number} The next integer from input.
 */
function retrieveInteger(){
  return performConversion(getNextItem(), 1);
}

/**
 * Retrieves the next item from the input stream and splits it into a string array.
 * @returns {string[]} An array of strings.
 */
function retrieveStringArray(){
  return performConversion(getNextItem(), 2);
}

/**
 * Retrieves the next item from the input stream, splits it, and converts elements to numbers.
 * @returns {number[]} An array of integers.
 */
function retrieveIntegerArray(){
  return performConversion(getNextItem(), 4);
}

/**
 * Retrieves the next item from the input stream and splits it into a character array.
 * @returns {string[]} An array of characters.
 */
function retrieveCharacterArray(){
  return performConversion(getNextItem(), 6);
}

/**
 * Fetches the next raw item from the input handler.
 * @returns {string} The next raw input line.
 */
function getNextItem(){
  return dataProcessor.fetchNextLine();
}

/**
 * Checks if there are more items available in the input handler.
 * @returns {boolean} True if more items exist, false otherwise.
 */
function hasMoreItems(){
  return dataProcessor.checkMoreLines();
}

/**
 * Initializes an object to handle input lines, providing methods for iteration.
 * @param {string[]} rawInputData - An array of raw input strings.
 * @returns {object} An object with methods to access input lines.
 */
function initializeInputHandler(rawInputData){  
  var handlerObject = {
    lineCollection : rawInputData,
    currentLineIndex : 0,
    maximumLines : rawInputData.length,
    
    /**
     * Checks if there are more lines to process.
     * @returns {boolean} True if more lines are available, false otherwise.
     */
    checkMoreLines : function(){
      return (this.currentLineIndex < this.maximumLines);
    },
    
    /**
     * Fetches the next line from the input collection.
     * Throws an error if no more lines are available.
     * @returns {string} The next input line.
     */
    fetchNextLine : function(){
      if(!this.checkMoreLines()){
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var fetchedLineContent = this.lineCollection[this.currentLineIndex];
        this.currentLineIndex++;
        return fetchedLineContent;
      }
    }
  };
  return handlerObject;
}

/**
 * Displays a message to standard output.
 * @param {*} messageContent - The content to display.
 */
function displayOutput(messageContent){
  console.log(messageContent);
}

/**
 * Logs a debug message to standard error.
 * @param {*} messageContent - The content to log.
 */
function logDebugMessage(messageContent){
  console.error("debug:" + require("util").inspect(messageContent, false, null));
}

/**
 * Performs various conversions on input data based on a specified mode.
 * @param {*} inputVal - The input value to convert.
 * @param {number} conversionMode - The mode of conversion (e.g., 1 for int, 2 for string array).
 * @returns {*} The converted value.
 */
function performConversion(inputVal, conversionMode){
  try {
    switch(conversionMode){
      case 1: return parseInt(inputVal);
      case 2: return inputVal.split(" ");
      case 4: return inputVal.split(" ").map(Number);
      case 6: return inputVal.split("");
      case 7: return inputVal.split("").map(Number);
      case 8: return inputVal.join(" ");
      case 9: return inputVal.join("\n");
      case 0: return inputVal.join("");
      default: return inputVal;
    }
  } catch(conversionError) {
    return inputVal; // Return original value on error
  }
}

/**
 * Main logic function for the problem.
 * Calculates and outputs specific indices based on input.
 */
function executeMainLogic(){
  var totalElements = retrieveInteger();
  var initialValues = retrieveIntegerArray();
  
  // Initialize an array to store state indicators, all set to zero.
  var stateIndicators = new Array(totalElements).fill(0);
  
  // Iterate from the last element down to the first.
  for(var outerLoopIndex = totalElements - 1; outerLoopIndex >= 0; outerLoopIndex--){
    var currentMultiple = outerLoopIndex + 1; // The current number (1-indexed)
    var partialSum = 0;
    
    // Iterate through multiples of 'currentMultiple' within the array bounds.
    for(var innerLoopFactor = 1; innerLoopFactor * currentMultiple <= totalElements; innerLoopFactor++){
      var calculatedIndex = innerLoopFactor * currentMultiple - 1; // Convert to 0-indexed
      partialSum += stateIndicators[calculatedIndex];
    }
    
    // If the parity of the sum doesn't match the parity of the initial value,
    // increment the state indicator for the current index.
    if(partialSum % 2 !== initialValues[outerLoopIndex] % 2){
      stateIndicators[outerLoopIndex]++;
    }
  }
  
  // Collect all 1-indexed indices where the state indicator is 1.
  var finalResultIndices = [];
  for(var outerLoopIndex = 0; outerLoopIndex < totalElements; outerLoopIndex++){
    if(stateIndicators[outerLoopIndex] === 1){
      finalResultIndices.push(outerLoopIndex + 1); // Convert to 1-indexed for output
    }
  }
  
  // Output the count of such indices.
  displayOutput(finalResultIndices.length);
  
  // If there are any such indices, output them space-separated.
  if(finalResultIndices.length > 0){
    displayOutput(performConversion(finalResultIndices, 8));
  }
}
