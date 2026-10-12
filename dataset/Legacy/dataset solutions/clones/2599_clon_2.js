// This script processes input data to find a specific pattern.
function ProcessInput(rawData) {
    // The raw input string is split into individual lines.
    let processedLines = rawData.split("\n");

    // The first line contains the number of elements.
    const numElements = parseInt(processedLines[0], 10);

    // The second line contains space-separated height values.
    const heightsArray = processedLines[1].split(" ");

    // Initialize a counter for consecutive non-increasing elements.
    let currentConsecutiveDecreases = 0;

    // Initialize a variable to store the maximum count found.
    let maximumConsecutiveDecreases = currentConsecutiveDecreases;

    // Iterate through the height array, comparing adjacent elements.
    // The loop runs up to (numElements - 1) to avoid out-of-bounds access for heightsArray[idx + 1].
    for (let idx = 0; idx < (numElements - 1); ++idx) {
        // Check if the current height is greater than or equal to the next height.
        if (heightsArray[idx] >= heightsArray[idx + 1]) {
            // If it is, increment the consecutive decrease counter.
            currentConsecutiveDecreases++;
        } else {
            // If the sequence is broken (current height is less than the next), reset the counter.
            currentConsecutiveDecreases = 0;
        }

        // Update the maximum consecutive decreases if the current count is higher.
        if (currentConsecutiveDecreases > maximumConsecutiveDecreases) {
            maximumConsecutiveDecreases = currentConsecutiveDecreases;
        }
    }

    // Output the final maximum count to the console.
    console.log('%s', maximumConsecutiveDecreases);
}

// Do not modify the following line; it handles standard input/output.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
