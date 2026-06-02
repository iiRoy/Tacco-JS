const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim(); // Obtain raw input data from standard input, then clean it up.
const inputRows = rawData.trim().split("\n"); // Divide the cleaned input into individual lines.

// Process each set of inputs until only one line (or fewer) remains.
while (inputRows.length > 0x1) {
    // Extract the number of users (numUsers) and the task duration (taskDuration) from the first line.
    // The line is shifted, trimmed, split by space, and then each part is converted to a number.
    const [numUsers, taskDuration] = inputRows.shift().trim().split(" ").map(Number);

    let currentUserIdx = 0x0; // Initialize the index for the current user, starting from the first user.
    let remainingTime = taskDuration; // Initialize the time remaining for the current task.
    let userTaskProgress = []; // An array to track the accumulated task time for each user.

    // Continue simulating until the current user's accumulated task time equals the total task duration.
    while (userTaskProgress[currentUserIdx] !== taskDuration) {
        // Check if there's still time left for the current task segment.
        if (remainingTime > 0x0) {
            // Increment the current user's task progress. If undefined, start from zero.
            userTaskProgress[currentUserIdx] = (userTaskProgress[currentUserIdx] || 0x0) + 0b1;
            remainingTime--; // Decrement the remaining time for this segment.
        } else {
            // If remainingTime is zero, it means the current task segment is complete for this user.
            remainingTime = userTaskProgress[currentUserIdx]; // Reset remainingTime to the user's accumulated time.
            userTaskProgress[currentUserIdx] = 0x0; // Reset the user's accumulated time to zero.
        }
        // Move to the next user in a circular fashion.
        currentUserIdx = (currentUserIdx + 0b1) % numUsers;
    }
    // Output the index of the user who completes the task.
    console.log(currentUserIdx);
}
