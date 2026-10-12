'use strict'; // Enforce strict mode for cleaner code

/**
 * Processes a given input string to determine if a series of tasks can be completed by their deadlines.
 * The algorithm prioritizes tasks with the earliest deadlines.
 *
 * @param {string} rawData - The entire input string, typically from stdin.
 */
function processInputData(rawData) {
    // Split the input string into individual lines.
    const linesArray = rawData.split("\n");

    // Parse the first line to get the total number of tasks.
    const taskCount = parseInt(linesArray[0], 10);

    // Initialize arrays to store task processing times and due dates.
    let processingTimes = []; // Stores the time required for each task.
    let dueDates = [];        // Stores the deadline for each task.

    // Loop through the input lines to populate the task arrays.
    for (let idx = 1; idx <= taskCount; idx++) {
        // Split each task line into its components (processing time and due date).
        let taskDetails = linesArray[idx].split(" ");
        // Convert string components to integers and add to respective arrays.
        processingTimes.push(parseInt(taskDetails[0], 10));
        dueDates.push(parseInt(taskDetails[1], 10));
    }

    // Initialize current time and a flag to track deadline adherence.
    let currentTime = 0;
    let allTasksCompletedOnTime = true; // Assume success until a deadline is missed.

    // Continue processing tasks as long as there are tasks remaining.
    while (processingTimes.length !== 0) {
        // Find the earliest due date among the remaining tasks.
        let earliestDueDate = dueDates.reduce((val1, val2) => Math.min(val1, val2));
        // Get the index of the task with the earliest due date.
        let earliestDueDateIndex = dueDates.indexOf(earliestDueDate);

        // Add the processing time of the selected task to the current time.
        currentTime += processingTimes[earliestDueDateIndex];

        // Check if completing this task causes us to miss its deadline.
        if (currentTime > dueDates[earliestDueDateIndex]) {
            allTasksCompletedOnTime = false; // Deadline missed!
            break; // No need to check further tasks.
        }

        // Remove the completed task from the lists.
        processingTimes.splice(earliestDueDateIndex, 1);
        dueDates.splice(earliestDueDateIndex, 1);
    }

    // Output the final result based on whether all deadlines were met.
    if (allTasksCompletedOnTime) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
