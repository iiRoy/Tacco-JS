function ProcessData(rawData) {
    // The raw input string is split into an array of lines.
    let processedInput = rawData.split("\n");

    // The first line of input is assigned to a variable.
    var firstString = processedInput[0];
    // The second line of input is assigned to another variable.
    var secondString = processedInput[1];

    // A loop iterates through a combined length of both strings.
    for (let idx = 0; idx < firstString.length + secondString.length; idx++) {
        // Check if the current index is an even number.
        if (idx % 2 === 0) {
            // If even, print a character from the first string.
            console.log(firstString[idx / 2]);
        } else {
            // If odd, print a character from the second string.
            console.log(secondString[idx / 2]);
        }
    }
}

// Read content from standard input and pass it to the main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
