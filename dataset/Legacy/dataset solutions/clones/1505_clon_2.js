const processInput = (inputData) => {
    // The first line of the input string represents the total number of entries.
    let numEntries = inputData.split("\n")[0];

    // Subsequent lines contain the actual data, so we remove the first line.
    inputData = inputData.split("\n").splice(1);

    // Extract the first component (before the space) from each data line.
    let firstValues = inputData.map(currentLine => currentLine.split(" ")[0]);

    // Extract the second component (after the space) from each data line.
    let secondValues = inputData.map(currentLine => currentLine.split(" ")[1]);

    // Initialize a counter to track consecutive occurrences where firstValue equals secondValue.
    let consecutiveMatches = 0;

    // A boolean flag to indicate if we have found at least three consecutive matches.
    let foundTripleMatch = false;

    // Iterate through each entry based on the total number of entries.
    for (let idx = 0; idx < numEntries; idx++) {
        // Compare the current first value with the current second value.
        if (firstValues[idx] === secondValues[idx]) {
            // If they are identical, increment the consecutive match counter.
            consecutiveMatches++;
            // Check if the counter has reached or exceeded three.
            if (consecutiveMatches >= 3) {
                // If so, set the flag to true, indicating a triple match was found.
                foundTripleMatch = true;
            }
        } else {
            // If the values do not match, reset the consecutive match counter.
            consecutiveMatches = 0;
        }
    }

    // Output "Yes" if a sequence of three or more identical pairs was found, otherwise "No".
    console.log(foundTripleMatch ? "Yes" : "No");
};

// Read the entire content from standard input, assuming UTF-8 encoding, and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
