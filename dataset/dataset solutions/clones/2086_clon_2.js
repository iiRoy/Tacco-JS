const sourceData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const dataStream = {
  "itemCollection" : sourceData,
  "currentIndex" : 0,
  "totalCount" : sourceData.length,

  /* Checks if there are more items to process */
  "hasMoreElements" : function() {
    return (this.currentIndex < this.totalCount);
  },

  /* Retrieves the next item from the collection */
  "retrieveNext" : function() {
    if (!this.hasMoreElements()) {
      throw new Error("NoFurtherElementsException: No more items available for retrieval.");
    }
    const currentElement = this.itemCollection[this.currentIndex];
    this.currentIndex++;
    return currentElement;
  }
};

ExecuteProgram();

/* Fetches the subsequent input line */
function getNextItem() {
  return dataStream.retrieveNext();
}

/* Retrieves the next input line as an integer */
function getNextInteger() {
  return dataConverter(getNextItem(), 1);
}

/* Retrieves the next input line as an array of strings, split by spaces */
function getNextStringArray() {
  return dataConverter(getNextItem(), 2);
}

/* Retrieves the next input line as an array of numbers, split by spaces */
function getNextIntegerArray() {
  return dataConverter(getNextItem(), 4);
}

/* Retrieves the next input line as an array of characters */
function getNextCharacterArray() {
  return dataConverter(getNextItem(), 6);
}

/* Checks if additional input lines are present */
function hasMoreInput() {
  return dataStream.hasMoreElements();
}

/* Prints a value to the standard output console */
function printResult(outputValue) {
  console.log(outputValue);
}

/* Sends an error message to the standard error console */
function logError(errorMessage) {
  console.error(errorMessage);
}

/*
 * Utility function for converting input values based on a specified type.
 * Default/Error: Returns the input value unchanged.
 * 1: Converts to a base-10 integer.
 * 2: Splits the string by single spaces.
 * 4: Splits by spaces and maps each part to a Number.
 * 6: Splits the string into individual characters.
 * 7: Splits into characters and maps each to a Number.
 * 8: Joins array elements with single spaces.
 * 9: Joins array elements with newline characters.
 * 0: Joins array elements without any separator.
 */
function dataConverter( inputValue, conversionType ) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue, 10);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((itemValue) => Number(itemValue));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((itemValue) => Number(itemValue));
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

/* Main program execution routine */
function ExecuteProgram() {
  const initialValues = getNextIntegerArray();
  const ValueA = initialValues[0];
  const ValueB = initialValues[1];
  const IterationCount = initialValues[2];

  const listA = getNextIntegerArray();
  const listB = getNextIntegerArray();

  let minimumCost = Math.min(...listA) + Math.min(...listB);

  for (let loopIndex = 0; loopIndex < IterationCount; loopIndex++) {
    const tempValues = getNextIntegerArray();
    const currentCalculatedCost = listA[tempValues[0] - 1] + listB[tempValues[1] - 1] - tempValues[2];
    minimumCost = Math.min(currentCalculatedCost, minimumCost);
  }

  printResult(minimumCost);
}