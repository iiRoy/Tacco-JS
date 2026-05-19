var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The raw input string is first trimmed of leading/trailing whitespace,
// then split into an array of strings, with each element representing a line.
var lineCollection = (rawData.trim()).split("\n");

// Iterate over each entry in the collection of lines.
for (var idx = 0; idx < lineCollection.length; idx++) {
    // Assign the current line from the array to a temporary variable for processing.
    var currentLine = lineCollection[idx];

    // If the current line is a single period, it signals the termination of input.
    if (currentLine === ".") {
        break; // Exit the loop immediately.
    }

    // Remove all alphabetic characters (both uppercase and lowercase),
    // literal periods, and any whitespace characters from the string.
    currentLine = currentLine.replace(/[a-zA-Z]|\.|\s/g, "");

    // Repeatedly remove all occurrences of empty square brackets "[]"
    // or empty parentheses "()" from the string until no more are found.
    while (currentLine.match(/\[\]|\(\)/)) {
        currentLine = currentLine.replace(/\[\]|\(\)/g, "");
    }

    // After all processing, if the string is empty, it means all brackets were balanced.
    // Otherwise, they were not. Print "yes" or "no" accordingly.
    console.log((currentLine === "") ? "yes" : "no");
}
