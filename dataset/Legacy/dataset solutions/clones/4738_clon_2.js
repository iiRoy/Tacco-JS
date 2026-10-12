var sourceLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var lineIterator = {
  "dataStore" : sourceLines,
  "currentPosition" : 0,
  "totalCount" : sourceLines.length,

  "retrieveNext" : function() {
    if (!this.hasMore()) {
      throw "NoSuchElementException: No more elements available.";
    }
    var retrievedItem = this.dataStore[this.currentPosition];
    this.currentPosition++;
    return retrievedItem;
  },

  "hasMore" : function() {
    return (this.currentPosition < this.totalCount);
  }
};

ExecuteProgram();

function fetchNextLine() {
  return lineIterator.retrieveNext();
}

function fetchNextInteger() {
  return dataTransformer(fetchNextLine(), 1);
}

function fetchNextStringArray() {
  return dataTransformer(fetchNextLine(), 2);
}

function fetchNextIntegerArray() {
  return dataTransformer(fetchNextLine(), 4);
}

function fetchNextCharacterArray() {
  return dataTransformer(fetchNextLine(), 6);
}

function checkIfMoreLines() {
  return lineIterator.hasMore();
}

function printToConsole(content) {
  console.log(content);
}

function printToError(errorMessage) {
  console.error(errorMessage);
}

// This utility function handles various data transformations.
// Option 1: Convert to integer.
// Option 2: Split by space into a string array.
// Option 4: Split by space and convert to a number array.
// Option 6: Split into a character array.
// Option 7: Split into a character array and convert to a number array.
// Option 8: Join array elements with a space.
// Option 9: Join array elements with a newline.
// Option 0: Join array elements without a separator.
// Default: Return input as is.
function dataTransformer(inputValue, transformOption) {
  try {
    switch (transformOption) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((elementValue) => Number(elementValue));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((elementValue) => Number(elementValue));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (errorDetails) {
    return inputValue;
  }
}

function ExecuteProgram() {
  var inputNumber = fetchNextInteger();
  var calculatedResult = Math.floor(inputNumber / 11) * 2;
  var remainderValue = inputNumber % 11;

  if (remainderValue >= 7) {
    calculatedResult += 2;
  } else if (remainderValue > 0) {
    calculatedResult++;
  }

  printToConsole(calculatedResult);
}
