"use strict";

// This function serves as the primary entry point for processing input data.
const processInput = (inputString) => {
    // Trim leading/trailing whitespace and split the input into an array of lines.
    inputString = inputString.trim().split("\n");

    // Parse the first line to get the total number of elements.
    const elementCount = parseInt(inputString[0]);

    // Process the second line: split by space, convert to integers, and sort numerically.
    const sortedNumbers = inputString[1].split(" ").map(numStr => parseInt(numStr)).sort((valA, valB) => valA - valB);

    // Create a Set to easily get unique values from the sorted array.
    const uniqueValuesSet = new Set(sortedNumbers);
    // Convert the Set back to an array to iterate over distinct numbers.
    const distinctNumbers = [...uniqueValuesSet];

    // Initialize a variable to keep track of the maximum count found.
    let maximumCount = 0;

    // Iterate through each unique number present in the input.
    for (let idx in distinctNumbers) {
        // Initialize a counter for the current unique number's "neighbor" count.
        let currentCount = 0;

        // Iterate through all numbers in the original sorted array.
        for (let k = 0; k < elementCount; k++) {
            // Check if the absolute difference between the current number from the original array
            // and the current distinct number is 0 or 1.
            if (Math.abs(sortedNumbers[k] - distinctNumbers[idx]) <= 1) {
                // If they are neighbors (or the same), increment the counter.
                currentCount++;
            }
        }

        // If the current count is greater than the previously recorded maximum, update the maximum.
        if (currentCount > maximumCount) {
            maximumCount = currentCount;
        }
    }

    // Output the final maximum count to the console.
    console.log(maximumCount);
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
