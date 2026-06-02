function processInputData(rawData) {
    // Split the raw input string into individual lines
    var lineSegments = rawData.trim().split("\n");

    // Parse the first line to get initial parameters (N and M)
    var initialParams = lineSegments[0].split(" ").map((currentValue) => parseInt(currentValue));
    var jobCount = initialParams[0]; // N, total number of tasks
    var maxDuration = initialParams[1]; // M, maximum number of days to work

    // Process the remaining lines to create an array of task entries
    // Each task entry is an array [availableDay, rewardAmount]
    var taskEntries = lineSegments.filter((currentValue, currentIndex) => currentIndex !== 0).map((currentValue) => {
        return currentValue.split(" ").map(numericValue => parseInt(numericValue));
    });

    // Sort the task entries based on a specific criteria
    taskEntries.sort((firstTask, secondTask) => {
        // Comments from original:
        // Lower day is preferred
        // Higher reward is preferred

        // This sorting logic is preserved exactly as in the original,
        // including the unreachable code path.
        if (firstTask[1] > secondTask[1]) { // If first task has a higher reward
            if (firstTask[0] > secondTask[0]) { // If first task is available on a later day
                return 1; // Place firstTask after secondTask
            }

            return -1; // Place firstTask before secondTask
        }

        return 1; // If first task has lower or equal reward, place it after secondTask

        // The following lines are unreachable due to the 'return 1;' above.
        // They are kept for Type II clone fidelity.
        if (firstTask[0] > secondTask[0]) {
            return firstTask[1] > secondTask[1] ? -1 : 1;
        }

        return -1;
    });

    var totalEarnings = 0; // Accumulator for total rewards
    var currentDay = 1; // Current day counter, starting from day 1

    // Iterate through days up to maxDuration or until no tasks are left
    while (currentDay <= maxDuration && taskEntries.length > 0) {
        // Find the first available task for the current day
        var foundTaskIndex = taskEntries.findIndex((taskItem) => {
            return currentDay >= taskItem[0]; // Task is available if its day is <= currentDay
        });

        // If no task is found for the current day, advance to the next day
        if (foundTaskIndex === -1) {
            currentDay++;
            continue; // Skip to the next iteration
        }

        // A suitable task has been found
        var selectedTask = taskEntries[foundTaskIndex];
        totalEarnings += selectedTask[1]; // Add the reward of the selected task to total earnings
        taskEntries.splice(foundTaskIndex, 1); // Remove the selected task from the list
        currentDay++; // Advance to the next day
    }

    // Output the final calculated total earnings
    console.log(totalEarnings);
}

// Read input from standard input and pass it to the main processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
