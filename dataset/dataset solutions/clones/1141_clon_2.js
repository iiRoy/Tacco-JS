function calculateLongestIncreasingSubsequence() {
    // Determine the effective size for initialization based on the first element of the sequence.
    // This assumes the first element of 'numericSequence' holds a count or a related value.
    let sequenceSize = numericSequence[0] + 1;

    // Initialize an array to store the length of the longest increasing subsequence ending at each index.
    let currentLengths = [];
    // Initialize an array to store the predecessor index for each element in the LIS.
    let predecessorMap = [];

    // Populate both arrays with initial zero values.
    for (let currentIndex = 0; currentIndex < sequenceSize; currentIndex++) {
        currentLengths.push(0);
        predecessorMap.push(0);
    }

    // Special handling for the initial element of the numeric sequence.
    // It's set to zero, potentially acting as a sentinel or base case.
    numericSequence[0] = 0;
    // The predecessor of the first element is set to -1, indicating no prior element.
    predecessorMap[0] = -1;

    // Iterate through the numeric sequence starting from the second element.
    // This loop calculates the LIS length for each element.
    for (let currentIndex = 1; currentIndex < numericSequence.length; currentIndex++) {
        // Initialize 'bestPreviousIndex' to 0. This will track the index of the element
        // that yields the longest increasing subsequence ending before 'currentIndex'.
        let bestPreviousIndex = 0;

        // Inner loop to compare the current element with all preceding elements.
        for (let previousIndex = 0; previousIndex <= currentIndex - 1; previousIndex++) {
            // Check two conditions to find a suitable predecessor:
            // 1. The previous element must be strictly smaller than the current element
            //    to maintain the increasing subsequence property.
            // 2. The LIS length ending at 'previousIndex' must be greater than the LIS length
            //    ending at the current 'bestPreviousIndex'.
            if (numericSequence[previousIndex] < numericSequence[currentIndex] && currentLengths[previousIndex] > currentLengths[bestPreviousIndex]) {
                bestPreviousIndex = previousIndex; // Update 'bestPreviousIndex' if a better predecessor is found.
            }
        }

        // The LIS length ending at 'currentIndex' is 1 plus the LIS length ending at its 'bestPreviousIndex'.
        currentLengths[currentIndex] = currentLengths[bestPreviousIndex] + 1;
        // Store the index of the best predecessor for the current element.
        predecessorMap[currentIndex] = bestPreviousIndex;
    }

    // After processing all elements, find the maximum value in the 'currentLengths' array.
    // This maximum value represents the overall length of the Longest Increasing Subsequence.
    let finalMaxLen = Math.max.apply(null, currentLengths);

    // Output the computed maximum length to the console.
    console.log(finalMaxLen);
}

// Read raw input data from standard input.
// The 'fs' module is used for file system operations, and '/dev/stdin' is a common path for standard input.
let rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input:
// 1. Remove any leading or trailing whitespace using 'trim()'.
// 2. Split the string into an array of strings based on newline characters using 'split("\n")'.
// 3. Convert each string in the array to a number using 'map(Number)'.
// The resulting array of numbers is stored in 'numericSequence'.
let numericSequence = (rawInputData.trim()).split("\n").map(Number);

// Invoke the function to calculate and print the Longest Increasing Subsequence length.
calculateLongestIncreasingSubsequence();
