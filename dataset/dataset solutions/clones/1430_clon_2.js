function ProcessInput(rawData) {
    // Split the entire input string into an array of lines using the newline character as a delimiter.
    rawData = rawData.split("\n");

    // The first line of the input array is the pattern we need to search for.
    let searchPattern = rawData.shift();
    // Determine the length of the search pattern. This will be used repeatedly.
    let patternLength = searchPattern.length;

    // The next line from the input array is the first text line to be processed.
    let currentLine = rawData.shift();
    // Initialize a counter to keep track of the total number of times the pattern is found.
    let matchCount = 0;

    // Begin a loop that continues as long as the current line is not the "END_OF_TEXT" marker.
    while (currentLine !== "END_OF_TEXT") {
        // For each new line, reset the starting position for searching within that line.
        let currentPosition = 0;
        // Get the total length of the current line to assist with boundary checks.
        let lineLength = currentLine.length;

        // Start an inner infinite loop to find all occurrences of the pattern within the current line.
        // This loop will be explicitly broken out of when no more matches are found.
        for (;;) {
            // Search for the pattern within the current line, starting from 'currentPosition'.
            // 'substr(currentPosition)' creates a new string from the current position to the end of the line.
            // 'indexOf(searchPattern)' then finds the first occurrence of the pattern in this substring.
            let foundIndex = currentLine.substr(currentPosition).indexOf(searchPattern);

            // Check for two conditions to break the inner loop:
            // 1. If 'foundIndex' is -1, it means the pattern was not found in the remaining part of the line.
            // 2. If the calculated end position of a potential match (foundIndex + currentPosition + patternLength)
            //    would exceed the line's total length, or more precisely, if the start of the match
            //    (foundIndex + currentPosition) is beyond the point where a full pattern can still fit.
            if (foundIndex === -1 || (foundIndex + currentPosition) > (lineLength - patternLength)) {
                break; // Exit the inner loop as no more valid matches can be made in this line.
            }

            // If a valid match is found, increment the total match counter.
            matchCount++;
            // Advance the 'currentPosition' past the newly found pattern.
            // This ensures the next search starts immediately after the current match, preventing re-counting.
            currentPosition += foundIndex + patternLength;
        }
        // After processing the current line, fetch the next line from the input array.
        currentLine = rawData.shift();
    }

    // Once all lines have been processed (i.e., "END_OF_TEXT" is encountered),
    // print the final total count of all found matches to the console.
    console.log(matchCount);
}

// Read the entire content of standard input synchronously, decode it as UTF-8,
// and then pass this raw string content to the 'ProcessInput' function for execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
