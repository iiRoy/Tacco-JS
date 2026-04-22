/*
 * Utility functions for common operations.
 * These are defined using arrow function syntax for conciseness.
 */

// Function to convert a string `x` to an integer with base 10.
var toInt = x => parseInt(x, 10);

/*
 * Function to convert an array of strings to an array of integers.
 * It uses the `map` method to apply `toInt` to each element.
 */
var toIntArr = arr => arr.map(x => toInt(x));

// Function to calculate the absolute value of a number `x`.
// Uses a ternary operator: if `x` is positive, return `x`, otherwise return `-x`.
var abs = x => x > 0 ? x : -x;


/*
 * Custom implementation of a 'min' function that finds the smallest value
 * among a variable number of arguments.
 * It iterates through the 'arguments' object to find the minimum.
 */
function min() {
    var rest = arguments;     // 'arguments' is an array-like object of passed parameters.
    var val = rest[0];        // Initialize 'val' with the first argument.

    // Loop through the arguments starting from the second one.
    for (var i = 1; i < rest.length; i++) {
        // If the current argument is less than the current minimum, update 'val'.
        if (rest[i] < val) {
            val = rest[i];
        }
    }
    return val;               // Return the smallest value found.
}

/*
 * Custom implementation of a 'max' function that finds the largest value
 * among a variable number of arguments.
 * Similar to 'min', it uses the 'arguments' object.
 */
function max() {
    var rest = arguments;     // Access all arguments passed to this function.
    var val = rest[0];        // Assume the first argument is initially the largest.

    // Iterate over the remaining arguments, from the second element onwards.
    for (var i = 1; i < rest.length; i++) {
        // If an argument is found that is greater than the current 'val', update 'val'.
        if (rest[i] > val) {
            val = rest[i];
        }
    }
    return val;               // Return the maximum value identified.
}


// The program's entry point.
// It reads input from standard input ('/dev/stdin') using Node.js 'fs' module.
// The entire input content is read as a UTF-8 string and passed to the Main function.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));


/*
 * The main function responsible for processing the input and generating the output.
 * It takes the raw input string, parses it, performs calculations, and logs the result.
 */
function Main(input) {
    // Split the input string into an array of lines based on the newline character.
    var input = input.split('\n');

    // Parse the first line of input to get the integer value 'n'.
    var n = toInt(input[0]);

    // Split the second line of input by spaces, then convert each part to an integer.
    // This creates an array 'as' containing the input numbers.
    var as = toIntArr(input[1].split(' '));

    // Initialize an empty array 'ms' to store the medians of all subarrays.
    var ms = [];

    // Declare temporary variables to be used within the nested loops.
    var temp1, temp3;

    // Outer loop: iterates through all possible starting indices 'i' for subarrays.
    for (var i = 0; i < n; i++) {
        // Inner loop: iterates through all possible ending indices 'j' for subarrays,
        // ensuring 'j' is always greater than or equal to 'i'.
        for (var j = i; j < n; j++) {
            // Extract a subarray (slice) from 'as' starting at index 'i' and ending at 'j' (inclusive).
            temp1 = as.slice(i, j + 1);

            // Sort the extracted subarray 'temp1' in ascending order.
            // Then, find the median element. The index for the median of a 0-indexed array
            // of length 'len' is Math.floor((len - 1) / 2).
            // Here, (j - i + 1) represents the length of the current subarray.
            temp3 = temp1.sort(function(a, b) {
                return a - b;
            })[Math.floor((j - i + 1) / 2)];

            // Add the calculated median 'temp3' to the 'ms' array.
            ms.push(temp3);
        }
    }

    // After populating 'ms' with all medians of subarrays, sort 'ms' itself.
    // The problem asks for a specific element from this sorted 'ms' array.
    // The index `Math.floor(n * (n + 1) / 4)` corresponds to the median of the medians
    // for a specific problem context (e.g., median of all subarray medians).
    console.log(ms.sort((a, b) => a - b)[Math.floor(n * (n + 1) / 4)]);
}