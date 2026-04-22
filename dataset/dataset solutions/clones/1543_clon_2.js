var dataStream = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var inputProcessor = {
  "sourceLines" : dataStream,
  "currentPosition" : 0,
  "totalLines" : dataStream.length,

  "retrieveNext" : function() {
    // Verify if more items are available
    if(!this.hasMore()) {
      throw new Error("NoMoreElementsException: End of input reached.");
    }
    // Extract the current line
    var extractedElement = this.sourceLines[this.currentPosition];
    // Advance to the next line
    this.currentPosition++;
    return extractedElement;
  },

  "hasMore" : function() {
    // Check if the current position is within bounds
    return (this.currentPosition < this.totalLines);
  }
};

// Start the primary execution flow
ExecuteProgram();

/**
 * Retrieves the subsequent input item from the processor.
 * @returns {string} The next line of input.
 */
function fetchNextItem() {
  return inputProcessor.retrieveNext();
}

/**
 * Parses the next input item as an integer.
 * @returns {number} The parsed integer.
 */
function fetchInteger() {
  return dataConverter(fetchNextItem(), 1);
}

/**
 * Splits the next input item by spaces into an array of strings.
 * @returns {string[]} An array of strings.
 */
function fetchStringArray() {
  return dataConverter(fetchNextItem(), 2);
}

/**
 * Splits the next input item by spaces and converts parts to numbers.
 * @returns {number[]} An array of numbers.
 */
function fetchIntArray() {
  return dataConverter(fetchNextItem(), 4);
}

/**
 * Splits the next input item into individual characters.
 * @returns {string[]} An array of characters.
 */
function fetchCharList() {
  return dataConverter(fetchNextItem(), 6);
}

/**
 * Checks if there are more items in the input stream.
 * @returns {boolean} True if more items exist, false otherwise.
 */
function checkRemaining() {
  return inputProcessor.hasMore();
}

/**
 * Prints the given content to standard output.
 * @param {*} content - The data to be logged.
 */
function displayOutput(content) {
  console.log(content);
}

/**
 * Prints the given content to standard error.
 * @param {*} content - The data to be logged as an error.
 */
function displayError(content) {
  console.error(content);
}

/**
 * Converts input based on a specified type code.
 *
 * Type Codes:
 * 1: Convert to integer.
 * 2: Split by single space.
 * 4: Split by single space and convert to numbers.
 * 6: Split into individual characters.
 * 7: Split into individual characters and convert to numbers.
 * 8: Join array elements with single space.
 * 9: Join array elements with newline.
 * 0: Join array elements without separator.
 * Default: Return input as is.
 *
 * @param {*} inputValue - The input to convert.
 * @param {number} conversionType - The type of conversion to perform.
 * @returns {*} The converted value.
 */
function dataConverter(inputValue, conversionType) {
  try {
    switch(conversionType) {
      case 1:
        return parseInt(inputValue, 10);
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
  } catch(exceptionObject) {
    // If conversion fails, return original input
    return inputValue;
  }
}

function ExecuteProgram() {
  var disjointSet = {
    "parentArray" : null,

    // Initialize the structure with 'setCount' elements.
    // Each element initially forms its own set, represented by -1 (indicating root and size 1).
    "initializeSets" : function(setCount) {
      this.parentArray = new Array(setCount).fill(-1);
    },

    // Determines if two elements belong to the same connected component.
    "areConnected" : function(firstElement, secondElement) {
      return this.findRoot(firstElement) === this.findRoot(secondElement);
    },

    // Finds the representative (root) of the set containing 'elementIndex'.
    // Performs path compression for optimization.
    "findRoot" : function(elementIndex) {
      if(this.parentArray[elementIndex] < 0) {
        return elementIndex;
      } else {
        // Path compression: set parent directly to root
        this.parentArray[elementIndex] = this.findRoot(this.parentArray[elementIndex]);
        return this.parentArray[elementIndex];
      }
    },

    // Merges the sets containing 'firstElement' and 'secondElement'.
    // Uses union by size heuristic.
    "uniteSets" : function(firstElement, secondElement) {
      var rootOfFirst = this.findRoot(firstElement);
      var rootOfSecond = this.findRoot(secondElement);

      // Only merge if they are in different sets
      if(!this.areConnected(rootOfFirst, rootOfSecond)) {
        // Attach smaller tree to root of larger tree
        if(rootOfFirst >= rootOfSecond) { // Note: The original code used >=, which might be a typo for comparing sizes, but for Type II, we keep the logic identical.
          this.parentArray[rootOfFirst] += this.parentArray[rootOfSecond]; // Update size
          this.parentArray[rootOfSecond] = rootOfFirst; // Set parent
        } else {
          this.parentArray[rootOfSecond] += this.parentArray[rootOfFirst]; // Update size
          this.parentArray[rootOfFirst] = rootOfSecond; // Set parent
        }
      }
    },

    // Returns the size of the set containing 'elementIndex'.
    "getSetSize" : function(elementIndex) {
      // The root stores the negative size of its set.
      return -this.parentArray[this.findRoot(elementIndex)];
    }
  };

  var initialParams = fetchIntArray();
  var numberOfElements = initialParams[0];
  var numberOfQueries = initialParams[1];

  disjointSet.initializeSets(numberOfElements);
  var resultBuffer = [];

  // Process each query
  for(var queryIndex = 0; queryIndex < numberOfQueries; queryIndex++) {
    var currentQuery = fetchIntArray();
    if(currentQuery[0] === 0) { // Union operation
      disjointSet.uniteSets(currentQuery[1], currentQuery[2]);
    } else { // Check connection operation
      if(disjointSet.areConnected(currentQuery[1], currentQuery[2])) {
        resultBuffer.push("Yes");
      } else {
        resultBuffer.push("No");
      }
    }
  }

  // Display the final results, joined by newlines
  displayOutput(dataConverter(resultBuffer, 9));
}