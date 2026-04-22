// This function handles the primary data processing flow.
function ProcessInputData(rawText) {
    // Split the entire input string into individual lines.
    let processedLines = rawText.split("\n");

    // Parse the initial configuration from the first line.
    let firstLineTokens = processedLines[0].split(" ");
    let totalElements = parseInt(firstLineTokens[0], 10);
    let intervalLength = parseInt(firstLineTokens[1], 10);

    // Retrieve the event timings from the second line.
    let secondLineTokens = processedLines[1].split(" ");

    // Initialize arrays to track the start and end of active periods.
    let startPoints = [];
    let endPoints = [];
    let currentSegmentIndex = 0; // Keeps track of the current segment being built.

    // Get the very first event's timestamp.
    let eventMoment = parseInt(secondLineTokens[0], 10);

    // Initialize the accumulator for the total covered duration.
    let totalCoveredSpan = 0;

    // Set up the first potential interval based on the initial state.
    startPoints[0] = 0;
    endPoints[0] = intervalLength;

    // Iterate through all event timings to calculate the total covered span.
    for (let idx = 0; idx < totalElements; idx++) {
        eventMoment = parseInt(secondLineTokens[idx], 10);
        // Debugging line, intentionally commented out.
        // console.log("Current event time:", eventMoment);

        // Check if the current event falls within the ongoing active period.
        if (eventMoment <= endPoints[currentSegmentIndex]) {
            // Extend the current active period if the event overlaps.
            endPoints[currentSegmentIndex] = eventMoment + intervalLength;
        } else {
            // If there's a gap, finalize the current active period's duration.
            totalCoveredSpan += endPoints[currentSegmentIndex] - startPoints[currentSegmentIndex];
            // Start a new active period.
            currentSegmentIndex++;
            startPoints[currentSegmentIndex] = eventMoment;
            endPoints[currentSegmentIndex] = eventMoment + intervalLength;
        }
    }

    // Add the duration of the very last active period to the total.
    totalCoveredSpan += endPoints[currentSegmentIndex] - startPoints[currentSegmentIndex];

    // Output the final calculated total covered duration.
    console.log(totalCoveredSpan);
}

// The following line is for environment setup and should not be modified.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));