// Import the Node.js file system module for file operations.
const fileSystemModule = require("fs");

// Define a custom function to read file data synchronously.
const readInputData = fileSystemModule.readFileSync;

// Define a custom function to remove leading/trailing whitespace from a string.
const removeWhitespace = (textInput) => textInput.trim();

// Define a custom function to split a string into an array based on a delimiter.
const segmentContent = (textInput, delimiterPattern) => textInput.split(delimiterPattern);

// Define a custom function to iterate over an array and transform each element.
const processArrayElements = (inputArray, callbackFunction) => inputArray.map(callbackFunction);

// Define a custom function for outputting results to the console.
const outputResult = console.log;

// Define a constant for the common upper index limit used in calculations.
const maxArrayIndex = 10;


// --- Main Program Logic ---

// 1. Read all data from the standard input stream, decoded as UTF-8.
const rawInputContent = readInputData("/dev/stdin", 'utf8');

// 2. Remove any leading or trailing whitespace from the raw content.
const cleanedContent = removeWhitespace(rawInputContent);

// 3. Split the cleaned content into an array of individual entries using whitespace as a delimiter.
const entryList = segmentContent(cleanedContent, /\s/);

// 4. Process each entry in the list to calculate and output a specific index.
processArrayElements(entryList, function (currentEntryString) {
  // Split the current string entry by commas into an array of value strings.
  let numericValues = segmentContent(currentEntryString, ',');

  // Initialize variables for the reverse cumulative sum and loop control.
  let cumulativeSum = 0;
  let outerLoopCounter = maxArrayIndex;
  let indexFinder = maxArrayIndex;

  // Perform a reverse cumulative sum on elements from maxArrayIndex down to 1.
  // The element at index 0 (numericValues[0]) is not modified by this loop.
  // The loop iterates while outerLoopCounter is 10, 9, ..., 1.
  while (outerLoopCounter > 0) {
    // Convert string to number implicitly during subtraction and assignment.
    numericValues[outerLoopCounter] = cumulativeSum -= numericValues[outerLoopCounter];
    outerLoopCounter--;
  }

  // Calculate a scaling factor using the element at maxArrayIndex + 1 (index 11).
  // This assumes the 'numericValues' array has at least 12 elements (indices 0-11).
  let scalingFactor = -numericValues[maxArrayIndex + 1];

  // Adjust the 'cumulativeSum' using the 'scalingFactor' and the modified element at 'indexFinder' (index 10).
  // This step can lead to 'Infinity' or 'NaN' if the denominator (scalingFactor - numericValues[indexFinder]) is zero.
  cumulativeSum *= (scalingFactor / (scalingFactor - numericValues[indexFinder]));

  // Search for the first index, starting from maxArrayIndex - 1 downwards,
  // where the array element is less than the adjusted 'cumulativeSum'.
  // The loop condition handles the decrement and comparison; the body is intentionally empty.
  while (numericValues[--indexFinder] >= cumulativeSum) {
    /* No operations are performed within this loop body. */
  }

  // Output the final adjusted index. The '++' operator increments 'indexFinder'
  // back to the position where the condition first became false.
  outputResult(++indexFinder);
});