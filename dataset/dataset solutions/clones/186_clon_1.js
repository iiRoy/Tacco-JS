/*
 * This JavaScript script processes numerical data
 * obtained from standard input.
 * It reads lines, sorts them numerically in descending order,
 * performs a calculation, and then prints the final result.
 */

// Declare and initialize the variable 'x'.
// 'x' will store the input lines as an array of strings.
x = require('fs') // Use the built-in 'fs' (file system) module
    .readFileSync(
        // Read the content from standard input.
        '/dev/stdin',
        // Specify the encoding for the input data.
        'utf8'
    )
    // Split the entire input string into an array of strings,
    // using the newline character as a delimiter.
    .split(
        "\n"
    );


// Sort the array 'x' in descending numerical order.
// The sort method modifies the array in place.
x.sort(
    // This is the comparison function for sorting.
    // It will implicitly convert 'a' and 'b' to numbers for subtraction.
    function(a, b) {

        // For descending order, we return b - a.
        // If a - b was used, it would be ascending order.
        return b - a;
    }
);


// Calculate the final result and print it to the console.
console
    .log(
        // The calculation involves:
        // 1. Getting the largest number (first element after sort).
        // 2. Getting the smallest number (last element after sort).
        // 3. Removing any decimal points from their string representations.
        // 4. Subtracting the smallest from the largest.
        // 5. Dividing the difference by 10.
        (
            x[0] // Access the first element (largest number after sort).
                .replace(
                    // Remove any occurrences of the '.' character.
                    '.',
                    ''
                )
            -
            x[x.length - 1] // Access the last element (smallest number after sort).
                .replace(
                    // Remove any occurrences of the '.' character.
                    '.',
                    ''
                )
        )
        / // Division operator.
        10 // Divide the difference by ten.
    );