// This script is designed to process numerical input provided via standard input.
// It specifically looks for a sequence of numbers on the second line of input
// and then identifies how many of those numbers are 'local medians' within their immediate neighborhood.

// Ensure the standard input stream remains active and does not close prematurely.
process.stdin.resume();

// Set the character encoding for the incoming data from standard input to UTF-8.
process.stdin.setEncoding('utf8');

// A dynamic array to store each line of text received from standard input.
var capturedInputLines = [];

// Initialize a readline interface to efficiently handle input, line by line.
// This interface reads from stdin and can optionally write to stdout (though not directly used for output here).
var inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Register an event listener that triggers every time a new line of input is received.
inputProcessor.on('line', (currentInputSegment) => {
  // Append the current line of input to our collection.
  capturedInputLines.push(currentInputSegment);
});

// Register an event listener that triggers once the entire input stream has ended (EOF).
inputProcessor.on('close', () => {

  // --- Initial Input Validation and Data Preparation ---

  // Validate that there are enough lines of input.
  // The problem statement implies the data of interest is on the second line (index 1).
  if (capturedInputLines.length < 2) {
    // If fewer than two lines are provided, no meaningful data can be processed.
    // Output 0 as there are no possible local medians.
    console.log(0);
    return; // Terminate further processing.
  }

  // Extract the second line (at index 1) from the captured input.
  // Split this line by spaces to get individual number strings.
  // Filter out any empty strings that might result from multiple spaces.
  const rawNumberStrings = capturedInputLines[1].split(' ').filter(segment => segment.trim() !== '');

  // Convert the array of string representations into an array of actual numbers.
  // The global 'Number()' function is used for robust type conversion.
  const numericSequence = rawNumberStrings.map(Number);

  // Validate the length of the numeric sequence.
  // A local median requires at least three elements (previous, current, next).
  if (numericSequence.length < 3) {
    // If the sequence is too short, no local medians can exist.
    console.log(0);
    return; // Terminate further processing.
  }

  // Initialize a counter for tracking how many elements are identified as local medians.
  var centralElementCounter = 0;

  // --- Core Algorithm: Identifying Local Medians ---

  // Iterate through the numeric sequence.
  // The loop starts at index 1 and ends before the last element (numericSequence.length - 1).
  // This ensures that for each 'current' element, there are always 'previous' and 'next' elements available.
  for (let elementPosition = 1; elementPosition < numericSequence.length - 1; elementPosition++) {
    // Retrieve the three adjacent values for the current position.
    var previousValue = numericSequence[elementPosition - 1];
    var currentValue = numericSequence[elementPosition];
    var nextValue = numericSequence[elementPosition + 1];

    // Determine if the 'currentValue' is the median of its triplet.
    // A value is a median if it falls between or equals its two neighbors,
    // regardless of whether the triplet is strictly increasing or decreasing.
    // Case 1: The triplet is in non-decreasing order (e.g., A <= B <= C).
    var isNonDecreasingOrder = (previousValue <= currentValue && currentValue <= nextValue);

    // Case 2: The triplet is in non-increasing order (e.g., A >= B >= C).
    var isNonIncreasingOrder = (previousValue >= currentValue && currentValue >= nextValue);

    // If either condition is true, the 'currentValue' is a local median.
    if (isNonDecreasingOrder || isNonIncreasingOrder) {
      centralElementCounter++; // Increment the counter.
    }
  }

  // --- Final Output ---

  // Print the total count of identified local medians to standard output.
  console.log(centralElementCounter);
});