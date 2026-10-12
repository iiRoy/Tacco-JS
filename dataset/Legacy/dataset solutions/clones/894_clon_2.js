var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var processedString = rawData.trim();

for (var idx = 0; idx < processedString.length - 7; idx++) {
    // Extract a sequence of 8 characters
    var charArray = [
        processedString[idx],
        processedString[idx + 1],
        processedString[idx + 2],
        processedString[idx + 3],
        processedString[idx + 4],
        processedString[idx + 5],
        processedString[idx + 6],
        processedString[idx + 7]
    ];

    // Sort the extracted characters alphabetically
    var sortedChars = charArray.sort().join("");

    // Check if the sorted sequence matches a specific pattern
    if (sortedChars === "AADINNUY") {
        // If a match is found, replace the original 8 characters with a new string
        processedString = processedString.slice(0, idx) + "AIZUNYAN" + processedString.slice(idx + 8, processedString.length);
        // Advance the index to skip the recently replaced segment
        idx += 8;
    }
}

// Print the final modified string
console.log(processedString);
