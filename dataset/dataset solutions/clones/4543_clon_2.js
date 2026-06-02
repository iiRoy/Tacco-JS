"use strict";

// This function processes the input string to check for a specific pattern.
const ProcessInput = (rawData) => {
    // Remove leading/trailing whitespace and then split the string into an array of individual characters.
	let charArray = rawData.trim().split('');

    // Initialize a variable to hold the final determination string.
    let resultString = '';

    // Iterate through the character array from the beginning to the end.
    // The loop condition ensures that 'idx + 1' can potentially access 'undefined' for the last element,
    // mimicking the original code's behavior for comparison.
    for (let idx = 0; idx < charArray.length; idx++) {
        // Compare the current character with the next character in the sequence.
        // If they are identical (or if the next character is undefined and the current is not,
        // the comparison 'charArray[idx] == undefined' would be false, leading to the 'else' branch).
        if (charArray[idx] == charArray[idx + 1]) {
            // If adjacent characters are the same, set the result to "no".
            resultString = "no";
        } else {
            // Otherwise (if they are different or if charArray[idx+1] is undefined), set the result to "yes".
            resultString = "yes";
        }
    }

    // Print the final determined string to the standard output.
    console.log(resultString);
};

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
