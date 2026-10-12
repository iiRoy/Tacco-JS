var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lineArray = rawData.trim().split("\n"); // Split the input into an array of lines, removing leading/trailing whitespace
var mainString = lineArray[0]; // The first line is the main string to search within
var searchPattern = lineArray[1]; // The second line is the pattern to search for

// Iterate through the main string to find occurrences of the search pattern
for (var outerIndex = 0; outerIndex < mainString.length; outerIndex++) {
    // Initialize a boolean flag for each potential starting position
    var matchFound = true;

    // Compare the substring of mainString with the searchPattern
    for (var innerIndex = 0; innerIndex < searchPattern.length; innerIndex++) {
        // If characters do not match, set flag to false and break the inner loop
        if (mainString[outerIndex + innerIndex] !== searchPattern[innerIndex]) {
            matchFound = false;
            break; // No need to check further characters for this starting position
        }
    }

    // If the flag is still true after the inner loop, a match was found
    if (matchFound) {
        console.log(outerIndex); // Output the starting index of the match
    }
}
