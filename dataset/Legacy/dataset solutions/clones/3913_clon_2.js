'use strict';

function processInputData(rawInputText) {
  // Parse the input string: split by newline, take the first line,
  // then split by space, and convert each part to a number.
  let parsedValues = rawInputText
    .split('\n')[0]
    .split(' ')
    .map((currentString) => Number(currentString));

  // Extract the three numerical parameters from the parsed array.
  const firstBoundary = parsedValues[0];
  const secondBoundary = parsedValues[1];
  const iterationLimit = parsedValues[2];

  // Initialize a Set to store unique numbers that meet the criteria.
  let collectedNumbers = new Set();

  // Loop 'iterationLimit' times to generate potential numbers.
  for (let loopIndex = 0; loopIndex < iterationLimit; loopIndex++) {
    // Check if the generated numbers are within the specified range [firstBoundary, secondBoundary].
    // If either (firstBoundary + loopIndex) is less than or equal to secondBoundary
    // OR (secondBoundary - loopIndex) is greater than or equal to firstBoundary,
    // then add both numbers to the set.
    if (
      firstBoundary + loopIndex <= secondBoundary ||
      secondBoundary - loopIndex >= firstBoundary
    ) {
      collectedNumbers.add(firstBoundary + loopIndex);
      collectedNumbers.add(secondBoundary - loopIndex);
    } else {
      // If neither condition is met, it means we've gone beyond the relevant range,
      // so we can stop iterating early.
      break;
    }
  }

  // Convert the Set to an array, sort it numerically in ascending order,
  // and then join the numbers into a single string, separated by newlines.
  let finalResultString = [...collectedNumbers]
    .sort((numA, numB) => numA - numB)
    .join('\n');

  // Output the final formatted string to the console.
  console.log(finalResultString);
}

// Read input from standard input and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
