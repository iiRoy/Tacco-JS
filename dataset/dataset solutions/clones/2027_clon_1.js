/*
 * This JavaScript code implements a solution for a problem that involves
 * reading numerical input, performing calculations on a list of numbers,
 * and then outputting a result. It utilizes custom input/output functions.
 */

// Global object for managing input stream.
var obj = init();


// Initiates the main execution flow of the program.
Main();


/**
 * Reads the next available input token and attempts to convert it into an integer.
 * This is a convenience wrapper around the general conversion utility.
 * @returns {number} The integer representation of the next input token.
 */
function nextInt() {
    return myconv(next(), 1);
}


// This function retrieves the next input line and splits it into an array of strings
// using a half-width space as the delimiter.
function nextStrArray() {
    return myconv(next(), 2);
}


/*
 * Retrieves the next input line, splits it by half-width spaces,
 * and then maps each resulting string segment to a numerical value.
 * This produces an array of integers.
 */
function nextIntArray() {
    return myconv(next(), 4);
}


/**
 * Obtains the next input line and breaks it down into an array where
 * each element is a single character from the original line.
 * @returns {Array<string>} An array of characters.
 */
function nextCharArray() {
    return myconv(next(), 6);
}


// Accessor method to get the next input token from the initialized input object.
function next() {
    return obj.next();
}


// Checks if there are more input tokens to be processed.
function hasNext() {
    return obj.hasNext();
}


/**
 * Reads all data from standard input (`/dev/stdin`),
 * decodes it as UTF-8, removes any leading or trailing whitespace,
 * and then splits the entire content into an array of strings based on newline characters.
 * Each element in the returned array represents a single line of input.
 * @returns {Array<string>} An array of input lines.
 */
function myin() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}


/**
 * Initializes the input reader object.
 * This function reads all lines from standard input once
 * and stores them in an internal list, along with an index
 * to track the current reading position.
 * @returns {object} An object with methods to access input lines sequentially.
 */
function init() {
    var inputFile = myin(); // Reads all input lines from standard input.

    // Constructs the return object with input management properties and methods.
    var returnObj = {
        "list": inputFile, // Stores all input lines.
        "index": 0, // Current position for reading.
        "max": inputFile.length, // Total number of lines available.

        "hasNext": function() {
            // Determines if there are more lines to read.
            return (this.index < this.max);
        },

        "next": function() {
            // Retrieves the next line from the input list.
            if (!this.hasNext()) {
                return ""; // Returns an empty string if no more input is available.
            } else {
                var returnInput = this.list[this.index]; // Gets the current line.
                this.index++; // Advances the index for the next read.
                return returnInput; // Returns the fetched line.
            }
        }
    };

    return returnObj; // Returns the fully initialized input object.
}


// Utility function for printing output to the console (standard output).
function myout(t) {
    console.log(t);
}


// Utility function for printing debug or error messages to the standard error stream.
function myerr(t) {
    console.error(t);
}


/*
 * This is a versatile conversion utility function.
 * It takes an input 'i' and a numerical code 'no' to perform various transformations.
 *
 * Supported conversion types ('no' parameter):
 *   1: Converts 'i' to an integer using parseInt().
 *   2: Splits 'i' (assumed string) by spaces into an array of strings.
 *   4: Splits 'i' by spaces and converts each part to a number, returning an array of numbers.
 *   6: Splits 'i' (assumed string) into an array of individual characters.
 *   7: Splits 'i' into an array of characters and converts each character to a number.
 *   8: Joins elements of 'i' (assumed array) with a space separator.
 *   9: Joins elements of 'i' (assumed array) with a newline character.
 *   0: Joins elements of 'i' (assumed array) without any separator.
 *
 * Error Handling: If an unknown 'no' is provided or an error occurs during conversion,
 *                 the original input 'i' is returned unchanged.
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
                return i; // Default case: return the input as is.
        }
    } catch (e) {
        // Catches any errors during conversion and returns the original input.
        return i;
    }
}


/**
 * The primary function containing the core logic of the program.
 * It reads two integers K and N from the first line, then N integers
 * forming a list from the second line. It calculates differences between
 * consecutive elements (including a special wrap-around difference),
 * sorts these differences, removes the largest one, and finally sums the rest.
 */
function Main() {
    // Read the first line of input, expected to contain two integers K and N.
    var one = nextIntArray();

    var K = one[0]; // Assigns the first integer to variable K.
    var N = one[1]; // Assigns the second integer to variable N.

    // Read the next line of input, which contains N integers forming a list.
    var list = nextIntArray();

    // Initialize an array to store the calculated differences between elements.
    var diff = new Array(N);

    // Calculate the differences between consecutive elements in the 'list'.
    // This loop covers differences from list[1]-list[0] up to list[N-1]-list[N-2].
    for (var i = 0; i < N - 1; i++) {
        diff[i] = list[i + 1] - list[i];
    }

    // Calculate a special "wrap-around" difference: (K - last_element) + first_element.
    diff[N - 1] = (K - list[N - 1]) + list[0];


    // Output the array of calculated differences to standard error for debugging purposes.
    myerr(diff);


    // Sort the 'diff' array in ascending numerical order.
    diff.sort(function(a, b) {
        return a - b;
    });


    // Remove the largest difference, which is now the last element after sorting.
    diff.pop();


    var sum = 0; // Initialize a variable to accumulate the sum of differences.

    // Iterate through the modified 'diff' array and sum its elements.
    // The loop runs N-1 times because one element was removed.
    for (var i = 0; i < N - 1; i++) {
        sum += diff[i];
    }


    // Output the final calculated sum to standard output.
    myout(sum);
}