/*
  This segment handles the input-output operations for the script.
  It sets up a mechanism to read lines from standard input and process them.
*/
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataStream;
var inputLines = [];

// Event listener for each incoming line of text
inputReader.on('line', function(currentLineText) {
  inputLines.push(currentLineText);
});

// Event listener triggered when all input has been received
inputReader.on('close', function() {
  dataStream = initializeStream(inputLines);

  console.error('\n'); // Output a newline for better debug log separation

  var beginTime = Date.now();
  executeCoreLogic(); // Invoke the primary program function
  var elapsedTime = Date.now() - beginTime;

  debugLog("execution time : " + (elapsedTime) + "ms");
  debugLog("memory usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Creates a deep copy of an object by serializing and deserializing it
function duplicateObject(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

// Retrieves the next available integer from the input stream
function retrieveInteger() {
  return formatData(advanceStream(), 1);
}

// Retrieves the next available line as an array of strings
function retrieveStringArray() {
  return formatData(advanceStream(), 2);
}

// Retrieves the next available line as an array of integers
function retrieveIntegerArray() {
  return formatData(advanceStream(), 4);
}

// Retrieves the next available line as an array of individual characters
function retrieveCharacterArray() {
  return formatData(advanceStream(), 6);
}

// Moves to the next element in the input stream and returns it
function advanceStream() {
  return dataStream.getNextElement();
}

// Checks if there are more elements available in the input stream
function hasMoreData() {
  return dataStream.hasMoreElements();
}

/*
  Initializes the input data stream object.
  This object manages access to the raw input lines.
*/
function initializeStream(rawInputData) {
  return {
    dataCollection: rawInputData,
    currentPosition: 0,
    maximumPosition: rawInputData.length,

    // Method to check if more data exists
    hasMoreElements: function() {
      return (this.currentPosition < this.maximumPosition);
    },

    // Method to get the next data element
    getNextElement: function() {
      if (this.hasMoreElements()) {
        return this.dataCollection[this.currentPosition++];
      } else {
        throw "InputBoundaryExceeded: No more data available in the stream";
      }
    }
  };
}

// Outputs a string to standard output (console.log)
function printResult(messageContent) {
  console.log(messageContent);
}

// Outputs a string to standard error (console.error) with debug prefix
function debugLog(messageContent) {
  console.error("DEBUG INFO:" + require("util").inspect(messageContent, false, null));
}

/*
  Utility function for data type conversion and formatting.
  The 'formatType' parameter dictates the conversion logic:
  - Default/unknown: returns the input as is.
  - 1: Parses input as an integer.
  - 2: Splits input string by spaces into an array of strings.
  - 4: Splits input string by spaces and converts each part to a number.
  - 6: Splits input string into an array of single characters.
  - 7: Splits input string into characters and converts each to a number.
  - 8: Joins an array of strings with spaces.
  - 9: Joins an array of strings with newlines.
  - 0: Joins an array of strings without any separator.
*/
function formatData(inputValue, formatType) {
  try {
    switch (formatType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map(Number);
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map(Number);
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (conversionError) {
    return inputValue; // Return original value on error
  }
}

/*
  This marks the end of the boilerplate code.
  The actual problem-solving logic starts below.
*/
function executeCoreLogic() {
  var targetSum = retrieveInteger();
  var currentNumber = 0;
  var isTrianglePossible = false;

  // Loop to find if targetSum is a triangular number
  while (currentNumber <= targetSum) {
    if ((currentNumber * (currentNumber + 1)) / 2 == targetSum) {
      isTrianglePossible = true;
      break;
    }
    currentNumber++;
  }

  if (!isTrianglePossible) {
    printResult("No");
    return;
  }

  printResult("Yes");

  // Initialize a 2D array (matrix)
  var matrixStructure = new Array(currentNumber + 1);
  for (var rowIndex = 0; rowIndex < currentNumber + 1; rowIndex++) {
    matrixStructure[rowIndex] = new Array(currentNumber);
  }

  // Populate the matrix with sequential values
  var cellValue = 1;
  for (var rowIndex = 0; rowIndex < currentNumber; rowIndex++) {
    for (var colIndex = rowIndex; colIndex < currentNumber; colIndex++) {
      matrixStructure[rowIndex][colIndex] = cellValue;
      matrixStructure[colIndex + 1][rowIndex] = cellValue;
      cellValue++;
    }
  }

  debugLog(matrixStructure); // Output the generated matrix for debugging

  printResult(matrixStructure.length);

  // Prepare the output by adding the size to each row and joining elements
  var formattedOutput = new Array(matrixStructure.length);
  for (var rowIndex = 0; rowIndex < matrixStructure.length; rowIndex++) {
    matrixStructure[rowIndex].unshift(currentNumber); // Add 'currentNumber' at the beginning of each row
    formattedOutput[rowIndex] = matrixStructure[rowIndex].join(" ");
  }

  // Print the final formatted output, joined by newlines
  printResult(formatData(formattedOutput, 9));
}