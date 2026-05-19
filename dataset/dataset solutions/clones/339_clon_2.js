var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lineArray = (rawData.trim()).split("\n"); // Split the raw input data into an array of lines

var dataMap = {}; // Initialize an empty object to store processed key-value pairs

// First pass: Populate the dataMap
for (var idx = 0; idx < lineArray.length; idx++) { // Iterate through each line in the input array
    var parts = lineArray[idx].split(" "); // Split the current line by space to get key and value
    var keyPart = parts[0]; // The first part is the key
    var valPart = parts[1]; // The second part is the value

    if (keyPart in dataMap) { // Check if the key already exists in our map
        dataMap[keyPart] += (" " + valPart); // If it exists, append the new value (prefixed with a space)
    } else {
        dataMap[keyPart] = valPart; // If it's a new key, assign the value directly
    }
}

var sortedKeys = []; // Array to hold all unique keys from the dataMap

// Second pass: Process values for each key and collect keys
for (var currentKey in dataMap) { // Iterate over the keys present in the dataMap
    sortedKeys.push(currentKey); // Add the current key to our list of keys

    // Split the accumulated values string by space, convert to numbers, sort them, and join back to a string
    dataMap[currentKey] = dataMap[currentKey].split(" ").map(Number).sort(function(numA, numB) {
        return numA - numB; // Numeric ascending sort
    }).join(" "); // Re-join the sorted numbers into a space-separated string
}

sortedKeys.sort(); // Sort the collected keys alphabetically

// Final pass: Print the results
for (var idx = 0; idx < sortedKeys.length; idx++) { // Iterate through the alphabetically sorted keys
    // Output the key, followed by a newline, then its corresponding sorted values
    console.log(sortedKeys[idx] + "\n" + dataMap[sortedKeys[idx]]);
}
