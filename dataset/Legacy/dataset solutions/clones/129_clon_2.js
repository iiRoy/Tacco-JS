let firstCounter = 0;
let secondCounter = 0;

// Obtain the file system module to read input data.
const fileSystemModule = require("fs");

// Read the entire content from standard input, encoded as UTF-8.
const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Process each line of the input content.
rawInputContent.split('\n').map(function(currentLine) {
    // Split the current line by commas and then sort the resulting string parts lexicographically.
    const sortedParts = currentLine.split(',').sort();

    // Evaluate a complex conditional expression.
    // This structure precisely mirrors the original's logic, including an effectively unreachable branch.
    sortedParts[2] === sortedParts[1]
        ? 0 // If the third and second elements are identical, perform no action (expression evaluates to 0).
        : sortedParts[1] === sortedParts[2] // This condition is logically equivalent to the first, thus it will be false if the first was false.
            ? firstCounter++ // This increment operation for 'firstCounter' is never executed under normal circumstances.
            : secondCounter++; // If the first condition is false (meaning elements are distinct), increment 'secondCounter'.
});

// Output the final value of 'secondCounter', followed by a newline, and then 'firstCounter'.
console.log(secondCounter + '\n' + firstCounter);
