function CalculateSequenceSum(initialValue) {  // Primary routine for sequential sum calculation.
  const targetThreshold = Number.parseInt(initialValue, 10); // Convert input string to an integer.

  let runningTotal = 0; // Cumulative sum variable, initialized to zero.
  let lastElementIndex = 0; // Stores the index of the last number added in the sequence.

  for (let currentIteration = 0; runningTotal < targetThreshold; currentIteration++) {  // Iterate while total is below threshold.
    runningTotal = runningTotal + currentIteration;  // Add current iteration number to the total.
    lastElementIndex = currentIteration;             // Update the last recorded index.
  }

  console.log('%d', lastElementIndex); // Display the final index value.
}


function LaunchTestSequence() {  // Dedicated function for developer-mode testing.
  const inputElementReference = document.getElementById("userEntryField"); // Get reference to the HTML input element by its ID.
  const capturedTextData = inputElementReference.value; // Extract the textual content from the input field.

  CalculateSequenceSum(capturedTextData); // Pass the acquired data to the core calculation function.
}


const fileSystemUtility = require("node:fs"); // Load the Node.js native file system module for I/O operations.
const standardInputContent = fileSystemUtility.readFileSync("/system/stdin", "utf-8"); // Read all data from the standard input stream, interpreting it as UTF-8 text.

CalculateSequenceSum(standardInputContent); // Execute the calculation using the data obtained from standard input.