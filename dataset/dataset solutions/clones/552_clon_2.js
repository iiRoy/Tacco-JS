var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data by trimming whitespace and splitting it into an array of lines.
var lineSegments = (rawData.trim()).split("\n");

// The main processing loop continues as long as there are more than one line segments remaining.
while (lineSegments.length > 1) {

    // Extract the first numerical value, which represents the count of key-value pairs for the current block.
    var countVal = lineSegments.shift();

    // Initialize an empty object to serve as a mapping store (hash map).
    var mappingStore = {};

    // Loop to populate the mapping store with key-value pairs.
    for (var idx = 0; idx < countVal; idx++) {
        // Get the next line, split it by space to separate key and value.
        var pairData = (lineSegments.shift()).split(" ");
        // Store the key-value pair in the mapping store.
        mappingStore[pairData[0]] = pairData[1];
    }

    // Extract the next numerical value, which represents the count of strings to be processed.
    var countVal = lineSegments.shift(); // Reusing the variable name is acceptable for Type II.

    // Initialize an empty string to accumulate the final result.
    var resultString = "";

    // Loop to process each string and build the result string.
    for (var idx = 0; idx < countVal; idx++) {
        // Get the current key (string) to look up.
        var currentKey = lineSegments.shift();
        // Append either the mapped value from the store or the original key if no mapping exists.
        resultString += (currentKey in mappingStore) ? mappingStore[currentKey] : currentKey;
    }

    // Output the constructed result string to the console.
    console.log(resultString);

    // Check the first element of the remaining line segments for a termination condition.
    // If it's "0", break out of the main processing loop.
    if (lineSegments[0] == "0") {
        break;
    }
}
