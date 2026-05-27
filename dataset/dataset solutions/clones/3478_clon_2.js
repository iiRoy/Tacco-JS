var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var inputLines = [];

// Event listener for each line of input
inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

// Event listener for when input stream closes
inputReader.on('close', function(){
  // Initialize the data processor with all collected input lines
  dataProcessor = initializeInput(inputLines);
  
  // Print a newline to stderr for visual separation
  console.error("\n");
  
  // Record start time for performance measurement
  var startTime = Date.now();
  
  // Execute the main solution logic
  executeSolution();
  
  // Calculate elapsed time
  var elapsedTime = Date.now() - startTime;
  
  // Output performance metrics to stderr
  printDebug("execution time : " + (elapsedTime) + "ms");
  printDebug("memory usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

/**
 * Creates a deep copy of an object using JSON serialization/deserialization.
 * @param {object} sourceObject The object to clone.
 * @returns {object} A deep copy of the source object.
 */
function createDeepCopy(sourceObject){
  return JSON.parse(JSON.stringify(sourceObject));
}

/**
 * Fetches the next token from input and converts it to an integer.
 * @returns {number} The next integer from input.
 */
function getNextInteger(){
  return convertInput(fetchNextToken(), 1);
}

/**
 * Fetches the next token from input and converts it to an array of strings.
 * @returns {string[]} An array of strings from input.
 */
function getNextStringArray(){
  return convertInput(fetchNextToken(), 2);
}

/**
 * Fetches the next token from input and converts it to an array of integers.
 * @returns {number[]} An array of integers from input.
 */
function getNextIntegerArray(){
  return convertInput(fetchNextToken(), 4);
}

/**
 * Fetches the next token from input and converts it to an array of characters.
 * @returns {string[]} An array of characters from input.
 */
function getNextCharacterArray(){
  return convertInput(fetchNextToken(), 6);
}

/**
 * Retrieves the next available token (line) from the input data.
 * @returns {string} The next input line.
 */
function fetchNextToken(){
  return dataProcessor.next();
}

/**
 * Checks if there are more tokens (lines) available in the input data.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasMoreTokens(){
  return dataProcessor.hasNext();
}

/**
 * Initializes an object to manage input lines, providing methods to check for
 * more input and retrieve the next line.
 * @param {string[]} rawInputData An array of raw input strings.
 * @returns {object} An object with input management methods.
 */
function initializeInput(rawInputData){  
  return {
    sourceData : rawInputData,
    currentPosition : 0,
    dataLength : rawInputData.length,
    
    /**
     * Checks if there are more input lines to process.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    hasNext : function(){
      return (this.currentPosition < this.dataLength);
    },
    
    /**
     * Retrieves the next input line and advances the position.
     * Throws an error if no more input is available.
     * @returns {string} The next input line.
     */
    next : function(){
      if(this.hasNext()){
        return this.sourceData[this.currentPosition++];
      } else {
        throw "ArrayIndexOutOfBoundsException: No more input available.";
      }
    }
  };
}

/**
 * Prints a message to standard output.
 * @param {any} messageContent The content to print.
 */
function printOutput(messageContent){
  console.log(messageContent);
}

/**
 * Prints a debug message to standard error, inspecting objects for detailed output.
 * @param {any} messageContent The content to print as a debug message.
 */
function printDebug(messageContent){
  console.error("debug:" + require("util").inspect(messageContent, false, null));
}

/**
 * Converts input values based on a specified conversion type.
 * @param {any} inputValue The value to convert.
 * @param {number} conversionType The type of conversion to apply:
 *   1: Parse as integer.
 *   2: Split by space into string array.
 *   4: Split by space and map to number array.
 *   6: Split by character into character array.
 *   7: Split by character and map to number array.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements with no character.
 *   (default): Return input as is.
 * @returns {any} The converted value.
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
  } catch(conversionError){
    // If conversion fails, return the original input value
    return inputValue;
  }
}

// Main function containing the problem's solution logic
function executeSolution(){
  // Read the target number from input
  var targetNumber = getNextInteger();
  
  // Variable to iterate through potential triangular numbers
  var currentSumCandidate = 0;
  // Flag to indicate if targetNumber is a triangular number
  var isTriangular = false;
  
  // Loop to find if targetNumber is a triangular number (k * (k + 1) / 2)
  while(currentSumCandidate <= targetNumber){
    if((currentSumCandidate * (currentSumCandidate + 1)) / 2 === targetNumber){
      isTriangular = true;
      break; // Found a match, exit loop
    }
    currentSumCandidate++; // Increment candidate
  }
  
  // If targetNumber is not a triangular number, print "No" and exit
  if(!isTriangular){
    printOutput("No");
    return;
  }
  
  // If it is a triangular number, print "Yes"
  printOutput("Yes");
  
  // Initialize a 2D array (matrix) to store the result
  // Dimensions: (currentSumCandidate + 1) rows, currentSumCandidate columns
  var resultMatrix = new Array(currentSumCandidate + 1);
  for(var rowIdx = 0; rowIdx < currentSumCandidate + 1; rowIdx++){
    resultMatrix[rowIdx] = new Array(currentSumCandidate);
  }
  
  // Variable to assign sequential numbers to matrix cells
  var currentValue = 1;
  
  // Populate the matrix based on the problem's specific pattern
  // This creates a symmetric structure where list[i][j] and list[j+1][i] get the same value
  for(var rowIter = 0; rowIter < currentSumCandidate; rowIter++){
    for(var colIter = rowIter; colIter < currentSumCandidate; colIter++){
      resultMatrix[rowIter][colIter] = currentValue;
      resultMatrix[colIter + 1][rowIter] = currentValue;
      currentValue++; // Increment for the next unique number
    }
  }
  
  // Output the generated matrix to stderr for debugging purposes
  printDebug(resultMatrix);
  
  // Print the number of rows in the result matrix
  printOutput(resultMatrix.length);
  
  // Prepare the final output lines
  var formattedOutputLines = new Array(resultMatrix.length);
  for(var lineIter = 0; lineIter < resultMatrix.length; lineIter++){
    // Prepend the count of elements in the current row (which is currentSumCandidate)
    resultMatrix[lineIter].unshift(currentSumCandidate);
    // Join the elements of the row with spaces
    formattedOutputLines[lineIter] = resultMatrix[lineIter].join(" ");
  }
  
  // Print all formatted output lines, joined by newlines
  printOutput(convertInput(formattedOutputLines, 9));
}
