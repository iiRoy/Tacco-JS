"use strict"; // Strict mode enabled for cleaner code execution

// Function to compute permutations (nPr)
const computeArrangements = (totalElements, selectedElements) => {
    let resultValue = 1.0; // Initialize product for permutation calculation

    // Loop from 0 up to selectedElements (exclusive)
    for (let idx = 0.0; idx < selectedElements; idx++) {
        resultValue *= totalElements - idx; // Multiply result by (n - i)
    }

    return resultValue; // Return the final permutation count
};

// Function to calculate combinations (nCr) using permutations
const calculateSelections = (totalItems, chosenItems) => {
    // nCr = nPr / rPr
    return computeArrangements(totalItems, chosenItems) / computeArrangements(chosenItems, chosenItems);
};

// Main processing function for input data
const processInputData = (inputStringData) => {
    // Clean and split the raw input string into an array of lines
    let processedLines = inputStringData.trim().split("\n");

    // Parse the first line as the total count (N)
    const elementCount = parseInt(processedLines[0], 10);

    // Parse the second line, split by space, convert to numbers, and sort in descending order
    const sortedNumbers = processedLines[1].split(" ").map(currentNumStr => parseInt(currentNumStr, 10)).sort((itemA, itemB) => itemB - itemA);

    // Calculate the midpoint based on the largest number
    let midpointValue = sortedNumbers[0] / 2.0;

    // Initialize minimum difference to a very large number
    let minimumDifference = Number.MAX_VALUE;

    // Variable to store the element closest to the midpoint
    let closestElement;

    // Iterate through the sorted numbers to find the one closest to the midpoint
    for (let arrayIndex in sortedNumbers) {
        // Calculate the absolute difference between the midpoint and the current array element
        const absoluteDeviation = Math.abs(midpointValue - sortedNumbers[arrayIndex]);

        // If the current absolute difference is smaller than the minimum found so far
        if (absoluteDeviation < minimumDifference) {
            closestElement = sortedNumbers[arrayIndex]; // Update the closest element
            minimumDifference = absoluteDeviation; // Update the minimum difference
        }
    }

    // Output the largest number and the number closest to its half
    console.log(sortedNumbers[0] + " " + closestElement);
};

// Execute the main processing function with data read from standard input
processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));