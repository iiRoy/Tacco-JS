// Expert-level code clone generation - Type III variant
// This script simulates a peculiar task scheduling mechanism, processing tasks in segments.

// Step 1: Secure raw input data from the standard input stream.
const rawDataContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Step 2: Parse and prepare the input lines.
// Filters out any potential empty lines that might arise from splitting.
const lineSegments = rawDataContent.trim().split('\n').filter(segment => segment.length > 0);

// Step 3: Extract initial configuration parameters: total tasks and quantum time slice.
// We expect the first line to contain these two numerical values.
const configLine = lineSegments.shift(); // Remove and get the first line
if (!configLine) { // Guard clause: ensure config line exists
    console.error("Error: No configuration line found in input.");
    process.exit(1);
}

const [ initialTasksCountStr, quantumSizeStr ] = configLine.split(/\s+/);

// Convert string values to integers, providing a radix for safety.
let totalTasks = parseInt(initialTasksCountStr, 10);
let quantumSlice = parseInt(quantumSizeStr, 10);

// Basic validation for parsed numbers
if (isNaN(totalTasks) || totalTasks <= 0) {
    console.error("Error: Invalid or non-positive total task count.");
    process.exit(1);
}
if (isNaN(quantumSlice) || quantumSlice <= 0) {
    console.error("Error: Invalid or non-positive quantum slice.");
    process.exit(1);
}

// Step 4: Define a class to represent individual task entities.
class TaskEntity {
  /**
   * Constructs a new TaskEntity.
   * @param {string} taskIdentifier - The name or identifier of the task.
   * @param {number} remainingDuration - The total time required for the task to complete.
   */
  constructor(taskIdentifier, remainingDuration) {
    if (typeof taskIdentifier !== 'string' || taskIdentifier.trim() === '') {
        throw new Error('Task identifier must be a non-empty string.');
    }
    if (typeof remainingDuration !== 'number' || isNaN(remainingDuration) || remainingDuration < 0) {
        throw new Error('Remaining duration must be a non-negative number.');
    }
    this.taskIdentifier = taskIdentifier;
    this.remainingDuration = remainingDuration;
  }

  // Helper method to check if the task is completed
  isFinished() {
    return this.remainingDuration <= 0;
  }
}

// Step 5: Initialize the collection of active tasks (our "queue").
// Note: The original code's queue behavior is `pop()` from end and `unshift()` to front
// for re-insertion, which is not a standard FIFO queue. We replicate this exact behavior.
const activeTasks = [];

// Populate the active tasks collection from the remaining input lines.
// We iterate through the `lineSegments` which now only contain task definitions.
for (let idx = 0; idx < lineSegments.length; idx++) {
  const currentTaskDefinition = lineSegments[idx];
  const [ taskName, taskDurationString ] = currentTaskDefinition.split(/\s+/);
  
  const taskDuration = parseInt(taskDurationString, 10);

  // Validate parsed task duration
  if (isNaN(taskDuration) || taskDuration < 0) {
      console.warn(`Warning: Skipping task "${taskName}" due to invalid duration: ${taskDurationString}`);
      continue; // Skip this task if duration is invalid
  }

  const newTask = new TaskEntity(taskName, taskDuration);
  activeTasks.push(newTask); // Add new task to the end of the collection
}

// Step 6: Simulate the task scheduling process.
let elapsedSystemTime = 0; // Tracks the total elapsed time.

// The simulation continues as long as there are tasks awaiting processing.
while (activeTasks.length > 0) {
  // Extract the last task from the collection for processing.
  // This is a key part of replicating the original code's non-standard queue behavior.
  const currentTask = activeTasks.pop();

  // Determine the actual time slice to apply for this task.
  // It's either the task's remaining duration or the defined quantum, whichever is smaller.
  const timeSliceUsed = Math.min(currentTask.remainingDuration, quantumSlice);

  // Accumulate the time used by this task into the total system elapsed time.
  elapsedSystemTime += timeSliceUsed;

  // Reduce the task's remaining duration by the time slice just applied.
  currentTask.remainingDuration -= timeSliceUsed;

  // Check if the task still requires more processing time.
  if (currentTask.isFinished()) {
    // If the task is finished, log its completion details.
    // Using a template literal for output formatting.
    console.log(`${currentTask.taskIdentifier} ${elapsedSystemTime}`);
  } else {
    // If the task still has time remaining, re-insert it at the *beginning* of the collection.
    // This is another critical aspect of the original code's unique scheduling logic.
    activeTasks.unshift(currentTask);
  }
}

// End of scheduling simulation.