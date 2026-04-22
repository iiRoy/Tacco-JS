"use strict"; // Activate strict mode for enhanced error handling and cleaner code practices.

// Define the primary function responsible for processing the incoming data.
const processInputData = rawInputText => {
    // The input is expected to be a multi-line string; split it into an array of individual lines.
    rawInputText = rawInputText.split("\n");
    // Take the very first line of input and break it down into an array of single characters.
    const characterArray = rawInputText[0].split("");

    // Initialize a boolean variable to signify whether we are currently within a target sequence.
    let inSegmentMode = false;
    // An array to store the calculated sizes of all identified character segments.
    let segmentLengths = [];
    // A numerical accumulator for the length of the segment currently being observed.
    let currentSegmentSize = 0;

    // Begin iterating through each character of the character array using its index.
    for (let characterPosition in characterArray) {
        // If the character at the current position is 'A', it marks the start of a segment.
        if (characterArray[characterPosition] === "A") {
            inSegmentMode = true; // Set the flag to indicate we are now inside a segment.
        }

        // If the character at the current position is 'Z', it marks the end of a segment.
        if (characterArray[characterPosition] === "Z") {
            inSegmentMode = false; // Reset the flag, exiting segment tracking.
            segmentLengths.push(currentSegmentSize); // Store the accumulated size of the completed segment.
        }

        // If the `inSegmentMode` flag is active, increment the counter for the current segment's size.
        if (inSegmentMode) {
            currentSegmentSize++;
        }
    }

    // Calculate the maximum segment length found from the collected values, then add one as per requirements,
    // and finally, print this result to the console.
    console.log(Math.max(...segmentLengths) + 1);
};

// Execute the main data processing function by reading content from standard input,
// assuming it's UTF-8 encoded, using Node.js's file system module.
processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));