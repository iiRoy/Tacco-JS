function ProcessInput(rawData) {
    // Split the raw input string into individual lines.
    rawData = rawData.split("\n");

    // Parse the first line to extract configuration parameters.
    // These are expected to be space-separated numbers.
    let configParams = rawData[0].split(" ").map(Number);

    // Parse the second line to get the array of data points.
    // These are also expected to be space-separated numbers.
    let dataPoints = rawData[1].split(" ").map(Number);

    // Initialize a variable to accumulate the total calculated length.
    let totalLength = 0;

    // Initialize the start marker for the current interval.
    let currentStart = -1;

    // Initialize the end marker for the current interval.
    let currentEnd = -1;

    // Iterate through each data point in the array.
    for (let idx = 0; idx < dataPoints.length; idx++) {
        // Check if the current data point starts after the current interval ends.
        if (currentEnd < dataPoints[idx]) {
            // If it does, the previous interval is complete. Add its length to the total.
            totalLength += currentEnd - currentStart;
            // Set the new start of the interval to the current data point.
            currentStart = dataPoints[idx];
            // Calculate the new end of the interval using the second configuration parameter.
            currentEnd = dataPoints[idx] + configParams[1];
        } else {
            // If the current data point overlaps or is within the current interval,
            // extend the end of the current interval if necessary.
            currentEnd = dataPoints[idx] + configParams[1];
        }
    }

    // After the loop, add the length of the very last interval processed.
    totalLength += currentEnd - currentStart;

    // Output the final calculated total length to the console.
    console.log(totalLength);
}

// Read the input from standard input, decode it as UTF-8, trim whitespace,
// and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
