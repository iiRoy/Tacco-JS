function executeSimulation() {
    // Parse the first line of input to determine the number of tasks (N) and the time quantum (Q).
    // The 'taskConfiguration' array will hold [N, Q].
    let taskConfiguration = rawData[0].split(' ').map(Number);

    // Initialize an array to serve as the task queue. Each element will be a task array [name, remaining_time].
    let taskQueue = [];

    // Declare a variable to temporarily store the task currently being processed.
    let currentTaskItem;

    // Declare a variable to keep track of the total elapsed time.
    let totalElapsedTime;

    // Iterate through the input lines, starting from the second line up to N tasks.
    // This populates the 'taskQueue' with initial task data.
    rawData.slice(1, taskConfiguration[0] + 1).forEach(function (taskEntry) {
        // Split each task entry string into its components (name and time).
        taskEntry = taskEntry.split(' ');
        // Convert the time component from string to number.
        taskEntry[1] = Number(taskEntry[1]);
        // Add the prepared task array to the end of the queue.
        taskQueue.push(taskEntry);
    });

    // Initialize the total elapsed time counter to zero.
    totalElapsedTime = 0;

    // Continue processing tasks as long as the queue is not empty.
    while (taskQueue.length !== 0) {
        // Remove the task at the front of the queue for processing.
        currentTaskItem = taskQueue.shift();

        // Check if the current task's remaining time is greater than the quantum.
        if (currentTaskItem[1] > taskConfiguration[1]) {
            // If it is, the task is not finished in this quantum.
            // Subtract the quantum from its remaining time.
            currentTaskItem[1] -= taskConfiguration[1];
            // Add the quantum duration to the total elapsed time.
            totalElapsedTime += taskConfiguration[1];
            // Re-add the partially completed task to the end of the queue.
            taskQueue.push(currentTaskItem);
        } else {
            // If the task's remaining time is less than or equal to the quantum, it finishes.
            // Add the task's remaining time to the total elapsed time.
            totalElapsedTime += currentTaskItem[1];
            // Output the task's name and its completion time.
            console.log(currentTaskItem[0] + ' ' + totalElapsedTime);
        }
    }
}

// Global variable to accumulate all incoming standard input data.
let rawData = '';

// Resume the standard input stream to start receiving data.
process.stdin.resume();
// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events on the standard input.
// Each time a chunk of data is received, append it to the 'rawData' string.
process.stdin.on('data', function (dataSegment) {
    rawData += dataSegment;
});

// Attach an event listener for the 'end' event on the standard input.
// This event fires when there is no more data to be read from stdin.
process.stdin.on('end', function () {
    // Once all input is received, split the accumulated 'rawData' into an array of lines.
    rawData = rawData.split('\n');
    // Call the main simulation function to process the input.
    executeSimulation();
});
