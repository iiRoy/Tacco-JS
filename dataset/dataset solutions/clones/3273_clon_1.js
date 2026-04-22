var obj = init(); /* Initialize the input reading object */

Main(); // Execute the primary logic of the program

/**
 * Reads the next line of input and converts it to an integer.
 * @returns {number} The converted integer value.
 */
function nextInt () {
    return myconv(next(), 1);
}


/**
 * Reads the next line of input and splits it into an array of strings
 * based on half-width spaces.
 * @returns {string[]} An array of strings.
 */
function nextStrArray () {
    return myconv(next(), 2); /* Splits the input line by spaces */
}


/**
 * Reads the next line of input, splits it by half-width spaces,
 * and converts each part into a number, returning an array of numbers.
 * @returns {number[]} An array of integer values.
 */
function nextIntArray () {
    return myconv(next(), 4); // Splits by space and converts elements to numbers
}


/**
 * Reads the next line of input and splits it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
function nextCharArray () {
    return myconv(next(), 6); /* Splits the input line into single characters */
}


/**
 * Retrieves the next available line of input from the initialized input object.
 * @returns {string} The next line of input.
 */
function next () {
    return obj.next();
}


/**
 * Checks if there are more lines of input available to be read.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasNext () {
    return obj.hasNext();
}


/**
 * Reads all input from standard input, trims it, and splits it into an array of lines.
 * This function uses Node.js 'fs' module.
 * @returns {string[]} An array where each element is a line from stdin.
 */
function myin () {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}


/**
 * Initializes the input handler object.
 * This object manages reading input lines sequentially.
 * @returns {object} An object with `list`, `index`, `max`, `hasNext`, and `next` properties.
 */
function init () {

    var inputFile = myin(); // Get all input lines from stdin

    var returnObj = {
        "list"    : inputFile,         // Array of input lines
        "index"   : 0,                 // Current index for reading input
        "max"     : inputFile.length,  // Total number of input lines

        "hasNext" : function () {
            return (this.index < this.max); // Check if there are more lines to read
        },

        "next"    : function () {
            if (!this.hasNext()) {
                return ""; /* Return an empty string if no more input is available */
            } else {
                var returnInput = this.list[this.index];
                this.index++; /* Advance the index to the next line */
                return returnInput;
            }
        }
    };

    return returnObj; // Return the fully configured input object
}


/**
 * Prints the given argument to standard output, followed by a newline.
 * @param {*} t The value to be printed.
 */
function myout (t) {
    console.log(t); // Standard output function
}


/**
 * Prints the given argument to standard error output.
 * @param {*} t The value to be printed.
 */
function myerr (t) {
    console.error(t); // Standard error output function
}


/*
 *  The `myconv` utility function handles various data conversions.
 *  It takes an input `i` and a conversion `no` identifier.
 *
 *  Conversion types (`no` parameter):
 *  - Default (or unknown `no`): Returns the input `i` as is.
 *  - 1: Converts `i` to an integer using `parseInt()`.
 *  - 2: Splits `i` (expected to be a string) by a single space (" ").
 *  - 4: Splits `i` by a space (" ") and then maps each resulting string
 *       to a `Number` type.
 *  - 6: Splits `i` into an array of individual characters.
 *  - 7: Splits `i` into individual characters and then maps each character
 *       to a `Number` type.
 *  - 8: Joins the elements of `i` (expected to be an array) with a space (" ").
 *  - 9: Joins the elements of `i` with a newline character ("\n").
 *  - 0: Joins the elements of `i` without any separator.
 *
 *  Error Handling: If any conversion attempt fails, the function
 *  gracefully returns the original input `i`.
 */
function myconv (i, no) {
    try {
        switch (no) {
            case 1:
                return parseInt(i); // Convert string to integer
            case 2:
                return i.split(" "); // Split string by spaces into an array of strings
            case 4:
                return i.split(" ").map((a) => Number(a)); // Split by space and convert to numbers
            case 6:
                return i.split(""); // Split string into an array of characters
            case 7:
                return i.split("").map((a) => Number(a)); // Split into chars and convert to numbers
            case 8:
                return i.join(" "); // Join array elements with a space
            case 9:
                return i.join("\n"); // Join array elements with a newline
            case 0:
                return i.join(""); // Join array elements without any separator
            default:
                return i; // If 'no' is not recognized, return the input as is
        }
    } catch (e) {
        return i; // Catch any errors during conversion and return the original input
    }
}


/**
 * The main function of the program.
 * It reads two arrays of integers, performs calculations based on their differences,
 * and outputs a final result.
 */
function Main () {

    var N = nextInt(); // Read the number of elements for the arrays

    var alist = nextIntArray(); // Read the first array of integers
    var blist = nextIntArray(); // Read the second array of integers

    var positivelist = []; // Stores positive differences (a[i] - b[i] >= 0)
    var negativeSum = 0;   // Accumulates the sum of absolute negative differences (b[i] - a[i])
    var diffSum = 0;       // Stores the total sum of differences (a[i] - b[i])
    var output = 0;        // Counter for operations or elements to be considered

    // Iterate through the arrays to calculate differences and categorize them
    for (var i = 0; i < N; i++) {
        var currentDiff = alist[i] - blist[i];
        diffSum += currentDiff; // Add current difference to total sum

        if (currentDiff >= 0) {
            positivelist.push(currentDiff); // If difference is non-negative, add to positivelist
        } else {
            negativeSum += Math.abs(currentDiff); // If difference is negative, add its absolute value to negativeSum
            output++;                             // Increment output count for negative differences
        }
    }

    // Check if the total sum of differences is negative
    if (diffSum < 0) {
        myout(-1); // If total difference is negative, output -1 (problem constraints)
    } else {
        // Sort the positivelist in descending order
        positivelist.sort(function (a, b) {
            return b - a; /* Sort from largest to smallest */
        });

        // Use positive differences to cover the accumulated negative sum
        for (var i = 0; i < positivelist.length; i++) {
            if (negativeSum <= 0) {
                break; // Stop if the negative sum has been fully covered
            }
            negativeSum -= positivelist[i]; // Reduce negativeSum by the current largest positive difference
            output++;                       // Increment output count for using a positive difference
        }

        myout(output); // Output the final calculated count
    }
}