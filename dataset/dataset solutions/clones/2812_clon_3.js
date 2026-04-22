'use strict';

// This function serves as the primary entry point for analyzing
// a set of scheduling tasks to determine if they can all be completed
// by their respective deadlines. It processes raw input, parses task details,
// and applies a greedy algorithm to check feasibility.
function evaluateTaskCompletionFeasibility(scheduleRawInput) {
    // Normalize and segment the input data.
    // .trim() removes any leading/trailing whitespace, including potential
    // extra newlines at the end of the input file, ensuring clean processing.
    const inputRows = scheduleRawInput.trim().split('\n');

    // The first line of the input specifies the total number of operations.
    // We use `Number()` for explicit type conversion from string to number,
    // which is generally a robust approach.
    const declaredOperationCount = Number(inputRows[0]);

    // Early exit condition: If there are no operations to perform,
    // the schedule is inherently feasible. This is an added guard clause.
    if (declaredOperationCount === 0) {
        console.log('Yes');
        return;
    }

    // A collection to store the parsed task objects.
    // Each task will be represented as an object with 'duration' and 'deadline' properties
    // for clearer data representation and access compared to simple arrays.
    const scheduledJobs = [];

    // Iterate through the input rows, starting from the second row (index 1),
    // to parse each individual task definition.
    for (let taskRowIndex = 1; taskRowIndex <= declaredOperationCount; taskRowIndex++) {
        // Split the current row into its constituent parts (duration and deadline).
        const jobParameters = inputRows[taskRowIndex].split(' ');

        // Convert the string parameters to numeric values.
        const jobExecutionTime = Number(jobParameters[0]);
        const jobCompletionDeadline = Number(jobParameters[1]);

        // Create a structured object for the current job and add it to our collection.
        scheduledJobs.push({ duration: jobExecutionTime, deadline: jobCompletionDeadline });
    }

    // Crucial step for the greedy algorithm: sort all jobs by their deadlines
    // in ascending order. This ensures we prioritize tasks that need to be
    // completed sooner.
    scheduledJobs.sort((firstJob, secondJob) => firstJob.deadline - secondJob.deadline);

    // Initialize a variable to keep track of the accumulated time spent on tasks
    // up to the current point in the schedule.
    let cumulativeWorkloadTime = 0;

    // A boolean flag to indicate the overall viability of the schedule.
    // It is initially assumed to be viable until a deadline is missed.
    let isScheduleOverallValid = true;

    // Iterate through the sorted list of jobs to simulate their execution
    // and check against their deadlines.
    // Using a 'for...of' loop provides a clean way to iterate over array elements.
    for (const currentJobDetails of scheduledJobs) {
        // Add the duration of the current job to the running total of time spent.
        cumulativeWorkloadTime += currentJobDetails.duration;

        // Check if the cumulative time spent has exceeded the deadline
        // for the current job.
        if (cumulativeWorkloadTime > currentJobDetails.deadline) {
            // If a deadline is missed, the entire schedule becomes invalid.
            isScheduleOverallValid = false;
            // Since the schedule is already deemed invalid, there's no need
            // to check further jobs; we can terminate the loop early.
            break;
        }
    }

    // Based on the final state of the viability flag, construct the output message.
    const finalVerdictOutput = isScheduleOverallValid ? 'Yes' : 'No';

    // Display the determined outcome to the standard output.
    console.log(finalVerdictOutput);
}

// This is the execution entry point for the script when run in a Node.js environment.
// It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string
// and passes it to our main analysis function.
// Using 'node:fs' for explicit Node.js module import syntax.
evaluateTaskCompletionFeasibility(require('node:fs').readFileSync('/dev/stdin', 'utf8'));