// This script reads data from standard input, processes it, and prints a summary.

// Initialize accumulator variables.
// 't' will store the total sum of products (c[0] * c[1]).
// 's' will store the total sum of the second column (c[1]).
// 'a' will count the number of processed lines.
t = s = a = 0;

// Import the Node.js 'fs' (file system) module to read input.
require("fs")
    // Read the entire content of standard input synchronously.
    .readFileSync("/dev/stdin", "utf8")
    // Remove leading/trailing whitespace (especially a final newline).
    .trim()
    // Split the input string into an array of lines.
    .split('\n')
    // Iterate over each line and process it.
    .map(function(i) {
        // Split the current line 'i' by comma to get individual column values.
        c = i.split(',');

        // Add the product of the first and second columns to 't'.
        t += c[0] * c[1];

        // Add the numeric value of the second column to 's'.
        // The unary plus '+' converts c[1] to a number.
        s += +c[1];

        // Increment the line counter 'a'.
        a++;
    });

// Print the final results to the console.
// The output format is: total sum of products, followed by a newline,
// followed by the rounded average of the second column.
console.log(
    t + // The total sum of products.
    '\n' + // A newline character to separate the two values.
    // Calculate the average of the second column (s / a),
    // add 0.5 for rounding to the nearest integer,
    // and then use the bitwise NOT operator (~~) twice
    // to truncate towards zero (effectively floor for positive, ceil for negative),
    // which works as a fast floor for positive numbers and rounds correctly with +0.5.
    ~~(s / a + 0.5)
);

// End of script.