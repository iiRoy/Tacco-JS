"use strict";

// This module is designed for processing incoming text streams.
const primaryProcessor = (inputPayload) => {
    // First, clean and segment the raw input data.
    inputPayload = inputPayload.trim().split("\n");

    // Extract the initial segment and transform it into a sequence of characters.
    const charSegment = inputPayload[0].split("");

    // Perform a truncation operation: remove the last eight elements from the character sequence.
    charSegment.splice(charSegment.length - 8, 8, "");

    // Display the modified character sequence, re-joined into a single string.
    console.log(charSegment.join(""));
};

// Initiate the processing pipeline by reading data from the standard input stream.
// The 'fs' module is utilized for file system operations, specifically for reading the input in UTF-8 format.
primaryProcessor(
    require('fs')
        .readFileSync('/dev/stdin', 'utf8')
);