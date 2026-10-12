// This function processes the raw input string.
function ProcessInput(rawData) {
    // Split the input into individual lines for easier parsing.
    rawData = rawData.split("\n");

    // Extract parameters from the first line: item count and time window.
    var firstLineParts = rawData[0].split(" ");
    var itemCount = parseInt(firstLineParts[0]);
    var timeWindow = parseInt(firstLineParts[1]);

    // Retrieve the second line, which contains a sequence of time points.
    var secondLineParts = rawData[1].split(" ");

    // Initialize arrays to track the start and end times of active segments.
    var segmentStarts = [];
    var segmentEnds = [];
    var segmentIndex = 0; // Keeps track of the current segment's index.

    // Parse the first time point from the sequence.
    var currentTime = parseInt(secondLineParts[0]);

    // Initialize the variable to accumulate the total active duration.
    var totalDuration = 0;

    // Set up the initial active segment.
    segmentStarts[0] = 0;
    segmentEnds[0] = timeWindow;

    // Iterate through each time point to calculate the total duration.
    for (var idx = 0; idx < itemCount; idx++) {
        currentTime = parseInt(secondLineParts[idx]);
        // console.log("Processing time point:", currentTime); // A commented-out debug line.

        // Check if the current time point falls within the active window of the current segment.
        if (currentTime <= segmentEnds[segmentIndex]) {
            // If it does, extend the end time of the current segment.
            segmentEnds[segmentIndex] = currentTime + timeWindow;
        } else {
            // If the current time point is outside the current segment's window,
            // finalize the current segment's duration and add it to the total.
            totalDuration += segmentEnds[segmentIndex] - segmentStarts[segmentIndex];
            // Then, start a new active segment.
            segmentIndex++;
            segmentStarts[segmentIndex] = currentTime;
            segmentEnds[segmentIndex] = currentTime + timeWindow;
        }
    }

    // After the loop, add the duration of the very last active segment to the total.
    totalDuration += segmentEnds[segmentIndex] - segmentStarts[segmentIndex];

    // Output the final calculated total active duration.
    console.log(totalDuration);
}

// The following line handles reading input from standard input and calling the main processing function.
// It should not be modified as it's part of the external environment interaction.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
