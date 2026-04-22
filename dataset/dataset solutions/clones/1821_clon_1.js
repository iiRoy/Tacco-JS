/*
 * This JavaScript program processes a set of numerical inputs from standard input.
 * It reads two arrays of numbers, sorts them, and then calculates a specific
 * range based on the median elements, distinguishing between even and odd N.
 *
 * This code adheres to the principles of a Type I clone, meaning
 * all structural and logical elements are preserved exactly,
 * with modifications limited strictly to whitespace and comments
 * for visual differentiation.
 */

// Initialize the 'inputs' constant by reading from the file system.
// This chain of methods reads the entire content of '/dev/stdin',
// converts it to a UTF-8 string, removes leading/trailing whitespace,
// and then splits the string into an array of substrings using
// any sequence of whitespace characters as delimiters.
const inputs = require('fs')
    .readFileSync(
        '/dev/stdin',  // Specifies the path to the standard input stream.
        'utf8'         // Defines the character encoding for reading the file.
    )
    .trim()            // Removes any whitespace characters from both ends of the string.
    .split(/\s+/);     // Splits the string into an array by one or more whitespace characters.


// Parse the first element of the 'inputs' array to get the integer value of N.
const N = parseInt(
    inputs[0] // The first element in the 'inputs' array represents the count N.
);

// Declare and initialize two new arrays, A and B, each with a size of N.
const A = new Array(N); // Array A will store the first sequence of numbers.
const B = new Array(N); // Array B will store the second sequence of numbers.


// Loop through the input data to populate arrays A and B.
// 'i' serves as the index for arrays A and B, starting from 0.
// 'p' serves as the index for the 'inputs' array, starting from 1
// because inputs[0] was already used for N.
for (
    let i = 0, p = 1; // Initialize loop control variables: i for array index, p for input index.
    i < N;            // Condition: loop continues as long as 'i' is less than N.
    i += 1            // Increment 'i' by 1 after each iteration.
) {
    // Parse the current input string at index 'p' into an integer
    // and assign it to A[i]. Then, increment 'p'.
    A[i] = parseInt(
        inputs[p++] // Use post-increment to use 'p' then increment it.
    );

    // Parse the next input string at the new index 'p' into an integer
    // and assign it to B[i]. Then, increment 'p' again.
    B[i] = parseInt(
        inputs[p++] // Again, use post-increment.
    );
} // End of the data population loop.


// Define a comparison function 'cmp' for sorting numbers in ascending order.
// This function is suitable for use with Array.prototype.sort().
const cmp = (
    a, // The first element for comparison.
    b  // The second element for comparison.
) => a - b; // Returns a negative value if a < b, zero if a == b, positive if a > b.

// Sort array A using the defined comparison function.
A.sort(cmp); // Array A is now sorted numerically in ascending order.

// Sort array B using the defined comparison function.
B.sort(cmp); // Array B is now sorted numerically in ascending order.


// Determine the calculation based on whether N is an even or odd number.
if (N % 2 == 0) { // If N is an even number, indicating two middle elements.
    // Calculate the indices for the two middle elements.
    const i1 = N / 2 - 1; // Index of the first of the two middle elements.
    const i2 = N / 2;     // Index of the second of the two middle elements.

    // Calculate the sum of the two middle elements from array B.
    const maxMed = B[i1] + B[i2];

    // Calculate the sum of the two middle elements from array A.
    const minMed = A[i1] + A[i2];

    // Output the final result to the console.
    console.log(maxMed - minMed + 1);

} else { // If N is an odd number, indicating a single middle element.
    // Calculate the index for the single middle element.
    const i = (N - 1) / 2; // Index of the unique middle element.

    // Get the single middle element from array B.
    const maxMed = B[i];

    // Get the single middle element from array A.
    const minMed = A[i];

    // Output the final result to the console.
    console.log(maxMed - minMed + 1);
} // End of the conditional statement for N parity.