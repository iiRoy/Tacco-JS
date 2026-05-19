function ProcessInput(rawData) {
    // Split the entire input string by newline characters to get individual lines.
    let processedLines = rawData.split("\n");

    // The first line contains the count of items, stored as a string.
    const itemCount = processedLines[0];

    // The second line contains space-separated numeric values.
    // Parse these into an array of numbers for sorting.
    let sortedValues = processedLines[1].split(" ").map(Number);
    // Create a separate copy to retain the original order for comparison.
    const originalValues = processedLines[1].split(" ").map(Number);

    // Initialize a counter for elements that are out of place.
    let mismatchCount = 0;

    // Sort the 'sortedValues' array.
    // JavaScript's default sort converts elements to strings and sorts lexicographically.
    // This behavior is preserved from the original code.
    sortedValues.sort();

    // Iterate through the arrays from the first element up to the item count.
    for (let idx = 0; idx < itemCount; idx++) {
        // Compare the element at the current index in the sorted array
        // with the element at the same index in the original array.
        if (sortedValues[idx] !== originalValues[idx]) {
            // If they do not match, increment the mismatch counter.
            mismatchCount++;
        }
    }

    // Determine the final result string based on the total number of mismatches.
    // If the count of mismatches is 2 or less, the result is "YES", otherwise "NO".
    const resultString = (mismatchCount <= 2) ? "YES" : "NO";

    // Output the final determination to the console.
    console.log(resultString);
}

// Read the entire content from standard input as a UTF-8 string
// and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
