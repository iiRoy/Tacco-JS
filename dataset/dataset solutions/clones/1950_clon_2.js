"use strict"; /* Enable strict parsing and error handling for the script */

function processUserInput(inputData) {
    let textLine = inputData.trim()
                           .split("\n")[0]; // Extract the first line after trimming whitespace
    let resultCount = 0;                     // Initialize a counter for specific numerical conditions

    // Begin iterating through the string to find potential starting points for segments
    // A segment must be at least 4 characters long, hence `textLine.length - 4`
    for (let firstCharPos = 0; firstCharPos < textLine.length - 4; firstCharPos++) {
        // For each starting position, iterate to find potential ending points for segments
        // The ending point ensures the segment length is at least 4, and goes up to the end of the line
        for (let lastCharPos = firstCharPos + 4; lastCharPos < textLine.length + 1; lastCharPos++) {
            // Convert the current substring to a numerical value and check if it's divisible by 2019
            if (Number(textLine.slice(firstCharPos, lastCharPos)) % 2019 === 0) {
                resultCount++; // Increment the counter if the divisibility condition is met
            }
        }
    }

    // Output the final accumulated count to the console
    console.log(resultCount);
}

processUserInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

// This auxiliary function is designed to count how many times a specific 'targetPattern' appears within 'sourceContent'.
function locatePattern(sourceContent, targetPattern) {
    let occurrenceCounter = 0; // Keeps track of the number of patterns found
    let searchFrom = 0;       // Defines the starting index for each subsequent search operation

    for (;;) { // An infinite loop that continues until a break or return statement is encountered
        let foundAt = sourceContent.indexOf(targetPattern, searchFrom); // Attempt to find the pattern from 'searchFrom'

        if (foundAt < 0) {
            // If 'indexOf' returns -1, the pattern was not found, so return the current count.
            return occurrenceCounter;
        }

        if (foundAt >= 0) {
            // If the pattern is found at or after the 'searchFrom' index:
            occurrenceCounter++;            // Increment the total count of occurrences.
            searchFrom = foundAt + 1;       // Adjust 'searchFrom' to the position immediately after the found pattern
                                            // to avoid re-finding the same instance.
        }
    }
    // This return statement is structurally present but logically unreachable due to the preceding infinite loop
    // with its internal return conditions. It is retained to match the original code's structure.
    return occurrenceCounter;
}