// Function to process a collection of numerical values and determine, for each value,
// the maximum among all other values in the collection.
const processNumericalData = (fullRawInput) => {
  // Step 1: Parse and sanitize the incoming raw string data.
  // The input is typically a multi-line string where the first line might be a count (discarded),
  // and subsequent lines are the actual numerical data.
  const numericalSequence = fullRawInput
    .split('\n') // Break the input string into individual lines.
    .filter((lineContent, lineIndex) => {
      // Exclude the first line (index 0) and any lines that are empty or just whitespace.
      return lineIndex !== 0 && lineContent.trim() !== '';
    })
    .map(Number); // Convert the filtered string lines into actual numbers.

  // Step 2: Implement a guard clause for insufficient data.
  // If there are fewer than two numbers, the concept of "maximum among others" is not meaningful.
  // The original code would throw an error for a single element array in `reduce`.
  // This enhanced version handles such edge cases gracefully by returning an empty output.
  if (numericalSequence.length < 2) {
    return; // No output if insufficient data for comparison.
  }

  // Step 3: Initialize a container for the calculated results.
  // This array will store the maximum value for each iteration.
  const calculatedMaximums = [];

  // Step 4: Iterate through each number in the sequence to find the maximum of its peers.
  for (let currentElementIndex = 0; currentElementIndex < numericalSequence.length; currentElementIndex++) {
    // Construct a temporary array that excludes the current element being processed.
    // This is achieved by slicing the original array into two parts (before and after the current index)
    // and then combining them using the spread operator.
    const leftSegment = numericalSequence.slice(0, currentElementIndex);
    const rightSegment = numericalSequence.slice(currentElementIndex + 1);
    const elementsExcludingCurrent = [...leftSegment, ...rightSegment];

    let largestValueAmongOthers;

    // Step 5: Determine the maximum value within the `elementsExcludingCurrent` array.
    // If the array of other elements is empty (e.g., if the original sequence had only one element),
    // Math.max() with an empty array returns -Infinity, which correctly indicates no other comparable values.
    if (elementsExcludingCurrent.length === 0) {
      largestValueAmongOthers = -Infinity; // Represents the absence of other elements.
    } else {
      largestValueAmongOthers = Math.max(...elementsExcludingCurrent);
    }

    // Step 6: Store the computed maximum for the current iteration.
    calculatedMaximums.push(largestValueAmongOthers);
  }

  // Step 7: Output all collected results, each on a new line.
  // This approach of collecting results and then printing once is generally more efficient
  // for large datasets than logging within the loop.
  console.log(calculatedMaximums.join('\n'));
};

// Entry point for the application:
// Reads input from standard input (typically '/dev/stdin' in competitive programming contexts)
// and passes it to our processing function.
try {
  // Ensure the 'fs' module is available for file system operations.
  const stdInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  processNumericalData(stdInputContent);
} catch (readingError) {
  // In a production environment, proper error handling (e.g., logging) would be implemented here.
  // For competitive programming, this block might be omitted if input guarantees are strict.
}