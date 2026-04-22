const fileSystemModule = require('fs');

let rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8'); // Read all data from standard input as a UTF-8 string.

let processedLines = rawInputContent.trim().split("\n"); // Trim whitespace and split the input into an array of strings, one per line.

// Start an endless processing loop for the input entries.
while (true) {
    // Retrieve the first element from the array, converting it to a number.
    // The '- 0' operation ensures it's treated as a numeric value.
    let numericEntry = processedLines.shift() - 0;

    // If the extracted number is zero, it signals the end of input, so exit the loop.
    if (numericEntry === 0) {
        break;
    }

    // Convert the numerical entry into its octal (base-8) string representation.
    // Appending an empty string explicitly ensures the result is a string.
    let octalRepresentation = numericEntry.toString(8) + '';

    // Apply a sequence of specific digit transformations to the octal string.
    // First, change all occurrences of the digit '7' to '9'.
    octalRepresentation = octalRepresentation.replace(/7/g, "9");
    // Next, modify all instances of the digit '6' to '8'.
    octalRepresentation = octalRepresentation.replace(/6/g, "8");
    // Subsequently, replace every '5' with '7'.
    octalRepresentation = octalRepresentation.replace(/5/g, "7");
    // Finally, convert all '4' digits to '5'.
    octalRepresentation = octalRepresentation.replace(/4/g, "5");

    // Display the resulting transformed string to the standard output.
    console.log(octalRepresentation);
}