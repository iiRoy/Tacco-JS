"use strict";

// This utility function generates a multi-dimensional array based on provided dimensions.
// It's not directly used in the main problem-solving logic, but is part of the original file.
function createMultiDimArray(initialValue) {
  var args = arguments,
    len = args.length,
    resultString = "Array(args[" + --len + "]).fill(0).map(_val => { return " + initialValue + "; })";
  while (--len) {
    resultString = "Array(args[" + len + "]).fill(0).map(_val => " + resultString + ")";
  }
  return eval(resultString);
}

// Initialize readline interface for standard input/output operations.
const rl = require("readline").createInterface(process.stdin, process.stdout);

// Define the main asynchronous process using a generator function.
const mainProcess = (function* () {

  // Helper function to fetch a single line of input from the console.
  const fetchInputLine = () => rl.once("line", (inputStr) => mainProcess.next(inputStr));

  // Step 1: Read the initial integer 'n'.
  var countVal = yield fetchInputLine();
  countVal = +countVal; // Convert the string input to a number.

  // Step 2: Initialize the first array 'p' with values from 1 to 'n'.
  var firstArr = [];
  for (var idx = 1; idx <= countVal; idx++) {
    firstArr[idx - 1] = idx;
  }

  // Step 3: Output the initial query using 'p'.
  console.log("?", firstArr.join(" "));

  // Step 4: Get the response for the initial query.
  var initialResponse = yield fetchInputLine();

  // Step 5: Loop to determine the 'currentOffset' value.
  var currentOffset = 1;
  while (true) {
    // Modify 'firstArr' by setting an element to 'currentOffset + countVal'.
    firstArr[currentOffset - 1] = currentOffset + countVal;
    console.log("?", firstArr.join(" ")); // Output the modified query.
    var currentResponse = yield fetchInputLine(); // Get the response for this query.
    if (initialResponse[0] !== currentResponse[0]) {
      break; // Exit loop if the first characters of responses differ.
    }
    currentOffset++; // Increment the offset for the next iteration.
  }

  // Step 6: Prepare variables for constructing the final answer.
  var finalResult = [];
  var secondArr = [];
  var trackedIndices = new Set(); // A set to keep track of specific indices.

  // Step 7: Populate 'firstArr' and 'secondArr' for the next phase of queries.
  for (var idx = 0; idx < countVal - 1; idx++) {
    firstArr[idx] = currentOffset + idx - 1;
    secondArr[idx] = (firstArr[idx] + countVal) % (2 * countVal);
    trackedIndices.add(idx + currentOffset - 1);
  }

  // Step 8: Iterate through all possible values from 1 to 2*n to determine final results.
  for (var idx = 1; idx <= 2 * countVal; idx++) {
    if (trackedIndices.has(idx)) {
      // If 'idx' is in the tracked set, use 'secondArr' for the query.
      secondArr[countVal - 1] = idx;
      console.log("?", secondArr.join(" "));
      var tempResponse = yield fetchInputLine();
      if (tempResponse[0] === "R") {
        finalResult[idx - 1] = "R";
      } else {
        finalResult[idx - 1] = "B";
      }
    } else {
      // Otherwise, use 'firstArr' for the query.
      firstArr[countVal - 1] = idx;
      console.log("?", firstArr.join(" "));
      var tempResponse = yield fetchInputLine();
      if (tempResponse[0] === "R") {
        finalResult[idx - 1] = "R";
      } else {
        finalResult[idx - 1] = "B";
      }
    }
  }

  // Step 9: Output the final answer.
  console.log("!", finalResult.join(""));
})();

// Start the execution of the generator function.
mainProcess.next();
