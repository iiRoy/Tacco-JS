/**
 * This module provides functionality to process textual data,
 * primarily by sorting lines and then extracting specific elements.
 */

/**
 * Processes an input string by splitting it into lines,
 * sorting these lines, and then printing a subset of the sorted data.
 *
 * @param {string} incomingData - The raw string input, typically containing multiple lines.
 */
function ProcessData(incomingData) {
  // Convert the single input string into an array of strings,
  // where each element represents a line from the original input.
  incomingData = incomingData.split("\n");

  // Declare and initialize variables that will be used for loop control
  // and temporary storage during the sorting process.
  let unusedInitialVar = 0; // This variable is declared but not actively used in the subsequent logic.
  let innerLoopIdx = 0;
  let temporarySwapVal = 0;
  let outerLoopIdx = 0; // This variable will serve as the primary loop counter for both major loops.

  // Implement a sorting algorithm, specifically a variation of bubble sort.
  // The outer loop controls the number of passes through the array.
  for (outerLoopIdx = 0; outerLoopIdx < incomingData.length - 1; outerLoopIdx++) {
    // The inner loop iterates through the unsorted portion of the array,
    // comparing adjacent elements and swapping them if they are in the wrong order.
    for (innerLoopIdx = incomingData.length - 1; innerLoopIdx > outerLoopIdx; innerLoopIdx--) {
      // Compare the current element with the one immediately preceding it.
      // The comparison is lexicographical since the elements are strings.
      if (incomingData[innerLoopIdx] < incomingData[innerLoopIdx - 1]) {
        // If the current element is "smaller" than the previous one, swap their positions.
        temporarySwapVal = incomingData[innerLoopIdx]; // Store the current element.
        incomingData[innerLoopIdx] = incomingData[innerLoopIdx - 1]; // Move the previous element forward.
        incomingData[innerLoopIdx - 1] = temporarySwapVal; // Place the stored element in the previous position.
      }
    }
  }

  // After the sorting is complete, print a specific set of elements from the end of the array.
  // This loop runs exactly four times.
  for (outerLoopIdx = 0; outerLoopIdx < 4; outerLoopIdx++) {
    // Access and print an element using an index calculated from the array's length
    // and the current loop counter. Note that for outerLoopIdx = 0, this accesses
    // incomingData[incomingData.length], which might be undefined if the array is 0-indexed
    // and its length property reflects the count of elements.
    console.log(incomingData[incomingData.length - outerLoopIdx]);
  }
}

/**
 * A utility function designed for local testing, typically within a web browser environment.
 * It retrieves user input from a designated HTML element and passes it to the main processing logic.
 */
function TestExecution() {
  // Obtain the current value from an HTML input field identified by the ID "input".
  let testInputString = document.getElementById("input").value;
  // Invoke the primary data processing function with the retrieved string.
  ProcessData(testInputString);
}

// This is the main execution block for environments like Node.js.
// It reads the entire content of standard input (e.g., from a file or piped data)
// as a UTF-8 encoded string and then passes it to the data processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
