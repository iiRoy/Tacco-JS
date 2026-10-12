var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var dataStream = {
  "contentList": rawData,
  "currentIdx": 0,
  "maxElements": rawData.length,

  // Checks if there are more elements available in the stream.
  "hasMore": function() {
    return (this.currentIdx < this.maxElements);
  },

  // Retrieves the next element from the stream.
  "retrieveNext": function() {
    if (!this.hasMore()) {
      throw "NoSuchElementException:次に要素は無いよ";
    }
    var elementValue = this.contentList[this.currentIdx];
    this.currentIdx++;
    return elementValue;
  }
};

ExecuteProgram();

// Fetches the next raw string item from the input stream.
function getNextItem() {
  return dataStream.retrieveNext();
}

// Fetches the next item and converts it to an integer.
function getNextInteger() {
  return dataConverter(getNextItem(), 1);
}

// Fetches the next item and splits it into a string array by spaces.
function getNextStringArray() {
  return dataConverter(getNextItem(), 2);
}

// Fetches the next item, splits it by spaces, and converts elements to numbers.
function getNextIntegerArray() {
  return dataConverter(getNextItem(), 4);
}

// Fetches the next item and splits it into a character array.
function getNextCharacterArray() {
  return dataConverter(getNextItem(), 6);
}

// Checks if there are more items in the input stream.
function checkHasNext() {
  return dataStream.hasMore();
}

// Prints the given text to standard output.
function printOutput(textToPrint) {
  console.log(textToPrint);
}

// Prints the given error message to standard error output.
function printError(errorMessage) {
  console.error(errorMessage);
}

/**
 * A utility function for various data type conversions.
 * @param {string|Array} inputValue - The input data to be converted.
 * @param {number} conversionType - Specifies the type of conversion.
 *   - 1: Converts input to an integer.
 *   - 2: Splits input string by half-width spaces into a string array.
 *   - 4: Splits input string by half-width spaces and maps to an array of numbers.
 *   - 6: Splits input string into an array of individual characters.
 *   - 7: Splits input string into characters and maps to an array of numbers.
 *   - 8: Joins array elements with a single half-width space.
 *   - 9: Joins array elements with a newline character.
 *   - 0: Joins array elements without any separator.
 *   - Default: Returns the input value unchanged.
 * @returns {any} The converted value or the original input if conversion fails or type is unknown.
 */
function dataConverter(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((item) => Number(item));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((item) => Number(item));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (error) {
    // In case of any conversion error, return the original input.
    return inputValue;
  }
}

function ExecuteProgram() {
  var firstLineData = getNextIntegerArray();
  var nodeCount = firstLineData[0];
  var edgeCount = firstLineData[1];

  var pathsFromStart = new Set(); // Stores nodes reachable from node 1
  var pathsToEnd = new Set();     // Stores nodes that can reach node N

  for (var loopCounter = 0; loopCounter < edgeCount; loopCounter++) {
    var currentEdge = getNextIntegerArray();
    // Check if the edge starts from node 1
    if (currentEdge[0] === 1) {
      pathsFromStart.add(currentEdge[1]);
    }
    // Check if the edge ends at node N
    if (currentEdge[1] === nodeCount) {
      pathsToEnd.add(currentEdge[0]);
    }
  }

  printError(pathsFromStart);
  printError(pathsToEnd);

  var endPathNodes = Array.from(pathsToEnd);

  // Iterate through nodes that can reach N
  for (var idx = 0; idx < endPathNodes.length; idx++) {
    // If a node that can reach N is also reachable from 1, then a path exists.
    if (pathsFromStart.has(endPathNodes[idx])) {
      printOutput("POSSIBLE");
      return;
    }
  }

  // If no such intermediate node is found, a path is impossible.
  printOutput("IMPOSSIBLE");
}
