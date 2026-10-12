"use strict";

// This function processes the provided text input.
const processInput = (inputData) => {
    // First, remove any leading/trailing whitespace and then
    // split the entire input string into an array of lines.
    inputData = inputData.trim().split("\n");

    // Take the first line of the processed input,
    // and split it further by the comma delimiter.
    const stringParts = inputData[0].split(",");

    // Finally, join the resulting parts with a space
    // and print the combined string to the console.
    console.log(stringParts.join(" "));
};

// Read the content from standard input synchronously,
// using UTF-8 encoding, and then pass it to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
