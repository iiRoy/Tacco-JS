/*
 * This module is responsible for processing a specific type of textual input.
 * It identifies common elements between two sets of numbers.
 */
function ProcessInput(rawData) {
    // Break down the raw input string into an array of lines,
    // first trimming any leading/trailing whitespace from the entire input.
    const linesOfText = rawData
        .trim()
        .split("\n");

    // Extract the second line (index 1), split it by spaces,
    // and convert each part to a number, then store them in a Set
    // for efficient lookup of unique elements.
    const uniqueElements = new Set(
        linesOfText[1]
            .split(" ")
            .map(Number)
    );

    // Get the fourth line (index 3), split it by spaces,
    // and convert each part to a number. These are the items
    // we will iterate through to check for presence in 'uniqueElements'.
    const searchCandidates = linesOfText[3]
        .split(" ")
        .map(Number);

    // Initialize a counter to track the number of matches found.
    let matchCount = 0;

    // Loop through the 'searchCandidates' up to the specified total checks
    // which is provided on the third line (index 2) of the input.
    for (
        let idx = 0;
        idx < parseInt(linesOfText[2], 10); // Explicit radix for safety.
        ++idx
    ) {
        // If the current candidate from 'searchCandidates' is found
        // within the 'uniqueElements' set, increment the match counter.
        if (
            uniqueElements.has(
                searchCandidates[idx]
            )
        ) {
            matchCount++; // Increment the counter for a successful match.
        }
    }

    // Output the final count of matched items to the standard console.
    console
        .log(
            matchCount
        );
}

// Entry point: Read data from standard input asynchronously
// and then pass it to our processing function.
ProcessInput(
    require("fs")
        .readFileSync(
            "/dev/stdin",
            "utf8"
        )
);