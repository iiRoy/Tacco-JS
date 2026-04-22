// This function serves as the primary entry point for processing textual input.
// It analyzes numeric data to determine if a specific condition is met based on differences after sorting.
function ProcessInput(rawData) {
    // The incoming raw text is first segmented into individual lines.
    // The first line typically contains metadata (like element count),
    // and subsequent lines hold the actual data for analysis.
    const processedLines = rawData.split("\n");

    // Extract the numerical count of elements from the very first line of the input.
    // This value, though initially a string, will be implicitly converted to a number
    // when used in numeric contexts (e.g., loop conditions).
    let elementCount = processedLines[0];

    // The second line of the input contains a space-separated sequence of numbers.
    // These are parsed into an array of actual numeric values.
    // This array will be manipulated (sorted) later.
    const numericValues = processedLines[1]
                                 .split(" ")
                                 .map(Number);

    // A separate, identical copy of the numeric values from the second line is created.
    // This copy preserves the original ordering of the elements, which is crucial
    // for comparing against the sorted version.
    const originalOrder = processedLines[1]
                                 .split(" ")
                                 .map(Number);

    // Initialize a counter to track the number of discrepancies found
    // between the sorted and original sequences.
    let differenceCounter = 0;

    // Perform an in-place sort on the 'numericValues' array.
    // By default, JavaScript's sort() converts elements to strings and sorts them lexicographically.
    numericValues.sort();

    // Iterate through both the sorted and original arrays, comparing elements at corresponding indices.
    // The loop runs for the number of elements specified on the first input line.
    for (let idx = 0; idx < elementCount; idx++) {
        // If an element in the sorted array does not match the element at the same position
        // in the original array, it indicates a difference.
        if (numericValues[idx] !== originalOrder[idx]) {
            differenceCounter++; // Increment the counter for each detected difference.
        }
    }

    // Based on the total number of differences, a final decision is made.
    // If the count of differences is two or less, the outcome is "YES"; otherwise, it's "NO".
    const finalResult = (differenceCounter <= 2) ? "YES" : "NO";

    // Output the determined result to the standard console.
    console.log(finalResult);
}

// Execute the main processing function by feeding it content from standard input.
// The 'fs' (file system) module is utilized to read the entire file synchronously
// from '/dev/stdin' and interpret its content as UTF-8 encoded text.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));