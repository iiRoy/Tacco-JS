'use strict';

const parseIntegerFromString = (stringValue) => {
  return parseInt(stringValue, 10);
};

function processInputData(rawInputContent) {
  const dataLines = rawInputContent.split('\n');
  // Remove the last element, which is typically an empty string from the final newline
  dataLines.pop();

  // The first line often contains metadata like the count of elements,
  // though it's not directly used in the subsequent logic for this problem.
  const declaredElementCount = parseIntegerFromString(dataLines[0]);

  // The second line holds the space-separated numbers
  const numberStringTokens = dataLines[1].split(' ');
  const numericalSequence = numberStringTokens.map(parseIntegerFromString);

  // Execute the core analysis function and output its result
  console.log(analyzeNumericalSequence(numericalSequence));
}

function analyzeNumericalSequence(sourceSequence) {
  // Create a working copy of the array. While not strictly necessary for this read-only operation,
  // it's a common pattern to avoid modifying the original input array.
  const currentSequenceState = sourceSequence.slice();
  let deviationCount = 0;

  // Iterate through the sequence to identify elements that are not in their expected 1-indexed position
  for (const [elementIndex, elementValue] of currentSequenceState.entries()) {
    const expectedPositionValue = elementIndex + 1; // For a 1-indexed permutation, value should match index + 1
    if (elementValue !== expectedPositionValue) {
      deviationCount++;
    }
  }

  // Based on the number of deviations, determine if the sequence can be considered a "YES" case.
  // A sequence is "YES" if it has 2 or fewer elements out of place.
  if (deviationCount > 2) {
    return 'NO'; // More than 2 deviations means it cannot be fixed with at most 2 changes
  }
  return 'YES'; // 2 or fewer deviations means it can be fixed
}

// Read the entire content from standard input and pass it to the processing function
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
