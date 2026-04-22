/*
 * This JavaScript script processes a single numerical input.
 * It reads from standard input, extracts the first line,
 * performs a specific mathematical operation, and then
 * prints the calculated result to the console.
 *
 * This is a Type I clone, meaning only whitespace and
 * comments have been altered from the original source.
 */

// Import the 'fs' (File System) module, which is necessary for reading files.
const    line    =    require('fs')
    .   readFileSync(  '/dev/stdin'   ,    'utf-8'   )  // Synchronously read the entire content of '/dev/stdin' as UTF-8.
    .   split('\n')    ;   // Split the read content into an array of strings, using newline characters as delimiters.

// Extract the first line from the input array. This line is expected to contain the number 'n'.
const    n    =    line[0]    ;

// Perform the core calculation:
// 1. Divide 'n' by 2.
// 2. Round the result of (n / 2) to the nearest whole number using Math.round().
// 3. Divide this rounded value by 'n' again.
// Finally, print the computed result to the standard output (console).
console.log(   Math.round(   n   /   2   )   /   n   )   ;   // Output the final calculated value.