function computeMaxIncreasingSubsequence() {
    // Determine the total count of numbers including a sentinel
    let elementCount = dataSequence.shift() + 1;

    // Add an initial placeholder to the front of the sequence for easier processing
    dataSequence.unshift(0);

    // Array to store the maximum length of an increasing subsequence ending at each position
    let currentLengths = [];

    // Array to store the index of the predecessor element in the longest increasing subsequence
    let previousElements = [];

    // Initialize both arrays with zeros for all anticipated positions
    for (let position = 0; position < elementCount; position++) {
        currentLengths.push(0);
        previousElements.push(0);
    }

    // The first actual element has no predecessor in a subsequence, so set its pointer to -1
    previousElements[0] = -1;

    // Iterate through the input sequence starting from the second element (index 1)
    for (let currentItemIndex = 1; currentItemIndex < dataSequence.length; currentItemIndex++) {
        // Initialize the index of the best preceding element for the current position
        let bestPreviousIndex = 0; // This will store the index of the element that allows the longest valid subsequence ending here

        // Iterate through all elements that come before the current one
        for (let pastItemIndex = 0; pastItemIndex <= currentItemIndex - 1; pastItemIndex++) {
            // Check if the past element is smaller than the current element AND
            // if using the past element results in a longer subsequence than the current best
            if (dataSequence[pastItemIndex] < dataSequence[currentItemIndex] && currentLengths[pastItemIndex] > currentLengths[bestPreviousIndex]) {
                bestPreviousIndex = pastItemIndex; // Update the best predecessor index
            }
        }

        // The length of the longest increasing subsequence ending at currentItemIndex is
        // one more than the length of the LIS ending at the bestPreviousIndex
        currentLengths[currentItemIndex] = currentLengths[bestPreviousIndex] + 1;

        // Store the index of the best predecessor for potential reconstruction later
        previousElements[currentItemIndex] = bestPreviousIndex;
    }

    // Find the maximum value in the currentLengths array, which represents the overall longest increasing subsequence length
    let finalMaxLen = Math.max.apply(null, currentLengths);

    // Display the computed maximum length
    console.log(finalMaxLen);
}

// Use Node.js file system module to read input from standard input
let fileContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace, split by newlines, and convert each part to a number
let dataSequence = (fileContent.trim()).split('\n').map(Number);

// Execute the main function to find the longest increasing subsequence
computeMaxIncreasingSubsequence();