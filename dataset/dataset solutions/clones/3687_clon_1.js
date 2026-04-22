/*
 * This file contains a JavaScript program designed to process input and perform a specific calculation.
 * It includes utility functions for input parsing and output.
 * The primary logic is encapsulated within the Main function.
 */


// Initialize the input object globally
var obj = init();


// Execute the main program logic after initialization
Main();


/**
 * Reads the next integer from the input stream.
 * This function utilizes the myconv utility for type conversion.
 * @returns {number} The next integer value from the input.
 */
function nextInt() {
    return myconv(next(), 1);
}


/**
 * Reads the next string array from the input, where elements are delimited by half-width spaces.
 * @returns {string[]} An array of strings parsed from the input.
 */
function nextStrArray() {
    return myconv(next(), 2); // Divides by half-width spaces
}


/**
 * Reads the next integer array from the input. It splits by half-width spaces and then converts each segment to a number.
 * @returns {number[]} An array of numbers parsed from the input.
 */
function nextIntArray() {
    return myconv(next(), 4); // Splits by half-width spaces and converts to numbers
}


/**
 * Reads the next character array from the input, splitting the string into individual characters.
 * @returns {string[]} An array of single-character strings.
 */
function nextCharArray() {
    return myconv(next(), 6); // Splits character by character
}


/**
 * Retrieves the next item (line) from the input object.
 * This is a core function for sequential input access.
 * @returns {string} The next line of input.
 */
function next() {
    return obj.next();
}


/**
 * Checks if there are more items available in the input stream.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasNext() {
    return obj.hasNext();
}


/**
 * Reads all input from standard input, processes it, and returns an array of lines.
 * This function is responsible for file system interaction to get input.
 * @returns {string[]} An array where each element is a line from the standard input.
 */
function myin() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}


/**
 * Initializes the input processing object.
 * This object manages the input lines, keeping track of the current position.
 * It provides methods to check for more input and retrieve the next line.
 * @returns {object} An object containing the input list, current index, maximum length, and utility methods.
 */
function init() {
    // Read all lines from the input source
    var inputFile = myin();

    // Construct the input management object
    var returnObj = {
        "list": inputFile,
        "index": 0,
        "max": inputFile.length,

        // Method to check if there are more lines to read
        "hasNext": function () {
            return (this.index < this.max);
        },

        // Method to get the next line from the input
        "next": function () {
            if (!this.hasNext()) {
                return ""; // Return empty string if no more input
            } else {
                var returnInput = this.list[this.index];
                this.index++; // Advance the index
                return returnInput;
            }
        }
    };

    return returnObj;
}


/**
 * Prints the given argument to standard output using console.log.
 * This is the primary function for displaying results to the user.
 * @param {*} t - The value to be printed.
 */
function myout(t) {
    console.log(t); // Standard output function
}


/**
 * Prints the given argument to standard error output using console.error.
 * Useful for debugging or reporting non-critical errors.
 * @param {*} t - The value to be printed to the error stream.
 */
function myerr(t) {
    console.error(t); // Standard error output function
}


// This section details the 'no' parameter's behavior within the 'myconv' function.
// It defines various conversion types for input 'i'.
// Default (or unknown/error 'no'): The input 'i' is returned as is.
// 'no' = 1: Input 'i' is converted to an integer.
// 'no' = 2: Input 'i' (string) is split into an array of strings by half-width spaces.
// 'no' = 4: Input 'i' (string) is split by half-width spaces, and each part is converted to a number.
// 'no' = 6: Input 'i' (string) is split into an array of individual characters.
// 'no' = 7: Input 'i' (string) is split into individual characters, and each character is converted to a number.
// 'no' = 8: Input 'i' (array) elements are joined together with a half-width space.
// 'no' = 9: Input 'i' (array) elements are joined together with a newline character.
// 'no' = 0: Input 'i' (array) elements are joined together without any separator.


/**
 * A versatile utility function for converting input data based on a numeric type code.
 * It handles various parsing and joining operations.
 * @param {*} i - The input data to be converted (can be string or array).
 * @param {number} no - A numeric code specifying the conversion type.
 * @returns {*} The converted data, or the original input if an error occurs or the type code is unrecognized.
 */
function myconv(i, no) {
    try {
        switch (no) {
            case 1:
                return parseInt(i);
            case 2:
                return i.split(" ");
            case 4:
                return i.split(" ").map((a) => Number(a));
            case 6:
                return i.split("");
            case 7:
                return i.split("").map((a) => Number(a));
            case 8:
                return i.join(" ");
            case 9:
                return i.join("\n");
            case 0:
                return i.join("");
            default:
                return i;
        }
    } catch (e) {
        // If any error occurs during the conversion, return the original input
        return i;
    }
}


/**
 * The main execution function of the program.
 * It reads initial parameters, then performs a complex nested loop calculation.
 * The calculation involves checking absolute differences between loop variables against a given 'd' value.
 * Finally, it outputs the frequency count of calculated sums.
 */
function Main() {
    // Read the first line of input, expecting three integers
    var one = nextIntArray();

    // Extract individual parameters from the 'one' array
    var N = one[0];
    var M = one[1];
    var d = one[2];

    // Initialize an object to store counts of sums
    var count = {};

    // Start of the first nested loop (variable 'i')
    for (var i = 1; i <= N; i++) {
        // Second nested loop (variable 'j')
        for (var j = 1; j <= N; j++) {
            // Third nested loop (variable 'k')
            for (var k = 1; k <= N; k++) {
                // Innermost nested loop (variable 'l')
                for (var l = 1; l <= N; l++) {
                    var sum = 0; // Initialize sum for the current combination of i, j, k, l

                    // Check the absolute difference between i and j
                    if (Math.abs(i - j) == d) {
                        sum++;
                    }

                    // Check the absolute difference between k and j
                    if (Math.abs(k - j) == d) {
                        sum++;
                    }

                    // Check the absolute difference between k and l
                    if (Math.abs(k - l) == d) {
                        sum++;
                    }

                    // Update the count for the calculated sum
                    if (count[sum] == null) {
                        count[sum] = 1; // First occurrence of this sum value
                    } else {
                        count[sum]++; // Increment existing count for this sum value
                    }
                }
            }
        }
    }

    // Output the final count object to standard output
    myout(count);
}