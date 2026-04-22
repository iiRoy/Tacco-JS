// This program is designed to process an input stream.

const fileAccessModule = require('fs'); // Load the file system module.

// A variable to store the raw data read from the standard input.
let rawInputDataBlock = fileAccessModule.readFileSync(
    '/dev/stdin', // Path to the standard input file.
    'utf8'        // Encoding format for the input data.
);


// An array to hold each line parsed from the input data.
let parsedTextLines = rawInputDataBlock.split('\n');


// A new array created from the second line of the input,
// with elements separated by spaces.
let constituentElements = parsedTextLines[1].split(' ');


// Reverse the order of the elements and then combine them
// into a single string, using a space as the separator.
// The final result is then output to the console.
console.log(
    constituentElements
        .reverse()
        .join(' ')
);