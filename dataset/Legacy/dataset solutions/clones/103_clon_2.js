let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input from standard input stream
let lineSegments = rawData.trim().split("\n"); // Process the raw input: remove whitespace, then split into an array of lines

// Iterate through the processed lines, handling two lines at a time for each game scenario
for (let outerIndex = 0; outerIndex < lineSegments.length; outerIndex += 2) {
    // Convert the first line of the current pair into an array of numbers
    const firstSequence = lineSegments[outerIndex].split(" ").map(Number);
    // Convert the second line of the current pair into an array of numbers
    const secondSequence = lineSegments[outerIndex + 1].split(" ").map(Number);

    let exactMatches = 0; // Initialize counter for numbers that are correct in both value and position
    let partialMatches = 0; // Initialize counter for numbers that are correct in value but wrong in position

    // Compare the elements of the two sequences, assuming a fixed length of 4
    for (let innerIndex = 0; innerIndex < 4; innerIndex++) {
        // Check if the numbers at the current position are identical
        if (firstSequence[innerIndex] === secondSequence[innerIndex]) {
            exactMatches++; // Increment the exact matches counter
        }
        // If not an exact match, check if the number from the second sequence exists anywhere in the first sequence
        else if (firstSequence.indexOf(secondSequence[innerIndex]) !== -1) {
            partialMatches++; // Increment the partial matches counter
        }
    }
    // Output the calculated exact matches and partial matches for the current game scenario
    console.log(exactMatches + " " + partialMatches);
}
