function ProcessInput(rawData) {
    // The raw input string is split into an array of lines.
    let linesArray = rawData.split("\n");

    // Output specific characters from the first three lines.
    // This concatenates the character at index 0 of the first line,
    // the character at index 1 of the second line,
    // and the character at index 2 of the third line.
    console.log("%s%s%s", linesArray[0][0], linesArray[1][1], linesArray[2][2]);
}

// Read the entire content of standard input as a UTF-8 string
// and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
