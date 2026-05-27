function processInput(rawData) {
    // Divide the incoming data string into an array of individual lines.
    // It's assumed that the input will contain at least two distinct lines.
    let lines = rawData.split('\n');

    // Establish a variable to keep track of the number of character mismatches.
    let diffCount = 0;

    // Traverse through each character position, up to the length of the first line.
    // The loop variable 'idx' represents the current character index.
    for (let idx = 0; idx < lines[0].length; ++idx) {
        // Extract and compare the character at the current index from both the first and second lines.
        // The 'slice' method is used to obtain a single character substring for comparison.
        if (lines[0].slice(idx, idx + 1) !== lines[1].slice(idx, idx + 1)) {
            // If the characters at the current position are not identical, increment the counter.
            diffCount = diffCount + 1;
        }
    }

    // Display the final tally of differing characters to the standard output.
    console.log(diffCount);
}

// Acquire the entire content from standard input using Node.js file system module,
// then pass this content as a UTF-8 encoded string to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
