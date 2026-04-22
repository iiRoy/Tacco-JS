/*
 * This JavaScript file contains utility functions and a main program logic.
 * It's designed to read numerical input, perform calculations, and output a result.
 */


// ==============================================================================
// Utility Functions Section
// These functions provide common operations used throughout the program.
// ==============================================================================

/**
 * Converts a string value to an integer using base 10.
 * @param {string} x - The string to convert.
 * @returns {number} The integer representation of the string.
 */
var toInt    = x => parseInt(x, 10);


/**
 * Maps an array of strings to an array of integers using the toInt function.
 * @param {Array<string>} arr - The array of strings to convert.
 * @returns {Array<number>} An array of integers.
 */
var toIntArr = arr => arr.map(x => toInt(x));


/**
 * Calculates the absolute value of a number.
 * @param {number} x - The number.
 * @returns {number} The absolute value of the number.
 */
var abs      = x => x > 0 ? x : -x;


/**
 * Finds the minimum value among a variable number of arguments.
 * @param {...number} rest - Numbers to compare.
 * @returns {number} The smallest number provided.
 */
function min( ) {
    // Access all arguments passed to the function.
    var rest = arguments,
        // Initialize 'v' with the first argument as the current minimum.
        v    = rest[0];

    // Iterate through the rest of the arguments starting from the second one.
    for ( var i = 1; i < rest.length; i++ ) {
        // If the current argument is less than 'v', update 'v'.
        if ( rest[i] < v ) {
            v = rest[i];
        }
    }

    // Return the smallest value found.
    return v;
}


/**
 * Finds the maximum value among a variable number of arguments.
 * @param {...number} rest - Numbers to compare.
 * @returns {number} The largest number provided.
 */
function max( ) {
    // Access all arguments passed to the function.
    var rest = arguments,
        // Initialize 'v' with the first argument as the current maximum.
        v    = rest[0];

    // Iterate through the rest of the arguments starting from the second one.
    for ( var i = 1; i < rest.length; i++ ) {
        // If the current argument is greater than 'v', update 'v'.
        if ( rest[i] > v ) {
            v = rest[i];
        }
    }

    // Return the largest value found.
    return v;
}


/**
 * Computes the greatest common divisor (GCD) of a variable number of arguments.
 * Uses the Euclidean algorithm recursively for pairs of numbers.
 * @param {...number} rest - Numbers for which to find the GCD.
 * @returns {number} The GCD of all provided numbers.
 */
function gcd( ) {
    // Access all arguments.
    var rest = arguments,
        // Initialize 'v' with the first argument.
        v    = rest[0],
        // Define a helper function 'temp' for calculating GCD of two numbers.
        temp = (a, b) => b ? temp(b, a % b) : a; // Recursive Euclidean algorithm.

    // Iterate through the rest of the arguments, updating 'v' with the GCD.
    for ( var i = 1; i < rest.length; i++ ) {
        v = temp(v, rest[i]);
    }

    // Return the final GCD.
    return v;
}


// ==============================================================================
// Program Entry Point
// This line initiates the execution by reading input and calling Main.
// ==============================================================================

// Reads the entire content of standard input synchronously,
// then passes it as a UTF-8 string to the Main function.
Main( require("fs").readFileSync("/dev/stdin", "utf8") );


// ==============================================================================
// Main Program Logic
// This function contains the core algorithm to solve the problem.
// ==============================================================================

/**
 * The primary function that processes the input and computes the final answer.
 * @param {string} input - The raw string content read from standard input.
 * @returns {number} Returns 0 upon successful completion.
 */
function Main( input ) {

    // Split the entire input string into an array of lines.
    var inputLines = input.split('\n');

    // The first line of input contains the integer 'n'.
    var n = toInt(inputLines[0]);

    // Declare an empty array to store the subsequent 'n' integer values.
    var as = [];

    // Loop from 0 to n-1 to populate the 'as' array.
    // Each element is parsed from the input lines starting from the second line.
    for ( var i = 0; i < n; i++ ) {
        as[i] = toInt(inputLines[i + 1]);
    }


    // Sort the array 'as' in ascending numerical order.
    // The comparison function (a, b) => a - b ensures numerical sorting.
    as.sort( ( a, b ) => a - b );


    // Initialize two variables 'x' and 'y' which will store calculated sums.
    var x = 0;
    var y = 0;

    // Check if 'n' (the number of elements) is an even number.
    if ( n % 2 === 0 ) {
        // Logic for when 'n' is even.
        // Iterate through the sorted array 'as' to calculate 'x'.
        for ( var i = 0; i < n; i++ ) {
            // Add 2*as[i] if i is in the second half, else add -2*as[i].
            x += i >= n / 2 ? 2 * as[i] : -2 * as[i];
        }
        // Apply an additional specific adjustment to 'x'.
        x += as[n / 2] - as[n / 2 + 1];

    } else {
        // Logic for when 'n' is odd.
        // Iterate through the sorted array 'as' to calculate 'x' and 'y'.
        for ( var i = 0; i < n; i++ ) {
            // For 'x': if i is in the middle or second half, add 2*as[i], else -2*as[i].
            x += i >= (n - 1) / 2 ? 2 * as[i] : -2 * as[i];
            // For 'y': if i is strictly in the second half, add 2*as[i], else -2*as[i].
            y += i > (n - 1) / 2 ? 2 * as[i] : -2 * as[i];
        }
        // Apply additional specific adjustments to 'x' and 'y'.
        x -= as[(n - 1) / 2] + as[(n + 1) / 2];
        y += as[(n - 1) / 2] + as[(n - 3) / 2];
    }


    // The final answer is the maximum value between the calculated 'x' and 'y'.
    var ans = max(x, y);


    // Original code had a commented-out debug line:
    // console.log(as, bs); // This line was present but commented out.


    // Output the final calculated answer to the standard console.
    console.log(ans);


    // Return 0 to indicate successful program execution.
    return 0;

} // End of Main function.