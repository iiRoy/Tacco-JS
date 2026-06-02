'use strict';

// This function processes the incoming text data.
const processInput = (inputString) => {
    // Split the entire input into individual lines, removing any leading/trailing whitespace.
    const lines = inputString.trim().split("\n");

    // Extract the window size from the first line.
    // The window size is the second element after splitting by space.
    let windowSize = lines[0].split(' ')[1];

    // Parse the data points from the second line.
    // Each element is converted to a number.
    let dataPoints = lines[1].split(' ').map(val => Number(val));

    // Initialize an array to store the sums of sliding windows.
    let windowSums = [];

    // Calculate prefix sums for efficient window sum computation.
    // The first element is just the first data point.
    let prefixSums = [dataPoints[0]];
    // Iterate through the rest of the data points to build the prefix sum array.
    for (let idx = 1; idx < dataPoints.length; idx++) {
        prefixSums.push(prefixSums[idx - 1] + dataPoints[idx]);
    }

    // The sum of the first window (of size windowSize) is directly available from prefixSums.
    windowSums.push(prefixSums[windowSize - 1]);

    // Calculate sums for subsequent sliding windows.
    // For each window, subtract the prefix sum of the element just before the window start
    // from the prefix sum of the window end.
    for (let jdx = 0; jdx < dataPoints.length - windowSize; jdx++) {
        windowSums.push(prefixSums[jdx + Number(windowSize)] - prefixSums[jdx]);
    }

    // Initialize a dynamic programming array, starting with zero.
    let dynamicProgression = [0];
    // Populate the DP array: each element is the sum of previous element and its index.
    // This calculates cumulative sums up to 1000.
    for (let counter = 1; counter <= 1000; counter++) {
        dynamicProgression.push((dynamicProgression[counter - 1] + counter));
    }

    // Output a simple message to the console.
    console.log('hi');
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
