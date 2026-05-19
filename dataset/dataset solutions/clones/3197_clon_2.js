'use strict';

// This function is responsible for processing the raw input string.
const processInput = (rawData) => {
  // First, split the raw data by newline characters to get individual lines.
  // Then, take the first line (index 0) and split it by space characters.
  // The first element of this split array is converted to a number and stored as 'firstVal'.
  const firstVal = Number(rawData.split('\n')[0].split(' ')[0]);

  // Similarly, the second element of the first line (after splitting by space)
  // is converted to a number and stored as 'secondVal'.
  const secondVal = Number(rawData.split('\n')[0].split(' ')[1]);

  // We evaluate a specific condition: if (firstVal + 1) divided by 2 is
  // greater than or equal to 'secondVal'.
  if ((firstVal + 1) / 2 >= secondVal) {
    // If the condition holds true, we output 'YES' to the console.
    console.log('YES');
  } else {
    // Otherwise, if the condition is false, we output 'NO' to the console.
    console.log('NO');
  }
};

// The program starts by reading the content of '/dev/stdin' (standard input)
// as a UTF-8 encoded string. This content is then passed to the 'processInput' function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
