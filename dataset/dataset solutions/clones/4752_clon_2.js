const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The first line 'count' is read but not used in the subsequent calculation.
// The remaining lines are processed as 'sequenceStrings'.
const [count, ...sequenceStrings] = rawData.split('\n');

// Each string representing a pair of numbers is split into an array of two strings.
const parsedSequences = sequenceStrings.map(singleSetString => singleSetString.split(' '));

// Extract the first number from each pair and convert it to a numeric type.
const firstNumbers = parsedSequences.map(pairArray => +pairArray[0]);

// Extract the second number from each pair and convert it to a numeric type.
const secondNumbers = parsedSequences.map(pairArray => +pairArray[1]);

// Perform a right-to-left reduction to calculate the final adjusted value.
const finalResult = firstNumbers.reduceRight((cumulativeAdjustment, currentAValue, indexPosition) => {
  // Retrieve the corresponding 'b' value for the current index.
  const correspondingBValue = secondNumbers[indexPosition];

  // Calculate the 'a' value, incorporating the cumulative adjustment from previous steps.
  const adjustedAValue = currentAValue + cumulativeAdjustment;

  // Determine the remainder when 'adjustedAValue' is divided by 'correspondingBValue'.
  const remainder = adjustedAValue % correspondingBValue;

  // If there's a remainder, calculate the amount needed to make 'adjustedAValue' a multiple of 'correspondingBValue'.
  // Then, subtract the original 'currentAValue' to get the new cumulative adjustment for the next iteration.
  // If there's no remainder, the cumulative adjustment remains unchanged.
  return remainder > 0 ? adjustedAValue + (correspondingBValue - remainder) - currentAValue : cumulativeAdjustment;
}, 0); // The initial cumulative adjustment is set to zero.

// Print the final calculated result to standard output.
console.log(finalResult);
