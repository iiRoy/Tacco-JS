'use strict'; // Activate strict mode for enhanced error handling and cleaner code.

// Acquire the entire content from the standard input device.
// The 'fs' module is utilized for file system operations.
var fileContent = require('fs')
    .readFileSync(
        '/dev/stdin', // Specifies the standard input file path.
        'utf8'        // Ensures the content is read as UTF-8 encoded text.
    );

// Pre-process the obtained content:
// 1. Remove any leading or trailing whitespace characters.
// 2. Divide the clean string into an array of separate lines,
//    using the newline character as a delimiter.
var problemCases = fileContent
    .trim()
    .split('\n');

// Loop through each individual problem case in the array.
// The loop continues as long as there are cases remaining to process.
while ( problemCases.length !== 0 ) {
    // Extract the very first problem case from the array,
    // converting it into a numerical type using the unary plus operator.
    var currentInput = +problemCases.shift(); // Removes and returns the first element.

    // Compute the final output value based on the given formula.
    // The calculation involves squaring the input, dividing by 98,
    // adding 1, and then rounding up to the nearest whole number.
    // The result is then printed to the console.
    console.log(
        Math.ceil(
            currentInput * currentInput / 98 + 1
        )
    );
}