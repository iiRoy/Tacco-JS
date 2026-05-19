var INPUT_PARSER=(function(){
  // Factory function to create a new data processor instance
  function createParser(sourceString){
    return new DataProcessor(sourceString);
  }

  // Constructor for the data processing object
  function DataProcessor(inputContent){
    // Store lines as an array, trimming initial/final whitespace
    this._linesArray = inputContent.trim().split("\n");
    // Initialize current line index
    this._currentLineIndex = 0;
  }

  // Method to read a single item from the current line
  DataProcessor.prototype.readNextItem=function(isString){
    var currentLines = this._linesArray;
    var lineIdx = this._currentLineIndex;
    var extractedValue;

    // If the current line hasn't been split yet, split it and reverse for easy popping
    if(typeof currentLines[lineIdx]==="string") {
      currentLines[lineIdx] = currentLines[lineIdx].split(" ").reverse();
    }

    // Pop the last item from the current line's array
    extractedValue = currentLines[lineIdx].pop();

    // If the current line is now empty, advance to the next line
    if(!currentLines[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return as string or number based on the flag
    return isString ? extractedValue : +extractedValue;
  };

  // Method to read all items from the current line
  DataProcessor.prototype.readLineItems=function(asStrings){
    // Get the current line, split it by space, and advance the line index
    var currentLineParts = this._linesArray[this._currentLineIndex++].split(" ");
    // Return as strings or numbers based on the flag
    return asStrings ? currentLineParts : currentLineParts.map(item => +item);
  };

  // Method to read a matrix of 'numRows' rows
  DataProcessor.prototype.readMatrix=function(numRows, returnStrings){
    // Slice the required number of rows, split each by space
    var matrixData = this._linesArray.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(row => row.split(" "));
    // Return as strings or numbers based on the flag
    return returnStrings ? matrixData : matrixData.map(row => row.map(item => +item));
  };

  // Method to read 'count' raw rows
  DataProcessor.prototype.readRows=function(count, asRawStrings){
    // Slice the required number of rows
    var rowStrings = this._linesArray.slice(this._currentLineIndex, this._currentLineIndex += count);
    // Return as raw strings or numbers based on the flag
    return asRawStrings ? rowStrings : rowStrings.map(item => +item);
  };

  return createParser;
})();

// Initialize the input reader with content from standard input
var inputReader=INPUT_PARSER(require("fs").readFileSync("/dev/stdin","utf8"));

// Helper function to create multi-dimensional arrays
function createMultiDimArray(initialValue){
  var argsList=arguments, argCount=argsList.length, arrayCreationString="Array(argsList["+--argCount+"]).fill(0).map(x=>{return "+initialValue+";})";
  while(--argCount) {
    arrayCreationString="Array(argsList["+argCount+"]).fill(0).map(x=>"+arrayCreationString+")";
  }
  return eval(arrayCreationString);
}

// Output the result of the main problem-solving function
console.log(solveProblem());

// Main function containing the problem's logic
function solveProblem(){
  var numItems = inputReader.readNextItem(); // N
  var thresholdValue = inputReader.readNextItem(); // X
  var itemData = inputReader.readMatrix(numItems); // B

  var totalSum = 0; // S
  // Process each item to calculate derived values
  for(var idx = 0; idx < numItems; idx++){
    var productVal = itemData[idx][0] * itemData[idx][1]; // t = b[i][0]*b[i][1]
    var adjustedVal = (thresholdValue - itemData[idx][0]) * itemData[idx][2]; // a = (x-b[i][0])*b[i][2]
    totalSum += productVal; // S += t
    // Add calculated values to the item's array: adjustedVal, productVal, adjustedVal+productVal
    itemData[idx].push(adjustedVal, productVal, adjustedVal + productVal);
  }

  // Sort items based on the last added value (adjustedVal + productVal) in descending order
  itemData.sort((itemA, itemB) => itemB[5] - itemA[5]);

  // Binary search setup
  var upperBound = numItems * thresholdValue; // ok = N*X
  var lowerBound = -1; // ng = -1

  // Binary search loop
  while(upperBound - lowerBound > 1){
    var midPoint = Math.floor((upperBound + lowerBound) / 2); // m = (ok+ng)/2
    var currentSum = totalSum; // u = S
    var remainingThreshold = midPoint; // k = m

    // Iterate through sorted items while conditions are met
    for(var idx = 0; idx < numItems && remainingThreshold > 0 && currentSum > 0; idx++){
      if(thresholdValue <= remainingThreshold){ // if X <= k
        currentSum -= itemData[idx][5]; // u -= b[i][5]
        remainingThreshold -= thresholdValue; // k -= X
      } else {
        // Complex calculation when remainingThreshold is less than thresholdValue
        for(var tempIdx = idx; tempIdx < numItems && currentSum > 0; tempIdx++){
          var tempSum = currentSum; // v = u
          if(remainingThreshold < itemData[tempIdx][0]){ // if k < b[i][0]
            tempSum -= itemData[tempIdx][1] * remainingThreshold; // v -= b[i][1]*k
          } else {
            tempSum -= itemData[tempIdx][4] + (remainingThreshold - itemData[tempIdx][0]) * itemData[tempIdx][2]; // v -= b[i][4]+(k-b[i][0])*b[i][2]
          }
          currentSum = tempSum; // u = v
          idx = tempIdx; // Update outer loop index
        }
        remainingThreshold = 0; // k = 0
      }
    }

    // Adjust binary search bounds
    if(currentSum > 0) {
      lowerBound = midPoint; // ng = m
    } else {
      upperBound = midPoint; // ok = m
    }
  }

  return upperBound; // Return the final result
}
