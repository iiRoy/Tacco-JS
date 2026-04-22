/*
 * This JavaScript program processes numerical input
 * from /dev/stdin.
 */

// Initialize loop counter and read input values.
for (
    j = 0; // Initialize loop variable 'j' to 0.
    i = require("fs")
        .readFileSync("/dev/stdin", "utf8") // Read content from standard input.
        .split(/\s/)[
            j++
        ]; // Split by whitespace, get the element at index 'j', then increment 'j'.
)
    // The loop body consists of a single statement:
    console.log(
        (
            i * i + // Calculate i squared.
            i + // Add i itself.
            2 // Add the constant 2.
        ) /
            2 // Divide the entire sum by 2.
    ); /* End of console.log statement and loop body. */

// No further code after the loop.