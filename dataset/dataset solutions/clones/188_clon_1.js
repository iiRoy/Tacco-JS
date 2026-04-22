/*
 * This JavaScript code reads input, processes it, and outputs a calculated value.
 * It demonstrates reading from standard input, array manipulation, and basic arithmetic.
 */

// Initialize a variable 'x' by reading data from standard input.
// The 'fs' module is used for file system operations.
// '/dev/stdin' is a common path for standard input on Unix-like systems.
// 'utf8' specifies the encoding for the input.
// The read content is then split into an array of strings by newline characters.
x = require('fs')
    .readFileSync(
        '/dev/stdin', // Source of input data
        'utf8'        // Encoding for the input
    )
    .split(
        "\n"          // Delimiter to split the input string into an array
    )
; // End of the input reading and splitting operation.


// Sort the array 'x' in descending order.
// The `sort()` method is called on the array 'x'.
// A custom comparison function `(a, b) => b - a` is provided.
// For numerical sorts, `b - a` ensures descending order (largest first).
x.sort(
    function(
        a,  // The first element for comparison
        b   // The second element for comparison
    )
    {
        // Return a negative value if 'b' should come before 'a',
        // a positive value if 'a' should come before 'b',
        // and zero if their order doesn't matter.
        // For descending numerical sort, `b - a` achieves this.
        return b - a;
    }
); // End of the array sorting operation.


/*
 * Finally, calculate and print a specific value to the console.
 * The calculation involves:
 * 1. Accessing the first element of the sorted array (x[0]).
 * 2. Accessing the last element of the sorted array (x[x.length - 1]).
 * 3. Multiplying both by 10.
 * 4. Subtracting the second result from the first.
 * 5. Dividing the final difference by 10.
 * This effectively calculates (x[0] - x[last]) in floating point if x are numbers.
 */
console.log(
    (
        x[0]             // The first element (largest)
        * 10             // Multiplied by ten
        -                // Subtraction operator
        x[x.length - 1]  // The last element (smallest)
        * 10             // Multiplied by ten
    )
    / 10                 // Divide the entire difference by ten
); // End of the console logging statement.