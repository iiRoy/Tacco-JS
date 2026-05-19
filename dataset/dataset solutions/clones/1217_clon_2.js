'use strict';

(function(inputData) {
  // This section is typically for function declarations, but none are needed here.

  // Initialize variables by parsing input data.
  let inputStrings = inputData.toString().trim().split(' ');
  let firstVal = parseInt(inputStrings[0], 10);
  let secondVal = parseInt(inputStrings[1], 10);
  let thirdVal = parseInt(inputStrings[2], 10);

  // Execute the primary conditional logic.
  if (firstVal < secondVal) {
    if (secondVal < thirdVal) {
      console.log('Yes');
      return;
    }
  }
  console.log('No');

  // Optional debugging line, currently inactive.
  // console.log(inputStrings);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
