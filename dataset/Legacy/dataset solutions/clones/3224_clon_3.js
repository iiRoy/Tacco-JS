'use strict';

function processInput(rawData) {
  const dataLines = rawData.split('\n');

  // The first line typically indicates the count of items,
  // though its value isn't directly used in the triangle inequality check.
  const itemCount = parseInt(dataLines[0], 10);

  // Extract the string of space-separated numbers from the second line.
  const numbersString = dataLines[1];

  // Split the string into an array of string parts.
  const stringParts = numbersString.split(' ');

  // Convert each string part to a number.
  const numericLengths = stringParts.map(valueStr => Number(valueStr));

  // Sort the array of lengths in ascending order to easily identify the longest side.
  const sortedLengths = numericLengths.sort((a, b) => a - b);

  // Identify the longest side, which is the last element in the sorted array.
  const longestSide = sortedLengths[sortedLengths.length - 1];

  // Create a new array containing all sides except the longest one.
  const remainingSides = sortedLengths.slice(0, sortedLengths.length - 1);

  // Calculate the sum of the lengths of the remaining sides.
  const initialSumValue = 0;
  const remainingSidesSum = remainingSides.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, initialSumValue);

  // Determine if a triangle can be formed using the triangle inequality theorem.
  // A triangle can be formed if the sum of the lengths of any two sides
  // is greater than the length of the third side.
  // For a sorted array, this simplifies to checking if the sum of all
  // sides except the longest is greater than the longest side.
  const canFormTriangle = longestSide < remainingSidesSum;

  // Output the result.
  console.log(canFormTriangle ? 'Yes' : 'No');
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
