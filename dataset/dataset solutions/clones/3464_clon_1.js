/* This file contains utility functions and a main program logic.
 * It processes numerical input to calculate a specific value. */

// Helper function to convert a string to an integer
var toInt = x => parseInt(x, 10);

// Helper function to convert an array of strings to an array of integers
var toIntArr = arr => arr.map(x => toInt(x));


// Function to get the absolute value of a number.
// This is a basic ternary operator implementation.
var abs = x => x > 0 ? x : -x;


/*
 * Finds the minimum value among the provided arguments.
 * Uses the arguments object for flexibility.
 */
function min() {
    var rest = arguments,
        v = rest[0]; // Initialize with the first argument

    // Loop through the remaining arguments to find the smallest
    for (var i = 1; i < rest.length; i++) {
        if (rest[i] < v) {
            v = rest[i];
        }
    }
    return v;
}

// Function to find the maximum value among its arguments.
// Similar structure to the min function.
function max() {
    var rest = arguments,
        v = rest[0]; // Start comparison with the first element

    for (var i = 1; i < rest.length; i++) {
        if (rest[i] > v) {
            v = rest[i];
        }
    }
    return v;
}


/*
 * Calculates the Greatest Common Divisor (GCD) of multiple numbers.
 * It uses a recursive helper function for pairwise GCD calculation.
 */
function gcd() {
    var rest = arguments,
        v = rest[0],
        temp = (a, b) => b ? temp(b, a % b) : a; // Euclidean algorithm for GCD

    for (var i = 1; i < rest.length; i++) {
        v = temp(v, rest[i]); // Update GCD iteratively
    }
    return v;
}

// Entry point of the program. Reads input from stdin.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));



/**
 * The main function that processes the input and computes the result.
 * @param {string} input - The raw input string read from stdin.
 */
function Main(input) {
    // Split the input string by newline characters to get individual lines.
    var input = input.split('\n');

    // Parse the first line as the number of elements 'n'.
    var n = toInt(input[0]);

    // Initialize an empty array to store the parsed numbers.
    var as = [];

    // Populate the 'as' array by parsing subsequent input lines.
    for (var i = 0; i < n; i++) {
        as[i] = toInt(input[i + 1]);
    }


    // Sort the array 'as' in ascending order.
    as.sort((a, b) => a - b);


    // Initialize variables for calculations.
    var x = 0;
    var y = 0;


    // Conditional logic based on whether 'n' is even or odd.
    if (n % 2 === 0) {
        // Case: n is an even number.
        for (var i = 0; i < n; i++) {
            // Accumulate 'x' based on index relative to n/2.
            x += i >= n / 2 ? 2 * as[i] : -2 * as[i];
        }
        // Adjust 'x' with specific elements from the sorted array.
        x += as[n / 2 - 1] - as[n / 2];
    } else {
        // Case: n is an odd number.
        for (var i = 0; i < n; i++) {
            // Accumulate 'x' and 'y' based on index relative to (n-1)/2.
            x += i >= (n - 1) / 2 ? 2 * as[i] : -2 * as[i];
            y += i > (n - 1) / 2 ? 2 * as[i] : -2 * as[i];
        }
        // Adjust 'x' and 'y' with specific elements from the sorted array.
        x -= as[(n - 1) / 2] + as[(n + 1) / 2];
        y += as[(n - 1) / 2] + as[(n - 3) / 2];
    }

    // Determine the final answer as the maximum of 'x' and 'y'.
    var ans = max(x, y);


    // Original commented-out debug line; kept as-is to demonstrate Type I with commented lines.
    //console.log(as,bs)

    // Output the final calculated answer to the console.
    console.log(ans);


    // The function returns 0, indicating successful execution.
    return 0;
}