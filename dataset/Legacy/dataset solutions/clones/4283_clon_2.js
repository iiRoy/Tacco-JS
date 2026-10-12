"use strict"; // Enforce strict parsing and error handling for better code quality

// This function serves as the primary entry point for processing the input data.
const processInput = (inputData) => {
    // First, clean up the input string by removing leading/trailing whitespace,
    // then split it into an array of lines. For this problem, we only care about the first line.
    inputData = inputData.trim().split("\n");
    
    // Convert the relevant input line (the first one) into an array of individual characters.
    const charArray = inputData[0].split("");
    
    // Initialize a variable to keep track of the character encountered in the immediately preceding iteration.
    let lastChar = null;
    
    // Iterate through each character in the `charArray` to check for a specific sequence.
    // The `for...in` loop is used here to iterate over the indices of the array.
    for (let idx in charArray) {
        // Check if the character from the previous step was 'A' AND the current character is 'C'.
        // This condition looks for the "AC" sequence.
        if (lastChar === "A" && charArray[idx] === "C") {
            // If the "AC" sequence is found, print "Yes" to the console.
            console.log("Yes");
            // Immediately exit the function as the required condition has been met.
            return; 
        }
        
        // Update `lastChar` to the current character for the next iteration of the loop.
        lastChar = charArray[idx];
    }
    
    // If the loop completes without finding the "AC" sequence anywhere in the string,
    // print "No" to the console.
    console.log("No");
};

// Read the entire content of standard input synchronously, assuming UTF-8 encoding,
// and then pass this content to our main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
