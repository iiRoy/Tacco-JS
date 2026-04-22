'use strict'; /* This directive enforces stricter parsing and error handling in the JavaScript code,
                      helping to prevent common mistakes and ensuring better code quality. */

/**
 * Orchestrates the primary data processing flow for the application.
 * It reads input, performs a series of numerical transformations, and then outputs the final result.
 * @param {string} rawData - The complete raw text input received, typically from a file or standard input.
 */
function processInput(rawData) {

  // Split the entire input string into an array, where each element corresponds to a new line.
  const lines = rawData.split('\n');

  /*
   * The first line of the input contains a sequence of numbers separated by spaces.
   * The second line specifies the total number of amplification cycles to perform.
   */
  const numberString = lines[0];
  const iterations = parseInt(lines[1], 10); // Safely parse the iteration count as a base-10 integer.

  // Convert the space-separated number string into an array of actual integer values.
  let numericValues = numberString.split(' ').map(strNum => parseInt(strNum, 10));

  // Execute the element amplification procedure for the predetermined number of iterations.
  for (let counter = 0; counter < iterations; counter++) {
    numericValues = amplifyLargest(numericValues); // Update the array with the result of each amplification.
  }

  // Display the sum of all elements in the final, processed array to the standard output.
  console.log(
    numericValues.reduce(
      (accumulator, item) => accumulator + item
    )
  );
}

/**
 * Identifies the largest number within an array and doubles its value.
 * This operation is performed on a copy of the array to maintain immutability of the original.
 * @param {Array<number>} currentNumbers - An array containing numerical data.
 * @returns {Array<number>} A brand new array where the single largest element has been multiplied by two.
 */
function amplifyLargest(currentNumbers) {

  const modifiedList = [...currentNumbers]; // Create a shallow copy to prevent side effects on the original array.
  const greatestElement = Math.max(...currentNumbers); // Determine the highest numerical value present in the array.
  const position = modifiedList.indexOf(greatestElement); // Find the zero-based index of the identified greatest element.

  modifiedList[position] = greatestElement * 2; // Replace the greatest element with its doubled value.

  return modifiedList; // Return the newly modified array.
}

// Initial execution point: Read content from the standard input stream and pass it to the main processing function.
processInput(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8') // Read the entire file synchronously, decoded as UTF-8.
);