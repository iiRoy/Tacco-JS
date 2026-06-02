var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Global variables for input processing
var dataProcessor;
var inputLines = [];

// Event listener for each line of input
inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

// Event listener for end of input
inputReader.on('close', function(){
  dataProcessor = initializeInputHandler(inputLines);

  // Separator for debug output
  console.error("\n");

  // Measure execution time
  var startTime = Date.now();
  executeSolution();
  var elapsedTime = Date.now() - startTime;

  // Log performance metrics
  logDebug("time : " + (elapsedTime) + "ms");
  logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

/**
 * Creates a deep copy of an object.
 * @param {object} sourceObject - The object to clone.
 * @returns {object} A new object that is a deep copy of the source.
 */
function createDeepCopy(sourceObject){
  return JSON.parse(JSON.stringify(sourceObject));
}

/**
 * Retrieves the next input token as an integer.
 * @returns {number} The next integer from input.
 */
function getNextInteger(){
  return convertInput(getNextToken(), 1);
}

/**
 * Retrieves the next input token as an array of strings.
 * @returns {string[]} The next string array from input.
 */
function getNextStringArray(){
  return convertInput(getNextToken(), 2);
}

/**
 * Retrieves the next input token as an array of integers.
 * @returns {number[]} The next integer array from input.
 */
function getNextIntegerArray(){
  return convertInput(getNextToken(), 4);
}

/**
 * Retrieves the next input token as an array of characters.
 * @returns {string[]} The next character array from input.
 */
function getNextCharacterArray(){
  return convertInput(getNextToken(), 6);
}

/**
 * Retrieves the next raw input token.
 * @returns {string} The next raw token.
 */
function getNextToken(){
  return dataProcessor.retrieveNextToken();
}

/**
 * Checks if there are more input tokens available.
 * @returns {boolean} True if more tokens exist, false otherwise.
 */
function hasMoreTokens(){
  return dataProcessor.checkMoreTokens();
}

/**
 * Initializes the input handler object.
 * @param {string[]} inputData - An array of input strings.
 * @returns {object} An object with methods to process input.
 */
function initializeInputHandler(inputData){
  return {
    sourceList : inputData,
    currentPosition : 0,
    totalItems : inputData.length,

    /**
     * Checks if there are more items in the input list.
     * @returns {boolean} True if more items, false otherwise.
     */
    checkMoreTokens : function(){
      return (this.currentPosition < this.totalItems);
    },

    /**
     * Retrieves the next item from the input list.
     * @returns {string} The next item.
     * @throws {string} If no more input is available.
     */
    retrieveNextToken : function(){
      if(this.checkMoreTokens()){
        return this.sourceList[this.currentPosition++];
      } else {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
    }
  };
}

/**
 * Prints a message to standard output.
 * @param {*} message - The message to print.
 */
function printResult(message){
  console.log(message);
}

/**
 * Prints a debug message to standard error.
 * @param {*} debugMessage - The message to print.
 */
function logDebug(debugMessage){
  console.error("debug:" + require("util").inspect(debugMessage, false, null));
}

/**
 * Converts input based on a specified format code.
 * @param {*} inputItem - The item to convert.
 * @param {number} formatCode - The conversion format code.
 * @returns {*} The converted item.
 */
function convertInput(inputItem, formatCode){
  try {
    switch(formatCode){
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
  } catch(error) {
    return inputItem; // Return original on error
  }
}

/**
 * Main function to solve the problem.
 */
function executeSolution(){
  // Read initial dimensions
  var dimensions = getNextIntegerArray();
  var heightVal = dimensions[0];
  var widthVal = dimensions[1];

  // Initialize minimum difference with a large value
  var minDifference = 100000000000;

  // First set of calculations: splitting along height
  for(var splitIndex = 1; splitIndex <= heightVal - 2; splitIndex++){
    // Calculate areas for vertical splits
    var vertSlice1 = splitIndex;
    var vertSlice2 = Math.floor((heightVal - splitIndex) / 2);
    var vertSlice3 = Math.ceil((heightVal - splitIndex) / 2);

    // Find max and min of these vertical slices
    var maxVertSlice = Math.max.apply(null, [vertSlice1, vertSlice2, vertSlice3]);
    var minVertSlice = Math.min.apply(null, [vertSlice1, vertSlice2, vertSlice3]);

    // Update minDifference with the difference of vertical slices multiplied by width
    minDifference = Math.min(minDifference, (maxVertSlice - minVertSlice) * widthVal);

    // Calculate areas for horizontal splits within the remaining part
    var horizSlice1 = Math.floor(widthVal / 2);
    var horizSlice2 = widthVal - horizSlice1;

    var area1 = splitIndex * widthVal;
    var area2 = (heightVal - splitIndex) * horizSlice1;
    var area3 = (heightVal - splitIndex) * horizSlice2;

    // Find max and min of these areas
    var maxArea = Math.max.apply(null, [area1, area2, area3]);
    var minArea = Math.min.apply(null, [area1, area2, area3]);

    // Update minDifference with the difference of these areas
    minDifference = Math.min(minDifference, maxArea - minArea);
  }

  // Swap height and width to perform symmetric calculations
  var tempDim = heightVal;
  heightVal = widthVal;
  widthVal = tempDim;

  // Second set of calculations: splitting along new height (original width)
  for(var splitIndex = 1; splitIndex <= heightVal - 2; splitIndex++){
    // Calculate areas for vertical splits (now effectively horizontal in original orientation)
    var vertSlice1 = splitIndex;
    var vertSlice2 = Math.floor((heightVal - splitIndex) / 2);
    var vertSlice3 = Math.ceil((heightVal - splitIndex) / 2);

    // Find max and min of these slices
    var maxVertSlice = Math.max.apply(null, [vertSlice1, vertSlice2, vertSlice3]);
    var minVertSlice = Math.min.apply(null, [vertSlice1, vertSlice2, vertSlice3]);

    // Update minDifference
    minDifference = Math.min(minDifference, (maxVertSlice - minVertSlice) * widthVal);

    // Calculate areas for horizontal splits within the remaining part (now effectively vertical)
    var horizSlice1 = Math.floor(widthVal / 2);
    var horizSlice2 = widthVal - horizSlice1;

    var area1 = splitIndex * widthVal;
    var area2 = (heightVal - splitIndex) * horizSlice1;
    var area3 = (heightVal - splitIndex) * horizSlice2;

    // Find max and min of these areas
    var maxArea = Math.max.apply(null, [area1, area2, area3]);
    var minArea = Math.min.apply(null, [area1, area2, area3]);

    // Update minDifference
    minDifference = Math.min(minDifference, maxArea - minArea);
  }

  // Output the final minimum difference
  printResult(minDifference);
}
