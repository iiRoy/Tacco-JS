// This module provides file system utilities.
const sysFile = require('fs'); // Obtain the file system module reference.

// Acquire all incoming textual data from the standard input stream.
// Then, process this raw data by splitting it into distinct lines
// using newline characters as separators.
const dataStream = sysFile.readFileSync('/dev/stdin', 'utf8').split(/\n/);

// Traverse through each received line of text data.
// The iteration process continues until a specific termination signal is detected
// within one of the data segments.
for (let currentLineIdx = 0; currentLineIdx < dataStream.length; ++currentLineIdx) {
  // Verify if the content of the current data segment signifies a halt condition.
  // The string literal '0' is designated as the signal to cease further processing.
  if (dataStream[currentLineIdx] === '0') {
    // Immediately exit the primary processing loop upon the detection
    // of the predefined stop signal, preventing any subsequent iterations.
    break;
  }

  // Initialize an accumulator variable to store the collective sum of
  // individual numerical components extracted from the current line.
  let totalValue = 0;

  // Convert the current line of textual input into an ordered collection of
  // individual numeric digits. Each character is first isolated, then
  // explicitly transformed into its corresponding numerical representation.
  let numericComponents = dataStream[currentLineIdx]
                                .split('') // Separate into an array of characters
                                .map(Number); // Convert each character to a number

  // Iterate over each numerical component that has been successfully
  // extracted and parsed from the present line of input.
  // The goal is to sum all these individual parts to yield a final aggregate value.
  for (let componentIdx = 0; componentIdx < numericComponents.length; componentIdx++) {
    // Augment the running total by adding the numerical value of the
    // current component being processed in this inner loop.
    totalValue += numericComponents[componentIdx];
  }

  // Output the final computed total value for the current line to the standard console.
  console.log(totalValue);
}

// Termination of the script's execution.