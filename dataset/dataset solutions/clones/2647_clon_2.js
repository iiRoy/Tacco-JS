function processInput(rawData) {
    // Remove any leading or trailing whitespace from the raw input string.
    let processedString = rawData.trim();

    // Initialize a counter for distinct segments found.
    let segmentCount = 0;
    // This variable will hold the last unique segment encountered.
    let previousSegment = "";
    // This variable accumulates characters to form the segment currently being examined.
    let currentSegment = "";

    // Iterate through the processed string, starting from the second character (index 1).
    // The loop continues as long as the current index is less than the total length of the string.
    for (let idx = 1; processedString.length > idx; idx++) {
        // Append the character at the current index to the current segment accumulator.
        currentSegment += processedString[idx];

        // Check if the segment we just formed is identical to the previous unique segment.
        if (currentSegment === previousSegment) {
            // If they are the same, we skip the rest of this iteration and move to the next character.
            continue;
        }

        // If the current segment is different from the previous one,
        // we update the 'previousSegment' to be this new unique segment.
        previousSegment = currentSegment;
        // Reset 'currentSegment' to an empty string to start accumulating the next potential segment.
        currentSegment = "";
        // Increment our counter for unique segments.
        segmentCount++;
    }

    // Print the final total count of unique segments to the console.
    console.log(segmentCount);
}

// Read the entire content of standard input as a UTF-8 string, then pass it to our processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
