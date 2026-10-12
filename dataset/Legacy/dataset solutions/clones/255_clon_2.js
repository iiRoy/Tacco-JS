let sourceData = []; // Array to hold the processed input segments.
let frequencyMap = []; // This array will store the counts of each number.

// The 'input' variable is assumed to be provided from an external source,
// similar to reading from stdin.
sourceData = input.split(/,\d+\n{0,}/); // Split the raw input string based on a specific pattern.

let segmentCount = sourceData.length; // Determine the total number of input segments.
let currentNumericValue; // A temporary variable to hold the integer value of a segment.
let finalOutputString = ""; // An accumulator string for the results.

// Loop through the input segments, excluding the last one if it's empty or incomplete.
for (let segmentIndex = 0; segmentIndex < segmentCount - 1; segmentIndex++) {
    currentNumericValue = parseInt(sourceData[segmentIndex]); // Convert the current segment to an integer.

    // Check if this numeric value has been encountered before in our frequency map.
    if (frequencyMap[currentNumericValue] === undefined) {
        frequencyMap[currentNumericValue] = 1; // If not, initialize its count to 1.
    } else {
        frequencyMap[currentNumericValue]++; // If yes, increment its existing count.
    }
}

// Update the segmentCount to reflect the length of the frequency map,
// which represents the highest number encountered plus one.
segmentCount = frequencyMap.length;

// Iterate through the frequency map to find numbers that appeared more than once.
for (let mapIndex = 0; mapIndex < segmentCount; mapIndex++) {
    // If an entry exists and its count is greater than 1, append it to the output string.
    if (frequencyMap[mapIndex] !== undefined && frequencyMap[mapIndex] > 1) {
        finalOutputString += (mapIndex + ' ' + frequencyMap[mapIndex] + '\n');
    }
}

// Print the accumulated result string to the console.
console.log(finalOutputString);
