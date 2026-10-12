function ProcessInput(rawData) {
    // Split the entire input string into an array of individual lines.
    rawData = rawData.split("\n");

    // Parse the first line to get the number of elements (numElements) and the number of pairs (numPairs).
    // The '- 0' converts the string parts to numbers.
    const numElements = rawData[0].split(' ')[0] - 0;
    const numPairs = rawData[0].split(' ')[1] - 0;

    let currentLineParts; // A temporary variable to hold parts of a line.

    // Initialize a boolean array to keep track of seen elements.
    // Its size is numElements + 1 because element indices typically start from 1.
    let elementTracker = new Array(numElements + 1);
    elementTracker.fill(false); // Initially, no elements have been seen.

    // Iterate through the input data to process the element pairs.
    // The loop starts from index 1 and increments by 2 to skip the first line and process every other line.
    for (let idx = 1; idx <= numPairs * 2; idx += 2) {
        // Split the current line by space. The map function here effectively just converts elements to strings (no actual transformation).
        currentLineParts = rawData[idx].split(' ').map(item => { return item; });
        // For each element in the current line, mark its corresponding position in the tracker array as true.
        currentLineParts.forEach(item => { elementTracker[item] = true; });
    }

    let resultCount = 0; // Initialize a counter for elements that were NOT marked.

    // Go through the elementTracker array.
    elementTracker.forEach(item => {
        // If an element's value is false (meaning it was not marked as seen),
        if (!item) {
            resultCount++; // Increment the counter.
        }
    });

    // Output the final count, subtracting one as per the problem's specific requirement.
    console.log(resultCount - 1);
}

// This section handles reading input from standard input and invoking the main processing function.
// It is typically part of the execution environment and should not be altered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
