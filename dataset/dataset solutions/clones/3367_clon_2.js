function ProcessInput(rawData) {
    // This line checks for occurrences of the digit '2' in the input string.
    // If no matches are found, it outputs 0; otherwise, it outputs the array of matches.
    console.log((rawData.match(/2/g) === null) ? 0 : rawData.match(/2/g));
}

// Initiate the processing by reading the entire content from standard input as a UTF-8 string.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
