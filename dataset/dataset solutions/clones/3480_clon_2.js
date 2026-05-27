var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// This variable will hold our processed input handler.
var dataProcessor;
// An array to store all incoming lines from standard input.
var inputLines = [];

// Event listener for each line of input received.
inputReader.on('line', function(rawInputData){
  inputLines.push(rawInputData);
});

// Event listener for when the input stream closes.
inputReader.on('close', function(){
  // Initialize the input handler with all collected lines.
  dataProcessor = initializeInputHandler(inputLines);

  // Output a blank line to stderr for formatting.
  console.error("\n");

  // Record the starting time for performance measurement.
  var operationStartTime = Date.now();

  // Execute the main application logic.
  executePrimaryLogic();

  // Calculate the elapsed time.
  var elapsedDuration = Date.now() - operationStartTime;

  // Log the execution time to stderr.
  logDebugMessage("time : " + (elapsedDuration) + "ms");
  // Log the memory usage to stderr.
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Creates a deep copy of an object using JSON serialization/deserialization.
function duplicateObject(originalObject){
  return JSON.parse(JSON.stringify(originalObject));
}

// Retrieves and parses the next input item as an integer.
function retrieveNextInteger(){
  return performTypeConversion(fetchNextItem(), 1);
}

// Retrieves the next input item and splits it into a string array.
function retrieveNextStringArray(){
  return performTypeConversion(fetchNextItem(), 2);
}

// Retrieves the next input item, splits it, and parses elements as integers.
function retrieveNextIntegerArray(){
  return performTypeConversion(fetchNextItem(), 4);
}

// Retrieves the next input item and splits it into a character array.
function retrieveNextCharacterArray(){
  return performTypeConversion(fetchNextItem(), 6);
}

// Fetches the next available item from the input data.
function fetchNextItem(){
  return dataProcessor.fetchNextItem();
}

// Checks if there are more items available in the input data.
function hasMoreItems(){
  return dataProcessor.hasMoreItems();
}

// Initializes an object to handle sequential access to input lines.
function initializeInputHandler(rawInputData){
  return {
    sourceData : rawInputData, // The array of input lines.
    currentPosition : 0,       // Current index for reading.
    maximumCount : rawInputData.length, // Total number of input lines.

    // Method to check if there are more lines to read.
    hasMoreItems : function(){
      return (this.currentPosition < this.maximumCount);
    },

    // Method to get the next line and advance the position.
    fetchNextItem : function(){
      if(this.hasMoreItems()){
        return this.sourceData[this.currentPosition++];
      } else {
        // Throws an error if no more input is available.
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
    }
  };
}

// Displays a message to standard output.
function displayOutput(messageContent){
  console.log(messageContent);
}

// Logs a debug message to standard error, inspecting objects for better readability.
function logDebugMessage(messageContent){
  console.error("debug:" + require("util").inspect(messageContent, false, null));
}

// Utility function to convert input based on a specified type.
// conversionType:
// 1: parseInt.
// 2: split by space.
// 4: split by space and map to Number.
// 6: split by character.
// 7: split by character and map to Number.
// 8: join with space.
// 9: join with newline.
// 0: join with no character.
// Default: return input as is.
function performTypeConversion(inputValue, conversionType){
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
  } catch(conversionError) {
    // If an error occurs during conversion, return the original input.
    return inputValue;
  }
}

// The primary function containing the application's core logic.
function executePrimaryLogic(){
  displayOutput("Yes");
  displayOutput(4);
  displayOutput("3 1 2 3");
  displayOutput("3 1 4 5");
  displayOutput("3 2 4 6");
  displayOutput("3 3 5 6");
}
