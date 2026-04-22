/*
 * This script is designed to process numerical input, specifically
 * checking if a given integer N is a triangular number (i.e., the sum of
 * the first 'k' natural numbers for some integer 'k').
 * If N is a triangular number, it then constructs and outputs a specific
 * matrix based on 'k'.
 */

// --- Input/Output Setup Section ---
// This part handles reading input from stdin and writing output to stdout/stderr.
// It uses Node.js 'readline' module for line-by-line input processing.

var read = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var obj; // Will hold the initialized input utility object
var inLine = []; // An array to accumulate all input lines

// Event listener for each line of input received
read.on('line', function(input) {
    inLine.push(input); // Store the current line in the inLine array
});

// Event listener for when the input stream closes
read.on('close', function() {
    obj = init(inLine); // Initialize the input object with all collected lines

    console.error("\n"); // Print a newline to stderr for visual separation in debug output

    var start = Date.now(); // Record the start time for performance measurement
    Main(); // Execute the main logic of the program
    var end = Date.now() - start; // Calculate the total execution time

    // Output performance metrics to stderr
    myerr("time : " + (end) + "ms");
    myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// --- Utility Functions Section ---
// These functions provide helper capabilities for cloning, input parsing,
// and custom output/error logging.

/**
 * Creates a deep clone of an object using JSON serialization.
 * Note: This method has limitations (e.g., cannot clone functions, Dates, undefined).
 *
 * @param {object} obj - The object to be cloned.
 * @returns {object} A deep copy of the input object.
 */
function makeClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Retrieves the next input line and converts it to an integer.
 *
 * @returns {number} The next input line parsed as an integer.
 */
function nextInt() {
    return myconv(next(), 1);
}

/**
 * Retrieves the next input line and splits it into an array of strings by space.
 *
 * @returns {string[]} An array of strings from the next input line.
 */
function nextStrArray() {
    return myconv(next(), 2);
}

/**
 * Retrieves the next input line, splits it by space, and converts each part to a number.
 *
 * @returns {number[]} An array of numbers from the next input line.
 */
function nextIntArray() {
    return myconv(next(), 4);
}

/**
 * Retrieves the next input line and splits it into an array of single characters.
 *
 * @returns {string[]} An array of characters from the next input line.
 */
function nextCharArray() {
    return myconv(next(), 6);
}

/**
 * Fetches the next available input line using the global 'obj' input utility.
 *
 * @returns {string} The next line from the input.
 * @throws {string} If there is no more input, an ArrayIndexOutOfBoundsException-like message.
 */
function next() {
    return obj.next();
}

/**
 * Checks if there are more input lines available.
 *
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasNext() {
    return obj.hasNext();
}

/**
 * Initializes an input utility object to manage reading from a list of strings.
 * Provides methods to check for more input and retrieve the next line.
 *
 * @param {string[]} input - An array of strings representing all input lines.
 * @returns {object} An object with 'list', 'index', 'max', 'hasNext', and 'next' properties.
 */
function init(input) {
    return {
        list: input, // The complete list of input strings
        index: 0, // The current position (index) in the list
        max: input.length, // The total number of input strings

        /**
         * Determines if there are more lines to read.
         * @returns {boolean} True if 'index' is less than 'max', indicating more input.
         */
        hasNext: function() {
            return (this.index < this.max);
        },

        /**
         * Retrieves the string at the current 'index' and then increments 'index'.
         * @returns {string} The next string in the 'list'.
         * @throws {string} If 'hasNext' is false, it throws an error indicating no more input.
         */
        next: function() {
            if (this.hasNext()) {
                return this.list[this.index++];
            } else {
                throw "ArrayIndexOutOfBoundsException ‚There is no more input";
            }
        }
    };
}

/**
 * A simple wrapper for console.log to output results.
 *
 * @param {*} s - The value to be printed to standard output.
 */
function myout(s) {
    console.log(s);
}

/**
 * A debug output function that prints to console.error.
 * Uses 'util.inspect' for detailed object logging.
 *
 * @param {*} s - The value to be printed to standard error for debugging.
 */
function myerr(s) {
    console.error("debug:" + require("util").inspect(s, false, null));
}

/**
 * A flexible conversion function that processes input 'i' based on the 'no' parameter.
 *
 * @param {*} i - The input value to convert (can be string or array).
 * @param {number} no - A code indicating the desired conversion type:
 *   1: parseInt(i) - converts string to integer.
 *   2: i.split(" ") - splits string by space into string array.
 *   4: i.split(" ").map(Number) - splits by space and converts to number array.
 *   6: i.split("") - splits string into character array.
 *   7: i.split("").map(Number) - splits by character and converts to number array.
 *   8: i.join(" ") - joins array elements with spaces.
 *   9: i.join("\n") - joins array elements with newlines.
 *   0: i.join("") - joins array elements without separator.
 *   Default: Returns 'i' unchanged.
 * @returns {*} The converted value or the original input if conversion fails or 'no' is unknown.
 */
function myconv(i, no) {
    try {
        switch (no) {
            case 1:
                return parseInt(i);
            case 2:
                return i.split(" ");
            case 4:
                return i.split(" ").map(Number);
            case 6:
                return i.split("");
            case 7:
                return i.split("").map(Number);
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
        return i; // Fallback: return original input on error
    }
}

// --- Main Program Logic ---

/**
 * The core function that implements the problem's logic.
 * Reads an integer N, checks if it's a triangular number,
 * and if so, generates and prints a specific matrix.
 */
function Main() {
    var N = nextInt(); // Read the first integer from input

    var check = 0; // Initialize a counter for the triangular number check
    var isOK = false; // Flag to indicate if N is a triangular number

    // Loop to find 'k' such that N = k * (k + 1) / 2
    while (check < N) {
        // Check if N equals the sum of integers from 1 to 'check'
        if ((check * (check + 1)) / 2 == N) {
            isOK = true; // N is a triangular number
            break; // Exit the loop as 'check' is found
        }
        check++; // Increment 'check' for the next iteration
    }

    // If N is not a triangular number, print "No" and terminate
    if (!isOK) {
        myout("No");
        return;
    }

    // If N is a triangular number, print "Yes" and proceed with matrix generation
    myout("Yes");

    // Initialize a 2D array (list) with dimensions (check + 1) x check
    var list = new Array(check + 1);
    for (var i = 0; i < check + 1; i++) {
        list[i] = new Array(check);
    }

    var count = 1; // Counter to fill the matrix elements sequentially

    // Populate the 'list' matrix with a specific pattern
    // This creates a symmetric structure where elements [i][j] and [j+1][i] are the same
    for (var i = 0; i < check; i++) {
        for (var j = i; j < check; j++) {
            list[i][j] = count;
            list[j + 1][i] = count;
            count++;
        }
    }

    myerr(list); // Output the generated matrix for debugging purposes

    myout(list.length); // Print the number of rows in the generated matrix

    // Prepare the final output by formatting each row of the matrix
    var output = new Array(list.length);
    for (var i = 0; i < list.length; i++) {
        list[i].unshift(check); // Prepend the 'check' value to the beginning of each row
        output[i] = list[i].join(" "); // Join the elements of the current row with spaces
    }

    // Print the final formatted output, with each row separated by a newline
    myout(myconv(output, 9));
}