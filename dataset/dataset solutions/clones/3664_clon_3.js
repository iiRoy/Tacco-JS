const retrieveRawInputData = () => {
    // Access the standard input stream (file descriptor 0)
    // and read its content as a UTF-8 string.
    // This is a synchronous operation, common in competitive programming setups.
    return require("fs").readFileSync(0, "utf8");
};

// --- Main Program Execution Flow ---
try {
    // 1. Acquire and segment the input text.
    const fullInputText = retrieveRawInputData();

    // Trim whitespace from ends and split into an array of individual lines.
    const segmentedLines = fullInputText.trim().split("\n");

    // 2. Process the initial configuration line.
    // The first line usually contains global parameters for the problem.
    const configurationTokens = segmentedLines[0].split(" ");

    // Extract the count of activities/intervals to be processed.
    // The original problem structure implies the second token is this count.
    const numberOfActivities = parseInt(configurationTokens[1], 10);

    // 3. Implement an early exit condition if no activities are specified or invalid.
    if (isNaN(numberOfActivities) || numberOfActivities <= 0) {
        console.log(0); // If no activities, then zero can be selected.
        process.exit(0); // Terminate gracefully.
    }

    // 4. Parse and store the activity intervals.
    const activitySchedule = [];
    const startIndexForActivities = 1; // Activities start from the second line (index 1).

    // Iterate through the lines that contain activity data.
    for (let i = 0; i < numberOfActivities; i++) {
        const currentLineIndex = startIndexForActivities + i;
        const currentActivityLine = segmentedLines[currentLineIndex];

        // Basic check to ensure the line exists before parsing.
        if (currentActivityLine) {
            const timeComponents = currentActivityLine.split(" ");
            const startPoint = parseInt(timeComponents[0], 10);
            const endPoint = parseInt(timeComponents[1], 10);

            // Validate parsed numbers before adding to the schedule.
            if (!isNaN(startPoint) && !isNaN(endPoint)) {
                activitySchedule.push([startPoint, endPoint]);
            }
        }
    }

    // 5. Sort the activities based on their completion times.
    // This is a fundamental step for the greedy interval selection algorithm.
    activitySchedule.sort((firstTask, secondTask) => {
        // Compare the second element (end time) of each activity array.
        return firstTask[1] - secondTask[1];
    });

    // 6. Execute the greedy selection algorithm.
    let chosenActivitiesCount = 0;
    let mostRecentCompletionTime = -Infinity; // Initialize with a very early time
                                             // to ensure the first activity can always be selected.

    // Iterate over the sorted activities.
    for (const currentActivityEntry of activitySchedule) {
        const currentActivityStart = currentActivityEntry[0];
        const currentActivityEnd = currentActivityEntry[1];

        // If the current activity's start time is after or at the same time
        // as the most recently chosen activity's completion time, select it.
        if (currentActivityStart >= mostRecentCompletionTime) {
            chosenActivitiesCount++; // Increment the counter for selected activities.
            mostRecentCompletionTime = currentActivityEnd; // Update the completion time.
        }
    }

    // 7. Output the final result.
    console.log(chosenActivitiesCount);

} catch (processingError) {
    // Generic error handling for any unexpected issues during execution.
    console.error("An operational error occurred:", processingError.message);
    process.exit(1); // Exit with an error code.
}