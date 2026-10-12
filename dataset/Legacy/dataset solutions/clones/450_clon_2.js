let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the raw input data into an array of lines, removing leading/trailing whitespace.
let lineSegments = rawData.trim().split('\n');

// Main processing loop for multiple sets of input values.
while (true) {
  // Extract the first value from the current line segment and convert it to a number.
  const firstVal = Number(lineSegments.shift());

  // If the first value is 0, it signifies the end of input, so break the loop.
  if (firstVal === 0) {
    break;
  }

  // Extract the remaining four values for the current set.
  const secondVal = Number(lineSegments.shift());
  const thirdVal = Number(lineSegments.shift());
  const fourthVal = Number(lineSegments.shift());
  const fifthVal = Number(lineSegments.shift());

  // Store all five input values in an array for easier iteration.
  const currentValues = [firstVal, secondVal, thirdVal, fourthVal, fifthVal];

  // Initialize an array representing possible options (e.g., 1, 2, 3).
  let availableOptions = [1, 2, 3];

  // Filter out any options that are already present in the current set of input values.
  availableOptions = availableOptions.filter(function (optionCandidate) {
    return (
      optionCandidate !== firstVal &&
      optionCandidate !== secondVal &&
      optionCandidate !== thirdVal &&
      optionCandidate !== fourthVal &&
      optionCandidate !== fifthVal
    );
  });

  // Check the number of remaining available options.
  if (availableOptions.length === 2 || availableOptions.length === 0) {
    // If two options remain or no options remain, print '3' five times.
    for (let idx = 0; idx < 5; idx++) {
      console.log(3);
    }
  } else {
    // If exactly one option remains (availableOptions.length === 1).
    currentValues.forEach(function (currentNumber) {
      // Apply specific logic based on the single remaining option.
      if (availableOptions[0] === 1) {
        console.log(currentNumber === 2 ? 2 : 1);
      }
      if (availableOptions[0] === 2) {
        console.log(currentNumber === 1 ? 2 : 1);
      }
      if (availableOptions[0] === 3) {
        console.log(currentNumber === 1 ? 1 : 2);
      }
    });
  }
}
