// This module defines a function to process textual data from standard input.
function processData(rawData) {
    // The incoming raw string is first broken down into individual lines.
    // Each line becomes an element in the 'processedLines' array.
    let processedLines = rawData.split("\n");

    // We then create a new array by excluding the very first line.
    // The 'slice' method extracts elements from index 1 up to the end of the array.
    processedLines = processedLines.slice(1, processedLines.length + 1);

    // To find the count of distinct entries, we filter the array.
    // The 'filter' method creates a new array containing only elements
    // that satisfy the provided testing function.
    const uniqueEntries = processedLines.filter((currentItem, currentIndex, sourceArray) => {
        // An element is considered unique (for this purpose) if its first occurrence
        // within the 'sourceArray' is at its current 'currentIndex'.
        return sourceArray.indexOf(currentItem) === currentIndex;
    });

    // Finally, the total number of unique entries is converted to an integer
    // and displayed on the console.
    console.log(parseInt(uniqueEntries.length));
}

// The main execution flow involves reading the entire content of standard input
// as a UTF-8 encoded string and then passing it to our data processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
