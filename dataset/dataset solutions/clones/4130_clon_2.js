'use strict';

// This primary function orchestrates the processing of the input data.
function processInput(inputString) {
  // First, we parse the raw input string.
  // It's expected to be multiple lines, but we only care about the first.
  // That first line contains space-separated numeric values.
  let parsedValues = inputString.split('\n')[0].split(' ');

  // Extract and convert the string parts into numerical values.
  // These represent the four components for our comparison.
  const valA = Number(parsedValues[0]); // The first numerical component.
  const valB = Number(parsedValues[1]); // The second numerical component.
  const valC = Number(parsedValues[2]); // The third numerical component.
  const valD = Number(parsedValues[3]); // The fourth numerical component.

  // Calculate the sum of the first pair of numbers.
  const sumLeft = valA + valB;
  // Calculate the sum of the second pair of numbers.
  const sumRight = valC + valD;

  // Initialize a variable to hold the outcome of the comparison.
  let resultString = '';

  // Determine the relationship between the two sums.
  // If the left sum is greater, it's 'Left'.
  if (sumLeft > sumRight) {
    resultString = 'Left';
  }
  // If the left sum is less, it's 'Right'.
  if (sumLeft < sumRight) {
    resultString = 'Right';
  }
  // If both sums are equal, it's 'Balanced'.
  if (sumLeft === sumRight) {
    resultString = 'Balanced';
  }

  // Output the final determined status to the standard console.
  console.log(resultString);
}

// The program execution begins by reading data from standard input.
// The 'fs' module is used to read the file content synchronously.
// The content is then passed to our main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
