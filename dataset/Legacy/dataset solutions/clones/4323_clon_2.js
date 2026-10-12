'use strict';

/**
 * Processes raw input data to find the sum of the maximum value
 * from one derived list and its corresponding value from another.
 * @param {string} rawData The raw string input, typically from a file or stdin.
 */
function ProcessInput(rawData) {
  // Clean and parse the raw input string into an array of numerical values.
  // The input string is trimmed, split by whitespace, and each part is converted to a number.
  let parsedNumbers = rawData.trim().split(/\s+/).map((val) => +val);

  // The first number in the input is often a count, but its value is not
  // utilized in the subsequent logic of this particular function.
  const countElements = parsedNumbers.shift();

  // Initialize two empty arrays to store processed data.
  let firstList = [];
  let secondList = [];

  // Populate the two lists by iteratively taking elements from the end
  // of the parsed numbers array. Elements are pushed in reverse order
  // of their original appearance in the input after the initial shift.
  while (parsedNumbers.length > 0) {
    secondList.push(parsedNumbers.pop()); // Add to second list
    firstList.push(parsedNumbers.pop());  // Add to first list
  }

  // Determine the highest numerical value present within the 'firstList'.
  const maximumValue = Math.max.apply(null, firstList);

  // Find the index of this maximum value in 'firstList', then use that
  // index to retrieve the corresponding element from 'secondList'.
  const correspondingValue = secondList[firstList.indexOf(maximumValue)];

  // Print the sum of the identified maximum value and its paired corresponding value.
  console.log(maximumValue + correspondingValue);
}

// Execute the primary processing function by reading input from standard input.
// The input is read as a UTF-8 encoded string.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
