var INPUT_PARSER=(function(){
  // Factory function to create a new data processor instance.
  function createParser(inputStringContent){
    return new DataProcessor(inputStringContent);
  }

  // Constructor for the DataProcessor object.
  function DataProcessor(inputStringContent){
    // Store the input string, split by newlines and trimmed.
    this._inputLinesArray = inputStringContent.trim().split("\n");
    // Initialize the current line pointer.
    this._currentLinePointer = 0;
  }

  // Method to read the next token from the current line.
  // If the current line is exhausted, it moves to the next.
  DataProcessor.prototype.readNextNumericToken = function(returnAsString){
    var linesCollection = this._inputLinesArray,
        linePointer = this._currentLinePointer,
        tokenValue;

    // If the current line hasn't been split into tokens yet, do it.
    if(typeof linesCollection[linePointer] === "string") {
      linesCollection[linePointer] = linesCollection[linePointer].split(" ").reverse();
    }

    // Pop the last token (since we reversed the array).
    tokenValue = linesCollection[linePointer].pop();

    // If the current line is now empty, advance the line pointer.
    if(!linesCollection[linePointer].length) {
      this._currentLinePointer++;
    }

    // Return the token, either as string or parsed to number.
    return returnAsString ? tokenValue : +tokenValue;
  };

  // Method to read all tokens from the current line.
  DataProcessor.prototype.readNumericLine = function(returnStrings){
    // Get the current line, split it by spaces, and advance the line pointer.
    var lineTokens = this._inputLinesArray[this._currentLinePointer++].split(" ");
    // Return tokens as strings or parsed to numbers.
    return returnStrings ? lineTokens : lineTokens.map(strVal => +strVal);
  };

  // Method to read a matrix of numbers from subsequent lines.
  DataProcessor.prototype.readNumericMatrix = function(rowCount, returnStrings){
    // Extract 'rowCount' lines and split each into tokens.
    var matrixData = this._inputLinesArray.slice(this._currentLinePointer, this._currentLinePointer += rowCount).map(rowString => rowString.split(" "));
    // Return matrix as strings or parsed to numbers.
    return returnStrings ? matrixData : matrixData.map(rowString => rowString.map(cellString => +cellString));
  };

  // Method to read raw lines without splitting tokens.
  DataProcessor.prototype.readRawLines = function(lineCount, returnStrings){
    // Extract 'lineCount' lines directly.
    var extractedRows = this._inputLinesArray.slice(this._currentLinePointer, this._currentLinePointer += lineCount);
    // Return lines as strings or parsed to numbers (if applicable).
    return returnStrings ? extractedRows : extractedRows.map(lineContent => +lineContent);
  };

  return createParser;
})();

// Initialize the input reader by reading from standard input.
var dataInputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin","utf8"));

// Helper function to create multi-dimensional arrays.
function generateMultiDimensionalArray(initialElementValue){
  var argumentsList = arguments,
      listLength = argumentsList.length,
      arrayConstructorString = "Array(argumentsList["+ --listLength +"]).fill(0).map(x=>{return "+initialElementValue+";})";

  while(--listLength) {
    arrayConstructorString = "Array(argumentsList["+listLength+"]).fill(0).map(x=>"+arrayConstructorString+")";
  }
  return eval(arrayConstructorString);
}

// Output the result of the main processing function.
console.log(processCalculation());

// Main function containing the problem's logic.
function processCalculation(){
  // Read problem parameters.
  var itemCount = dataInputReader.readNextNumericToken();
  var thresholdValue = dataInputReader.readNextNumericToken();
  var itemDetails = dataInputReader.readNumericMatrix(itemCount);

  var totalInitialSum = 0; // Accumulator for initial sum.

  // First pass: calculate initial sum and add a new property to each item.
  for(var loopIndex = 0; loopIndex < itemCount; loopIndex++){
    var currentProduct = itemDetails[loopIndex][0] * itemDetails[loopIndex][1];
    totalInitialSum += currentProduct;
    // Add a calculated value to each item's array.
    itemDetails[loopIndex].push((thresholdValue - itemDetails[loopIndex][0]) * itemDetails[loopIndex][2]);
  }

  // Sort items based on the newly added property in descending order.
  itemDetails.sort((itemA, itemB) => itemB[3] - itemA[3]);

  // Binary search setup.
  var searchHigh = itemCount * thresholdValue, // Upper bound for binary search.
      searchLow = -1; // Lower bound for binary search.

  // Perform binary search.
  while(searchHigh - searchLow > 1){
    var midPoint = Math.floor((searchHigh + searchLow) / 2);
    var currentAccumulatedSum = totalInitialSum,
        remainingThreshold = midPoint;

    // Simulate the process for the current 'midPoint'.
    for(var loopIndex = 0; loopIndex < itemCount && remainingThreshold > 0 && currentAccumulatedSum > 0; loopIndex++){
      if(thresholdValue <= remainingThreshold) {
        // If remaining threshold is large enough, apply full item effect.
        currentAccumulatedSum -= itemDetails[loopIndex][0] * itemDetails[loopIndex][1] + itemDetails[loopIndex][3];
        remainingThreshold -= thresholdValue;
      } else {
        // If remaining threshold is smaller, apply partial effect.
        for(var temporarySum = currentAccumulatedSum; loopIndex < itemCount && temporarySum > 0; loopIndex++){
          temporarySum = currentAccumulatedSum; // Reset temporary sum for inner loop iteration.
          if(remainingThreshold < itemDetails[loopIndex][0]){
            temporarySum -= itemDetails[loopIndex][1] * remainingThreshold;
          } else {
            temporarySum -= itemDetails[loopIndex][0] * itemDetails[loopIndex][1] + (remainingThreshold - itemDetails[loopIndex][0]) * itemDetails[loopIndex][2];
          }
        }
        currentAccumulatedSum = temporarySum; // Update main sum after inner loop.
      }
    }

    // Adjust binary search bounds based on the simulation result.
    if(currentAccumulatedSum > 0) {
      searchLow = midPoint;
    } else {
      searchHigh = midPoint;
    }
  }
  // Return the final result.
  return searchHigh;
}
