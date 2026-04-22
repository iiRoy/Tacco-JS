'use strict';
// This function handles the primary processing of incoming textual data.
const processData = (rawData) => {

  // The raw input string is first trimmed and then divided into distinct lines.
  const allLines = rawData.trim().split('\n');

  // The very first line is taken, split by spaces, and each part is converted into a number.
  // This forms our initial collection of numerical values.
  let numericalCollection = allLines[0].split(' ').map(stringItem => Number(stringItem));

  // The collection of numbers is then sorted in ascending order.
  numericalCollection = numericalCollection.sort((valueOne, valueTwo) => valueOne - valueTwo);

  // The fully sorted numerical collection is printed to the console.
  console.log(numericalCollection);

  // A conditional check is performed: if the third number (index 2)
  // is equal to the sum of the first two numbers (indices 0 and 1),
  // then 'Yes' is printed; otherwise, 'No' is printed.
  console.log(
    numericalCollection[2] === numericalCollection[0] + numericalCollection[1]
      ? 'Yes'
      : 'No'
  );
};

// The program initiates execution by reading the entire content of standard input
// as a UTF-8 string and passing it to the main data processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));