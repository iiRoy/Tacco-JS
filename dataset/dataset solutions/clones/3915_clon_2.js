"use strict"; /* This directive enforces stricter parsing and error handling */

/**
 * Executes core logic to process input data, generate a number sequence,
 * and print specific elements from its beginning and end.
 * @param {string} rawInputString - The complete string of input data, typically "START END COUNT".
 */
const ProcessInputData = (rawInputString) => {

  // Break the input string into individual parts and convert each part into a numerical value.
  const parsedNumericalValues = rawInputString.split(" ").map((currentStringPart) => {
    return Number(currentStringPart); // Explicit conversion to a numeric type.
  });

  const rangeStartValue = parsedNumericalValues[0];    // The initial boundary for number generation.
  const rangeEndValue = parsedNumericalValues[1];      // The final boundary for number generation.
  const desiredOutputAmount = parsedNumericalValues[2]; // The quantity of numbers to display from each end.

  // This variable will hold the complete sequence of numbers within the specified range.
  const generatedNumberSequence = [];

  // Populate the sequence array, including all integers from the start to the end value.
  for (let currentNumberValue = rangeStartValue; currentNumberValue <= rangeEndValue; currentNumberValue += 1) {
    generatedNumberSequence.push(currentNumberValue);
  }
  
  // Determine the highest valid index for elements within the generated sequence.
  const finalElementIndex = generatedNumberSequence.length - 1;

  // Iterate and print the initial 'desiredOutputAmount' elements from the sequence.
  for (let firstSectionIterator = 0; firstSectionIterator <= desiredOutputAmount - 1; firstSectionIterator += 1) {
    console.log(generatedNumberSequence[firstSectionIterator]);
  }

  // Iterate and print the final 'desiredOutputAmount' elements from the sequence.
  // This loop ensures the correct number of elements are extracted from the tail end.
  for (let lastSectionIterator = finalElementIndex - desiredOutputAmount + 1; lastSectionIterator <= finalElementIndex; lastSectionIterator += 1) {
    console.log(generatedNumberSequence[lastSectionIterator]);
  }
};

// The primary function is invoked by reading data from standard input,
// which is a common pattern in competitive programming environments.
ProcessInputData(
  require('fs')
    .readFileSync(
      '/dev/stdin',
      'utf8'
    )
);