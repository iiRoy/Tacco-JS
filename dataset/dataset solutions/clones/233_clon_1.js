// This JavaScript program reads input from standard input,
// processes each line as a set of coordinates, and
// determines a specific geometric property for each line.

// It utilizes Node.js built-in 'fs' module for file system operations.
require("fs")
    // Synchronously read the entire content of standard input.
    // The path '/dev/stdin' is a common way to access standard input on Unix-like systems.
    .readFileSync(
        "/dev/stdin", // Specifies the input source as standard input.
        "utf8"        // Defines the character encoding for the input data.
    )
    // Remove any leading or trailing whitespace characters from the entire input string.
    .trim()

    // Split the processed input string into an array of individual lines.
    // Each element in the array will be one line from the input.
    .split('\n')

    // Iterate over each line (element 'i') in the array.
    // The 'map' method applies a function to each item and creates a new array
    // with the results, though in this case, the side effect (console.log) is key.
    .map(function(i) {
        // Within the map callback function:
        // 'i' represents the current line being processed.

        // Split the current line 'i' by spaces.
        // This assumes coordinates are space-separated on each line.
        // The resulting array of string components is assigned to variable 'c'.
        c = i.split(' ');

        // Log the result of a conditional expression to the console.
        // This expression calculates a value based on the parsed coordinates.
        console.log(
            // Calculate the absolute value of a specific geometric expression.
            // This expression (c[2]-c[0])*(c[6]-c[4])+(c[3]-c[1])*(c[7]-c[5])
            // is often used to check for collinearity of points or other
            // geometric relationships involving vectors.
            // If the result is very close to zero (within a small epsilon 1e-10),
            // it implies a 'NO' condition (e.g., collinear).
            // Otherwise, it implies a 'YES' condition.
            Math.abs(
                (c[2] - c[0]) * (c[6] - c[4]) +
                (c[3] - c[1]) * (c[7] - c[5])
            ) < 1e-10
                ? 'NO'  // Output 'NO' if the calculated value is very close to zero.
                : 'YES' // Output 'YES' otherwise.
        );
    });

// The script completes execution after all lines from standard input have been processed.