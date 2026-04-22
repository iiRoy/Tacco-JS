/*
 * This file contains a JavaScript program designed to calculate
 * the Euclidean distance between two points given their coordinates.
 *
 * This is an example of a Type I code clone.
 * All functional logic, variable names, function names, and operators
 * are preserved exactly as in the original source.
 * Only whitespace (indentation, line breaks, spacing) and comments
 * have been altered extensively to create a visually distinct version.
 */

// The primary function to process input and perform the calculation.
function Main /* Entry point for the program logic */ (
    input // The raw input string containing coordinate data.
) {
    // Step 1: Parse the input string into an array of numbers.
    // The input is expected to contain four numbers representing (x1, y1, x2, y2).
    var a = input // Take the raw input string.
        .trim() // Remove any leading or trailing whitespace.
        .split(
            /\s|\n/ // Split the string by any whitespace character or newline.
        )
        .map(
            Number // Convert each resulting string segment into a numerical value.
        );

    // Step 2: Extract coordinates and calculate differences.
    // The input array 'a' is assumed to be [x1, y1, x2, y2].
    // Calculate the difference in x-coordinates (dx).
    x = a[2] // x2
        -
        a[0]; // x1

    // Calculate the difference in y-coordinates (dy).
    y = a[3] // y2
        -
        a[1]; // y1

    // Step 3: Calculate the Euclidean distance using the Pythagorean theorem.
    // Distance = sqrt((x2 - x1)^2 + (y2 - y1)^2)
    console.log(
        Math.sqrt // Use Math.sqrt to find the square root.
        (
            x * x // Square the difference in x-coordinates.
            + // Add to the squared difference in y.
            y * y // Square the difference in y-coordinates.
        )
    );

} // End of the Main function definition.


// This part of the code handles reading input from standard input
// and then passing it to the Main function for processing.
Main // Call the main processing function.
(
    require("fs") // Load the built-in 'fs' (file system) module.
    .readFileSync(
        "/dev/stdin", // Specify the path for standard input in a Unix-like environment.
        "utf8" // Define the character encoding for reading the file.
    ) // The readFileSync method reads the entire file synchronously.
); // The content of /dev/stdin is passed as the 'input' argument to Main.