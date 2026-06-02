var processInputData = function(rawData) {
    // Split the raw input into an array of lines
    rawData = rawData.split('\n');

    // Extract the first line as the total number of elements
    var totalElements = rawData.shift();

    // Join the remaining lines into a single string
    var combinedString = rawData.join();

    // Declare variables for segments and their filtered versions
    var leftSegment; // Represents the western part
    var leftSegmentFiltered;
    var rightSegment; // Represents the eastern part
    var rightSegmentFiltered;

    // Variable to hold the current count of mismatches
    var currentMismatchCount;

    // Initialize the minimum mismatch count to a large value
    var minimumMismatchCount = 300000; // Equivalent to 3 * 100000

    // Iterate through possible split points for the string
    for (var segmentIndex = 1; segmentIndex < totalElements; segmentIndex++) {
        // Extract the left (western) segment
        leftSegment = combinedString.slice(0, segmentIndex);
        // Extract the right (eastern) segment
        rightSegment = combinedString.slice(segmentIndex + 1, totalElements);

        // Filter 'W' characters from the right segment
        leftSegmentFiltered = rightSegment.split('W').join('');
        // Filter 'E' characters from the left segment
        rightSegmentFiltered = leftSegment.split('E').join('');

        // Calculate the current mismatch count
        currentMismatchCount = (leftSegment.length - rightSegmentFiltered.length) + (rightSegment.length - leftSegmentFiltered.length);

        // Check if the current count is zero, indicating a perfect split
        if (currentMismatchCount === 0 || currentMismatchCount === -0) {
            minimumMismatchCount = 0; // Set minimum to zero and exit early
            break;
        } else if (currentMismatchCount < minimumMismatchCount) {
            // Update the minimum count if a smaller one is found
            minimumMismatchCount = currentMismatchCount;
        }
    }

    // Output the final minimum mismatch count to the console
    console.log(minimumMismatchCount);

    // Return a success code
    return 0;
};

// Read input from standard input, decode as UTF-8, and trim whitespace
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
