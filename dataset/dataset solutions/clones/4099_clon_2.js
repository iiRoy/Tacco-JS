'use strict';

// This function serves as the primary entry point for processing the input data.
function ProcessInput(rawData) {
    // First, the raw input string is split by newline characters, and only the first line is taken.
    // Then, this first line is further split into an array of individual characters.
    const charArray = rawData.split("\n")[0].split("");

    // The character at the fourth position (index 3) in the array is modified to '8'.
    charArray[3] = "8";

    // Finally, the modified character array is joined back into a single string
    // and printed to the console.
    console.log(charArray.join(""));
}

// The program reads the entire content of standard input as a UTF-8 string
// and passes it to the ProcessInput function for processing.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
