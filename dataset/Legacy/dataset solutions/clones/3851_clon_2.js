'use strict'; // Enforce strict parsing and error handling.

/**
 * Processes raw input data to calculate a specific result.
 * @param {string} rawData The input string, typically from stdin.
 */
function processInput(rawData) {
  // Split the entire input string by newline characters to get individual lines.
  let processedLines = rawData.split('\n');

  // The first line contains space-separated numbers.
  // Split it by space, then convert each part to an integer using bitwise NOT operator.
  processedLines[0] = processedLines[0].split(' ').map(itemVal => ~~itemVal);

  // The second line is a single number. Convert it to an integer.
  processedLines[1] = ~~processedLines[1];

  // Sort the numbers in the first line in ascending order.
  processedLines[0] = processedLines[0].sort((firstElement, secondElement) => firstElement - secondElement);

  // Determine the index of the last element in the sorted array.
  let lastIndex = processedLines[0].length - 1;

  // Multiply the last element by two times the value from the second line.
  processedLines[0][lastIndex] = processedLines[0][lastIndex] * (2 * processedLines[1]);

  // Calculate the sum of all elements in the modified first line.
  let finalResult = processedLines[0].reduce((accumulator, currentValue) => accumulator + currentValue);

  // Output the computed final result to the console.
  console.log(finalResult);
}

// Read the entire content of standard input synchronously and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
