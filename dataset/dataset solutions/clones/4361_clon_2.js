"use strict"; // Enforce strict parsing and error handling rules for the entire script

/*
 * This module defines a primary function responsible for analyzing input data.
 * Its purpose is to check if the first line of the provided text contains the digit '9'.
 * This pattern is commonly used for processing single-line inputs in programming challenges.
 */
const verifyNinePresence = (inputPayload) => { // Declare the main function, accepting all raw input as a string
    // The inputPayload might contain multiple lines. We are only interested in the very first one.
    // The `split('\n')[0]` method effectively isolates the initial line of text.
    const initialTextLine = inputPayload.split('\n')[0];

    // Log the outcome directly based on a conditional check.
    // 1. `initialTextLine.split('')`: Converts the first line string into an array of individual character strings.
    // 2. `.filter(charElement => charElement === '9')`: Iterates through the character array,
    //    keeping only those elements that are strictly equal to the string '9'.
    // 3. `.length`: Gets the total count of '9' characters found in the filtered array.
    // 4. `? "Yes" : "No"`: A ternary operator that evaluates if the count of '9's is greater than zero.
    //    If true, it outputs "Yes"; otherwise, it outputs "No".
    console.log(
        initialTextLine
            .split('') // Transform the string into an array of characters
            .filter(charElement => charElement === '9') // Retain only the character '9'
            .length // Count the occurrences of '9'
            ? "Yes" // If one or more '9's are found
            : "No" // If no '9's are found
    );
}; // Conclude the definition of the verifyNinePresence function


// This section handles the execution of the script by reading from standard input.
// It uses Node.js's built-in file system module to retrieve data before passing it
// to our primary analysis function.
verifyNinePresence(
    require('fs') // Access the Node.js File System module for I/O operations
        .readFileSync( // Synchronously read the content of a file
            '/dev/stdin', // Specify the path to standard input, common in Unix-like systems
            'utf8' // Define the character encoding to correctly interpret the input text
        ) // End of the file read operation
); // Final call to the analysis function with the obtained input