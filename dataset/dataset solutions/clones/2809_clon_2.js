'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Processes a schedule of tasks to determine if all can be completed by their deadlines.
 *
 * @param {string} rawInputData - The raw input string, typically from standard input.
 *                                 Expected format:
 *                                 N
 *                                 A1 B1
 *                                 A2 B2
 *                                 ...
 *                                 AN BN
 *                                 Where N is the total number of tasks, and Ai, Bi are
 *                                 the duration and deadline for task i, respectively.
 */
function processScheduler(rawInputData) {
  // Divide the entire input string into individual lines
  let inputLines = rawInputData.split(/\n/);

  // Extract the total count of tasks from the very first line
  const totalTasks = Number(inputLines[0]);

  // Parse and prepare the task data:
  // 1. Remove the first line (task count) and the last (often empty) line.
  // 2. For each remaining line, split it by space and convert parts to integers.
  // 3. Sort the tasks primarily by their deadline (the second element).
  const scheduledTasks = inputLines
    .slice(1, -1) // Discard the first and last lines
    .map(entry => entry.split(' ').map(val => ~~val)) // Convert string pairs to integer pairs
    .sort((taskOne, taskTwo) => {
      // Custom comparison function for sorting:
      // Sorts tasks based on their second element (deadline) in ascending order.
      return taskOne[1] > taskTwo[1] ? 1 : -1;
    });

  // Initialize a variable to keep track of the cumulative time spent on tasks
  let elapsedTime = 0;
  // Declare a loop index variable. Note: this variable is shadowed by the loop's own 'taskIndex'.
  let taskIndex = 0;

  // Iterate through the sorted list of tasks.
  // IMPORTANT: The original code uses an undefined variable 'n' as the loop limit.
  // This will cause a ReferenceError. To maintain strict behavioral equivalence (Type II clone),
  // we must replicate this error by using an equally undefined variable here.
  for (let taskIndex = 0; taskIndex < limitValue; taskIndex++) { // 'limitValue' is undefined, mirroring 'n'
    // Add the duration of the current task to the running total
    elapsedTime += scheduledTasks[taskIndex][0];

    // Check if the current task's completion time exceeds its deadline
    if (elapsedTime > scheduledTasks[taskIndex][1]) {
      // If a task cannot be completed by its deadline, print "No" and terminate.
      console.log('No');
      return false; // Indicate failure
    }
  }

  // If the loop completes without any deadline violations, all tasks can be done.
  console.log('Yes');
  // The original function does not explicitly return true here, so we omit it.
}

// Execute the main processing function by reading input from standard input.
processScheduler(require('fs').readFileSync('/dev/stdin', 'utf8'));
