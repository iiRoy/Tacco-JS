'use strict';

// This script processes input data to perform a specific calculation.
const executeLogic = (sourceData) => {
  // Split the input by newlines and then each line by spaces.
  const processedSegments = sourceData.split('\n').map(segmentPart => segmentPart.split(' '));

  // Parse the first two numbers from the first processed segment.
  const valueOne = parseInt(processedSegments[0][0], 10);
  const valueTwo = parseInt(processedSegments[0][1], 10);

  // Check conditions based on the parsed numbers.
  if (valueOne + valueTwo === 15) {
    console.log('+'); // Output '+' if their sum is 15.
  } else if (valueOne * valueTwo === 15) {
    console.log('*'); // Output '*' if their product is 15.
  } else {
    console.log('x'); // Otherwise, output 'x'.
  }
};

// Read data from standard input and pass it to the main processing function.
executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
