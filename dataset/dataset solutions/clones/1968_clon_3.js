/**
 * This module processes raw input data to count the occurrences of numbers
 * within a specified range. It expects a maximum value 'N' on the first line
 * and a space-separated list of numbers on the second line.
 *
 * The core logic involves sorting the provided numbers and then efficiently
 * counting the frequency of each integer from 1 up to 'N' using a single
 * pointer approach.
 */
function ProcessInputData(rawDataString) {

  // Step 1: Parse the incoming raw string data into individual lines.
  const allInputLines = rawDataString.split('\n');

  // Input validation: Ensure we have at least two lines for N and the number list.
  if (!allInputLines || allInputLines.length < 2) {
    // In a real application, this might throw an error or log a warning.
    // For this exercise, we'll just exit or return.
    console.error("Error: Insufficient input lines provided. Expected at least 2.");
    return;
  }


  // Extract the first line, which should contain the upper limit for counting.
  const firstLineContent = allInputLines[0];
  const upperLimitVal = parseInt(firstLineContent.trim(), 10);

  // Validate the extracted upper limit value.
  if (isNaN(upperLimitVal) || upperLimitVal <= 0) {
    console.error(`Error: Invalid upper limit value '${firstLineContent}'. Must be a positive integer.`);
    return;
  }


  // Extract the second line, containing the space-separated numbers.
  const secondLineContent = allInputLines[1];
  const stringValues = secondLineContent.split(' ');

  // Convert string values to numbers, filtering out any non-numeric entries.
  let numericItems = stringValues
                       .map(str => parseInt(str.trim(), 10))
                       .filter(num => !isNaN(num));

  // It's crucial to sort the numeric items for the efficient counting algorithm.
  // Sort in ascending order.
  numericItems.sort((a, b) => a - b);


  // Initialize a pointer to traverse the sorted array.
  // This pointer will only advance when a matching number is found or skipped.
  let currentArrayPointer = 0;

  // This array will store the final frequency counts for each number from 1 to upperLimitVal.
  const finalCounts = [];


  // Iterate from 1 up to the maximum expected value (upperLimitVal)
  // to determine the frequency of each number.
  for (let targetValue = 1; targetValue <= upperLimitVal; targetValue++) {
    let itemFrequency = 0; // Reset frequency for the current targetValue.

    // Before entering the counting loop, check if the pointer is still within bounds.
    // Also, check if the element at the current pointer position is already
    // greater than our targetValue. If so, due to sorting, no future elements
    // at or after this pointer can match the current targetValue.
    if (currentArrayPointer < numericItems.length && numericItems[currentArrayPointer] > targetValue) {
      // If the current element is too large, we know 'targetValue' is not present
      // at the current pointer's position or further. The pointer remains unchanged.
      // 'itemFrequency' stays 0.
    } else {
      // If the pointer is out of bounds, or if the current element is less than or equal to targetValue,
      // we proceed to count matches.
      // This inner loop counts all consecutive occurrences of the 'targetValue'.
      while (currentArrayPointer < numericItems.length && numericItems[currentArrayPointer] === targetValue) {
        itemFrequency++;             // Increment the frequency count.
        currentArrayPointer++;       // Advance the pointer only on an actual match.
      }
    }

    // Store the calculated frequency for the current targetValue.
    finalCounts.push(itemFrequency);
  }


  // Output the collected frequencies, each on a new line.
  // This is the final step of the processing.
  for (const frequencyResult of finalCounts) {
    console.log(frequencyResult);
  }
}

// Entry point: Read input from standard input and pass it to the processing function.
// This assumes the environment is Node.js and input comes from '/dev/stdin'.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));