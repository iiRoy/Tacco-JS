function ProcessInput (rawData) {
    // Split the raw input string into an array of lines
    var linesOfText = rawData.trim().split("\n");

    // Create a Set from the second line of input (index 1),
    // converting space-separated numbers to actual numbers.
    var uniqueNumbersCollection = new Set(linesOfText[1].split(" ").map(Number));

    // Parse the fourth line of input (index 3) into an array of numbers.
    var queryValues = linesOfText[3].split(" ").map(Number);

    // Initialize a counter for matching elements.
    var matchCount = 0;

    // The third line (index 2) contains the count of elements to iterate over.
    // Loop through the query values up to the specified count.
    for (var idx = 0; idx < parseInt(linesOfText[2]); idx++) {
        // Check if the current query value exists in our set of unique numbers.
        if (uniqueNumbersCollection.has(queryValues[idx])) {
            // If it exists, increment the match counter.
            matchCount++;
        }
    }

    // Output the final count of matches to the console.
    console.log(matchCount);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
