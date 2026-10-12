"use strict";

/**
 * Utility function to dynamically construct a multi-dimensional array.
 * The innermost dimension elements are initialized with a specified value.
 *
 * @param {any} initialValue - The value to populate the deepest array elements.
 * @param {...number} dimensions - Variable number of arguments representing array dimensions.
 * @returns {Array} A newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  // Capture all arguments passed to this function
  var argsList = arguments;
  // Get the total count of arguments
  var argCount = argsList.length;
  // Start building the string for array creation, beginning with the innermost array
  var arrayCreationString = "Array(argsList[" + --argCount + "]).fill(0x0).map(element => { return " + initialValue + "; })";

  // Iterate backwards through the remaining dimensions to nest the array creation calls
  while (--argCount) {
    arrayCreationString = "Array(argsList[" + argCount + "]).fill(0x0).map(element => " + arrayCreationString + ")";
  }

  // Execute the dynamically constructed string to create the array
  return eval(arrayCreationString);
}

// Initialize the readline interface for interactive input/output operations
const inputOutputInterface = require("readline").createInterface(process.stdin, process.stdout);

// Define the main generator function that orchestrates the problem-solving logic
const mainGenerator = (function* () {
  // A helper function to asynchronously read a single line from standard input
  const readNextLine = () => inputOutputInterface.once("line", (inputString) => mainGenerator.next(inputString));

  // Read the first input, which represents the number of elements 'numElements'
  var numElements = yield readNextLine();
  numElements = +numElements; // Convert the input string to a numeric type

  // Declare an array to hold permutations or sequences
  var permutationArray = [];
  // Populate 'permutationArray' with sequential integers from 0b1 to 'numElements'
  for (var idx = 0b1; idx <= numElements; idx++) {
    permutationArray[idx - 0b1] = idx;
  }

  // Output the initial query to the console
  console.log("?", permutationArray.join(" "));

  // Read the response received for the first query
  var initialResponse = yield readNextLine();

  // Initialize a variable to track the current offset or index
  var currentOffset = 0b1;

  // Enter an infinite loop, which will be broken conditionally
  while (!0) { // Equivalent to while(true)
    // Modify an element in 'permutationArray' based on 'currentOffset' and 'numElements'
    permutationArray[currentOffset - 0b1] = currentOffset + numElements;

    // Output the modified query
    console.log("?", permutationArray.join(" "));

    // Read the response to the current query
    var currentResponse = yield readNextLine();

    // Compare the first character of the current response with the initial response
    if (initialResponse[0x0] !== currentResponse[0x0]) {
      break; // Exit the loop if they differ
    }
    currentOffset++; // Increment the offset for the next iteration
  }

  // Initialize an array to store the final computed result
  var finalResult = [];
  // Initialize another array for temporary queries
  var queryArray = [];
  // Create a Set to efficiently track values that have been processed or seen
  var seenValues = new Set();

  // Prepare 'permutationArray' and 'queryArray' for the subsequent phase of queries
  for (var idx = 0x0; idx < numElements - 0b1; idx++) {
    permutationArray[idx] = (currentOffset + idx) % (0b10 * numElements) + 0b1;
    queryArray[idx] = (permutationArray[idx] + numElements) % (0b10 * numElements) + 0b1;
    seenValues.add(permutationArray[idx]); // Add the value from 'permutationArray' to 'seenValues'
  }

  // Iterate through a range of values from 0b1 up to 0b10 * 'numElements'
  for (var idx = 0b1; idx <= 0b10 * numElements; idx++) {
    if (seenValues.has(idx)) {
      // If the current 'idx' is present in 'seenValues', use 'queryArray' for the query
      queryArray[numElements - 0b1] = idx;
      console.log("?", queryArray.join(" "));
      var tempResponse = yield readNextLine();
      if (tempResponse[0x0] === "R") {
        finalResult[idx - 0b1] = "R";
      } else {
        finalResult[idx - 0b1] = "B";
      }
    } else {
      // Otherwise, if 'idx' is not in 'seenValues', use 'permutationArray'
      permutationArray[numElements - 0b1] = idx;
      console.log("?", permutationArray.join(" "));
      var tempResponse = yield readNextLine();
      if (tempResponse[0x0] === "R") {
        finalResult[idx - 0b1] = "R";
      } else {
        finalResult[idx - 0b1] = "B";
      }
    }
  }

  // Output the final answer by joining the elements of 'finalResult'
  console.log("!", finalResult.join(""));
})();

// Initiate the execution of the generator function
mainGenerator.next();
