var inputStrings = [];
var finalOutcome = 0; // This variable is declared but not used in the original logic.
var standardInput = require('readline');

var inputHandler = standardInput.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Event listener for each line of input received
inputHandler.on('line', function (currentLine) {
    inputStrings.push(currentLine);
});

// Event listener for when the input stream closes
inputHandler.on('close', function () {
    // The first line of input is the string to process
    var charArray = inputStrings[0].split("");
    // The second line of input is the target index (K)
    var targetIndex = Number(inputStrings[1]);

    // Initialize a 2D array to store substrings, pre-filling with empty strings
    // The size is based on the length of the input character array
    var substringMatrix = Array(charArray.length).fill("").map(_ => Array(charArray.length).fill(""));
    // An array to collect all generated substrings
    var uniqueSubstrings = [];

    // Outer loop: iterates through all possible starting characters of a substring
    for (var startIdx = 0; startIdx < charArray.length; startIdx++) {
        // Inner loop: iterates through all possible ending characters of a substring,
        // starting from the current startIdx
        for (var endIdx = startIdx; endIdx < charArray.length; endIdx++) {
            // If the length of the current substring exceeds or equals K,
            // we can break early for this startIdx as longer substrings
            // will also exceed K and are not relevant for the K-th smallest.
            // This optimization is based on the original code's logic.
            if (targetIndex <= substringMatrix[startIdx][endIdx].length) {
                break;
            } else {
                // Build the substring by appending the current character
                substringMatrix[startIdx][endIdx + 1] = substringMatrix[startIdx][endIdx] + charArray[endIdx];
                // Add the newly formed substring to our collection
                uniqueSubstrings.push(substringMatrix[startIdx][endIdx + 1]);
            }
        }
    }

    // Filter out duplicate substrings to ensure uniqueness
    uniqueSubstrings = uniqueSubstrings.filter((currentValue, currentIndex, fullArray) => {
        return (fullArray.indexOf(currentValue) === currentIndex);
    });

    // Sort the unique substrings alphabetically
    uniqueSubstrings.sort();

    // Output the K-th smallest unique substring (K is 1-indexed, so we use K-1)
    console.log(uniqueSubstrings[targetIndex - 1]);
});
