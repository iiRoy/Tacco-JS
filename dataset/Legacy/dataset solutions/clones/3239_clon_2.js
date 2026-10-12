function ProcessInput(rawData) {
    // Trim any leading or trailing whitespace from the raw input data.
    rawData = rawData.trim();

    // Split the input by newline characters to get individual lines.
    // The first line contains the length of the strings.
    let stringLength = parseInt(rawData.split("\n")[0]);

    // The subsequent lines contain the three strings to compare.
    let firstString = rawData.split("\n")[1];
    let secondString = rawData.split("\n")[2];
    let thirdString = rawData.split("\n")[3];

    // Initialize a counter for differences.
    let diffCounter = 0;

    // Check for an early exit condition: if all three strings are identical.
    if (firstString === secondString && secondString === thirdString) {
        // If they are all the same, no differences, so print 0 and exit.
        console.log(diffCounter);
        return;
    }

    // Iterate through each character position of the strings.
    for (let idx = 0; idx < stringLength; idx++) {
        // Extract the character at the current index from each string.
        let charA = firstString.slice(idx, idx + 1);
        let charB = secondString.slice(idx, idx + 1);
        let charC = thirdString.slice(idx, idx + 1);

        // Check the character equality at the current position.
        if (charA === charB && charB === charC) {
            // If all three characters are identical, move to the next position.
            continue;
        } else if (charA !== charB && charB !== charC && charA !== charC) {
            // If all three characters are different from each other,
            // it means two changes are needed to make them all the same.
            diffCounter += 2;
        } else {
            // If exactly two characters are the same and one is different,
            // only one change is needed.
            diffCounter++;
        }
    }

    // Output the final calculated number of differences.
    console.log(diffCounter);
}

// Read the entire content of standard input synchronously and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
