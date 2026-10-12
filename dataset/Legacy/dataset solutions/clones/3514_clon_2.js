const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the raw input into individual lines
const dataRows = rawData.split('\n');

// Parse the total number of elements from the first line
let totalElements = dataRows[0].trim() - 0;

// Parse the array of element values from the second line
let elementValues = dataRows[1].trim().split(' ').map(Number);

// Initialize objects to store frequency counts for even and odd indexed elements
const evenCounts = {};
const oddCounts = {};

// Iterate through the element values, processing even and odd indices separately
for (let idx = 0; idx < totalElements; idx += 2) {
    // Increment count for the element at the even index
    evenCounts[elementValues[idx]] = evenCounts[elementValues[idx]] ? evenCounts[elementValues[idx]] + 1 : 1;
    // Increment count for the element at the odd index
    oddCounts[elementValues[idx + 1]] = oddCounts[elementValues[idx + 1]] ? oddCounts[elementValues[idx + 1]] + 1 : 1;
}

// Convert the even counts object into an array of [value, frequency] pairs
const evenFreqList = [];
for (let itemKey in evenCounts) {
    evenFreqList.push([itemKey, evenCounts[itemKey]]);
}

// Convert the odd counts object into an array of [value, frequency] pairs
const oddFreqList = [];
for (let entryKey in oddCounts) {
    oddFreqList.push([entryKey, oddCounts[entryKey]]);
}

// Sort both frequency lists in descending order based on frequency
evenFreqList.sort((firstPair, secondPair) => secondPair[1] - firstPair[1]);
oddFreqList.sort((firstPair, secondPair) => secondPair[1] - firstPair[1]);

// Initialize a variable to store the maximum possible sum of frequencies
let maxCommonFreq = 0;

// Check if the most frequent elements from even and odd positions are different
if (evenFreqList[0][0] !== oddFreqList[0][0]) {
    // If they are different, simply sum their frequencies
    maxCommonFreq = evenFreqList[0][1] + oddFreqList[0][1];
} else {
    // If they are the same, we need to consider the second most frequent element from one of the lists
    maxCommonFreq = Math.max(
        // Option 1: Use the most frequent even element and the second most frequent odd element (if available)
        evenFreqList[0][1] + (oddFreqList[1] ? oddFreqList[1][1] : 0),
        // Option 2: Use the second most frequent even element (if available) and the most frequent odd element
        (evenFreqList[1] ? evenFreqList[1][1] : 0) + oddFreqList[0][1]
    );
}

// Output the result: total elements minus the maximum common frequency
console.log(totalElements - maxCommonFreq);
