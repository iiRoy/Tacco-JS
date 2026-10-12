var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from standard input
var lineCollection = (rawData.trim()).split("\n"); // Process raw data: trim whitespace, then split into an array of strings by newline characters

// Iterate through each individual string in the collection
for (var idx = 0; idx < lineCollection.length; idx++) {
    var currentSequence = lineCollection[idx]; // Assign the current string from the array to a working variable

    // First, clean the string by removing alphabetic characters (both cases), periods, and whitespace
    currentSequence = currentSequence.replace(/[a-zA-Z]|\.|\s/g, "");

    // Continuously remove balanced '[]' and '()' pairs until no more are found
    while (currentSequence.match(/\[\]|\(\)/)) {
        currentSequence = currentSequence.replace(/\[\]|\(\)/g, "");
    }

    // After all processing, check if the string is empty and print the corresponding result
    console.log((currentSequence === "") ? "yes" : "no");
}
