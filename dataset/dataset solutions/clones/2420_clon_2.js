"use strict";

// Helper function to create multi-dimensional arrays dynamically.
function createMultiDimArray(valExpr) {
  var args = arguments; // Capture all arguments passed to the function.
  var lenIdx = args.length; // Get the total number of arguments.
  // Initialize the string for the innermost array creation.
  // Decrement lenIdx to get the last argument's index.
  var arrayStr = "Array(args[" + --lenIdx + "]).fill(0).map(element => { return " + valExpr + "; })";

  // Loop backwards from the second-to-last argument down to the first.
  while (--lenIdx) {
    // Wrap the current array string with another Array.map call for higher dimensions.
    arrayStr = "Array(args[" + lenIdx + "]).fill(0).map(element => " + arrayStr + ")";
  }
  // Evaluate the constructed string to create the multi-dimensional array.
  return eval(arrayStr);
}

// Set up readline interface for input/output operations.
const inputReader = require("readline").createInterface(process.stdin, process.stdout);

// Main generator function to handle asynchronous input.
const mainLogicGenerator = (function* () {
  // Internal helper function to get a line of input.
  const getNextLine = () => inputReader.once("line", (inputString) => mainLogicGenerator.next(inputString));

  // Read the number of elements (N).
  var numElements = yield getNextLine();
  numElements = +numElements; // Convert input string to a number.

  // Initialize the first permutation array.
  var currentPermutation = [];
  // Populate the array with values from 1 to N.
  for (var idxCounter = 0b1; idxCounter <= numElements; idxCounter++) {
    currentPermutation[idxCounter - 0b1] = idxCounter;
  }

  // Output the initial query.
  console.log("?", currentPermutation.join(" "));

  // Read the initial response.
  var initialResponse = yield getNextLine();

  // Initialize an offset value.
  var offsetValue = 0b1;

  // Loop to find the correct offset.
  while (0b1) { // Loop indefinitely until a break condition is met.
    // Modify the current permutation based on the offset.
    currentPermutation[offsetValue - 0b1] = offsetValue + numElements;
    // Output the modified query.
    console.log("?", currentPermutation.join(" "));
    // Read the response for the modified query.
    var tempResponse = yield getNextLine();

    // If the first character of the response changes, break the loop.
    if (initialResponse[0] !== tempResponse[0]) {
      break;
    }
    // Increment the offset value.
    offsetValue++;
  }

  // Initialize arrays for the final answer and an alternative permutation.
  var finalResultArray = [];
  var alternativePermutation = [];
  // Initialize a Set to track specific indices.
  var trackedIndices = new Set();

  // Populate parts of the permutations and the tracked indices set.
  for (var loopIndex = 0x0; loopIndex < numElements - 0b1; loopIndex++) {
    currentPermutation[loopIndex] = (offsetValue + loopIndex - 0b1) % (numElements * 0b10) + 0b1;
    alternativePermutation[loopIndex] = (currentPermutation[loopIndex] + numElements - 0b1) % (numElements * 0b10) + 0b1;
    trackedIndices.add(loopIndex + offsetValue);
  }

  // Iterate through all possible values from 1 to 2*N.
  for (var checkValue = 0b1; checkValue <= numElements * 0b10; checkValue++) {
    if (trackedIndices.has(checkValue)) {
      // If the current value is in trackedIndices, use the alternative permutation.
      alternativePermutation[numElements - 0b1] = checkValue;
      console.log("?", alternativePermutation.join(" "));
      var currentQueryResponse = yield getNextLine();
      if (currentQueryResponse[0] === "R") {
        finalResultArray[checkValue - 0b1] = "R";
      } else {
        finalResultArray[checkValue - 0b1] = "B";
      }
    } else {
      // Otherwise, use the current permutation.
      currentPermutation[numElements - 0b1] = checkValue;
      console.log("?", currentPermutation.join(" "));
      var currentQueryResponse = yield getNextLine();
      if (currentQueryResponse[0] === "R") {
        finalResultArray[checkValue - 0b1] = "R";
      } else {
        finalResultArray[checkValue - 0b1] = "B";
      }
    }
  }

  // Output the final result.
  console.log("!", finalResultArray.join(""));
})();

// Start the generator execution.
mainLogicGenerator.next();
