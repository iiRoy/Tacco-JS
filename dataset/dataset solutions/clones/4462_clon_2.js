const dataStream = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const iterator = {
  // Collection of input lines to be processed.
  "collection" : dataStream,
  // Current position within the input collection.
  "position"   : 0,
  // Upper boundary for iteration, representing total lines.
  "limit"      : dataStream.length,

  // Method to determine if there are more elements available for retrieval.
  "canAdvance" : function() {
    return (this.position < this.limit);
  },

  // Method to retrieve the next element from the collection.
  "retrieve" : function() {
    // If no further elements exist, raise an error.
    if (!this.canAdvance()) {
      throw "IterationError: No more elements available.";
    }
    // Fetch the current element and advance the position.
    let currentItem = this.collection[this.position];
    this.position++;
    return currentItem;
  }
};

// Initiate the primary execution logic of the application.
ExecuteProgram();

// Retrieves the subsequent item from the input iterator.
function fetchNext() {
  return iterator.retrieve();
}

// Fetches the next input item and processes it into an integer.
function fetchInteger() {
  return dataConverter(fetchNext(), 1);
}

// Fetches the next input item and divides it into an array of strings using space as delimiter.
function fetchStringArray() {
  return dataConverter(fetchNext(), 2); // Splits by single space
}

// Fetches the next input item, divides it by spaces, and converts each segment to a number.
function fetchIntegerArray() {
  return dataConverter(fetchNext(), 4); // Splits by space, then converts to numeric values
}

// Fetches the next input item and separates it into an array of individual characters.
function fetchCharacterList() {
  return dataConverter(fetchNext(), 6); // Divides string into characters
}

// Checks if additional elements are present in the input iterator.
function hasMoreElements() {
  return iterator.canAdvance();
}

// Outputs a given value to the standard console information stream.
function displayOutput(outputValue) {
  console.log(outputValue);
}

// Outputs a given value to the standard console error stream for warnings.
function displayError(errorMessage) {
  console.error(errorMessage);
}

/*
 * Comprehensive utility function for diverse data transformations.
 *
 * This function provides various modes for converting or manipulating data based on a specified type.
 *
 * Parameters:
 *   inputValue (any): The data input requiring conversion or processing.
 *   conversionType (number): A numeric code indicating the desired operation.
 *
 * Conversion Modes:
 *   - Default (any other value): Returns the inputValue without any modification.
 *   - 1: Transforms the inputValue into an integer.
 *   - 2: Splits the inputValue (expected as a string) by single spaces, yielding an array of strings.
 *   - 4: Splits the inputValue (string) by spaces, then applies Number() to each part, returning an array of numbers.
 *   - 6: Divides the inputValue (string) into an array where each character is a separate element.
 *   - 7: Divides the inputValue (string) into individual characters, then converts each character to a number, returning an array of numbers.
 *   - 8: Concatenates an array of strings using a single space as a separator.
 *   - 9: Concatenates an array of strings using a newline character as a separator.
 *   - 0: Concatenates an array of strings without any separator.
 *
 * Returns: The result of the transformation, or the original inputValue if an exception occurs during processing.
 */
function dataConverter(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((element) => Number(element));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((singleChar) => Number(singleChar));
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

// The core function encapsulating the main algorithm of the program.
function ExecuteProgram() {

  const initialParameters = fetchIntegerArray();
  const targetNodeValue = initialParameters[0]; // Represents N
  const numberOfEdges = initialParameters[1];   // Represents M

  const pathsStartingFromOne = new Set(); // Collects nodes directly reachable from node 1.
  const pathsEndingAtN = new Set();       // Collects nodes that directly lead to node N.

  // Process each edge from the input.
  for (let edgeCounter = 0; edgeCounter < numberOfEdges; edgeCounter++) {
    const currentEdgeData = fetchIntegerArray();
    // If an edge originates from node 1, record its destination.
    if (currentEdgeData[0] === 1) {
      pathsStartingFromOne.add(currentEdgeData[1]);
    }
    // If an edge terminates at node N, record its source.
    if (currentEdgeData[1] === targetNodeValue) {
      pathsEndingAtN.add(currentEdgeData[0]);
    }
  }

  // Debugging output for the collected sets.
  displayError(pathsStartingFromOne);
  displayError(pathsEndingAtN);

  // Convert the set of nodes leading to N into an array for sequential checking.
  const endingPathsList = Array.from(pathsEndingAtN);

  // Iterate through the nodes that lead to N.
  for (let edgeCounter = 0; edgeCounter < endingPathsList.length; edgeCounter++) {
    // Check if any node that leads to N is also reachable from node 1.
    if (pathsStartingFromOne.has(endingPathsList[edgeCounter])) {
      displayOutput("VERIFIED"); // A connecting path exists.
      return; // Terminate execution as a path has been found.
    }
  }

  displayOutput("UNVERIFIED"); // No connecting path found after checking all possibilities.

}