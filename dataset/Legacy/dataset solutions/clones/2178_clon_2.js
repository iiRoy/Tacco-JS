/*
 * This module defines a function to process numerical data
 * from standard input, applying a sliding window algorithm.
 */
function ProcessInput(rawData) {
    // Divide the incoming raw string into an array of separate lines.
    const lines = rawData.split('\n');

    // Extract the first line, split it by space, and convert parts to numbers.
    // The first number is the total count of items, the second is the window length.
    const [countElements, windowLength] = lines[0].split(' ').map(Number);

    // Take the second line, split it, and transform each segment into a number.
    // This forms the primary array of numerical values.
    const valuesArray = lines[1].split(' ').map(Number);

    // Initialize a variable to store the maximum sum found during the sliding window process.
    // Note: This variable will only capture sums from the *sliding* phase, not the initial window.
    let maximumSumFound = 0;

    // Calculate the sum of the initial window (first 'windowLength' elements).
    // This sum is used as the starting point for the sliding window.
    let currentWindowTotal = 0;
    for (let loopIndex = 0; loopIndex < windowLength; loopIndex++) {
        currentWindowTotal += valuesArray[loopIndex];
    }

    /*
     * Now, iterate through the rest of the array,
     * maintaining a sliding window of 'windowLength' elements.
     * For each step, update the current window total and
     * check if it's the new maximum sum encountered.
     */
    for (let loopIndex = windowLength; loopIndex < valuesArray.length; loopIndex++) {
        // Add the new element entering the window from the right.
        currentWindowTotal += valuesArray[loopIndex];
        // Subtract the element leaving the window from the left.
        currentWindowTotal -= valuesArray[loopIndex - windowLength];

        // If the current window's total exceeds the previously recorded maximum,
        // update the maximum sum.
        if (maximumSumFound < currentWindowTotal) {
            maximumSumFound = currentWindowTotal;
        }
    }

    // Perform a final arithmetic operation on the maximum sum found.
    // This calculation is part of the problem's specific requirements.
    maximumSumFound = (maximumSumFound + windowLength) / 2;

    // Display the final computed result to the standard output.
    console.log(maximumSumFound);
}

// Execute the main processing function.
// It reads data from standard input, decodes it as UTF-8,
// and removes any leading or trailing whitespace before passing it.
ProcessInput(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
        .trim()
);
