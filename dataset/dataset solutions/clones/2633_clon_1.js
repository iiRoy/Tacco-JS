/*
 * This file contains several utility functions and a main program logic.
 * The goal is to demonstrate a Type I code clone, meaning only
 * whitespace and comments are altered from the original source.
 */

// Utility function: Converts a string to an integer using base 10.
var toInt = x => parseInt(x, 10);

/*
 * Utility function: Maps an array of strings to an array of integers.
 * It applies the 'toInt' function to each element.
 */
var toIntArr = arr => arr.map(x => toInt(x));


var abs = x => x > 0 ? x : -x; // Computes the absolute value of a number.


function min() {
    var rest = arguments,
        v = rest[0]; // Initialize 'v' with the first argument.
    // Loop through the remaining arguments to find the smallest value.
    for (var i = 1; i < rest.length; i++) {
        if (rest[i] < v) {
            v = rest[i]; // Update 'v' if a smaller element is found.
        }
    }
    return v;
}


/*
 * This function determines the maximum value among its passed arguments.
 * It assumes at least one argument is provided.
 */
function max() {
    var rest = arguments,
        v = rest[0]; // Start comparison with the initial argument.
    for (var i = 1; i < rest.length; i++) {
        if (rest[i] > v) {
            v = rest[i]; // Replace 'v' if a larger argument is encountered.
        }
    }
    return v;
}


// Function to compute the Greatest Common Divisor (GCD) for multiple numbers.
function gcd() {
    var rest = arguments,
        v = rest[0],
        temp = (a, b) => b ? temp(b, a % b) : a; // Euclidean algorithm helper for two numbers.
    for (var i = 1; i < rest.length; i++) {
        v = temp(v, rest[i]); // Iteratively apply GCD.
    }
    return v;
}


// The program's entry point: reads input from standard input and calls Main.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));


/*
 * Main function: processes the input to calculate a final averaged value.
 * It simulates a process where numbers are repeatedly averaged.
 */
function Main(input) {
    // Parse the input: split by newlines, then by spaces, and convert to integer arrays.
    var input = input.split('\n').map((el, ind, arr) => toIntArr(el.split(' ')));

    var n = input[0][0]; // 'n' is extracted from the first element of the first line.

    var vs = input[1].sort(); // The main array of values, sorted initially.

    var pows = [1]; // This variable 'pows' is declared but currently unused.

    // Original comment about console.log was here. It is now removed for Type I clone.

    // Initial step: take the two smallest values, sum them, and average.
    ans = vs.shift() + vs.shift();
    ans /= 2;

    // Loop continues as long as there are values left in 'vs'.
    while (vs.length) {
        vs.push(ans); // Add the current average back into the list.
        vs.sort(); // Re-sort the list to maintain order for the next iteration.
        ans = vs.shift() + vs.shift(); // Take the two smallest (now including the average), sum them.
        ans /= 2; // Calculate the new average.
    }

    console.log(ans); // Output the final calculated average.

    return 0; // Standard exit code for successful execution.
}