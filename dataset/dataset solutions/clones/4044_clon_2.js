var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var dataStream = {
  "dataLines" : rawData,
  "currentIdx" : 0,
  "totalLines" : rawData.length,

  "hasMore" : function() {
    return (this.currentIdx < this.totalLines);
  },

  "getNext" : function() {
    if (!this.hasMore()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    var retrievedItem = this.dataLines[this.currentIdx];
    this.currentIdx++;
    return retrievedItem;
  }
};

// Start the main execution flow
ExecuteProgram();

// Helper function to get the next line from the input stream
function fetchNextLine() {
  return dataStream.getNext();
}

// Helper function to get the next line as an integer
function fetchNextInteger() {
  return convertInput(fetchNextLine(), 1);
}

// Helper function to get the next line as an array of strings (space-separated)
function fetchStringArray() {
  return convertInput(fetchNextLine(), 2);
}

// Helper function to get the next line as an array of integers (space-separated)
function fetchIntegerArray() {
  return convertInput(fetchNextLine(), 4);
}

// Helper function to get the next line as an array of characters
function fetchCharacterArray() {
  return convertInput(fetchNextLine(), 6);
}

// Helper function to check if there's more data in the input stream
function checkMoreData() {
  return dataStream.hasMore();
}

// Function for standard output
function printOutput(content) {
  console.log(content);
}

// Function for standard error output
function printError(content) {
  console.error(content);
}

/*
  This utility function handles various input conversions.
  conversionType:
  1: Convert to integer
  2: Split by space into string array
  4: Split by space and convert to integer array
  6: Split by character into string array
  7: Split by character and convert to integer array
  8: Join array elements with space
  9: Join array elements with newline
  0: Join array elements without separator
  Default: Return input as is
*/
function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map((element) => Number(element));
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map((element) => Number(element));
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch (errDetails) {
    return inputValue; // In case of conversion error, return original value
  }
}

// Main program logic
function ExecuteProgram() {
  var numElements = fetchNextInteger();
  var firstArray = fetchIntegerArray();
  var secondArray = fetchIntegerArray();

  var sumA = 0; // Declared but not used in original logic
  var sumB = 0; // Declared but not used in original logic

  var balanceCounter = 0; // Counter to track differences

  // First pass: Calculate required adjustments for aList[idx] < bList[idx]
  for (var idx = 0; idx < numElements; idx++) {
    if (firstArray[idx] < secondArray[idx]) {
      // If first element is smaller, add the difference (divided by 2, floored) to the counter.
      // This logic implies a specific problem context where '2' is a factor.
      balanceCounter += Math.floor(secondArray[idx] - firstArray[idx] / 2);
    }
  }

  // Second pass: Adjust counter for aList[idx] > bList[idx]
  for (var idx = 0; idx < numElements; idx++) {
    if (firstArray[idx] > secondArray[idx]) {
      // If first element is larger, subtract the direct difference from the counter.
      balanceCounter -= (firstArray[idx] - secondArray[idx]);
    }
  }

  // Final check based on the accumulated balanceCounter
  if (balanceCounter >= 0) {
    printOutput("Yes");
  } else {
    printOutput("No");
  }
}
