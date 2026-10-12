function processInput(rawData) {
    // Remove any leading or trailing whitespace from the raw input string.
    let processedString = rawData.trim();

    // Initialize a counter for the distinct segments identified.
    let segmentCount = 0;
    // This variable will hold the last segment that was deemed unique.
    let previousSegment = "";
    // This variable accumulates characters to form the current segment being evaluated.
    let currentSegment = "";
    // An array to store all the unique segments found during processing.
    const segmentHistory = [];

    // Iterate through each character of the cleaned input string.
    for (let charIndex = 0; processedString.length > charIndex; charIndex++) {
        // Append the character at the current index to the accumulating segment.
        currentSegment += processedString[charIndex];

        // Check if the newly formed 'currentSegment' is identical to the 'previousSegment'.
        if (currentSegment === previousSegment) {
            // If they are the same, it means this segment is a repetition, so we skip
            // the rest of the loop body for this iteration and move to the next character.
            continue;
        }

        // If the 'currentSegment' is different from 'previousSegment' (or if it's the first segment),
        // it's considered a new unique segment.
        previousSegment = currentSegment; // Update the 'previousSegment' to the newly found unique one.
        segmentHistory.push(currentSegment); // Add this unique segment to our history array.
        currentSegment = ""; // Reset 'currentSegment' to an empty string to start accumulating the next potential segment.
        segmentCount++; // Increment the counter for unique segments.
    }

    // After processing all characters, display the total number of unique segments found.
    console.log(segmentCount);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
