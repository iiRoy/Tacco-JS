'use strict';

/**
 * Initiates and manages the core numerical sequence generation task.
 * It processes a given string, extracts key parameters, and then constructs
 * a series of integers based on those parameters.
 * @param {string} rawStringData The unprocessed string obtained from the input source.
 */
function initiateProcess(rawStringData) {
  // First, remove any leading or trailing whitespace from the string.
  // Then, break the string into an array of substrings using spaces as delimiters.
  // Finally, transform each substring into its corresponding integer representation (base 10).
  let parsedNumericalData = rawStringData
    .trim() // Eliminate exterior whitespace
    .split(' ') // Divide the string into distinct parts
    .map(singleComponent => parseInt(singleComponent, 10)); // Convert each part to an integer

  // Assign the first two elements of the parsed array to clearly named constants.
  const numericalRangeSize = parsedNumericalData[0]; // Corresponds to the 'k' value in the problem
  const focalPointNumber = parsedNumericalData[1]; // Corresponds to the 'x' value in the problem

  // Evaluate a specific condition: if the desired range size is exactly one.
  if (numericalRangeSize === 1) {
    // In this unique scenario, only the focal point number needs to be displayed.
    console.log(String(focalPointNumber)); // Convert the number to a string for printing
    return; // Exit the function prematurely as the task is complete for this case
  }

  // Prepare an empty array to store the resultant sequence of numbers.
  let generatedSequence = [];

  // Commence a loop to populate the sequence.
  // The loop iterates from a calculated start point up to a calculated end point.
  // The start is `focalPointNumber - (numericalRangeSize - 1)`, and it continues
  // as long as the current number is less than `focalPointNumber + numericalRangeSize`.
  for (let currentIterationNumber = focalPointNumber - (numericalRangeSize - 1); currentIterationNumber < focalPointNumber + numericalRangeSize; currentIterationNumber++) {
    // Add the number generated in the current iteration to our collection.
    generatedSequence.push(currentIterationNumber);
  }

  // Output the complete sequence. The numbers are joined together with a single space
  // between each element before being printed to the console.
  console.log(generatedSequence.join(' ')); // Concatenate all elements with a space separator
}

// Execute the primary process. This line reads content from standard input,
// assuming it's UTF-8 encoded, and passes that content as a string to the function.
initiateProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));