/* This is a Type I clone of an existing JavaScript program.
 * All identifiers, variable names, function names, operators,
 * and expressions remain completely identical to the original.
 * The only modifications are whitespace and comments,
 * aimed at making the code visually distinct without
 * altering its logical or structural behavior.
 */


// Initialize global variables
a = [];         // Main array to store processed data
itr = 0;        // Iterator for 'a', used to track active rows
i = 0;          // General purpose loop counter


// Function definition for transposing a 2D array (matrix)
// Takes a 2D array 't' as input.
transpose = t => t[0].map(
    (_, c) => t.map(
        r => r[c]
    )
);


// Function definition to check if all elements in a given array 't' are a period ('.')
// Returns true if all elements are '.', false otherwise.
compress = t => t.every(e => e == '.');


// Main function to process the input data
function Main(input) {

    // Split the entire input string by newline characters
    // to get an array where each element is a line from the input.
    input = input.split("\n");


    // First pass: Process rows and filter out fully "compressed" (all '.') rows.
    // Start from index 1, assuming the first line might be metadata or already handled.
    for (i = 1; i <= input.length - 1; i++) {

        // Split the current input line into an array of individual characters.
        // Assign this character array to the 'a' array at the 'itr' index.
        a[itr] = input[i].split("");

        // Check if the current row (a[itr]) is NOT compressible.
        // If it contains any non-'.' character, it's considered an active row.
        if (!compress(a[itr])) {
            // Increment 'itr' only if the row is not compressible.
            // This effectively skips over rows that are entirely '.'.
            itr++;
        }

    }


    // After processing rows, transpose the 'a' array.
    // This operation swaps rows and columns, making it easier to process columns.
    a = transpose(a);


    // Second pass: Process columns (now rows in the transposed array) and filter them.
    // This loop structure is designed for array modification during iteration.
    for (i = 0; i < a.length;) {

        // If the current "column" (which is now a row in 'a') is compressible,
        // remove it from the array using splice.
        if (compress(a[i])) {
            a.splice(i, 1); // Remove one element at the current index 'i'.
        }
        else {
            // If the column is not compressible, move to the next index.
            i++;
        }

    }


    // Transpose the 'a' array back to its original orientation.
    // This restores the original row/column meaning after column-wise compression.
    a = transpose(a);


    // Final pass: Iterate through the processed 'a' array and print each row.
    // Join the characters of each inner array back into a single string before printing.
    for (i = 0; i < a.length; i++) {
        console.log(a[i].join(''));
    }

}


// Execute the Main function, reading input from standard input.
// The 'require("fs").readFileSync' method is used to synchronously
// read the entire content of a file, typically "/dev/stdin" in
// Unix-like environments for standard input. The encoding is "utf8".
Main(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
);