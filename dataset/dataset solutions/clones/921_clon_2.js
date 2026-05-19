let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from standard input
let lineArray = rawData.trim().split("\n"); // Process the raw data: remove leading/trailing whitespace and split into an array of lines

let lineCount = lineArray.shift(); // Extract the first line, which typically represents 'n' (though unused in this specific logic)
let currentSequence = lineArray.shift(); // Extract the second line, which is the character sequence to be processed

// Loop until the sequence is reduced to a single character
while (currentSequence.length !== 1) {
    // Replace the first two characters of the sequence based on predefined rules
    currentSequence = currentSequence.replace(/../, function(pairString) {
        // Evaluate the two-character pair and return its replacement
        if (pairString === "TT") return "T";
        if (pairString === "TF") return "F";
        if (pairString === "FT") return "T";
        if (pairString === "TF") return "T"; // This condition is a duplicate of the second one, but preserved for exact behavior
    });
}

console.log(currentSequence); // Display the final, reduced single-character sequence
