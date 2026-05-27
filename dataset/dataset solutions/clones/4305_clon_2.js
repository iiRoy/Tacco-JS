"use strict";

// This function processes the given input string.
const processInput = (inputData) => {
    // First, clean up the input: remove leading/trailing whitespace and split by newline characters.
    inputData = inputData.trim().split("\n");

    // Take the very first line of the processed input and convert it into an array of individual characters.
    const charArray = inputData[0].split("");

    // Modify the character array: remove a specific number of characters from the end.
    // The 'splice' method is used here to remove 8 characters, starting from 8 positions before the end.
    // The third argument "" means nothing is inserted in their place.
    charArray.splice(charArray.length - 8, 8, "");

    // Finally, join the modified character array back into a single string and print it to the console.
    console.log(charArray.join(""));
};

// The program execution starts here.
// It reads the content of the standard input file ('/dev/stdin') using Node.js's 'fs' module,
// decodes it as UTF-8, and then passes this content to our 'processInput' function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
