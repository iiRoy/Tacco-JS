/*
 * This module processes raw data to determine an optimal value.
 * It simulates a scenario where elements are picked from two distinct sets.
 */
function ExecuteLogic(rawData) {
    // Clean and split the input string into individual configuration lines.
    const parsedLines = rawData .  trim() .  split ('\n') ;

    // The first line indicates the total number of processing stages.
    const totalIterations = Number(parsedLines[0]);

    // The second line contains space-separated values for the 'top' collection.
    const topRowValues = parsedLines[1].split(' ');

    // The third line contains space-separated values for the 'bottom' collection.
    const bottomRowValues = parsedLines[2].split(' ');

    // Initialize the variable to store the highest value found so far.
    let maximumAcquired = 0;

    // Iterate through each possible division point for the 'top' collection.
    for ( let currentTopIndex = 0 ; currentTopIndex < totalIterations ; currentTopIndex++ ) {
        // Calculate the corresponding number of elements to take from the 'bottom' collection.
        let remainingBottomElements = totalIterations - currentTopIndex - 1;

        // Initialize a temporary sum for the current combination of elements.
        let currentCollection = 0;

        // Sum values from the 'top' collection up to the current index.
        for ( let idx = 0 ; idx <= currentTopIndex ; idx++ ) {
            currentCollection += parseInt(topRowValues[idx]);
        }

        // Sum values from the 'bottom' collection, starting from an offset.
        for ( let idx = 0 ; idx <= remainingBottomElements ; idx++ ) {
            currentCollection += parseInt(bottomRowValues[currentTopIndex + idx]);
        }

        // Update the maximum acquired value if the current collection is greater.
        if ( maximumAcquired < currentCollection ) {
            maximumAcquired = currentCollection;
        }
    }

    // Output the final computed maximum value.
    console.log(maximumAcquired);
}

// Entry point: Read input from standard input and pass it to the main function.
ExecuteLogic(require("fs").readFileSync("/dev/stdin", "utf8"));