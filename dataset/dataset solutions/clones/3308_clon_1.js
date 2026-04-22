'use strict'; // This directive enables strict mode for the entire script, enforcing stricter parsing and error handling.


// Configure the standard input stream for data reception.
process.stdin.resume(); // Keeps the Node.js process alive as long as standard input is open.
process.stdin.setEncoding('utf8'); // Specifies that input data should be interpreted as UTF-8 encoded text.


/**
 * @function max
 * @description Computes the maximum numeric value within a given array.
 * @param {Array<Number>} a - The input array of numbers.
 * @returns {Number} The largest number found in the array.
 */
const max = (a) => {
    let i = a.length; // Initialize a counter 'i' with the total number of elements in array 'a'.
    let max = -Infinity; // Set an initial 'max' value to negative infinity to ensure any number in the array is greater.

    // Loop through the array from the last element down to the first.
    while (i--) { // 'i--' decrements 'i' before each iteration, effectively iterating from a.length-1 down to 0.
        if (a[i] > max) { // Check if the current element is greater than the current maximum.
            max = a[i]; // If true, update 'max' to the current element's value.
        }
    }
    return max; // Return the final maximum value found.
}; // End of the 'max' function definition.


/**
 * @function min
 * @description Determines the minimum numeric value within a provided array.
 * @param {Array<Number>} a - The array of numbers to search through.
 * @returns {Number} The smallest number present in the array.
 */
const min = (a) => {
    let i = a.length; // Initialize loop index starting from the end of the array.
    let max = Infinity; // Initialize 'max' (which will actually store the minimum) to positive infinity.

    // Iterate backwards through the array elements.
    while (i--) { // The loop continues as long as 'i' is non-negative after decrementing.
        if (a[i] < max) { // If the current array element is smaller than the current 'max' (minimum).
            max = a[i]; // Update 'max' with this smaller value.
        }
    }
    return max; // Return the identified minimum value.
}; // End of the 'min' function.


/**
 * @function Main
 * @description The primary function that processes input for a knapsack-like problem.
 * It reads item weights and values, then calculates the maximum value that can be achieved
 * without exceeding a given total weight capacity.
 * @param {String} p - The raw input string, typically from standard input.
 */
const Main = (p) => {

    // Split the input string into an array of lines.
    p = p.split("\n"); // This handles multiple lines of input data.

    // Parse the number of items (N) and the maximum weight capacity (W) from the first line.
    const N = parseInt(p[0].split(" ")[0]); // N is the count of items.
    const W = parseInt(p[0].split(" ")[1]); // W is the maximum allowed total weight.

    // Initialize arrays to store the weights and values of each item.
    let w = new Array(N); // 'w' will store the weight of each item.
    let v = new Array(N); // 'v' will store the value of each item.

    // Loop through the subsequent input lines to populate the 'w' and 'v' arrays.
    for (let i = 0; i < N; i++) {
        // Each line (p[i+1]) contains the weight and value for the i-th item.
        let h = (p[i + 1].split(" ").map(Number)); // Parse weight and value as numbers.
        w[i] = h[0]; // Assign the first parsed number as the weight for item 'i'.
        v[i] = h[1]; // Assign the second parsed number as the value for item 'i'.
    }

    // Define a constant for the maximum possible total value.
    const maxv = 100000; // This value determines the size of the DP table's value dimension.

    // Initialize the dynamic programming table 'm'.
    // m[i][j] will store the minimum weight required to achieve a total value of 'j'
    // using a subset of the first 'i' items.
    let m = new Array(N + 1);

    // Initialize the first row of the DP table (representing 0 items considered).
    m[0] = new Array(maxv + 1).fill(Infinity); // It's impossible to achieve any value > 0 with 0 items, so set weight to Infinity.
    m[0][0] = 0; // It takes 0 weight to achieve a value of 0 with 0 items.

    // Fill the DP table using a bottom-up approach.
    // 'i' represents the current item index being considered (from 0 to N-1).
    // 'm[i+1]' will store results after considering the first 'i+1' items.
    for (let i = 0; i < N; i++) {
        // Copy the previous row's state as the base for the current row.
        // This means, if we don't include item 'i', the min weight for value 'j' is the same as before.
        m[i + 1] = m[i].concat();

        // Iterate through all possible total values 'j'.
        for (let j = 0; j <= maxv; j++) {
            // Check if it's possible to include the current item 'i' to reach value 'j'.
            // This means the remaining value (j - v[i]) must be non-negative.
            if (j - v[i] >= 0) {
                // Calculate the minimum weight to achieve value 'j' by either:
                // 1. NOT including item 'i': The weight is m[i][j] (already in m[i+1][j] from concat).
                // 2. INCLUDING item 'i': The weight is m[i][j - v[i]] (min weight for remaining value) + w[i] (weight of current item).
                m[i + 1][j] = Math.min(m[i][j - v[i]] + w[i], m[i][j]);
            }

        } // End of inner loop (for 'j', values).
    } // End of outer loop (for 'i', items).

    // After filling the DP table, find the largest value 'i' such that
    // the minimum weight to achieve that value (m[N][i]) does not exceed the capacity 'W'.
    let i = maxv; // Start searching from the maximum possible value.
    while (m[N][i--] > W) { // Decrement 'i' and check if the weight for the current value exceeds 'W'.
        // The loop continues as long as the weight required is greater than 'W'.
        // 'i--' means 'i' is used in the condition, then decremented.
    }

    // When the loop terminates, 'i' has been decremented one extra time.
    // So, 'i+1' represents the maximum value that can be achieved within weight 'W'.
    console.log(i + 1); // Output the final result.
}; // End of the 'Main' function.


// Invoke the Main function with the input read from standard input.
// 'require("fs").readFileSync("/dev/stdin", "utf8")' reads the entire content of stdin synchronously as a UTF-8 string.
// '.trim()' removes any leading or trailing whitespace (including newlines) from the input string.
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());