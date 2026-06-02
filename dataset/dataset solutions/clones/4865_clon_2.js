var programInput = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

// This object manages the sequential access to input lines.
var inputProcessor = {
  "dataLines" : programInput,
  "currentPosition" : 0,
  "totalLines" : programInput.length,
  "retrieveNext" : function(){
    // Check if there are more elements to process.
    if(!this.hasMore()){
      throw "NoSuchElementException:次に要素は無いよ";
    }
    var lineToReturn = this.dataLines[this.currentPosition];
    this.currentPosition++;
    return lineToReturn;
  },
  "hasMore" : function(){
    return (this.currentPosition < this.totalLines);
  }
};

// Start the main execution flow.
executeProgram();

// Global helper function to get the next input line.
function fetchNextLine(){
  return inputProcessor.retrieveNext();
}

// Global helper function to check if more input lines are available.
function checkMoreLines(){
  return inputProcessor.hasMore();
}

// Function for standard output.
function displayOutput(content){
  console.log(content);
}

// Function for error output.
function reportError(errorMessage){
  console.error(errorMessage);
}

/*
 * This utility function converts input values based on a specified type.
 * Conversion types:
 * 1: Convert to integer.
 * 2: Split by space.
 * 4: Split by space and convert to array of numbers.
 * 6: Split into individual characters.
 * 7: Split into individual characters and convert to array of numbers.
 * 8: Join array elements with space.
 * 9: Join array elements with newline.
 * 0: Join array elements without separator.
 * Default: Return input as is.
 * In case of error, returns the original input value.
 */
function transformInput(inputValue, conversionType){
  try {
    switch(conversionType){
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((element) => Number(element));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((element) => Number(element));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch(exception) {
    return inputValue;
  }
}

// The primary function where the program logic resides.
function executeProgram() {
  // Read the first line and parse it into two numbers (H and W).
  var firstLineData = transformInput(fetchNextLine(), 4);
  var gridHeight = firstLineData[0];
  var gridWidth = firstLineData[1];

  // Initialize a 2D array (grid) to store the input characters.
  var gridContent = new Array(gridHeight);
  for(var rowIdx = 0; rowIdx < gridHeight; rowIdx++){
    // Read each subsequent line and split it into characters.
    gridContent[rowIdx] = transformInput(fetchNextLine(), 6);
  }

  // Count the number of '#' characters in the grid.
  var hashCount = 0;
  for(var rowIdx = 0; rowIdx < gridHeight; rowIdx++){
    for(var colIdx = 0; colIdx < gridWidth; colIdx++){
      if(gridContent[rowIdx][colIdx] === "#"){
         hashCount++;
      }
    }
  }

  // Determine if the condition for "Possible" is met.
  if(hashCount === gridHeight + gridWidth - 1){
     displayOutput("Possible");
  } else {
     displayOutput("Impossible");
  }
}
