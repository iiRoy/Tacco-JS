"use strict"; // Enforce strict mode for better code quality

// This function processes the given input string to count occurrences of '1'.
const processInput = inputString => {
    // Trim leading/trailing whitespace and split the input into lines.
    let processedLines = inputString.trim().split("\n");
    
    // Take the first line and split it into an array of individual characters.
    const charArray = processedLines[0].split("");
    
    // Filter the character array to keep only '1's and then print the count of such characters.
    console.log(charArray.filter(digitChar => digitChar === "1").length);
};

// Read the entire content from standard input, decode it as UTF-8, and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
