/**
 * @file This script processes input data to calculate a specific result.
 * @author Code Clone Generator
 * @version 1.0.0
 */

// Utility function to convert a value to an integer with base 10.
var toInt = x => parseInt(x, 10);

// Utility function to convert an array of values to an array of integers.
var toIntArr = arr => arr.map(x => toInt(x));

// Utility function to calculate the absolute value of a number.
var abs = x => x > 0 ? x : -x;


/**
 * Calculates the minimum value among a list of arguments.
 * This function expects at least one argument.
 *
 * @returns {number} The smallest value provided.
 */
function min() {
    var rest = arguments; /* Get all arguments passed to the function */
    var val = rest[0];   // Initialize 'val' with the first argument

    for (var i = 1; i < rest.length; i++) { // Iterate through the remaining arguments
        if (rest[i] < val) {                 // If the current argument is smaller
            val = rest[i];                   // Update 'val' to the new minimum
        }
    }

    return val; // Return the determined minimum value
}


/**
 * Calculates the maximum value among a list of arguments.
 * This function expects at least one argument.
 *
 * @returns {number} The largest value provided.
 */
function max() {
    var rest = arguments; /* Retrieve all arguments as an array-like object */
    var val = rest[0];   // Assume the first argument is initially the maximum

    for (var i = 1; i < rest.length; i++) { // Loop through the arguments starting from the second one
        if (rest[i] > val) {                 // Check if the current argument is greater than the current maximum
            val = rest[i];                   // If so, update 'val' to this new maximum
        }
    }

    return val; // Return the final maximum value found
}


// Main execution block: reads input from standard input and passes it to the Main function.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));


/**
 * The primary function that processes the input and calculates the final answer.
 *
 * @param {string} input - The raw input string read from stdin.
 */
function Main(input) {
    // Split the input string into an array of lines.
    var input = input.split('\n');

    // Parse the first line of input to get 'n' and 'x'.
    var temp = toIntArr(input[0].split(' '));
    var n = temp[0]; // The first integer from the first line
    var x = temp[1]; // The second integer from the first line

    // Parse the second line of input to get the array 'xs'.
    var xs = toIntArr(input[1].split(' '));

    // Initialize 'ss' (presumably a prefix sum array) with the first element of 'xs'.
    var ss = [xs[0]];

    // Calculate prefix sums for the 'xs' array.
    for (var i = 1; i < n; i++) {
        ss[i] = xs[i] + ss[i - 1]; // Each element is the sum of itself and the previous prefix sum
    }

    // Initialize the answer with a base calculation.
    var ans = (n + 1) * x; // Initial answer calculation

    var has = 0; // Counter variable for a specific condition.

    // Iterate backwards through the 'xs' array to perform complex calculations.
    for (var i = n - 1; i > -1; i--) {
        has++; // Increment 'has' in each iteration.

        // Conditional logic based on 'has', 'x', 'ss', and 'xs'.
        if (has > 2 && x <= ss[i] * (has - 1) * 2 - xs[i] * 2) {
            has = 1;      // Reset 'has' if condition is met
            ans += x;     // Add 'x' to the answer
        }

        // Update the answer with a value derived from 'xs[i]', 'has', and 'max'.
        ans += xs[i] * (max(has, 2) * 2 + 1);
    }

    // Output the final calculated answer to the console.
    console.log(ans);
}

// End of script.