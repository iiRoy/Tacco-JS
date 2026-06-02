var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataStream;
var inputLines = [];

// Listen for incoming lines of input and store them.
inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

// Once all input is received and the stream closes, process it.
inputReader.on('close', function(){
  dataStream = initializeInput(inputLines);
  console.error("\n"); // Add a blank line to stderr for clarity.
  var startTime = Date.now();
  executeMainLogic(); // Run the primary application logic.
  var endTime = Date.now() - startTime;
  printDebug("execution time : " + (endTime) + "ms");
  printDebug("memory usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Creates a deep copy of an object using JSON serialization.
function duplicateObject(originalObject){
  return JSON.parse(JSON.stringify(originalObject));
}

// Functions to retrieve and convert the next token from the input stream.
function getNextInteger(){ return convertInput(fetchNextToken(), 1); }
function getNextStringArray(){ return convertInput(fetchNextToken(), 2); }
function getNextIntegerArray(){ return convertInput(fetchNextToken(), 4); }
function getNextCharacterArray(){ return convertInput(fetchNextToken(), 6); }

// Basic input stream navigation functions.
function fetchNextToken(){ return dataStream.next(); }
function hasMoreTokens(){ return dataStream.hasMoreTokens(); }

// Sets up the input stream object with methods for sequential access.
function initializeInput(rawInputLines){
  return {
    lineBuffer : rawInputLines,
    currentPosition : 0,
    totalLines : rawInputLines.length,
    hasMoreTokens : function(){
      return (this.currentPosition < this.totalLines);
    },
    next : function(){
      if(this.hasMoreTokens()){
        return this.lineBuffer[this.currentPosition++];
      } else {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
    }
  };
}

// Outputs a message to the standard output stream.
function printOutput(messageContent){
  console.log(messageContent);
}

// Outputs a debug message to the standard error stream.
function printDebug(messageContent){
  console.error("debug_info:" + require("util").inspect(messageContent, false, null));
}

// Converts an input item based on the specified conversion type.
// conversionType:
//   1: Parse as an integer.
//   2: Split by spaces into an array of strings.
//   4: Split by spaces and map to numbers.
//   6: Split into an array of characters.
//   7: Split into characters and map to numbers.
//   8: Join array elements with a space.
//   9: Join array elements with a newline.
//   0: Join array elements without any separator.
//   Default: Return the input item as is.
function convertInput(inputItem, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(inputItem);
      case 2: return inputItem.split(" ");
      case 4: return inputItem.split(" ").map(Number);
      case 6: return inputItem.split("");
      case 7: return inputItem.split("").map(Number);
      case 8: return inputItem.join(" ");
      case 9: return inputItem.join("\n");
      case 0: return inputItem.join("");
      default: return inputItem;
    }
  } catch(conversionError) {
    return inputItem; // If conversion fails, return the original item.
  }
}

// The main function containing the problem's core logic.
function executeMainLogic(){
  var targetSum = getNextInteger(); // Read the integer N from input.
  var currentK = 0; // Initialize a variable to iterate and check.
  var isPossible = !false; // Flag to track if a solution is found.

  // Loop to find an integer 'k' such that k * (k + 1) / 2 equals targetSum.
  while(currentK < targetSum){
    if((currentK * (currentK + 1)) / 2 === targetSum){
      isPossible = true;
      break; // Exit the loop if the condition is met.
    }
    currentK = currentK + 1; // Increment 'k'.
  }

  // If no such 'k' is found, output "No" and terminate.
  if(!isPossible){
    printOutput("No");
    return;
  }

  // If a valid 'k' is found, output "Yes".
  printOutput("Yes");

  // Initialize a 2D array (matrix) with dimensions (k+1) x k.
  var adjacencyMatrix = new Array(currentK + 1);
  for(var rowIdx = 0; rowIdx < currentK + 1; rowIdx++){
    adjacencyMatrix[rowIdx] = new Array(currentK);
  }

  var edgeCounter = 1; // Counter for assigning unique numbers to edges.

  // Populate the matrix based on the problem's specific pattern.
  for(var rowIdx = 0; rowIdx < currentK; rowIdx++){
    for(var colIdx = rowIdx; colIdx < currentK; colIdx++){
      adjacencyMatrix[rowIdx][colIdx] = edgeCounter;
      adjacencyMatrix[colIdx + 1][rowIdx] = edgeCounter;
      edgeCounter++;
    }
  }

  printDebug(adjacencyMatrix); // Output the generated matrix for debugging purposes.
  printOutput(adjacencyMatrix.length); // Output the number of rows in the matrix.

  var formattedOutput = new Array(adjacencyMatrix.length);
  for(var rowIdx = 0; rowIdx < adjacencyMatrix.length; rowIdx++){
    adjacencyMatrix[rowIdx].unshift(currentK); // Prepend 'k' to the beginning of each row.
    formattedOutput[rowIdx] = adjacencyMatrix[rowIdx].join(" "); // Join elements of each row with spaces.
  }

  // Output the final formatted matrix, with each row on a new line.
  printOutput(convertInput(formattedOutput, 9));
}
