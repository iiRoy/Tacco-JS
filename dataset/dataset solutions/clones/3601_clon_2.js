'use strict';

// This function is designed to process an incoming string of data.
function ProcessInput(rawData) {
    // It parses the raw string, splitting it by spaces, and converts each segment into a numerical value.
    const parsedNumbers = rawData.split(" ").map(numStr => Number(numStr));
    // The function then computes a specific result based on the first two parsed numbers
    // and outputs this result to the console.
    console.log((parsedNumbers[0] - 1) * (parsedNumbers[1] - 1));
}

// The primary execution flow involves reading data from standard input
// and subsequently invoking the processing function with the acquired data.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
