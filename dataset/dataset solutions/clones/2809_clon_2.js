'use strict'

/*
 * This function evaluates a given scheduling problem.
 * It determines if all tasks can be completed within their respective deadlines.
 */
function checkTaskSchedule(rawInputData) {

  // Parse the raw input string into an array of lines.
  rawInputData = rawInputData.split('\n');

  // The first line contains the total number of items to process.
  const numItems = parseInt(rawInputData[0], 10);

  // Extract task details from the input.
  // Each task has a duration (first element) and a deadline (second element).
  // The tasks are then sorted by their deadline in ascending order.
  const scheduleEntries = rawInputData
    .slice(1, -1) // Discard header and potentially empty last line.
    .map(lineContent =>
      lineContent.split(' ').map(valStr => parseInt(valStr, 10))
    )
    .sort((entryA, entryB) => {
      // Sort based on the deadline (second element) of each entry.
      return entryA[1] > entryB[1] ? 1 : -1;
    });

  let currentAccumulatedTime = 0; // Tracks the total time spent on tasks so far.

  // Iterate through each scheduled item to verify feasibility.
  for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
    // Add the duration of the current task to the accumulated time.
    currentAccumulatedTime += scheduleEntries[itemIndex][0];

    // If the accumulated time exceeds the current task's deadline,
    // the schedule is not feasible.
    if (currentAccumulatedTime > scheduleEntries[itemIndex][1]) {
      console.info('No'); // Output failure message.
      return false;       // Indicate an unsuccessful schedule.
    }
  }

  // If the loop completes without any deadline violations, the schedule is feasible.
  console.info('Yes'); // Output success message.
  // No return value needed here as the function implicitly finishes.
}


// Invoke the main scheduling function with input read from standard input.
checkTaskSchedule(
  require('fs').readFileSync('/dev/stdin', 'utf8')
);