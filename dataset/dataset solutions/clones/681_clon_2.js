const fileSystemModule = require('fs'); // Import the file system module for input operations.

let rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8'); // Acquire all content from standard input, encoded as UTF-8.

let parsedLines = rawInputData.trim().split("\n"); // Sanitize the raw input: remove leading/trailing whitespace and segment into an array of lines.
let linePointer = 0; // Initialize an index to navigate through the array of input lines.

// Commence the primary processing cycle, which iterates indefinitely until a specific exit condition is encountered.
while (true) {
    // Deconstruct the current configuration line, converting space-separated values into numbers.
    let currentConfig = parsedLines[linePointer].split(" ").map(Number);
    linePointer++; // Progress the line index to point to the subsequent line.

    let numberOfItems = currentConfig[0]; // Extract the first parameter: count of data points for this test case.
    let sumThreshold = currentConfig[1]; // Extract the second parameter: the target sum value for comparison.

    // Evaluate the termination condition: both configuration parameters are zero.
    if (numberOfItems === 0 && sumThreshold === 0) {
        break; // Terminate the main processing loop.
    }

    let numericalCollection = []; // Allocate an empty array to store the numerical data for the current scenario.
    // Iterate to populate the numerical collection with the specified number of items.
    for (let primaryIndex = 0; primaryIndex < numberOfItems; primaryIndex++) {
        let parsedNumericValue = Number(parsedLines[linePointer]); // Transform the current input line string into a numerical type.
        linePointer++; // Advance the line index.
        numericalCollection.push(parsedNumericValue); // Append the converted number to the collection.
    }

    // Arrange the collected numbers in ascending order to optimize subsequent pair-finding logic.
    numericalCollection.sort(function(firstVal, secondVal) {
        return firstVal - secondVal;
    });

    let exceedingPairCounter = 0; // Initialize a tally for pairs whose aggregate value surpasses the threshold.

    // Begin the nested loop structure to identify relevant pairs within the sorted collection.
    for (let outerLoopIndex = 0; outerLoopIndex < numberOfItems; outerLoopIndex++) {
        // The inner loop starts from the element immediately following the outer loop's current element.
        for (let innerLoopIndex = outerLoopIndex + 1; innerLoopIndex < numberOfItems; innerLoopIndex++) {
            // Check if the sum of the pair (current outer element + current inner element) exceeds the defined limit.
            if (numericalCollection[outerLoopIndex] + numericalCollection[innerLoopIndex] > sumThreshold) {
                // Due to the sorted nature of the array, if this pair exceeds the threshold,
                // all subsequent pairs formed with `numericalCollection[outerLoopIndex]` and elements
                // from `innerLoopIndex` onwards will also exceed the threshold.
                exceedingPairCounter += numberOfItems - innerLoopIndex;
                break; // Exit the inner loop for the current `outerLoopIndex` as further checks are redundant.
            }
        }
    }
    console.log(exceedingPairCounter); // Display the computed count of pairs that exceed the sum threshold for this test case.
}