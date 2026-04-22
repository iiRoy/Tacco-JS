/*
 * This script processes input from stdin to find common elements.
 * It reads two lists of numbers and counts how many numbers from the second list
 * are present in the first list.
 */

// Read raw data from the standard input file path
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the raw input into an array of lines after trimming whitespace
let lineSegments = rawData.trim().split("\n");

// Parse the second line (index 1) into an array of numbers
let firstSet = lineSegments[1].split(" ").map(Number);

// Parse the fourth line (index 3) into another array of numbers
let secondSet = lineSegments[3].split(" ").map(Number);

// Initialize a counter for matching elements
let matchCount = 0;

// Iterate through each element in the second array
secondSet.forEach(function (currentElement) {
    // Check if the current element exists in the first array
    if (firstSet.indexOf(currentElement) !== -1) {
        // Increment the counter if a match is found
        matchCount++;
    }
});

// Output the final count of matches to the console
console.log(matchCount);