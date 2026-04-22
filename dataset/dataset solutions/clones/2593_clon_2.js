/* This module processes a single line of input data
 * to perform a specific numerical calculation. */
function processInputData(dataLines) { // Defines the primary function to handle incoming data.
  // Extract the first numerical component from the initial data entry.
  let firstNumericVal = dataLines[0] . split ( ' ' ) [0] * 1;

  /* Retrieve the second numerical element from the same data entry. */
  let secondNumericVal = dataLines[0] . split ( ' ' ) [1] * 1;

  // Initialize a counter for the final computation.
  let resultCount = 1.0;

  // Begin an iterative process based on the extracted numerical values.
  for ( let currentIteration = firstNumericVal ; currentIteration < secondNumericVal ; currentIteration += (firstNumericVal - 1) ) {
    // Increment the result counter during each loop cycle.
    ++resultCount;
  }

  // Display the final computed value to the standard output.
  console.log(resultCount);
}

// Execute the main processing function with data read from standard input.
// Input is read as UTF-8, then split into an array of strings by newline characters.
processInputData(require("node:fs") . readFileSync ('/dev/stdin', "utf8") . split ('\n'));