var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var lineSegments = (rawData.trim()).split("\n");

// Extract the initial count from the first line
var initialCount = lineSegments.shift();

// Initialize a data structure to store aggregated values
var dataMap = {};

// Iterate through the remaining lines to populate the data map
for (var idx = 0; idx < initialCount; idx++) {
    // Split each line into its components
    var currentPair = lineSegments[idx].split(" ");
    var keyPart = currentPair[0];

    // If the key doesn't exist in the map, initialize its value
    if (!dataMap.hasOwnProperty(keyPart)) {
        dataMap[keyPart] = 0;
    }

    // Add the numeric part to the corresponding key's value
    dataMap[keyPart] += currentPair[1] - 0;
}

// Collect all unique keys from the data map
var sortedKeys = [];
for (var mapEntry in dataMap) {
    sortedKeys.push(mapEntry);
}

// Define a custom comparison function for string length
function compareLengths(firstStr, secondStr) {
    if (firstStr.length > secondStr.length) {
        return 1;
    }
    if (firstStr.length < secondStr.length) {
        return -1;
    }
    return 0;
}

// Sort the keys alphabetically first
sortedKeys.sort();

// Then sort them by string length using the custom comparator
sortedKeys.sort(compareLengths);

// Output the sorted keys and their aggregated values
for (var j = 0; j < sortedKeys.length; j++) {
    console.log(sortedKeys[j] + " " + dataMap[sortedKeys[j]]);
}
