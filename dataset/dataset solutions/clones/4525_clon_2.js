'use strict';

const processInputData = (sourceString) => {
  // First, we parse the raw string data to extract and sort numerical values.
  const numericValuesAsc = sourceString
    .split('\n')                                    // Divide the input into individual lines.
    .at(1)                                          // Select the second line, which contains the numbers.
    .split(' ')                                     // Break that line into separate string-numbers.
    .map( (currentStrItem) => parseInt(currentStrItem, 10) ) // Convert each string-number to an integer.
    .sort( (firstNumber, secondNumber) => firstNumber - secondNumber ); // Arrange numbers in ascending order.

  // Then, calculate the difference between the largest and smallest numbers.
  console.log(numericValuesAsc[numericValuesAsc.length - 1] - numericValuesAsc[0]);
};

// Initiate the data processing by reading from standard input.
processInputData(
  require('fs')
    .readFileSync('/dev/stdin', 'utf-8')
);