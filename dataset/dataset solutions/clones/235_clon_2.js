// This script processes lines from standard input to perform a specific geometric calculation.
// Each line is expected to contain eight space-separated numeric values representing coordinates.

// Obtain the Node.js file system module, which is necessary for reading input.
const fileSystemModuleReference = require("fs");

// Read the entire content from standard input (`/dev/stdin`).
// The content is decoded as UTF-8 text.
// Any leading or trailing whitespace is removed using `.trim()`.
// Finally, the content is split into an array of individual lines based on the newline character.
const processedInputLines = fileSystemModuleReference.readFileSync("/dev/stdin", "utf8").trim().split('\n');

// Iterate over each line that was read from the input.
// The `.map()` method is used here to process each line, though its return value (an array of `undefined`s) is not utilized.
processedInputLines.map(function(currentLineSegment) {
    // Split the current line string into an array of its constituent parts.
    // A space character (' ') is used as the delimiter.
    // These parts are initially strings but will be implicitly converted to numbers during arithmetic operations.
    let numericalCoordinateValues = currentLineSegment.split(' ');

    // Perform a specific mathematical computation using the extracted numerical values.
    // The expression is structured as: (x_b - x_a) * (y_d - y_c) + (y_b - y_a) * (x_d - x_c)
    // where the indices map to:
    // numericalCoordinateValues[0] = x_a, numericalCoordinateValues[1] = y_a
    // numericalCoordinateValues[2] = x_b, numericalCoordinateValues[3] = y_b
    // numericalCoordinateValues[4] = x_c, numericalCoordinateValues[5] = y_c
    // numericalCoordinateValues[6] = x_d, numericalCoordinateValues[7] = y_d
    const calculatedGeometricValue = (numericalCoordinateValues[2] - numericalCoordinateValues[0]) * (numericalCoordinateValues[6] - numericalCoordinateValues[4]) +
                                     (numericalCoordinateValues[3] - numericalCoordinateValues[1]) * (numericalCoordinateValues[7] - numericalCoordinateValues[5]);

    // Check if the absolute value of the computed result is extremely close to zero.
    // A small floating-point epsilon (1e-10) is used for this comparison to account for precision issues.
    // If the absolute value is less than this threshold, it signifies a 'NO' condition.
    // Otherwise, the condition is 'YES'.
    if (Math.abs(calculatedGeometricValue) < 1e-10) {
        console.log('NO'); // Output 'NO' to standard output.
    } else {
        console.log('YES'); // Output 'YES' to standard output.
    }
});
