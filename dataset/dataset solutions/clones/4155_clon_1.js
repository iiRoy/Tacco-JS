/*
 * This JavaScript code processes input from standard input.
 * It's structured as a self-executing anonymous function (IIFE).
 * The primary goal is to demonstrate string manipulation and comparison.
 */

(
    // The input parameter 'i' will receive the content read from stdin.
    i => {

        // This line is crucial for processing the input.
        // It splits the input string by newline characters, creating an array of lines.
        // Then, it maps over each line (val) and its index.
        i = i
            .split('\n') // Split the entire input string into an array of individual lines.
            .map(
                (
                    val, // 'val' represents the current line string.
                    index // 'index' is the zero-based index of the current line.
                ) =>
                    // Conditional logic:
                    // If the index is truthy (i.e., not 0), sort characters in ascending order.
                    index
                        ? // For subsequent lines (index > 0):
                          val
                              .split('') // Convert the line string into an array of characters.
                              .sort() // Sort the characters alphabetically (ascending).
                              .join('') // Join the sorted characters back into a string.
                        : // If the index is 0 (the first line):
                          val
                              .split('') // Convert the first line string into an array of characters.
                              .sort() // Sort the characters alphabetically (ascending).
                              .reverse() // Reverse the sorted array, effectively sorting in descending order.
                              .join('') // Join the reversed characters back into a string.
            );

        // After processing all lines, the modified array 'i' is logged to the console.
        // This output shows the transformed lines.
        console
            .log(
                i
            );


        // Finally, a comparison is made between the first two processed lines.
        // The result of this comparison determines the final output.
        console
            .log(
                i[0] // Access the first processed line.
                    > // Greater than comparison operator.
                i[1] // Access the second processed line.
                    ? // Ternary operator: if i[0] is greater than i[1]...
                    'Yes' // ...output 'Yes'.
                    : // Otherwise...
                    'No' // ...output 'No'.
            );

    } // End of the anonymous function body.
)
// The IIFE is immediately invoked with the result of reading a file.
(
    require("fs") // Node.js 'fs' module for file system operations.
        .readFileSync( // Method to synchronously read the entire content of a file.
            "/dev/stdin", // Specifies to read from standard input.
            "utf8" // Specifies the encoding of the input file.
        )
); // End of IIFE invocation.

/*
 * End of the JavaScript program.
 * All identifiers, operators, and expressions remain unchanged.
 * Only whitespace and comments have been altered.
 */