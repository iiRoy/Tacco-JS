const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

// The input data is split into individual lines for processing.
const dataRows = rawData.trim().split("\n");

// This loop continues as long as there are multiple lines of input,
// indicating more test cases to process.
while (dataRows.length > 1) {
    // Each line represents a test case with two numbers:
    // the number of users (numUsers) and the total task duration (taskDuration).
    // The line is extracted, cleaned, split, and converted to numeric values.
    const [numUsers, taskDuration] = dataRows.shift().trim().split(" ").map(Number);

    // Initialize simulation variables:
    // currentUserIndex: Tracks which user is currently active, starting from the first user (index 0).
    // remainingTaskTime: Represents the time left for the current segment of the task being processed.
    // userTaskProgress: An array to store how much progress each user has made on their task.
    let currentUserIndex = 0, remainingTaskTime = taskDuration, userTaskProgress = [];

    // Simulate the task assignment and progress until one user completes the entire task.
    // The condition checks if the current user's accumulated progress matches the total task duration.
    while (userTaskProgress[currentUserIndex] !== taskDuration) {
        // If there's still time left in the current task segment,
        // assign one unit of work to the current user.
        if (remainingTaskTime > 0) {
            // Increment the current user's progress. If the progress was undefined,
            // it's treated as 0 before incrementing.
            userTaskProgress[currentUserIndex] = (userTaskProgress[currentUserIndex] || 0) + 1;
            // Decrement the time remaining for this task segment.
            remainingTaskTime--;
        } else {
            // If the current task segment time has run out,
            // reassign the remainingTaskTime to the current user's progress,
            // and reset the current user's progress to zero.
            remainingTaskTime = userTaskProgress[currentUserIndex];
            userTaskProgress[currentUserIndex] = 0;
        }
        // Move to the next user in a cyclical manner using the modulo operator.
        currentUserIndex = (currentUserIndex + 1) % numUsers;
    }
    // Once a user completes the task, output the index of that user.
    console.log(currentUserIndex);
}
