/*
 * This is a Type I clone of the original JavaScript code.
 * It processes input from stdin to count occurrences of 'A', 'B', 'O', and other characters.
 *
 * All identifiers, operators, and expressions remain strictly identical.
 * Only whitespace and comments have been altered for visual differentiation.
 */

// Initialize counters and read input
for (
      w = x = y = z = 0, // Initialize four counters to zero
      i = require("fs") // Use the 'fs' module to handle file system operations
            .readFileSync("/dev/stdin", "utf8") // Read the content of /dev/stdin as UTF-8
            .split(/\s|,/), // Split the content by whitespace or commas into an array 'i'
      c = j = -1 // Initialize 'c' (current element) and 'j' (index)
    ;
      // Loop condition: Assign the next element from 'i' to 'c'
      // 'j' is incremented by 2 in each iteration to skip elements or read specific ones
      c = i[j += 2]
    ;
      // Loop final expression: Define newline character 'n'
      // This is an unconventional place for a variable declaration, but preserved as per Type I rules.
      n = '\n'
)
{
    // Ternary operator chain to increment the appropriate counter based on character 'c'
    c == 'A' // Is the current character 'A'?
        ? w++  // If yes, increment counter 'w'
        : c == 'B' // Else, is it 'B'?
            ? x++  // If yes, increment counter 'x'
            : c == 'O' // Else, is it 'O'?
                ? z++  // If yes, increment counter 'z'
                : y++; // Else (for any other character), increment counter 'y'

    // The loop body consists solely of this nested ternary operation.
}

// After the loop finishes, print the final counts to the console.
// Each count is separated by a newline character 'n'.
console.log(
    w // Count for 'A'
    + n // Newline
    + x // Count for 'B'
    + n // Newline
    + y // Count for 'Other'
    + n // Newline
    + z // Count for 'O'
);

// End of script.