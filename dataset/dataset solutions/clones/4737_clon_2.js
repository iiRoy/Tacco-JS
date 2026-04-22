const fileSystemModule = require("fs");
const programInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8").trim().split("\n");

const contentNavigator = {
  elements: programInputData,
  currentPosition: 0,
  totalCount: programInputData.length,

  retrieveNext: function() {
    if (!this.hasMoreElements()) {
      throw new Error("NoMoreElementsException: There are no additional items.");
    }
    const currentElement = this.elements[this.currentPosition];
    this.currentPosition++;
    return currentElement;
  },

  hasMoreElements: function() {
    return (this.currentPosition < this.totalCount);
  }
};

mainExecution();

function getNextLine() {
  return contentNavigator.retrieveNext();
}

function getNextInteger() {
  return dataTransformer(getNextLine(), 1);
}

function getNextStringArray() {
  return dataTransformer(getNextLine(), 2); // Divide by space characters
}

function getNextNumericArray() {
  return dataTransformer(getNextLine(), 4); // Divide by space and convert to numbers
}

function getNextCharacterArray() {
  return dataTransformer(getNextLine(), 6); // Divide into individual characters
}

function hasMoreData() {
  return contentNavigator.hasMoreElements();
}

function displayOutput(valueToLog) {
  console.log(valueToLog);
} // Print to standard output

function displayError(errorMessage) {
  console.error(errorMessage);
} // Print to standard error output

// This function handles various conversions for input data.
// It converts an input value based on the specified conversion mode.
// If the conversion fails or mode is unknown, the original input is returned.
// Conversion modes:
//   1: Convert to an integer.
//   2: Split by spaces into an array of strings.
//   4: Split by spaces and convert each part to a number, returning a numeric array.
//   6: Split into an array of individual characters.
//   7: Split into an array of individual characters and convert each to a number.
//   8: Join array elements with spaces.
//   9: Join array elements with newlines.
//   0: Join array elements without any separator.
function dataTransformer(inputValue, conversionMode) {
  try {
    switch (conversionMode) {
      case 1:
        return parseInt(inputValue, 10);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map(item => Number(item));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map(item => Number(item));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (exceptionDetails) {
    return inputValue;
  }
}

function mainExecution() {
  var initialValue = getNextInteger();
  var finalResult = Math.floor(initialValue / 11) * 2;
  var remainderValue = initialValue % 11;

  if (remainderValue >= 6) {
    finalResult += 2;
  } else if (remainderValue > 0) {
    finalResult++;
  }

  displayOutput(finalResult);
}