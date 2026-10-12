var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Object to manage input processing
var dataProcessor;
// Array to store all input lines
var inputLines = [];

// Event listener for each line of input
inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

// Event listener for when input stream closes
inputReader.on('close', function(){
  // Initialize the input handler with all collected lines
  dataProcessor = initializeInputHandler(inputLines);
  
  // Log start time for performance measurement
  logDebugMessage("-----start-----");
  var startTime = new Date();
  
  // Execute the main program logic
  ProcessGrid();
  
  // Calculate and log execution time
  var endTime = new Date() - startTime;
  logDebugMessage("----- end -----");
  logDebugMessage("time : " + (endTime) + "ms");
  
  // Log memory usage
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Helper functions for retrieving different types of input
function retrieveInteger(){ return convertInput(getNextLine(), 1); }
function retrieveStringArray(){ return convertInput(getNextLine(), 2); }
function retrieveIntegerArray(){ return convertInput(getNextLine(), 4); }
function retrieveCharacterArray(){ return convertInput(getNextLine(), 6); }

// Function to get the next line from the input handler
function getNextLine(){ return dataProcessor.next(); }
// Function to check if there are more lines to process
function hasMoreLines(){ return dataProcessor.hasNext(); }

// Initializes an object to handle sequential input line retrieval
function initializeInputHandler(allInputLines){  
  var inputHandlerObject = {
    lineList : allInputLines, // Stores all input lines
    currentLineIndex : 0,     // Current position in the line list
    totalLines : allInputLines.length, // Total number of lines
    
    // Method to check if there are more lines available
    hasNext : function(){
      return (this.currentLineIndex < this.totalLines);
    },
    
    // Method to retrieve the next line
    next : function(){
      if(!this.hasNext()){
        // Throw an error if no more lines are available
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        // Get the current line and advance the index
        var currentLineContent = this.lineList[this.currentLineIndex];
        this.currentLineIndex++;
        return currentLineContent;
      }
    }
  };
  return inputHandlerObject;
}

// Prints a result to standard output
function printResult(outputValue){
  console.log(outputValue);
}

// Prints a debug message to standard error
function logDebugMessage(debugInfo){
  console.error("debug:" + require("util").inspect(debugInfo, false, null));
}

// Utility function for converting input based on a specified type
// conversionType:
// 1: Convert to integer
// 2: Split by space into string array
// 4: Split by space into number array
// 6: Split by character into string array
// 7: Split by character into number array
// 8: Join array elements with space
// 9: Join array elements with newline
// 0: Join array elements without separator
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
      default: return inputValue; // Return as-is if type is unknown
    }
  } catch(error){
    return inputValue; // Return original value on error
  }
}

// Main function containing the core logic
function ProcessGrid(){
  // Read the first line of input, expected to be two integers
  var initialValues = retrieveIntegerArray();
  var valA = initialValues[0];
  var valB = initialValues[1];
  
  // Define the size of the grid
  var gridSize = 100;
  // Initialize a 2D array (grid)
  var gridData = new Array(gridSize);
  
  // Populate the grid with initial patterns
  for(var idx = 0; idx < gridSize; idx++){
    if(idx < 50){
      // First half of rows filled with '#'
      gridData[idx] = new Array(gridSize).fill("#");
    } else {
      // Second half of rows filled with '.'
      gridData[idx] = new Array(gridSize).fill(".");
    }
  }
  
  // Modify the grid based on value A
  // Place '.' characters in the top half
  for(var idx = 0; idx < valA - 1; idx++){
    var colPos = (idx * 2) % gridSize;
    var rowPos = Math.floor(idx / gridSize) * 2;
    gridData[rowPos][colPos] = ".";
  }
  
  // Modify the grid based on value B
  // Place '#' characters in the bottom half
  for(var idx = 0; idx < valB - 1; idx++){
    var colPos = (idx * 2) % gridSize;
    var rowPos = Math.floor(idx / gridSize) * 2 + 51; // Offset by 51 to be in the bottom half
    gridData[rowPos][colPos] = "#";
  }
  
  // Output the grid dimensions
  printResult(gridSize + " " + gridSize);
  
  // Output each row of the grid, joined without separators
  for(var idx = 0; idx < gridSize; idx++){
    printResult(convertInput(gridData[idx], 0));
  }
}
