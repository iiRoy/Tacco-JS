'use strict';

/**
 * Orchestrates the task scheduling feasibility check based on input data.
 * This implementation uses the Earliest Deadline First (EDF) scheduling algorithm
 * to determine if all tasks can be completed by their respective deadlines.
 *
 * @param {string} inputDataString - The raw string input containing task details.
 *                                   Expected format:
 *                                   Line 1: N (total number of tasks)
 *                                   Subsequent N lines: A B (task duration, task deadline)
 */
function processSchedulingData(inputDataString) {
    // --- Phase 1: Input Parsing and Initial Data Structuring ---

    // Split the entire input string into individual lines.
    const dataLines = inputDataString.split("\n");

    // Extract the total number of tasks from the very first line.
    // Use .trim() to handle any leading/trailing whitespace around the number.
    const totalTaskCount = parseInt(dataLines[0].trim(), 10);

    // Implement a guard clause for edge cases or invalid input for task count.
    // If there are no tasks, or the count is invalid, all deadlines are trivially met.
    if (isNaN(totalTaskCount) || totalTaskCount <= 0) {
        console.log('Yes');
        return; // Exit the function early.
    }

    // Initialize an array to hold structured task objects.
    // Each task will be represented as an object with 'workDuration' and 'targetDeadline' properties.
    let workItems = [];

    // Loop through the remaining lines (from index 1 up to totalTaskCount)
    // to parse the duration and deadline for each individual task.
    for (let currentTaskIndex = 1; currentTaskIndex <= totalTaskCount; currentTaskIndex++) {
        // Split each task line by space to separate the two numerical components.
        const taskComponents = dataLines[currentTaskIndex].split(" ");

        // Parse the task duration (A) and deadline (B) into integers.
        const taskEffort = parseInt(taskComponents[0], 10);
        const completionTarget = parseInt(taskComponents[1], 10);

        // Add the newly created task object to our collection.
        workItems.push({ workDuration: taskEffort, targetDeadline: completionTarget });
    }

    // --- Phase 2: Scheduling Logic - Earliest Deadline First (EDF) Algorithm ---

    // A crucial step for the EDF algorithm is to process tasks in ascending order of their deadlines.
    // Sort the entire array of work items once based on their 'targetDeadline'.
    // This pre-sort step replaces the iterative search for the minimum deadline task in each loop cycle
    // found in the original implementation, making the main processing loop simpler.
    workItems.sort((firstTask, secondTask) => firstTask.targetDeadline - secondTask.targetDeadline);

    let accumulatedTime = 0; // This variable tracks the total time elapsed as tasks are completed.
    let isScheduleFeasible = true; // A boolean flag to indicate if all deadlines can be met.

    // Iterate through the now sorted list of tasks.
    // Using a for...of loop provides a clean way to access each task object directly.
    for (const currentWorkItem of workItems) {
        // Add the duration of the current task to the accumulated time.
        // 'accumulatedTime' now represents the point in time when 'currentWorkItem' would be finished.
        accumulatedTime += currentWorkItem.workDuration;

        // Check if the completion time of the current task surpasses its assigned deadline.
        if (accumulatedTime > currentWorkItem.targetDeadline) {
            isScheduleFeasible = false; // If a deadline is missed, the schedule is not feasible.
            break; // Once one deadline is missed, there's no need to check subsequent tasks.
        }
    }

    // --- Phase 3: Output Result ---

    // Based on the final state of the 'isScheduleFeasible' flag, print the outcome.
    if (isScheduleFeasible) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

// This is the standard entry point for competitive programming environments in Node.js.
// It reads the entire content of standard input as a UTF-8 string and passes it
// to our primary scheduling function.
processSchedulingData(require('fs').readFileSync('/dev/stdin', 'utf8'));