function ProcessInput(rawData) {
    // Split the raw input string into an array of lines using the newline character.
    let linesOfText = rawData.split("\n");

    // Extract the first line as the first string.
    var firstString = linesOfText[0];

    // Extract the second line as the second string.
    var secondString = linesOfText[1];

    // Iterate through a sequence of indices to interleave characters.
    // The loop runs for a total number of iterations equal to the combined length of both strings.
    for (let idx = 0; idx < firstString.length + secondString.length; idx++) {
        // Check if the current index is an even number.
        if (idx % 2 === 0) {
            // If even, print a character from the first string.
            // The index for the first string is half of the current loop index.
            console.log(firstString[idx / 2]);
        } else {
            // If odd, print a character from the second string.
            // The index for the second string is also half of the current loop index (integer division).
            console.log(secondString[idx / 2]);
        }
    }
}

// Read input from standard input asynchronously and then process it.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
