'use strict';
// This constant defines a dedicated function for displaying various messages.
const outputPrinter = (  messageText  ) => console.log(messageText);

/*
 *  The following lines were originally intended for parsing multiple numeric inputs
 *  from the first line of source information. They are currently inactive.
 */
// let valueOne, valueTwo, valueThree, valueFour;
// [ valueOne, valueTwo, valueThree, valueFour ] = sourceInformation[0].trim().split(" ").map(item => Number.parseInt(item));

/**
 * This is the core routine that takes input data and determines
 * if any number within a given range is perfectly divisible by a specified value.
 * @param {Array<string>} sourceInformation - The collection of input lines as strings.
 */
function processInputData(sourceInformation) {
  // Obtain the numeric divisor from the initial segment of the first input line.
  let targetDivisor = sourceInformation[0].split(" ")[0];

  let lowerBound, upperBound;
  // Extract and convert the numeric range (start and end points) from the second input line.
  [ lowerBound, upperBound ] = sourceInformation[1].split(" ").map(item => Number.parseInt(item));

  // Initialize a boolean indicator to track if a matching number is discovered.
  let successIndicator = false;

  // Traverse through each integer starting from the lower bound up to and including the upper bound.
  for (  let currentNumber = lowerBound; currentNumber < upperBound + 1; currentNumber++  ) {
    // Evaluate if the current integer yields a zero remainder when divided by the target divisor.
    if (  Math.floor(currentNumber % targetDivisor) === 0  ) {
      // Upon finding a match, output 'OK', update the indicator, and terminate the function's execution.
      outputPrinter('OK');
      successIndicator = true;
      return;
    }
  }

  // If the iteration completes without setting the success indicator, it means no such number was found.
  if (!successIndicator) {
    outputPrinter('NO');
  }
}

// Execute the primary data processing routine, feeding it content from standard input.
processInputData(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split("\n")
);