function calculateLongestIncreasingSubsequence() {
    // This variable is initialized but its value is not directly used in the LIS computation.
    // It reflects a structural element from the original code.
    let firstElementPlusOne = inputNumbers[0] + 1;

    // 'lengthsOfSubsequences' will store the length of the longest increasing subsequence
    // ending at each corresponding index in the 'inputNumbers' array.
    const lengthsOfSubsequences = [];

    // The original code included a commented-out array for predecessor indices,
    // which is not needed for merely calculating the length of the LIS.
    // const predecessorTracker = [];

    // A critical step in this specific LIS algorithm: the first element of the
    // input array is modified to zero.
    inputNumbers[0] = 0;

    // Initialize the length of the LIS ending at the first position.
    lengthsOfSubsequences[0] = 0;

    // The predecessor tracker for the first element was also commented out.
    // predecessorTracker[0] = -1;

    // Iterate through the input array, starting from the second element (index 1).
    for (let outerIndex = 1; outerIndex < inputNumbers.length; outerIndex++) {
        // 'bestPreviousIndex' will keep track of the index of the element that
        // yields the longest increasing subsequence when extended by the current 'outerIndex' element.
        let bestPreviousIndex = 0;

        // Inner loop to compare the current element with all elements that precede it.
        for (let innerIndex = 0; innerIndex <= outerIndex - 1; innerIndex++) {
            // Check two conditions:
            // 1. The preceding element must be strictly smaller than the current element
            //    to form an increasing subsequence.
            // 2. The LIS ending at the 'innerIndex' must be longer than the LIS ending
            //    at the currently tracked 'bestPreviousIndex'.
            if (inputNumbers[innerIndex] < inputNumbers[outerIndex] && lengthsOfSubsequences[innerIndex] > lengthsOfSubsequences[bestPreviousIndex]) {
                bestPreviousIndex = innerIndex; // Update 'bestPreviousIndex' if a better predecessor is found.
            }
        }
        // The length of the LIS ending at 'outerIndex' is one more than the LIS
        // ending at the 'bestPreviousIndex' found.
        lengthsOfSubsequences[outerIndex] = lengthsOfSubsequences[bestPreviousIndex] + 1;

        // The predecessor tracker update was commented out in the original implementation.
        // predecessorTracker[outerIndex] = bestPreviousIndex;
    }

    // After iterating through all elements, the maximum value in 'lengthsOfSubsequences'
    // represents the overall length of the longest increasing subsequence.
    const maximumLength = Math.max.apply(null, lengthsOfSubsequences);

    // Output the computed maximum length to the standard console.
    console.log(maximumLength);
}

// Read the entire content of standard input as a UTF-8 string.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string:
// 1. Remove any leading or trailing whitespace.
// 2. Split the string into an array of substrings using the newline character as a delimiter.
// 3. Convert each substring in the array to a numerical value.
// This processed array of numbers is then used by the LIS calculation function.
const inputNumbers = (rawData.trim()).split("\n").map(Number);

// Invoke the function to calculate and print the LIS length.
calculateLongestIncreasingSubsequence();
