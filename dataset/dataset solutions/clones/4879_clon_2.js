function processInput(dataLines) {
    // Obtain the first line of input and convert it into an array of individual characters.
    let charArray = dataLines[0].split("");

    // Initialize a counter to keep track of adjacent character differences.
    let diffCount = 0;

    // Iterate through the character array, starting from the second element (index 1).
    // This allows comparison with the preceding character.
    for (let idx = 1; idx < charArray.length; idx++) {
        // Check if the current character is different from the character immediately before it.
        if (charArray[idx - 1] !== charArray[idx]) {
            // If a difference is found, increment the counter.
            diffCount++;
        }
    }

    // Print the final calculated count of differences to the console.
    console.log(diffCount);
}

// Read the entire content from standard input, decode it as UTF-8,
// remove leading/trailing whitespace, and then split it into an array of lines.
// This array of lines is then passed to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
