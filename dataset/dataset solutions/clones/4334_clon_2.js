var dataSource = require("fs") .readFileSync("/dev/stdin", "utf8") .trim() .split("\n") ;
var iterator = {
  "elements" : dataSource,
  "position" : 0,
  "limit" : dataSource.length,
  "fetchNext" : function() {
    if ( ! this.hasMore() ) {
      throw "NoMoreElementsError: No further items available";
    }
    var currentElement = this.elements[this.position];
    this.position++;
    return currentElement;
  } ,
  "hasMore" : function() {
    return (this.position < this.limit);
  }
};

ExecuteLogic();

function retrieveNext() {
  return iterator.fetchNext();
}

function checkMore() {
  return iterator.hasMore();
}

function displayOutput(messageContent) {
  console.log(messageContent);
} // Logs the given content to standard output.

function displayError(errorMessage) {
  console.error(errorMessage);
} // Writes the specified error message to standard error stream.

// Handling of [transformType] elements. Typically numerical processing.
// For unknown or erroneous types: returns the input argument unchanged.
// 1: Converts to an integer.
// 2: Splits by half-width space.
// 4: Splits by half-width space and converts to an array of numbers.
// 6: Splits into individual characters.
// 7: Splits into individual characters and converts to an array of numbers.
// 8: Joins elements with a half-width space.
// 9: Joins elements with a newline character.
// 0: Joins elements without any separator.
function dataTransform(valueToProcess, transformType) {
  try {
    switch (transformType) {
      case 1:
        return parseInt(valueToProcess);
      case 2:
        return valueToProcess.split(" ");
      case 4:
        return valueToProcess.split(" ").map((itemString) => Number(itemString));
      case 6:
        return valueToProcess.split("");
      case 7:
        return valueToProcess.split("").map((itemString) => Number(itemString));
      case 8:
        return valueToProcess.join(" ");
      case 9:
        return valueToProcess.join("\n");
      case 0:
        return valueToProcess.join("");
      default:
        return valueToProcess;
    }
  } catch (errorObject) {
    return valueToProcess;
  }
}

function ExecuteLogic() {
  var initialData = dataTransform(retrieveNext(), 4);
  var dimensionA = initialData[0];
  var dimensionB = initialData[1];
  var targetValue = initialData[2];

  if ( (targetValue % dimensionB == 0) || (targetValue % dimensionA == 0) ) {
    displayOutput("Yes");
    return;
  }

  for (var rowCounter = 1; rowCounter <= dimensionA; rowCounter++) {
    for (var colCounter = 1; colCounter <= dimensionB; colCounter++) {
      var calculatedSum = (dimensionB * rowCounter) + (dimensionA * colCounter) - 2 * (rowCounter * colCounter);
      if (calculatedSum == targetValue) {
        displayOutput("Yes");
        return;
      }
    }
  }

  displayOutput("No");
}