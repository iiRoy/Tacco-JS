'use strict';

/*
 * This function computes the maximum possible score based on
 * heights and associated values, following a specific dynamic programming approach.
 */
function calculateMaxScore(itemCount, heightsArr, valuesArr) {
  // Initialize a DP array where each element initially holds its corresponding value.
  // This array will store the maximum score ending at each position.
  let dynamicProgression = new Array(itemCount).fill(0).map((_elementPlaceholder, currentIdx) => valuesArr[currentIdx]);

  // Variable to keep track of the highest score found so far across all elements.
  let overallHighestScore = 0;

  // Iterate through each item to compute its maximum possible score.
  for (let outerIndex = 0; outerIndex < itemCount; outerIndex++) {
    let currentMaxSubScore = 0; // Represents the maximum score from a preceding item that can be extended.

    // Look at all previous items to find a suitable predecessor.
    for (let innerIndex = 0; innerIndex < outerIndex; innerIndex++) {
      // If the current item's height is greater than a previous item's height,
      // and the previous item's score is higher than our current best sub-score,
      // then update currentMaxSubScore.
      if (heightsArr[outerIndex] > heightsArr[innerIndex] && currentMaxSubScore < dynamicProgression[innerIndex]) {
        currentMaxSubScore = dynamicProgression[innerIndex];
      }
    }

    // Add the best found sub-score to the current item's initial value.
    dynamicProgression[outerIndex] += currentMaxSubScore;

    // Update the overall highest score if the current item's total score is greater.
    if (dynamicProgression[outerIndex] > overallHighestScore) {
      overallHighestScore = dynamicProgression[outerIndex];
    }
  }

  // Return the maximum score achievable.
  return overallHighestScore;
}

/**
 * Main function to process input, call the solver, and output the result.
 * @param {string} rawData - The raw input string from stdin.
 */
function processInputData(rawData) {
  // Split the input string into individual lines.
  const inputLines = rawData.split("\n");

  // Parse the first line for the total number of items.
  const itemCount = parseInt(inputLines[0]);

  // Parse the second line for heights, converting string parts to integers.
  const heightsArr = inputLines[1].split(' ').map(linePart => parseInt(linePart));

  // Parse the third line for values, converting string parts to integers.
  const valuesArr = inputLines[2].split(' ').map(linePart => parseInt(linePart));

  // Call the solver function with the parsed data.
  const finalResult = calculateMaxScore(itemCount, heightsArr, valuesArr);

  // Print the computed result to the console.
  console.log(finalResult);
}

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
