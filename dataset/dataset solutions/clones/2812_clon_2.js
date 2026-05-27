'use strict';

/**
 * Processes the raw input string to determine if all work items can be completed on time.
 * @param {string} rawText - The complete input string containing task information.
 */
function processInputData(rawText) {
  // Split the entire input string into individual lines.
  const textLines = rawText.split('\n');

  // The first line contains the total number of entries.
  const entryCount = parseInt(textLines.shift(), 10);

  // Initialize an array to hold parsed work items.
  const workItems = [];

  // Iterate through the remaining lines to parse each work item.
  for (let idx = 0; idx < entryCount; idx++) {
    // Each line represents a work item with two numeric values.
    // Parse them as integers and add to the collection.
    workItems.push(
      textLines.shift().split(' ').map(strVal => parseInt(strVal, 10))
    );
  }

  // Sort the work items based on their second value (deadline).
  // This ensures we process items with earlier deadlines first.
  workItems.sort((itemA, itemB) => itemA[1] - itemB[1]);

  // Initialize the final verdict as 'Yes', assuming all tasks can be completed.
  let finalVerdict = 'Yes';
  // Keep track of the cumulative duration of completed tasks.
  let currentDuration = 0;

  // Iterate through the sorted work items to check feasibility.
  for (let kdx = 0; kdx < entryCount; kdx++) {
    // Add the current task's required time to the cumulative duration.
    currentDuration += workItems[kdx][0];

    // If the cumulative duration exceeds the current task's deadline,
    // then it's impossible to complete all tasks on time.
    if (workItems[kdx][1] < currentDuration) {
      finalVerdict = 'No'; // Update the verdict.
      break; // No need to check further, we already found a failure.
    }
  }

  // Output the final determination.
  console.log(finalVerdict);
}

// Read the input from standard input and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
