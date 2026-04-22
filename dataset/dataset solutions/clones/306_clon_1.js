// This script processes input from standard input.

// Initialize a variable 'x' to store the processed input data.
// The 'fs' module is used for file system operations.
x = require('fs')
    // Read the content of '/dev/stdin' synchronously.
    // The content is expected to be UTF-8 encoded.
    .readFileSync(
        '/dev/stdin',
        'utf8'
    )
    // Remove leading/trailing whitespace from the read string.
    .trim()
    // Split the string into an array of substrings using whitespace as a delimiter.
    .split(
        /\s/
    )
;

// Log the final calculated value to the console.
console.log(
    // Apply the floor function to the result of an arithmetic expression.
    Math.floor(
        // Multiply the first element of 'x' by the second element.
        x[0]
        *
        x[1]
        // Divide the product by a specific floating-point constant.
        /
        0.000003305785
    )
    // Finally, divide the floored result by 1,000,000.
    /
    1000000
);

// End of script.