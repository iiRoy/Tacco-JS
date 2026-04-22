'use strict';

/**
 * Analyzes a given set of tasks to determine if all can be completed within their specified deadlines.
 * The core logic employs a greedy strategy: tasks are prioritized and processed in ascending order of their deadlines.
 *
 * @param {string} rawTaskInputData - The raw string input, typically from a file or standard input,
 *                                    containing the total number of tasks on the first line,
 *                                    followed by lines each describing a task's duration and deadline.
 * @returns {void} Outputs "Yes" to standard output if all tasks can be met, "No" otherwise.
 *                 Outputs error messages to standard error if input parsing fails.
 */
function evaluateTaskSchedulingFeasibility(rawTaskInputData) {
  // --- Section 1: Initial Input Validation and Line Segmentation ---

  if (typeof rawTaskInputData !== 'string' || rawTaskInputData.trim().length === 0) {
    console.error('Error: Input data is either missing, not a string, or empty.');
    return;
  }

  // Split the input string into individual lines and filter out any empty lines.
  const inputDataLines = rawTaskInputData.split('\n').filter(lineContent => lineContent.trim() !== '');

  if (inputDataLines.length === 0) {
    console.error('Error: No valid data lines found after processing input.');
    return;
  }

  // --- Section 2: Parse Declared Task Count ---

  const declaredTotalTasks = parseInt(inputDataLines[0], 10);

  if (isNaN(declaredTotalTasks) || declaredTotalTasks <= 0) {
    console.error(`Error: The first line must specify a positive integer for the total number of tasks. Found: "${inputDataLines[0]}".`);
    return;
  }

  // --- Section 3: Parse and Validate Individual Task Details ---

  // Extract task definition lines, ensuring we only consider up to the declared total.
  const taskDescriptionLines = inputDataLines.slice(1, declaredTotalTasks + 1);

  if (taskDescriptionLines.length !== declaredTotalTasks) {
    console.error(`Error: Mismatch between declared total tasks (${declaredTotalTasks}) and actual task descriptions parsed (${taskDescriptionLines.length}).`);
    return;
  }

  const parsedTasks = taskDescriptionLines.map((lineStr, lineIdx) => {
    const components = lineStr.split(' ');
    if (components.length !== 2) {
      console.error(`Error: Task definition on line ${lineIdx + 2} is malformed. Expected "duration deadline", got "${lineStr}".`);
      throw new Error('Malformed task line encountered.'); // Halt execution on critical parsing error
    }

    const taskDurationValue = parseInt(components[0], 10);
    const taskDeadlineValue = parseInt(components[1], 10);

    // Validate the numeric values for task properties.
    if (isNaN(taskDurationValue) || isNaN(taskDeadlineValue) || taskDurationValue < 0 || taskDeadlineValue < 0) {
      console.error(`Error: Invalid numeric values for task on line ${lineIdx + 2}. Duration: ${components[0]}, Deadline: ${components[1]}.`);
      throw new Error('Invalid numeric task parameters.'); // Halt execution
    }
    // Return task as an array [duration, deadline]
    return [taskDurationValue, taskDeadlineValue];
  });

  // --- Section 4: Apply Greedy Sorting Strategy ---

  // Sort the tasks based on their deadlines in ascending order.
  // This greedy approach is optimal for minimizing maximum lateness.
  parsedTasks.sort((firstTask, secondTask) => {
    const firstDeadline = firstTask[1];
    const secondDeadline = secondTask[1];
    return firstDeadline - secondDeadline; // Sort ascending by deadline
  });

  // --- Section 5: Simulate Scheduling and Check Feasibility ---

  let cumulativeTimeSpent = 0; // Accumulates the total time spent on tasks so far.
  let scheduleIsPossible = true; // Flag to track if the entire schedule is feasible.

  // Iterate through the sorted tasks and simulate their execution.
  for (let currentTaskIndex = 0; currentTaskIndex < parsedTasks.length; currentTaskIndex++) {
    const activeTask = parsedTasks[currentTaskIndex];
    const taskWorkDuration = activeTask[0];
    const taskCompletionDeadline = activeTask[1];

    cumulativeTimeSpent += taskWorkDuration; // Add the duration of the current task.

    // If the cumulative time exceeds the current task's deadline, the schedule is impossible.
    if (cumulativeTimeSpent > taskCompletionDeadline) {
      scheduleIsPossible = false;
      break; // No need to check further tasks, as one failure means overall failure.
    }
  }

  // --- Section 6: Output Final Result ---

  if (scheduleIsPossible) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

// --- Entry Point: Read Input and Execute ---

try {
  // Read the entire content from standard input synchronously.
  const systemInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  // Process the collected input data.
  evaluateTaskSchedulingFeasibility(systemInputContent);
} catch (runtimeError) {
  // Catch any unexpected errors that might occur during file reading or processing.
  console.error('An unhandled error occurred during program execution:', runtimeError.message);
  // Optionally, exit with a non-zero status code to indicate failure.
  // process.exit(1);
}