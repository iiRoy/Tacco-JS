const END_OF_TEXT_MARKER = "END_OF_TEXT";

function processTextData(rawInputContent) {
    const inputLines = rawInputContent.split("\n");

    const searchPattern = inputLines.shift();
    const patternLength = searchPattern.length;

    let totalOccurrences = 0;
    let currentProcessingLine;

    // Helper function to count occurrences of a pattern within a single line
    const countOccurrencesInSingleLine = (lineContent, patternToFind, pLength) => {
        let lineMatchCount = 0;
        let searchStartingOffset = 0;

        while (true) {
            // Find the pattern starting from the current offset in the line
            const foundAbsoluteIndex = lineContent.indexOf(patternToFind, searchStartingOffset);

            // If the pattern is not found, or if it would extend beyond the line's bounds
            // (which indexOf implicitly handles by returning -1), then stop searching this line.
            if (foundAbsoluteIndex === -1) {
                break;
            }

            // Increment the count for this line and advance the search offset
            lineMatchCount++;
            searchStartingOffset = foundAbsoluteIndex + pLength;
        }
        return lineMatchCount;
    };

    // Main loop to process each line of text
    while (true) {
        currentProcessingLine = inputLines.shift(); // Retrieve the next line from the input array

        // Check for the end-of-text marker
        if (currentProcessingLine === END_OF_TEXT_MARKER) {
            break; // Exit the loop if the marker is found
        }

        // Accumulate matches from the current line using the helper function
        totalOccurrences += countOccurrencesInSingleLine(currentProcessingLine, searchPattern, patternLength);
    }

    // Output the final count of all occurrences
    console.log(totalOccurrences);
}

// Execute the main processing function with input from standard input
processTextData(require("fs").readFileSync("/dev/stdin", "utf8"));
